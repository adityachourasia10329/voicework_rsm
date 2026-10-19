"""
Surgical Micro-Inference API Endpoint
Handles user-directed time-bracket re-evaluation and live crossfade patching.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..cache.redis_store import hot_store
from ..core.surgical_patcher import SurgicalPatcher

router = APIRouter(prefix="/api/projects", tags=["surgical"])

class SurgicalRecheckRequest(BaseModel):
    startSec: float
    endSec: float
    diagnosticFlag: str # "VOICE_MUFFLED_LOST", "RESIDUAL_NOISE_AUDIBLE", "BLEED_FROM_BACKGROUND"
    userNotes: Optional[str] = None
    crossfadeWindowSec: Optional[float] = 2.0

@router.post("/{project_id}/surgical-recheck")
async def surgical_recheck_bracket(project_id: str, req: SurgicalRecheckRequest):
    """
    Surgically re-processes ONLY the user-flagged time interval [startSec, endSec]
    using the specified diagnostic recovery strategy, then crossfade-splices the patch
    seamlessly into the master stem track.
    """
    state = hot_store.get_project_state(project_id)
    if not state:
        raise HTTPException(status_code=404, detail="Project not found")

    if req.startSec >= req.endSec:
        raise HTTPException(status_code=400, detail="startSec must be less than endSec")

    # Execute micro-inference
    revision = SurgicalPatcher.reprocess_time_bracket(
        project_id=project_id,
        start_sec=req.startSec,
        end_sec=req.endSec,
        diagnostic_flag=req.diagnosticFlag,
        user_notes=req.userNotes,
        crossfade_window_sec=req.crossfadeWindowSec or 2.0
    )

    # Append to project surgical history in Tier 1 Hot Store
    updated_state = hot_store.append_surgical_revision(project_id, revision)

    return {
        "status": "SUCCESS",
        "revision": revision,
        "surgicalHistory": updated_state.get("surgicalHistory", [])
    }
