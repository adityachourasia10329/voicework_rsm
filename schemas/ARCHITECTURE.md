# VoiceWork RSM System Architecture

VoiceWork RSM is an enterprise-grade AI audio separation, video remuxing, and surgical spectrogram editing platform engineered for arbitrary-length media (from 30-minute lectures to 2h+ broadcast streams).

```mermaid
flowchart TD
    subgraph Client ["Frontend & Editor (Next.js App Router)"]
        UI[Gallery / Editor Canvas]
        Spec[WebGL / Wavesurfer Mel-Spectrogram]
        Surg[Surgical Bracket Selection Tool]
    end

    subgraph Tier1 ["Tier 1: Hot In-Memory Cache (Redis / Dragonfly)"]
        RState[("project:{id}:state\nSub-3ms Latency\nMixer & Live Stems")]
    end

    subgraph Tier2 ["Tier 2: Relational DB (PostgreSQL / Supabase)"]
        PG[("Organizations, Users, Projects,\nMedia Assets, RBAC")]
    end

    subgraph Tier3 ["Tier 3: Document Store (MongoDB Atlas)"]
        MDoc[("Dense Time-Series SED Timelines,\nSpectrogram FFT Tiles,\nSurgical Revision Logs")]
    end

    subgraph Worker ["GPU & FFmpeg Media Workers"]
        Ingest[Media Ingestion / yt-dlp]
        Lossless[FFmpeg Lossless Demuxer]
        Chunker[Long-Audio 60s Chunker\n2s Linear Crossfades]
        RoFormer[BS-RoFormer / Demucs Stem Isolation]
        DeepFilter[DeepFilterNet3 Speech Enhancement]
        SurgEngine[Surgical Patch Micro-Inference Engine]
        Remuxer[Lossless Video Remuxer -c:v copy]
    end

    UI -->|Sub-3ms State Read/Write| RState
    RState -.->|Async Write-Behind| PG
    RState -.->|Time-Series Sync| MDoc
    Ingest --> Lossless --> Chunker --> RoFormer --> DeepFilter --> RState
    Surg -->|Diagnostic Flag & Time Interval| SurgEngine
    SurgEngine -->|Splice & Crossfade Patch| RState
    UI -->|Trigger Export| Remuxer -->|Zero-Loss Output| UI
```

## Data Tier Breakdown

| Tier | Technology | Purpose | SLA / Access Latency |
| :--- | :--- | :--- | :--- |
| **Tier 1: Hot In-Memory** | Redis / Dragonfly (`project:{id}:state`) | Real-time mixer state, live stem playback URLs, active scrub markers, temporary patch coordinates. | `< 3ms` |
| **Tier 2: Relational DB** | PostgreSQL / Supabase | Tenant tenancy, users, billing quotas, media asset inventory, permissions. | `15 - 35ms` |
| **Tier 3: Document Store** | MongoDB Atlas / JSONB | Heavy time-series: dense Mel-spectrogram FFT tiles, Sound Event Detection (SED) timeline intervals, surgical audit history. | `20 - 50ms` |
