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

export type EditorMode = 'EXPRESS' | 'FULL_AUTHORITY' | 'STEMS_REMOVAL';
export type PresetMode = 'VOICE_ONLY' | 'NATURAL_AMBIENT_CLEAN' | 'REMOVE_MUSIC' | 'CUSTOM' | null;

export interface MixerState {
  mode: EditorMode;
  masterGainDb: number;
  expressClarityDial: number; // 0 - 100
  preset: PresetMode;
}

export interface VideoCaption {
  start: number;
  end: number;
  text: string;
}

export interface VideoClip {
  clip_id: string;
  title: string;
  start_time: number;
  end_time: number;
  viral_score: number;
}

export interface ViralityMetrics {
  pacing?: number;
  hookRetention?: number;
  audioClarity?: number;
  [key: string]: any;
}

export interface ProjectState {
  projectId: string;
  code?: string; // 5-character alphanumeric uppercase ID (e.g. '7K9Q2', 'B4T81')
  youtubeId?: string;
  youtube_id?: string;
  orgId: string;
  title: string;
  status: ProjectStatus;
  durationSeconds: number;
  sourceType: 'UPLOAD' | 'YOUTUBE';
  sourceUrl?: string;
  originalVideoUrl?: string;
  mediaContainer: MediaContainer;
  mixer: MixerState;
  stems: StemTrack[];
  surgicalHistory: SurgicalRevision[];
  transcript?: string;
  captions?: VideoCaption[];
  clips?: VideoClip[];
  virality_score?: number;
  virality_metrics?: ViralityMetrics;
  updatedAt?: string;
  createdAt?: string;
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

export interface TranscriptSegment {
  id: string;
  startSec: number;
  endSec: number;
  speaker?: string;
  text: string;
}
