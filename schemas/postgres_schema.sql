-- ==============================================================================
-- VOICEWORK_RSM - TIER 2 RELATIONAL DATABASE SCHEMA (PostgreSQL / Supabase)
-- Multi-Tenant RBAC, Organization Management, Asset Registry, and Project State
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    billing_tier VARCHAR(50) DEFAULT 'ENTERPRISE',
    storage_quota_bytes BIGINT DEFAULT 1099511627776, -- 1 TB default
    storage_used_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Membership Roles & RBAC (Many-to-Many Organization Members)
CREATE TYPE membership_role_enum AS ENUM ('OWNER', 'ADMIN', 'AUDIO_ENGINEER', 'VIEWER');

CREATE TABLE IF NOT EXISTS membership_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role membership_role_enum NOT NULL DEFAULT 'AUDIO_ENGINEER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- 4. Projects (Linked to Redis Tier 1 Hot State)
CREATE TYPE project_status_enum AS ENUM (
    'INGESTING', 'EXTRACTING', 'SEPARATING', 'READY', 'SURGICAL_PATCHING', 'REMUXING', 'EXPORTED', 'FAILED'
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status_enum NOT NULL DEFAULT 'INGESTING',
    source_type VARCHAR(50) NOT NULL, -- 'UPLOAD' or 'YOUTUBE'
    source_url TEXT,
    duration_seconds DOUBLE PRECISION DEFAULT 0.0,
    thumbnail_url TEXT,
    has_video BOOLEAN DEFAULT TRUE,
    
    -- In-Memory Sync Pointer & Checksums
    redis_state_key VARCHAR(128) GENERATED ALWAYS AS ('project:' || id || ':state') STORED,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Media Assets (Source containers, extracted audio, stems, remuxed video)
CREATE TYPE asset_type_enum AS ENUM (
    'ORIGINAL_VIDEO', 'EXTRACTED_WAV', 'ISOLATED_STEM', 'SURGICAL_PATCH', 'REMUXED_MASTER', 'MEL_SPECTROGRAM_TILE'
);

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    asset_type asset_type_enum NOT NULL,
    stem_category VARCHAR(64), -- e.g. 'SPEECH_MAIN', 'NOISE_TRAFFIC', 'MUSIC_INSTRUMENTAL'
    storage_r2_path TEXT NOT NULL,
    cdn_playback_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    sample_rate INT DEFAULT 44100,
    channels INT DEFAULT 2,
    bit_depth INT DEFAULT 16,
    duration_seconds DOUBLE PRECISION,
    checksum_sha256 VARCHAR(64),
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Indexes for Sub-3ms Lookups & Multi-Tenant Queries
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_project_type ON media_assets(project_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_membership_org_user ON membership_roles(organization_id, user_id);
