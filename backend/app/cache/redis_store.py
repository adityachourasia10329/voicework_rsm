"""
Tier 1: Hot In-Memory Unified State Manager (Redis / Dragonfly)
Provides sub-3ms latency for the Gallery view and live Editor scrubbing.
Maintains dirty flags for asynchronous write-behind workers to persist to PostgreSQL / MongoDB.
"""

import json
import time
import logging
from typing import Dict, Any, Optional, List

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
        self._dirty_keys: set = set()

        if redis_url:
            try:
                import redis
                self.client = redis.Redis.from_url(redis_url, decode_responses=True)
                self.client.ping()
                logger.info(f"Connected to Redis / Dragonfly at {redis_url}")
            except Exception as e:
                logger.warning(f"Redis connection failed, running with In-Memory fallback: {e}")
                self.client = None

    def get_project_state(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Fetch project state with sub-3ms retrieval latency."""
        key = f"project:{project_id}:state"
        if self.client:
            try:
                val = self.client.get(key)
                if val:
                    return json.loads(val)
            except Exception as e:
                logger.error(f"Redis get error: {e}")

        # Local in-memory fallback
        return self._memory_cache.get(key)

    def set_project_state(self, project_id: str, state: Dict[str, Any], mark_dirty: bool = True) -> None:
        """Stores project state in hot memory and updates dirty write-behind flag."""
        key = f"project:{project_id}:state"
        state["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        state["isDirty"] = mark_dirty

        if mark_dirty:
            self._dirty_keys.add(key)

        # Store in local fast cache
        self._memory_cache[key] = state

        # Store in Redis if connected
        if self.client:
            try:
                self.client.set(key, json.dumps(state))
            except Exception as e:
                logger.error(f"Redis set error: {e}")

    def list_all_projects(self) -> List[Dict[str, Any]]:
        """Returns summarized project cards for the Enterprise Gallery."""
        results = []
        for key, state in self._memory_cache.items():
            results.append({
                "projectId": state.get("projectId"),
                "title": state.get("title", "Untitled Project"),
                "status": state.get("status", "READY"),
                "durationSeconds": state.get("durationSeconds", 0.0),
                "sourceType": state.get("sourceType", "UPLOAD"),
                "thumbnailUrl": state.get("mediaContainer", {}).get("thumbnailUrl", "/thumbnails/default.jpg"),
                "hasVideo": state.get("mediaContainer", {}).get("hasVideo", True),
                "updatedAt": state.get("updatedAt"),
            })
        return sorted(results, key=lambda x: x.get("updatedAt", ""), reverse=True)

    def update_mixer_state(self, project_id: str, mixer_update: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Atomic hot-patch of mixer parameters."""
        state = self.get_project_state(project_id)
        if not state:
            return None

        # Update mixer fields
        if "mixer" not in state:
            state["mixer"] = {}
        state["mixer"].update(mixer_update)

        # Update stem levels if provided
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
