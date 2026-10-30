"""
VoiceWork RSM - Backend API & Orchestration Server
Enterprise-grade AI Audio Separation, Video Remuxing, and Visual Spectrogram Editing.
"""

import os
import uuid
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .cache.redis_store import hot_store
from .api import ingestion, projects, surgical, export, webhooks, cron, videos

app = FastAPI(
    title="VoiceWork RSM API",
    description="Enterprise API for AI Audio Separation, Zero-Loss Remuxing & Surgical Spectrogram Editing",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(ingestion.router)
app.include_router(projects.router)
app.include_router(surgical.router)
app.include_router(export.router)
app.include_router(webhooks.router)
app.include_router(cron.router)
app.include_router(videos.router)

# Seed realistic demo projects into Tier 1 Hot In-Memory Cache on startup
def seed_demo_projects():
    demo_id_1 = "7f2a1884-2c63-4b08-9df8-013143527a91"
    demo_id_2 = "3e9b1192-8f12-4d22-b541-118274920c82"

    state_1 = {
        "id": demo_id_1,
        "projectId": demo_id_1,
        "code": "7K9Q2",
        "youtube_id": "demo_lex_412",
        "youtubeId": "demo_lex_412",
        "orgId": "org-rsm-enterprise-01",
        "title": "Lex Fridman Interview #412 - Studio Denoise & Stem Isolation",
        "status": "ready",
        "durationSeconds": 142.5,
        "duration_seconds": 142.5,
        "sourceType": "YOUTUBE",
        "sourceUrl": "https://www.youtube.com/watch?v=demo_lex",
        "original_video_url": "https://www.youtube.com/watch?v=demo_lex",
        "thumbnail_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
        "transcript": "Welcome to the podcast. Today my guest is discussing artificial intelligence, deep neural networks for audio processing, and how lossless stem extraction transforms production quality.",
        "captions": [
            {"start": 0.0, "end": 4.2, "text": "Welcome to the podcast."},
            {"start": 4.2, "end": 10.5, "text": "Today my guest is discussing artificial intelligence and neural audio processing."}
        ],
        "clips": [
            {"clip_id": "clip-lex-01", "title": "AI Breakthrough Discussion", "start_time": 0.0, "end_time": 35.0, "viral_score": 94.2}
        ],
        "virality_score": 94.2,
        "virality_metrics": {
            "pacing": 92,
            "hookRetention": 96,
            "audioClarity": 98
        },

        "mediaContainer": {
            "originalVideoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "masterAudioWavUrl": "/audio/master_lex.wav",
            "videoCodec": "h264",
            "audioCodec": "pcm_s16le",
            "hasVideo": True,
            "thumbnailUrl": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
            "remuxedMasterUrl": None
        },
        "mixer": {
            "mode": "FULL_AUTHORITY",
            "masterGainDb": 0.0,
            "expressClarityDial": 88.0,
            "preset": "VOICE_ONLY"
        },
        "stems": [
            {
                "stemId": "stem-lex-speech",
                "type": "SPEECH_MAIN",
                "label": "Host & Guest Dialogue",
                "audioUrl": "/audio/lex_speech.wav",
                "volumeDb": 0.0,
                "isMuted": False,
                "isSolo": False,
                "pan": 0.0,
                "colorHex": "#10B981"
            },
            {
                "stemId": "stem-lex-traffic",
                "type": "NOISE_TRAFFIC",
                "label": "Exterior Street Traffic",
                "audioUrl": "/audio/lex_traffic.wav",
                "volumeDb": -24.0,
                "isMuted": False,
                "isSolo": False,
                "pan": -0.1,
                "colorHex": "#EF4444"
            },
            {
                "stemId": "stem-lex-crowd",
                "type": "NOISE_CROWD",
                "label": "Studio Crew & Movement",
                "audioUrl": "/audio/lex_crowd.wav",
                "volumeDb": -28.0,
                "isMuted": False,
                "isSolo": False,
                "pan": 0.2,
                "colorHex": "#3B82F6"
            },
            {
                "stemId": "stem-lex-hum",
                "type": "NOISE_INDUSTRIAL_HUM",
                "label": "HVAC Air Conditioner",
                "audioUrl": "/audio/lex_hum.wav",
                "volumeDb": -32.0,
                "isMuted": False,
                "isSolo": False,
                "pan": 0.0,
                "colorHex": "#F97316"
            },
            {
                "stemId": "stem-lex-music",
                "type": "MUSIC_INSTRUMENTAL",
                "label": "Intro / Outro Synth Theme",
                "audioUrl": "/audio/lex_music.wav",
                "volumeDb": -14.0,
                "isMuted": False,
                "isSolo": False,
                "pan": 0.0,
                "colorHex": "#A855F7"
            }
        ],
        "surgicalHistory": [
            {
                "revisionId": "rev-82190-surg",
                "startSec": 14.2,
                "endSec": 18.5,
                "diagnosticFlag": "VOICE_MUFFLED_LOST",
                "appliedModel": "DeepFilterNet3-FormantRecovery",
                "status": "PATCHED",
                "crossfadeWindowSec": 2.0,
                "timestamp": "2026-10-19T14:30:00Z"
            }
        ]
    }

    state_2 = {
        "id": demo_id_2,
        "projectId": demo_id_2,
        "code": "B4T81",
        "youtube_id": "market_station_doc",
        "youtubeId": "market_station_doc",
        "orgId": "org-rsm-enterprise-01",
        "title": "Documentary Field Recording - Busy Market & Train Station",
        "status": "ready",
        "durationSeconds": 94.0,
        "duration_seconds": 94.0,
        "sourceType": "UPLOAD",
        "sourceUrl": "/storage/uploads/market_doc.mov",
        "original_video_url": "/storage/uploads/market_doc.mov",
        "thumbnail_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
        "transcript": "Capturing ambient field sounds across the central transit hub and busy street bazaar. Multi-mic binaural recording.",
        "captions": [
            {"start": 0.0, "end": 6.0, "text": "Capturing ambient field sounds across the central transit hub."},
            {"start": 6.0, "end": 14.2, "text": "Notice the separation between the train engine low-frequency rumble and surrounding human voices."}
        ],
        "clips": [
            {"clip_id": "clip-mkt-01", "title": "Train Station Rumble Isolation", "start_time": 2.0, "end_time": 28.0, "viral_score": 87.5}
        ],
        "virality_score": 87.5,
        "virality_metrics": {
            "pacing": 88,
            "hookRetention": 84,
            "audioClarity": 92
        },
        "mediaContainer": {
            "originalVideoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "masterAudioWavUrl": "/audio/market_master.wav",
            "videoCodec": "prores",
            "audioCodec": "pcm_s24le",
            "hasVideo": True,
            "thumbnailUrl": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
            "remuxedMasterUrl": None
        },
        "mixer": {
            "mode": "EXPRESS",
            "masterGainDb": 0.0,
            "expressClarityDial": 75.0,
            "preset": "NATURAL_AMBIENT_CLEAN"
        },

        "stems": [
            {
                "stemId": "stem-mkt-speech",
                "type": "SPEECH_MAIN",
                "label": "Narrator Voiceover",
                "audioUrl": "/audio/mkt_speech.wav",
                "volumeDb": +1.5,
                "isMuted": False,
                "isSolo": False,
                "pan": 0.0,
                "colorHex": "#10B981"
            },
            {
                "stemId": "stem-mkt-traffic",
                "type": "NOISE_TRAFFIC",
                "label": "Locomotive & Road Rumble",
                "audioUrl": "/audio/mkt_traffic.wav",
                "volumeDb": -16.0,
                "isMuted": False,
                "isSolo": False,
                "pan": -0.3,
                "colorHex": "#EF4444"
            },
            {
                "stemId": "stem-mkt-crowd",
                "type": "NOISE_CROWD",
                "label": "Market Crowd Chatter",
                "audioUrl": "/audio/mkt_crowd.wav",
                "volumeDb": -14.0,
                "isMuted": False,
                "isSolo": False,
                "pan": 0.3,
                "colorHex": "#3B82F6"
            }
        ],
        "surgicalHistory": []
    }

    hot_store.set_project_state(demo_id_1, state_1, mark_dirty=False)
    hot_store.set_project_state(demo_id_2, state_2, mark_dirty=False)

seed_demo_projects()

@app.get("/")
async def root():
    return {
        "service": "VoiceWork RSM Engine",
        "version": "2.0.0",
        "status": "HEALTHY",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "endpoints": {
            "projects": "/api/projects",
            "ingest_upload": "/api/ingest/upload",
            "ingest_youtube": "/api/ingest/youtube",
            "surgical_recheck": "/api/projects/{id}/surgical-recheck",
            "remux_video": "/api/projects/{id}/remux"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "OK", "uptime": "100%", "tier1_cache": "CONNECTED"}
