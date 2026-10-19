/**
 * VOICEWORK_RSM - TIER 3 DOCUMENT STORE SCHEMAS (MongoDB / JSONB)
 * Manages heavy time-series data: Sound Event Detection timelines,
 * FFT Spectrogram coordinates, and Surgical User-Directed Revision History.
 */

import { Schema, model, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// 1. Sound Event Detection (SED) Time-Series Document
// ---------------------------------------------------------------------------
export interface ISoundEvent {
  startSec: number;
  endSec: number;
  label:
    | 'SPEECH_MAIN'
    | 'SPEECH_OVERLAP'
    | 'NOISE_TRAFFIC'
    | 'NOISE_CROWD'
    | 'NOISE_ROOM_TONE'
    | 'NOISE_INDUSTRIAL_HUM'
    | 'NOISE_TRANSIENT_CLICK'
    | 'NOISE_WIND'
    | 'MUSIC_BEAT';
  confidence: number; // 0.0 - 1.0
  frequencyRangeHz: [number, number]; // [min_hz, max_hz]
  rmsDb: number;
}

export interface ISoundEventTimelineDocument extends Document {
  projectId: string; // Foreign Key to PostgreSQL projects.id
  version: number;
  totalDurationSeconds: number;
  classifiedEvents: ISoundEvent[];
  sedModelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SoundEventTimelineSchema = new Schema<ISoundEventTimelineDocument>(
  {
    projectId: { type: String, required: true, index: true },
    version: { type: Number, default: 1 },
    totalDurationSeconds: { type: Number, required: true },
    classifiedEvents: [
      {
        startSec: { type: Number, required: true },
        endSec: { type: Number, required: true },
        label: {
          type: String,
          enum: [
            'SPEECH_MAIN',
            'SPEECH_OVERLAP',
            'NOISE_TRAFFIC',
            'NOISE_CROWD',
            'NOISE_ROOM_TONE',
            'NOISE_INDUSTRIAL_HUM',
            'NOISE_TRANSIENT_CLICK',
            'NOISE_WIND',
            'MUSIC_BEAT',
          ],
          required: true,
        },
        confidence: { type: Number, min: 0, max: 1, required: true },
        frequencyRangeHz: { type: [Number], required: true },
        rmsDb: { type: Number, required: true },
      },
    ],
    sedModelVersion: { type: String, default: 'SED-RoFormer-v2.4' },
  },
  { timestamps: true, collection: 'sound_event_timelines' }
);

// Compound index for querying events by project and time window
SoundEventTimelineSchema.index({ projectId: 1, version: -1 });

// ---------------------------------------------------------------------------
// 2. Spectrogram Tile & FFT Coordinate Matrix
// ---------------------------------------------------------------------------
export interface ISpectrogramTileDocument extends Document {
  projectId: string; // Foreign Key to PostgreSQL projects.id
  tileIndex: number;
  startSec: number;
  endSec: number;
  fftResolution: number; // e.g., 1024 or 2048
  sampleRate: number; // 44100
  colorMappedTileUrl: string; // Pre-rendered RGB spectrogram tile (R=Traffic, G=Speech, B=Crowd, A=Music)
  rawFloat32MatrixUrl?: string; // Dense binary Float32Array on Cloudflare R2
  minFrequencyHz: number;
  maxFrequencyHz: number;
  createdAt: Date;
}

export const SpectrogramTileSchema = new Schema<ISpectrogramTileDocument>(
  {
    projectId: { type: String, required: true, index: true },
    tileIndex: { type: Number, required: true },
    startSec: { type: Number, required: true },
    endSec: { type: Number, required: true },
    fftResolution: { type: Number, default: 1024 },
    sampleRate: { type: Number, default: 44100 },
    colorMappedTileUrl: { type: String, required: true },
    rawFloat32MatrixUrl: { type: String },
    minFrequencyHz: { type: Number, default: 20 },
    maxFrequencyHz: { type: Number, default: 20000 },
  },
  { timestamps: true, collection: 'spectrogram_tiles' }
);

SpectrogramTileSchema.index({ projectId: 1, tileIndex: 1 }, { unique: true });
SpectrogramTileSchema.index({ projectId: 1, startSec: 1, endSec: 1 });

// ---------------------------------------------------------------------------
// 3. User-Flagged Surgical Revision History
// ---------------------------------------------------------------------------
export interface ISurgicalRevisionHistoryDocument extends Document {
  projectId: string; // Foreign Key to PostgreSQL projects.id
  revisionId: string; // UUID
  userId: string; // User who flagged the bracket
  timeBracket: {
    startSec: number;
    endSec: number;
    durationSec: number;
  };
  diagnosticFlag: 'VOICE_MUFFLED_LOST' | 'RESIDUAL_NOISE_AUDIBLE' | 'BLEED_FROM_BACKGROUND';
  userNotes?: string;
  recheckParameters: {
    suppressionThresholdDb?: number;
    spectralRecoveryFactor?: number;
    subtractiveNoiseProfile?: string;
    crossfadeWindowSec: number; // default 2.0s
  };
  inferenceWorkerId: string;
  executionDurationMs: number;
  beforePatchRmsDb: number;
  afterPatchRmsDb: number;
  patchedMasterSha256: string;
  createdAt: Date;
}

export const SurgicalRevisionHistorySchema = new Schema<ISurgicalRevisionHistoryDocument>(
  {
    projectId: { type: String, required: true, index: true },
    revisionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    timeBracket: {
      startSec: { type: Number, required: true },
      endSec: { type: Number, required: true },
      durationSec: { type: Number, required: true },
    },
    diagnosticFlag: {
      type: String,
      enum: ['VOICE_MUFFLED_LOST', 'RESIDUAL_NOISE_AUDIBLE', 'BLEED_FROM_BACKGROUND'],
      required: true,
    },
    userNotes: { type: String },
    recheckParameters: {
      suppressionThresholdDb: { type: Number },
      spectralRecoveryFactor: { type: Number },
      subtractiveNoiseProfile: { type: String },
      crossfadeWindowSec: { type: Number, default: 2.0 },
    },
    inferenceWorkerId: { type: String, required: true },
    executionDurationMs: { type: Number, required: true },
    beforePatchRmsDb: { type: Number, required: true },
    afterPatchRmsDb: { type: Number, required: true },
    patchedMasterSha256: { type: String, required: true },
  },
  { timestamps: true, collection: 'surgical_revisions' }
);

SurgicalRevisionHistorySchema.index({ projectId: 1, createdAt: -1 });

export const SoundEventTimeline = model<ISoundEventTimelineDocument>(
  'SoundEventTimeline',
  SoundEventTimelineSchema
);
export const SpectrogramTile = model<ISpectrogramTileDocument>(
  'SpectrogramTile',
  SpectrogramTileSchema
);
export const SurgicalRevisionHistory = model<ISurgicalRevisionHistoryDocument>(
  'SurgicalRevisionHistory',
  SurgicalRevisionHistorySchema
);
