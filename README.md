# VoiceWork RSM (`voicework_rsm`)

Enterprise-grade AI Audio Separation, Video Remuxing, and Visual Spectrogram Editing with Surgical User-Directed Re-processing.

---

## 1. Core Architectural Modules

### A. Media Ingestion & Zero-Loss Remuxing Engine
- **Input Formats:** Direct upload (`MP4`, `MOV`, `MKV`, `WAV`, `MP3`, `FLAC`) and remote streams (YouTube via headless `yt-dlp`).
- **Lossless Audio Extraction:** Lossless PCM 16-bit 44.1kHz audio extracted via FFmpeg (`ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 44100 audio.wav`). Original video container preserved in S3/Cloudflare R2.
- **Lossless Video Remuxing:** On export, remuxes refined audio master back into video container with stream copying (`ffmpeg -i original.mp4 -i refined_master.wav -c:v copy -map 0:v:0 -map 1:a:0 -shortest output.mp4`) with zero quality degradation.

### B. High-Fidelity Audio Separation & SED Pipeline
- **Arbitrary-Length Chunking:** Handles files from 30m to 2h+. Audio exceeding 60 seconds is sliced into 30-to-60-second overlapping blocks with 2-second linear crossfades to prevent GPU Out-Of-Memory (OOM) failures.
- **Separation Models:** BS-RoFormer v2, Mel-Band RoFormer, HTDemucs v4, and DeepFilterNet3 for speech enhancement and noise suppression.
- **Stem Classes:** Target Speech (Clean Voice), Ambient Traffic, Crowd Chatter, HVAC/Industrial Hum, Transients/Clicks, and Music.
- **Mel-Spectrogram Generation:** WebGL/Canvas multi-spectral layer visualizer color-coding Target Speech (Green), Traffic (Red), Crowd (Blue), and Music (Purple).

### C. Unified Memory & Dual-Database Storage Architecture
- **Tier 1 (Hot In-Memory):** Redis / Dragonfly key `project:{project_id}:state` providing `< 3ms` latency for gallery cards, live multi-stem mixer faders, and timeline scrubbing.
- **Tier 2 (Relational DB):** PostgreSQL / Supabase schema (`organizations`, `users`, `projects`, `media_assets`, `membership_roles`) for multi-tenant RBAC and billing quotas.
- **Tier 3 (Document Store):** MongoDB Atlas for heavy time-series data: Sound Event Detection (SED) intervals, FFT coordinate matrices, and user-flagged surgical revision logs.

### D. Surgical "Time-Bracket Flagging & Recheck" Engine
- Click & drag timeline intervals (e.g. `00:14:20 - 00:18:50`) on the spectrogram canvas.
- Diagnostic flags:
  - `[Voice Muffled / Lost]` &rarr; Formant recovery & lower suppression threshold.
  - `[Residual Noise Audible]` &rarr; Aggressive noise-profile subtraction.
  - `[Bleed from Background]` &rarr; Narrowband notch & harmonic isolation.
- Only re-evaluates the targeted time bracket and crossfade-splices the patch into the master stem without re-rendering the entire file.

---

## 2. Directory Structure

```text
voicework_rsm/
├── schemas/                     # Data Contracts & Schemas
│   ├── redis_contract.json      # Tier 1: project:{id}:state hot store
│   ├── postgres_schema.sql      # Tier 2: Relational tables & indexes
│   ├── postgres_schema.prisma   # Prisma ORM schema
│   ├── mongo_schemas.ts         # Tier 3: MongoDB SED & Spectrogram schemas
│   └── ARCHITECTURE.md          # Architecture flow diagram
├── backend/                     # Audio Pipeline & API Services
│   ├── app/
│   │   ├── main.py              # FastAPI server entrypoint
│   │   ├── core/
│   │   │   ├── demuxer.py       # FFmpeg lossless extraction & remuxer
│   │   │   ├── audio_chunker.py # 60s overlapping chunker with 2s crossfades
│   │   │   ├── separator.py     # BS-RoFormer & DeepFilterNet3 wrapper
│   │   │   ├── sed_classifier.py# Sound Event Detection classifier
│   │   │   ├── spectrogram.py   # Multi-spectral energy layer generator
│   │   │   └── surgical_patcher.py # Sub-segment micro-inference & patcher
│   │   ├── api/
│   │   │   ├── ingestion.py     # Upload & yt-dlp endpoints
│   │   │   ├── projects.py      # Sub-3ms state & mixer endpoints
│   │   │   ├── surgical.py      # Surgical recheck endpoint
│   │   │   └── export.py        # Video remuxing & stems ZIP endpoints
│   │   └── cache/
│   │       └── redis_store.py   # Hot in-memory unified state manager
├── frontend/                    # Next.js App Router Web Application
│   ├── app/
│   │   ├── page.tsx             # Enterprise Gallery & Ingestion
│   │   └── editor/[id]/page.tsx # Full Authority & Express Mode Editor
│   ├── components/
│   │   ├── Navbar.tsx           # Status indicators & navigation
│   │   ├── IngestionModal.tsx   # Upload & YouTube media ingestion
│   │   ├── ProjectGallery.tsx   # Project cards & quick actions
│   │   ├── VideoPlayer.tsx      # Synced video preview & timecode
│   │   ├── SpectrogramCanvas.tsx# WebGL Mel-spectrogram & bracket selector
│   │   ├── StemMixer.tsx        # Multi-stem faders, solo, mute, pan
│   │   ├── ExpressControls.tsx  # Beginner dial & studio presets
│   │   └── SurgicalModal.tsx    # Diagnostic flagging modal
│   └── lib/
│       ├── types.ts             # Unified data contracts
│       └── mockData.ts          # Seeded multi-stem video projects
├── wrangler.toml                # Cloudflare Pages & R2 project configuration
└── package.json                 # Project scripts
```

---

## 3. Quickstart & Development

### Run Next.js Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Enterprise Gallery and Editor.

### Run Python Backend Pipeline
```bash
uv run uvicorn backend.app.main:app --port 8000 --reload
```

### Build Production Bundle
```bash
npm run build
```

---

## 4. Cloudflare Deployment

Deploy directly to Cloudflare Pages:
```bash
npx wrangler pages deploy frontend/.next --project-name=voicework_rsm
```
Or connect your GitHub repository `voicework_rsm` to Cloudflare Pages in the dashboard for automatic continuous deployments on every `git push`.
