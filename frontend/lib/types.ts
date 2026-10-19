export type ProjectStatus =
  | 'INGESTING'
  | 'EXTRACTING'
  | 'SEPARATING'
  | 'READY'
  | 'SURGICAL_PATCHING'
  | 'REMUXING'
  | 'EXPORTED'
  | 'FAILED';

export type StemType =
  | 'SPEECH_MAIN'
  | 'BACKING_VOCALS'
  | 'NOISE_TRAFFIC'
  | 'NOISE_CROWD'
  | 'NOISE_ROOM_TONE'
  | 'NOISE_INDUSTRIAL_HUM'
  | 'NOISE_TRANSIENTS'
  | 'NOISE_WIND'
  | 'MUSIC_INSTRUMENTAL'
  | 'MUSIC_DRUMS'
  | 'MUSIC_BASS'
  | 'MUSIC_OTHER';

export interface StemTrack {
  stemId: string;
  type: StemType;
  label: string;
  audioUrl: string;
  volumeDb: number;
  isMuted: boolean;
  isSolo: boolean;
  pan: number; // -1.0 to +1.0
  colorHex: string;
}

export type DiagnosticFlag =
  | 'VOICE_MUFFLED_LOST'
  | 'RESIDUAL_NOISE_AUDIBLE'
  | 'BLEED_FROM_BACKGROUND';

export interface SurgicalRevision {
  revisionId: string;
  startSec: number;
  endSec: number;
  flagType: DiagnosticFlag;
  appliedModel: string;
  status: 'QUEUED' | 'PROCESSING' | 'PATCHED' | 'FAILED';
  crossfadeWindowSec: number;
  timestamp: string;
}

export interface MediaContainer {
  originalVideoUrl: string | null;
  masterAudioWavUrl: string;
  videoCodec: string | null;
  audioCodec: string;
  hasVideo: boolean;
  thumbnailUrl?: string;
  remuxedMasterUrl?: string | null;
}

export type EditorMode = 'EXPRESS' | 'FULL_AUTHORITY';
export type PresetMode = 'VOICE_ONLY' | 'NATURAL_AMBIENT_CLEAN' | 'REMOVE_MUSIC' | 'CUSTOM' | null;

export interface MixerState {
  mode: EditorMode;
  masterGainDb: number;
  expressClarityDial: number; // 0 - 100
  preset: PresetMode;
}

export interface ProjectState {
  projectId: string;
  orgId: string;
  title: string;
  status: ProjectStatus;
  durationSeconds: number;
  sourceType: 'UPLOAD' | 'YOUTUBE';
  sourceUrl?: string;
  mediaContainer: MediaContainer;
  mixer: MixerState;
  stems: StemTrack[];
  surgicalHistory: SurgicalRevision[];
  updatedAt?: string;
}

export interface SoundEvent {
  startSec: number;
  endSec: number;
  label: string;
  confidence: number;
  frequencyRangeHz: [number, number];
  rmsDb: number;
}

export interface SpectrogramBin {
  freqHz: number;
  energy: number;
  layer: 'speech' | 'traffic' | 'crowd' | 'music' | 'ambient';
}

export interface SpectrogramFrame {
  timeSec: number;
  bins: SpectrogramBin[];
  dominantLayer: string;
}
