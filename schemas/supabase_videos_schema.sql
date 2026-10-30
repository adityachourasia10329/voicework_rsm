-- ==============================================================================
-- VOICEWORK_RSM - SUPABASE / POSTGRESQL VIDEOS TABLE SCHEMA
-- Auto-Sync Registry, 5-Character Code Index & Full-Text / Trigram Search
-- ==============================================================================

-- Enable UUID extension and Trigram extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- public.videos Table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(5) UNIQUE NOT NULL, -- 5-character alphanumeric ID (Base36, 60M+ combinations)
    youtube_id VARCHAR(32) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    duration_seconds NUMERIC NOT NULL DEFAULT 0,
    thumbnail_url TEXT,
    original_video_url TEXT,
    
    -- Transcript & Captions
    transcript TEXT,               -- Raw transcribed text
    captions JSONB DEFAULT '[]',   -- Timestamped [{start: 0.0, end: 3.2, text: "..."}]
    
    -- Future Extension Fields (Schema Prep)
    clips JSONB DEFAULT '[]',          -- [{clip_id, title, start_time, end_time, viral_score}]
    virality_score NUMERIC DEFAULT 0,  -- Virality meter rating (0.0 to 100.0)
    virality_metrics JSONB DEFAULT '{}', -- Breakdown of pacing, engagement, retention signals
    
    status VARCHAR(32) DEFAULT 'ready',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Full-Text & Trigram search indexes
CREATE INDEX IF NOT EXISTS idx_videos_code ON public.videos(code);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON public.videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_videos_title_trgm ON public.videos USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_videos_transcript_search ON public.videos USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(transcript, '')));
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
