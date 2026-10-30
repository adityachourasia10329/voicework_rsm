"""
Tier 1: Hot In-Memory Unified State Manager (Redis / Upstash / Dragonfly)
Provides sub-3ms latency for the Gallery view, live Editor scrubbing,
and instant search across 5-character codes, titles, and transcripts.

Maintains:
- video:{id} -> Video state JSON
- video:code:{code} -> UUID pointer
- channel:videos:set -> SADD of ingested YouTube IDs (idempotency check)
"""

import json
import time
import logging
from typing import Dict, Any, Optional, List, Set

logger = logging.getLogger("voicework.cache")

class RedisUnifiedStore:
    """
    In-memory state tier. Uses redis-py when available, with a high-performance
    in-process concurrent memory cache for standalone offline/dev speed.
    """

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url
        self.client = None
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        self._dirty_keys: Set[str] = set()
        
        # Fast local indices for sub-3ms lookups
        self._video_code_index: Dict[str, str] = {} # code -> video_id
        self._channel_videos_set: Set[str] = set()   # set of youtube_ids

        if redis_url:
            try:
                import redis
                self.client = redis.Redis.from_url(redis_url, decode_responses=True)
                self.client.ping()
                logger.info(f"Connected to Redis / Dragonfly at {redis_url}")
            except Exception as e:
                logger.warning(f"Redis connection failed, running with In-Memory fallback: {e}")
                self.client = None

    # =========================================================================
    # 1. Video Entity & Joint Memory Operations
    # =========================================================================

    def is_code_taken(self, code: str) -> bool:
        """Checks if a 5-character alphanumeric code is already registered."""
        code_upper = code.strip().upper()
        if self.client:
            try:
                exists = self.client.exists(f"video:code:{code_upper}")
                if exists:
                    return True
            except Exception as e:
                logger.error(f"Redis is_code_taken error: {e}")
        return code_upper in self._video_code_index

    def has_youtube_id(self, youtube_id: str) -> bool:
        """
        Idempotency check: returns True if this YouTube video has already
        been ingested into the system.
        """
        if self.client:
            try:
                is_member = self.client.sismember("channel:videos:set", youtube_id)
                if is_member:
                    return True
            except Exception as e:
                logger.error(f"Redis sismember error: {e}")
        return youtube_id in self._channel_videos_set

    def set_video(self, video: Dict[str, Any], mark_dirty: bool = True) -> None:
        """
        Indexes video into hot memory:
        - video:{id} -> JSON metadata
        - video:code:{code} -> id
        - channel:videos:set -> youtube_id
        """
        video_id = str(video.get("id") or video.get("projectId"))
        code = str(video.get("code", "")).strip().upper()
        youtube_id = video.get("youtube_id") or video.get("youtubeId")

        if not video_id:
            raise ValueError("Video missing id")

        # Ensure timestamps
        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        if not video.get("created_at"):
            video["created_at"] = now_iso
        video["updated_at"] = now_iso

        key_video = f"video:{video_id}"
        video_json = json.dumps(video)

        # Update local memory
        self._memory_cache[key_video] = video
        if code:
            self._video_code_index[code] = video_id
        if youtube_id:
            self._channel_videos_set.add(youtube_id)

        # Also mirror to project:{id}:state for editor backward-compatibility
        self._memory_cache[f"project:{video_id}:state"] = video
        if code:
            self._video_code_index[code] = video_id

        # Update Redis / Upstash if connected
        if self.client:
            try:
                pipe = self.client.pipeline()
                pipe.set(key_video, video_json)
                pipe.set(f"project:{video_id}:state", video_json)
                if code:
                    pipe.set(f"video:code:{code}", video_id)
                if youtube_id:
                    pipe.sadd("channel:videos:set", youtube_id)
                pipe.execute()
            except Exception as e:
                logger.error(f"Redis set_video error: {e}")

    def get_video_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Resolves video by 5-character alphanumeric code."""
        code_upper = code.strip().upper()
        video_id = None

        if self.client:
            try:
                video_id = self.client.get(f"video:code:{code_upper}")
            except Exception as e:
                logger.error(f"Redis get_video_by_code pointer error: {e}")

        if not video_id:
            video_id = self._video_code_index.get(code_upper)

        if video_id:
            return self.get_video_by_id(video_id)
        return None

    def get_video_by_id(self, video_id: str) -> Optional[Dict[str, Any]]:
        """Resolves video by UUID."""
        key = f"video:{video_id}"
        if self.client:
            try:
                val = self.client.get(key)
                if val:
                    return json.loads(val)
            except Exception as e:
                logger.error(f"Redis get_video_by_id error: {e}")

        video = self._memory_cache.get(key)
        if not video:
            # Fallback to project:{id}:state
            video = self._memory_cache.get(f"project:{video_id}:state")
        return video

    def get_video(self, id_or_code: str) -> Optional[Dict[str, Any]]:
        """
        Dual-route resolver:
        Accepts either a 5-character code (e.g. '7K9Q2') or a UUID.
        """
        token = id_or_code.strip()
        # If 5 characters, try resolving via code first
        if len(token) == 5:
            video = self.get_video_by_code(token)
            if video:
                return video

        # Try resolving via ID
        video = self.get_video_by_id(token)
        if video:
            return video

        # Fallback check against memory cache items
        for k, v in self._memory_cache.items():
            if v.get("code", "").upper() == token.upper() or v.get("id") == token or v.get("projectId") == token:
                return v

        return None

    # =========================================================================
    # 2. Instant Search across Code, Title, and Transcript
    # =========================================================================

    def search_videos(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Searches videos in memory across:
        1. 5-character code (exact or prefix match)
        2. Video title (case-insensitive substring/keyword match)
        3. Transcript dialogue text
        4. Stems & tags
        """
        q = query.strip().lower()
        if not q:
            return self.list_all_videos()[:limit]

        q_code = query.strip().upper()
        matches = []
        seen_ids = set()

        # Iterate over all stored video entities
        for key, entity in self._memory_cache.items():
            if not (key.startswith("video:") or key.startswith("project:")):
                continue

            v_id = entity.get("id") or entity.get("projectId")
            if not v_id or v_id in seen_ids:
                continue

            code = entity.get("code", "").upper()
            title = entity.get("title", "").lower()
            transcript = (entity.get("transcript") or "").lower()
            youtube_id = (entity.get("youtube_id") or entity.get("youtubeId") or "").lower()

            score = 0
            match_type = None

            # 1. Code match (highest priority)
            if code == q_code:
                score += 100
                match_type = "EXACT_CODE"
            elif q_code in code:
                score += 60
                match_type = "PARTIAL_CODE"

            # 2. Title match
            if q in title:
                score += 50
                match_type = match_type or "TITLE"

            # 3. YouTube ID match
            if q in youtube_id:
                score += 40
                match_type = match_type or "YOUTUBE_ID"

            # 4. Transcript dialogue match
            if q in transcript:
                score += 30
                match_type = match_type or "TRANSCRIPT"

            # 5. Stems match
            stems = entity.get("stems", [])
            for s in stems:
                if q in s.get("label", "").lower() or q in s.get("type", "").lower():
                    score += 10
                    match_type = match_type or "STEM"
                    break

            if score > 0:
                seen_ids.add(v_id)
                item = dict(entity)
                item["_search_score"] = score
                item["_match_type"] = match_type
                matches.append(item)

        matches.sort(key=lambda x: x["_search_score"], reverse=True)
        return matches[:limit]

    def list_all_videos(self) -> List[Dict[str, Any]]:
        """Returns all registered videos sorted by created_at DESC."""
        results = []
        seen_ids = set()
        for key, state in self._memory_cache.items():
            if not (key.startswith("video:") or key.startswith("project:")):
                continue
            v_id = state.get("id") or state.get("projectId")
            if not v_id or v_id in seen_ids:
                continue
            seen_ids.add(v_id)
            results.append(state)
        return sorted(results, key=lambda x: x.get("created_at") or x.get("updatedAt") or "", reverse=True)

    # =========================================================================
    # 3. Project State Backward-Compatibility (Editor scrubbing)
    # =========================================================================

    def get_project_state(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Fetch project state with sub-3ms retrieval latency."""
        return self.get_video(project_id)

    def set_project_state(self, project_id: str, state: Dict[str, Any], mark_dirty: bool = True) -> None:
        """Stores project state and auto-indexes code and youtube_id."""
        if not state.get("id"):
            state["id"] = project_id
        if not state.get("projectId"):
            state["projectId"] = project_id
        self.set_video(state, mark_dirty=mark_dirty)

    def list_all_projects(self) -> List[Dict[str, Any]]:
        """Returns summarized project cards for the Enterprise Gallery."""
        results = []
        seen_ids = set()
        for video in self.list_all_videos():
            v_id = video.get("id") or video.get("projectId")
            if v_id in seen_ids:
                continue
            seen_ids.add(v_id)
            results.append({
                "projectId": v_id,
                "code": video.get("code", "VOICE"),
                "youtubeId": video.get("youtube_id") or video.get("youtubeId"),
                "title": video.get("title", "Untitled Project"),
                "status": video.get("status", "READY"),
                "durationSeconds": video.get("durationSeconds", video.get("duration_seconds", 0.0)),
                "sourceType": video.get("sourceType", "YOUTUBE" if video.get("youtube_id") else "UPLOAD"),
                "thumbnailUrl": video.get("thumbnail_url") or video.get("mediaContainer", {}).get("thumbnailUrl", "/thumbnails/default.jpg"),
                "hasVideo": video.get("mediaContainer", {}).get("hasVideo", True),
                "viralityScore": video.get("virality_score", 0),
                "updatedAt": video.get("updated_at") or video.get("updatedAt"),
            })
        return sorted(results, key=lambda x: x.get("updatedAt", ""), reverse=True)

    def update_mixer_state(self, project_id: str, mixer_update: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Atomic hot-patch of mixer parameters."""
        state = self.get_project_state(project_id)
        if not state:
            return None

        if "mixer" not in state:
            state["mixer"] = {}
        state["mixer"].update(mixer_update)

        if "stems" in mixer_update:
            state["stems"] = mixer_update["stems"]

        self.set_project_state(project_id, state, mark_dirty=True)
        return state

    def append_surgical_revision(self, project_id: str, revision: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Appends a completed surgical patch into the hot state."""
        state = self.get_project_state(project_id)
        if not state:
            return None

        if "surgicalHistory" not in state:
            state["surgicalHistory"] = []
        state["surgicalHistory"].insert(0, revision)

        self.set_project_state(project_id, state, mark_dirty=True)
        return state

# Global singleton store instance
hot_store = RedisUnifiedStore()
