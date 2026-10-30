import { ProjectState, TranscriptSegment } from './types';

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

export const MOCK_TRANSCRIPTS: Record<string, TranscriptSegment[]> = {
  '7f2a1884-2c63-4b08-9df8-013143527a91': [
    { id: 't-1', startSec: 0.0, endSec: 4.5, speaker: 'Lex', text: 'The following is a conversation on neural audio demixing and next-generation speech isolation.' },
    { id: 't-2', startSec: 4.8, endSec: 9.2, speaker: 'Lex', text: 'When you consider the mathematical separation of overlapping acoustic signals, where does the real challenge lie?' },
    { id: 't-3', startSec: 9.6, endSec: 15.0, speaker: 'Guest', text: 'The fundamental difficulty has always been phase cancellation and time-frequency masking in dense urban environments.' },
    { id: 't-4', startSec: 15.3, endSec: 21.4, speaker: 'Guest', text: 'With BS-RoFormer, we process multi-band spectrograms directly in the frequency domain with RoPE positional embeddings.' },
    { id: 't-5', startSec: 21.8, endSec: 27.5, speaker: 'Lex', text: 'And that prevents the classic underwater robotic artifacts that previous U-Net architectures suffered from.' },
    { id: 't-6', startSec: 28.0, endSec: 34.2, speaker: 'Guest', text: 'Exactly. Even when a loud diesel truck passes by at 80 Hz, the vocal formants in the 300 to 3,000 Hz range stay completely pristine.' },
    { id: 't-7', startSec: 34.8, endSec: 41.0, speaker: 'Lex', text: 'What about the zero-loss video remuxing? How does the pipeline ensure video bitrate remains bit-identical?' },
    { id: 't-8', startSec: 41.5, endSec: 48.0, speaker: 'Guest', text: 'We execute FFmpeg stream copy with -c:v copy. We never re-encode video frames; we only replace the audio stream track.' },
    { id: 't-9', startSec: 48.5, endSec: 56.0, speaker: 'Lex', text: 'Let us talk about surgical interval re-evaluation. If an engineer spots a 3-second noise bleed, what happens behind the scenes?' },
    { id: 't-10', startSec: 56.5, endSec: 64.2, speaker: 'Guest', text: 'Instead of re-running the 2-hour pipeline, we extract just that 60-second window, run micro-inference with 2-second crossfades, and stitch it back in.' },
    { id: 't-11', startSec: 64.8, endSec: 72.0, speaker: 'Lex', text: 'That saves immense GPU compute while giving mastering engineers surgical control over every frequency octave.' },
    { id: 't-12', startSec: 72.5, endSec: 81.0, speaker: 'Guest', text: 'Precisely. That is why having the Mel-spectrogram heatmap aligned with timecoded transcript words is so essential for diagnostic workflows.' },
    { id: 't-13', startSec: 81.5, endSec: 90.0, speaker: 'Lex', text: 'You can immediately click any word in the transcript, jump straight to that timestamp, and isolate the exact vocal sibilance or traffic rumble.' },
    { id: 't-14', startSec: 90.5, endSec: 100.0, speaker: 'Guest', text: 'And with Gemini API integration, we can extract contextual speaker diarization, keyword timestamps, and sentiment analysis in real time.' },
    { id: 't-15', startSec: 100.5, endSec: 112.0, speaker: 'Lex', text: 'It creates a unified multi-modal studio workstation where audio engineering and large language models intersect seamlessly.' },
    { id: 't-16', startSec: 112.5, endSec: 125.0, speaker: 'Guest', text: 'The future of post-production audio is not just filters and EQ; it is cognitive understanding of the sonic scene.' },
    { id: 't-17', startSec: 125.5, endSec: 135.0, speaker: 'Lex', text: 'Thank you for explaining this so clearly. Let us listen back to the isolated vocal stem.' },
    { id: 't-18', startSec: 135.5, endSec: 142.5, speaker: 'Guest', text: 'My pleasure. Hit play on the timeline and notice the total absence of room reflections.' }
  ],
  '3e9b1192-8f12-4d22-b541-118274920c82': [
    { id: 'm-1', startSec: 0.0, endSec: 5.2, speaker: 'Reporter', text: 'Live from the outdoor downtown night market where crowd babble and traffic roar are peaking.' },
    { id: 'm-2', startSec: 5.5, endSec: 12.0, speaker: 'Reporter', text: 'Testing speech extraction under extreme low SNR acoustic conditions with DeepFilterNet3.' },
    { id: 'm-3', startSec: 12.5, endSec: 20.0, speaker: 'Vendor', text: 'Fresh roasted coffee and spices right here, twenty percent off tonight only!' },
    { id: 'm-4', startSec: 20.5, endSec: 28.0, speaker: 'Reporter', text: 'Notice how the foreground microphone keeps the speech clear while attenuating the surround crowd chatter.' }
  ]
};
