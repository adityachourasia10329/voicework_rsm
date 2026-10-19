"""
Media Ingestion API
Handles direct media file uploads and remote YouTube streams via yt-dlp.
"""

import os
import uuid
import subprocess
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..cache.redis_store import hot_store
from ..core.demuxer import MediaDemuxer
from ..core.separator import StemSeparationEngine
from ..core.sed_classifier import SoundEventClassifier
from ..core.spectrogram import SpectrogramEngine

logger = logging.getLogger("voicework.ingestion")
router = APIRouter(prefix="/api/ingest", tags=["ingestion"])

UPLOAD_STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../storage/uploads"))
os.makedirs(UPLOAD_STORAGE_DIR, exist_ok=True)

class YouTubeIngestRequest(BaseModel):
    youtubeUrl: str
    title: Optional[str] = None
    separationModel: Optional[str] = "bs-roformer-v2"

@router.post("/upload")
async def ingest_file_upload(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    separationModel: Optional[str] = Form("bs-roformer-v2")
):
    """
    Direct upload endpoint for MP4, MOV, MKV, WAV, MP3, FLAC.
    Extracts lossless audio via FFmpeg and seeds Tier 1 hot state.
    """
    project_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())
    filename = file.filename or "media_upload"
    file_ext = os.path.splitext(filename)[1].lower()
    
    project_dir = os.path.join(UPLOAD_STORAGE_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    raw_path = os.path.join(project_dir, f"source{file_ext}")

    try:
        # Save uploaded file
        with open(raw_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Probe container
        probe_info = MediaDemuxer.probe_media(raw_path)
        duration_sec = probe_info.get("duration", 45.0)
        has_video = probe_info.get("has_video", True)

        # Extract lossless audio
        wav_path = os.path.join(project_dir, "master_audio.wav")
        if has_video or file_ext in [".mp4", ".mov", ".mkv"]:
            MediaDemuxer.extract_lossless_audio(raw_path, wav_path)
        else:
            wav_path = raw_path

        # Generate isolated stems
        stems = StemSeparationEngine.separate_wav(wav_path, os.path.join(project_dir, "stems"))

        # Build initial project state
        project_title = title or os.path.splitext(filename)[0].replace("_", " ").title()
        state = {
            "projectId": project_id,
            "orgId": org_id,
            "title": project_title,
            "status": "READY",
            "durationSeconds": round(duration_sec, 2),
            "sourceType": "UPLOAD",
            "sourceUrl": f"/storage/uploads/{project_id}/source{file_ext}",
            "mediaContainer": {
                "originalVideoUrl": f"/storage/uploads/{project_id}/source{file_ext}" if has_video else None,
                "masterAudioWavUrl": f"/storage/uploads/{project_id}/master_audio.wav",
                "videoCodec": "h264" if has_video else None,
                "audioCodec": "pcm_s16le",
                "hasVideo": has_video,
                "thumbnailUrl": "/thumbnails/video_placeholder.jpg"
            },
            "mixer": {
                "mode": "FULL_AUTHORITY",
                "masterGainDb": 0.0,
                "expressClarityDial": 85.0,
                "preset": "VOICE_ONLY"
            },
            "stems": stems,
            "surgicalHistory": []
        }

        hot_store.set_project_state(project_id, state)
        return {"status": "SUCCESS", "projectId": project_id, "project": state}

    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/youtube")
async def ingest_youtube_stream(req: YouTubeIngestRequest):
    """
    Ingests remote YouTube media using yt-dlp and extracts audio.
    """
    project_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())
    project_dir = os.path.join(UPLOAD_STORAGE_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    out_template = os.path.join(project_dir, "source.%(ext)s")

    cmd = [
        "yt-dlp",
        "--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "-o", out_template,
        req.youtubeUrl
    ]
    logger.info(f"Running yt-dlp: {' '.join(cmd)}")

    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)
        video_file = os.path.join(project_dir, "source.mp4")
        if not os.path.exists(video_file):
            # Check if any downloaded file exists
            files = [os.path.join(project_dir, f) for f in os.listdir(project_dir)]
            if files:
                video_file = files[0]
            else:
                raise RuntimeError(f"yt-dlp produced no output: {proc.stderr}")

        probe_info = MediaDemuxer.probe_media(video_file)
        duration_sec = probe_info.get("duration", 60.0)
        has_video = probe_info.get("has_video", True)

        wav_path = os.path.join(project_dir, "master_audio.wav")
        MediaDemuxer.extract_lossless_audio(video_file, wav_path)
        stems = StemSeparationEngine.separate_wav(wav_path, os.path.join(project_dir, "stems"))

        title = req.title or "YouTube Stream Capture"
        state = {
            "projectId": project_id,
            "orgId": org_id,
            "title": title,
            "status": "READY",
            "durationSeconds": round(duration_sec, 2),
            "sourceType": "YOUTUBE",
            "sourceUrl": req.youtubeUrl,
            "mediaContainer": {
                "originalVideoUrl": f"/storage/uploads/{project_id}/source.mp4",
                "masterAudioWavUrl": f"/storage/uploads/{project_id}/master_audio.wav",
                "videoCodec": "h264",
                "audioCodec": "pcm_s16le",
                "hasVideo": has_video,
                "thumbnailUrl": "/thumbnails/youtube_placeholder.jpg"
            },
            "mixer": {
                "mode": "FULL_AUTHORITY",
                "masterGainDb": 0.0,
                "expressClarityDial": 80.0,
                "preset": "VOICE_ONLY"
            },
            "stems": stems,
            "surgicalHistory": []
        }

        hot_store.set_project_state(project_id, state)
        return {"status": "SUCCESS", "projectId": project_id, "project": state}

    except Exception as e:
        logger.error(f"YouTube ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
