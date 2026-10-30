"""
Videos & Instant Search API
Provides dual-route resolution via UUID or 5-character alphanumeric code,
and sub-3ms instant search across titles, transcripts, and metadata.
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from ..cache.redis_store import hot_store

router = APIRouter(tags=["videos"])

@router.get("/api/videos")
async def list_videos():
    """Lists all videos registered in the system."""
    return {"status": "SUCCESS", "videos": hot_store.list_all_videos()}

@router.get("/api/videos/{id_or_code}")
async def get_video_by_identifier(id_or_code: str):
    """
    Dual-Route Identifier Resolution:
    Resolves a video via either its 5-character alphanumeric code (e.g., '7K9Q2')
    or its full UUID.
    """
    video = hot_store.get_video(id_or_code)
    if not video:
        raise HTTPException(
            status_code=404,
            detail=f"Video with identifier '{id_or_code}' not found in registry."
        )
    return {"status": "SUCCESS", "video": video}

@router.get("/api/search")
async def search_videos(
    q: Optional[str] = Query("", alias="q"),
    limit: int = Query(50, alias="limit")
):
    """
    Unified Instant Search:
    Searches across:
    1. 5-character code (Base36 exact or prefix match)
    2. Video titles (trigram / substring match)
    3. Transcript dialogue text
    4. YouTube IDs & Stem tags
    """
    results = hot_store.search_videos(q or "", limit=limit)
    return {
        "status": "SUCCESS",
        "query": q,
        "count": len(results),
        "results": results
    }
