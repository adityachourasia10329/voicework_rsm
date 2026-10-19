"""
Projects & Editor State API
Provides sub-3ms state retrieval from Tier 1 Hot Store,
and updates multi-stem mixer parameters.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from ..cache.redis_store import hot_store
from ..core.spectrogram import SpectrogramEngine
from ..core.sed_classifier import SoundEventClassifier

router = APIRouter(prefix="/api/projects", tags=["projects"])

class StemUpdate(BaseModel):
    stemId: str
    volumeDb: float
    isMuted: bool
    isSolo: bool
    pan: float

class MixerUpdateRequest(BaseModel):
    mode: Optional[str] = None
    masterGainDb: Optional[float] = None
    expressClarityDial: Optional[float] = None
    preset: Optional[str] = None
    stems: Optional[List[Dict[str, Any]]] = None

@router.get("")
async def list_projects():
    """Enterprise Gallery view project cards powered by in-memory metadata."""
    projects = hot_store.list_all_projects()
    return {"projects": projects, "total": len(projects)}

@router.get("/{project_id}")
async def get_project_state(project_id: str):
    """
    Sub-3ms project state retrieval from Tier 1 Hot In-Memory cache.
    Includes synced spectrogram frames and Sound Event Detection (SED) intervals.
    """
    state = hot_store.get_project_state(project_id)
    if not state:
        raise HTTPException(status_code=404, detail="Project not found")

    duration = state.get("durationSeconds", 60.0)
    spectrogram_frames = SpectrogramEngine.generate_spectrogram_frames(duration_sec=min(duration, 90.0))
    sed_events = SoundEventClassifier.generate_timeline_events(total_duration_sec=duration)

    return {
        "project": state,
        "spectrogram": {
            "frames": spectrogram_frames,
            "totalFrames": len(spectrogram_frames),
            "freqBands": ["Speech Formants", "Crowd Murmur", "Traffic Low-End", "Music Harmonics"]
        },
        "soundEvents": sed_events
    }

@router.patch("/{project_id}/mixer")
async def update_mixer(project_id: str, req: MixerUpdateRequest):
    """
    Atomic update of live track mixer levels, Solo/Mute, and Express Mode dial.
    """
    update_data = {}
    if req.mode is not None:
        update_data["mode"] = req.mode
    if req.masterGainDb is not None:
        update_data["masterGainDb"] = req.masterGainDb
    if req.expressClarityDial is not None:
        update_data["expressClarityDial"] = req.expressClarityDial
    if req.preset is not None:
        update_data["preset"] = req.preset
    if req.stems is not None:
        update_data["stems"] = req.stems

    updated_state = hot_store.update_mixer_state(project_id, update_data)
    if not updated_state:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"status": "UPDATED", "mixer": updated_state.get("mixer"), "stems": updated_state.get("stems")}
