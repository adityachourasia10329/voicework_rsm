import { ProjectState } from './types';

export const INITIAL_PROJECTS: ProjectState[] = [
  {
    projectId: '7f2a1884-2c63-4b08-9df8-013143527a91',
    orgId: 'org-rsm-enterprise-01',
    title: 'Lex Fridman Interview #412 - Studio Denoise & Stem Isolation',
    status: 'READY',
    durationSeconds: 142.5,
    sourceType: 'YOUTUBE',
    sourceUrl: 'https://www.youtube.com/watch?v=demo_lex',
    mediaContainer: {
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      masterAudioWavUrl: '/audio/master_lex.wav',
      videoCodec: 'h264',
      audioCodec: 'pcm_s16le',
      hasVideo: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
      remuxedMasterUrl: null
    },
    mixer: {
      mode: 'FULL_AUTHORITY',
      masterGainDb: 0.0,
      expressClarityDial: 88.0,
      preset: 'VOICE_ONLY'
    },
    stems: [
      {
        stemId: 'stem-lex-speech',
        type: 'SPEECH_MAIN',
        label: 'Host & Guest Dialogue',
        audioUrl: '/audio/lex_speech.wav',
        volumeDb: 0.0,
        isMuted: false,
        isSolo: false,
        pan: 0.0,
        colorHex: '#10B981'
      },
      {
        stemId: 'stem-lex-traffic',
        type: 'NOISE_TRAFFIC',
        label: 'Exterior Street Traffic',
        audioUrl: '/audio/lex_traffic.wav',
        volumeDb: -24.0,
        isMuted: false,
        isSolo: false,
        pan: -0.1,
        colorHex: '#EF4444'
      },
      {
        stemId: 'stem-lex-crowd',
        type: 'NOISE_CROWD',
        label: 'Studio Crew & Movement',
        audioUrl: '/audio/lex_crowd.wav',
        volumeDb: -28.0,
        isMuted: false,
        isSolo: false,
        pan: 0.2,
        colorHex: '#3B82F6'
      },
      {
        stemId: 'stem-lex-hum',
        type: 'NOISE_INDUSTRIAL_HUM',
        label: 'HVAC Air Conditioner',
        audioUrl: '/audio/lex_hum.wav',
        volumeDb: -32.0,
        isMuted: false,
        isSolo: false,
        pan: 0.0,
        colorHex: '#F97316'
      },
      {
        stemId: 'stem-lex-music',
        type: 'MUSIC_INSTRUMENTAL',
        label: 'Intro / Outro Synth Theme',
        audioUrl: '/audio/lex_music.wav',
        volumeDb: -14.0,
        isMuted: false,
        isSolo: false,
        pan: 0.0,
        colorHex: '#A855F7'
      }
    ],
    surgicalHistory: [
      {
        revisionId: 'rev-82190-surg',
        startSec: 14.2,
        endSec: 18.5,
        flagType: 'VOICE_MUFFLED_LOST',
        appliedModel: 'DeepFilterNet3-FormantRecovery',
        status: 'PATCHED',
        crossfadeWindowSec: 2.0,
        timestamp: '2026-10-19T14:30:00Z'
      }
    ],
    updatedAt: '2026-10-19T16:20:00Z'
  },
  {
    projectId: '3e9b1192-8f12-4d22-b541-118274920c82',
    orgId: 'org-rsm-enterprise-01',
    title: 'Documentary Field Recording - Busy Market & Train Station',
    status: 'READY',
    durationSeconds: 94.0,
    sourceType: 'UPLOAD',
    sourceUrl: '/storage/uploads/market_doc.mov',
    mediaContainer: {
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      masterAudioWavUrl: '/audio/market_master.wav',
      videoCodec: 'prores',
      audioCodec: 'pcm_s24le',
      hasVideo: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      remuxedMasterUrl: null
    },
    mixer: {
      mode: 'EXPRESS',
      masterGainDb: 0.0,
      expressClarityDial: 75.0,
      preset: 'NATURAL_AMBIENT_CLEAN'
    },
    stems: [
      {
        stemId: 'stem-mkt-speech',
        type: 'SPEECH_MAIN',
        label: 'Narrator Voiceover',
        audioUrl: '/audio/mkt_speech.wav',
        volumeDb: 1.5,
        isMuted: false,
        isSolo: false,
        pan: 0.0,
        colorHex: '#10B981'
      },
      {
        stemId: 'stem-mkt-traffic',
        type: 'NOISE_TRAFFIC',
        label: 'Locomotive & Road Rumble',
        audioUrl: '/audio/mkt_traffic.wav',
        volumeDb: -16.0,
        isMuted: false,
        isSolo: false,
        pan: -0.3,
        colorHex: '#EF4444'
      },
      {
        stemId: 'stem-mkt-crowd',
        type: 'NOISE_CROWD',
        label: 'Market Crowd Chatter',
        audioUrl: '/audio/mkt_crowd.wav',
        volumeDb: -14.0,
        isMuted: false,
        isSolo: false,
        pan: 0.3,
        colorHex: '#3B82F6'
      }
    ],
    surgicalHistory: [],
    updatedAt: '2026-10-19T15:10:00Z'
  }
];
