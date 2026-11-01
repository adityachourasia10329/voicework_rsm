import { ProjectState, TranscriptSegment, RSMChannelVideo } from './types';


export const INITIAL_PROJECTS: ProjectState[] = [
  {
    projectId: '7f2a1884-2c63-4b08-9df8-013143527a91',
    code: '7K9Q2',
    youtubeId: '2w7w4n0E9I0',
    youtube_id: '2w7w4n0E9I0',
    orgId: 'org-rsm-enterprise-01',
    title: 'Satsang as a Complete System | Building Inner Resilience Through Meditation',
    status: 'READY',
    durationSeconds: 3504.0,
    sourceType: 'YOUTUBE',
    sourceUrl: 'https://www.youtube.com/watch?v=2w7w4n0E9I0',
    originalVideoUrl: 'https://www.youtube.com/watch?v=2w7w4n0E9I0',
    transcript: 'The following is a live satsang workshop on unity without uniformity, heart-centered meditation, and spiritual absorption from Guru Maharaj teachings at Ramashram Satsang Math.',

    captions: [
      { start: 0.0, end: 4.5, text: 'The following is a conversation on neural audio demixing and next-generation speech isolation.' },
      { start: 4.8, end: 9.2, text: 'When you consider the mathematical separation of overlapping acoustic signals, where does the real challenge lie?' },
      { start: 9.6, end: 15.0, text: 'The fundamental difficulty has always been phase cancellation and time-frequency masking in dense urban environments.' }
    ],
    clips: [
      { clip_id: 'clip-lex-01', title: 'Phase Cancellation in Dense Urban Audio', start_time: 4.8, end_time: 25.0, viral_score: 94.2 }
    ],
    virality_score: 94.2,
    virality_metrics: {
      pacing: 92,
      hookRetention: 96,
      audioClarity: 98
    },
    mediaContainer: {
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      masterAudioWavUrl: '/audio/master_lex.wav',
      videoCodec: 'h264',
      audioCodec: 'pcm_s16le',
      hasVideo: true,
      thumbnailUrl: 'https://i.ytimg.com/vi/2w7w4n0E9I0/hqdefault.jpg',
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
    code: 'B4T81',
    youtubeId: '8sh9P--iyQs',
    youtube_id: '8sh9P--iyQs',
    orgId: 'org-rsm-enterprise-01',
    title: 'Obstacles in Pursuing Peace | Insights from Guru Maharaj & Sant Kabir',
    status: 'READY',
    durationSeconds: 4450.0,
    sourceType: 'YOUTUBE',
    sourceUrl: 'https://www.youtube.com/watch?v=8sh9P--iyQs',
    originalVideoUrl: 'https://www.youtube.com/watch?v=8sh9P--iyQs',
    transcript: 'Live spiritual discourse on the meaning of surrender, holding the rope of Guru Maharaj, and clearing subconscious karmic impressions through regular sadhana.',

    captions: [
      { start: 0.0, end: 5.2, text: 'Live from the outdoor downtown night market where crowd babble and traffic roar are peaking.' },
      { start: 5.5, end: 12.0, text: 'Testing speech extraction under extreme low SNR acoustic conditions with DeepFilterNet3.' },
      { start: 12.5, end: 20.0, text: 'Fresh roasted coffee and spices right here, twenty percent off tonight only!' }
    ],
    clips: [
      { clip_id: 'clip-mkt-01', title: 'Market Crowd Speech Extraction', start_time: 0.0, end_time: 15.0, viral_score: 87.5 }
    ],
    virality_score: 87.5,
    virality_metrics: {
      pacing: 88,
      hookRetention: 84,
      audioClarity: 92
    },
    mediaContainer: {
      originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      masterAudioWavUrl: '/audio/market_master.wav',
      videoCodec: 'prores',
      audioCodec: 'pcm_s24le',
      hasVideo: true,
      thumbnailUrl: 'https://i.ytimg.com/vi/8sh9P--iyQs/hqdefault.jpg',
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

// Alias transcripts by 5-character codes
MOCK_TRANSCRIPTS['7K9Q2'] = MOCK_TRANSCRIPTS['7f2a1884-2c63-4b08-9df8-013143527a91'];
MOCK_TRANSCRIPTS['B4T81'] = MOCK_TRANSCRIPTS['3e9b1192-8f12-4d22-b541-118274920c82'];

export const RSM_CHANNEL_URL = 'https://www.youtube.com/@rsmglobalsatsang';

export const RSM_CHANNEL_VIDEOS: RSMChannelVideo[] = [
  {
    id: 'rsm-vid-01',
    code: '7K9Q2',
    youtubeId: '2w7w4n0E9I0',
    title: 'Satsang as a Complete System | Building Inner Resilience Through Meditation',
    durationSeconds: 3504,
    durationFormatted: '58m 24s',
    clipsCount: 4,
    clips: [
      {
        clip_id: 'clip-rsm-01-1',
        title: 'Core Meditation Formula: Heart-Centered Inner Absorption',
        start_time: 252,
        end_time: 405,
        viral_score: 96,
        timeRange: '04:12 - 06:45',
      },
      {
        clip_id: 'clip-rsm-01-2',
        title: 'Interfaith Spiritual Harmony in Modern Practice',
        start_time: 870,
        end_time: 1035,
        viral_score: 92,
        timeRange: '14:30 - 17:15',
      },
      {
        clip_id: 'clip-rsm-01-3',
        title: 'Cultivating Inner Stillness Amidst Daily Noise',
        start_time: 1680,
        end_time: 1880,
        viral_score: 89,
        timeRange: '28:00 - 31:20',
      },
      {
        clip_id: 'clip-rsm-01-4',
        title: 'Q&A: Overcoming Restless Mind & Wandering Thoughts',
        start_time: 2530,
        end_time: 2790,
        viral_score: 94,
        timeRange: '42:10 - 46:30',
      },
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=2w7w4n0E9I0',
    channelUrl: RSM_CHANNEL_URL,
    thumbnailUrl: 'https://i.ytimg.com/vi/2w7w4n0E9I0/hqdefault.jpg',
    publishedAt: '3 days ago',
    category: 'Meditation Workshop',
    status: 'READY',
    viralityScore: 94.5,
  },
  {
    id: 'rsm-vid-02',
    code: 'B4T81',
    youtubeId: '8sh9P--iyQs',
    title: 'Obstacles in Pursuing Peace | Insights from Guru Maharaj & Sant Kabir',
    durationSeconds: 4450,
    durationFormatted: '1h 14m 10s',
    clipsCount: 6,
    clips: [
      {
        clip_id: 'clip-rsm-02-1',
        title: 'What Does True Spiritual Surrender Mean?',
        start_time: 495,
        end_time: 720,
        viral_score: 97,
        timeRange: '08:15 - 12:00',
      },
      {
        clip_id: 'clip-rsm-02-2',
        title: 'Holding the Rope of Guru Maharaj',
        start_time: 1360,
        end_time: 1570,
        viral_score: 95,
        timeRange: '22:40 - 26:10',
      },
      {
        clip_id: 'clip-rsm-02-3',
        title: 'Clearing Subconscious Karmic Impressions (Samskaras)',
        start_time: 2120,
        end_time: 2340,
        viral_score: 91,
        timeRange: '35:20 - 39:00',
      },
      {
        clip_id: 'clip-rsm-02-4',
        title: 'Spiritual Discipline & Self-Awareness in Modern Life',
        start_time: 2890,
        end_time: 3090,
        viral_score: 88,
        timeRange: '48:10 - 51:30',
      },
      {
        clip_id: 'clip-rsm-02-5',
        title: 'Guided Meditation on Divine Presence in the Heart',
        start_time: 3480,
        end_time: 3795,
        viral_score: 93,
        timeRange: '58:00 - 63:15',
      },
      {
        clip_id: 'clip-rsm-02-6',
        title: 'Closing Shanti Prayer & Universal Blessings',
        start_time: 4200,
        end_time: 4420,
        viral_score: 90,
        timeRange: '70:00 - 73:40',
      },
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=8sh9P--iyQs',
    channelUrl: RSM_CHANNEL_URL,
    thumbnailUrl: 'https://i.ytimg.com/vi/8sh9P--iyQs/hqdefault.jpg',
    publishedAt: '1 week ago',
    category: 'Satsang Discourse',
    status: 'READY',
    viralityScore: 92.8,
  },
  {
    id: 'rsm-vid-03',
    code: 'C8X10',
    youtubeId: 'xlsGLfhi4yc',
    title: 'Worry & Anxiety | Guru Maharaj’s Teachings on Finding Peace Through Thought-Freedom',
    durationSeconds: 2778,
    durationFormatted: '46m 18s',
    clipsCount: 3,
    clips: [
      {
        clip_id: 'clip-rsm-03-1',
        title: 'Karma Yoga: Transforming Daily Action into Worship',
        start_time: 320,
        end_time: 550,
        viral_score: 93,
        timeRange: '05:20 - 09:10',
      },
      {
        clip_id: 'clip-rsm-03-2',
        title: 'Ego Dissolution Through Selfless Seva',
        start_time: 1110,
        end_time: 1320,
        viral_score: 90,
        timeRange: '18:30 - 22:00',
      },
      {
        clip_id: 'clip-rsm-03-3',
        title: 'Radiating Compassion & Peace to All Beings',
        start_time: 2055,
        end_time: 2280,
        viral_score: 95,
        timeRange: '34:15 - 38:00',
      },
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=xlsGLfhi4yc',
    channelUrl: RSM_CHANNEL_URL,
    thumbnailUrl: 'https://i.ytimg.com/vi/xlsGLfhi4yc/hqdefault.jpg',
    publishedAt: '2 weeks ago',
    category: 'Seva & Karma Yoga',
    status: 'READY',
    viralityScore: 93.0,
  },
  {
    id: 'rsm-vid-04',
    code: 'M3V72',
    youtubeId: 'J4QEg51Ym5M',
    title: 'Inception of Ramashram Satsang Mathura: A Journey to Higher Consciousness',
    durationSeconds: 3165,
    durationFormatted: '52m 45s',
    clipsCount: 5,
    clips: [
      {
        clip_id: 'clip-rsm-04-1',
        title: 'The True Indicators of Inner Awakening',
        start_time: 370,
        end_time: 580,
        viral_score: 96,
        timeRange: '06:10 - 09:40',
      },
      {
        clip_id: 'clip-rsm-04-2',
        title: 'Beyond Intellectual Philosophy: Direct Realization',
        start_time: 1020,
        end_time: 1230,
        viral_score: 92,
        timeRange: '17:00 - 20:30',
      },
      {
        clip_id: 'clip-rsm-04-3',
        title: 'Maintaining Equanimity in Times of Crisis',
        start_time: 1660,
        end_time: 1875,
        viral_score: 94,
        timeRange: '27:40 - 31:15',
      },
      {
        clip_id: 'clip-rsm-04-4',
        title: 'Consistency in Daily Morning & Evening Sadhana',
        start_time: 2360,
        end_time: 2570,
        viral_score: 89,
        timeRange: '39:20 - 42:50',
      },
      {
        clip_id: 'clip-rsm-04-5',
        title: 'The Subtle Transmission of Guru’s Grace',
        start_time: 2820,
        end_time: 3070,
        viral_score: 91,
        timeRange: '47:00 - 51:10',
      },
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=J4QEg51Ym5M',
    channelUrl: RSM_CHANNEL_URL,
    thumbnailUrl: 'https://i.ytimg.com/vi/J4QEg51Ym5M/hqdefault.jpg',
    publishedAt: '3 weeks ago',
    category: 'Spiritual Growth',
    status: 'READY',
    viralityScore: 92.4,
  },
  {
    id: 'rsm-vid-05',
    code: 'P9L44',
    youtubeId: 'aBYfhOJAx90',
    title: 'Q&A: How to Balance Spirituality and Daily Life? | Live Satsang',
    durationSeconds: 3750,
    durationFormatted: '1h 02m 30s',
    clipsCount: 4,
    clips: [
      {
        clip_id: 'clip-rsm-05-1',
        title: 'Awakening from the Illusion of Separateness',
        start_time: 290,
        end_time: 510,
        viral_score: 95,
        timeRange: '04:50 - 08:30',
      },
      {
        clip_id: 'clip-rsm-05-2',
        title: 'The Science of Internal Subtle Sound & Vibration',
        start_time: 1095,
        end_time: 1360,
        viral_score: 92,
        timeRange: '18:15 - 22:40',
      },
      {
        clip_id: 'clip-rsm-05-3',
        title: 'Witness Consciousness (Sakshi Bhava)',
        start_time: 1930,
        end_time: 2160,
        viral_score: 94,
        timeRange: '32:10 - 36:00',
      },
      {
        clip_id: 'clip-rsm-05-4',
        title: 'Experiencing Boundless Joy and Peace Within',
        start_time: 2880,
        end_time: 3135,
        viral_score: 91,
        timeRange: '48:00 - 52:15',
      },
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=aBYfhOJAx90',
    channelUrl: RSM_CHANNEL_URL,
    thumbnailUrl: 'https://i.ytimg.com/vi/aBYfhOJAx90/hqdefault.jpg',
    publishedAt: '1 month ago',
    category: 'Consciousness',
    status: 'READY',
    viralityScore: 93.1,
  },
  {
    id: 'rsm-vid-06',
    code: 'K2W89',
    youtubeId: 'nm3spoZI3q0',
    title: 'How to Tame the Monkey Mind During Meditation | Pandit Mihilal Ji Teachings',
    durationSeconds: 2952,
    durationFormatted: '49m 12s',
    clipsCount: 3,
    clips: [
      {
        clip_id: 'clip-rsm-06-1',
        title: 'Opening the Spiritual Heart Center (Anahata)',
        start_time: 430,
        end_time: 645,
        viral_score: 94,
        timeRange: '07:10 - 10:45',
      },
      {
        clip_id: 'clip-rsm-06-2',
        title: 'Forgiveness as the Gateway to Divine Love',
        start_time: 1290,
        end_time: 1510,
        viral_score: 91,
        timeRange: '21:30 - 25:10',
      },
      {
        clip_id: 'clip-rsm-06-3',
        title: 'Becoming an Instrument of Light & Harmony',
        start_time: 2160,
        end_time: 2420,
        viral_score: 93,
        timeRange: '36:00 - 40:20',
      },
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=nm3spoZI3q0',
    channelUrl: RSM_CHANNEL_URL,
    thumbnailUrl: 'https://i.ytimg.com/vi/nm3spoZI3q0/hqdefault.jpg',
    publishedAt: '1 month ago',
    category: 'Meditation & Devotion',
    status: 'READY',
    viralityScore: 92.7,
  },
  {
    id: 'rsm-vid-07',
    code: 'R5N17',
    youtubeId: 'xaxyyG535Pw',
    title: 'How to Overcome Negativity | Live Satsang Workshop',
    durationSeconds: 4085,
    durationFormatted: '1h 08m 05s',
    clipsCount: 5,
    clips: [
      {
        clip_id: 'clip-rsm-07-1',
        title: 'Harmonizing Spiritual Practice with Family Duties',
        start_time: 340,
        end_time: 560,
        viral_score: 95,
        timeRange: '05:40 - 09:20',
      },
      {
        clip_id: 'clip-rsm-07-2',
        title: 'The Power of Pure Intent in Every Thought',
        start_time: 1150,
        end_time: 1370,
        viral_score: 90,
        timeRange: '19:10 - 22:50',
      },
      {
        clip_id: 'clip-rsm-07-3',
        title: 'Overcoming Fear Through Absolute Faith',
        start_time: 1980,
        end_time: 2235,
        viral_score: 93,
        timeRange: '33:00 - 37:15',
      },
      {
        clip_id: 'clip-rsm-07-4',
        title: 'Devotional Chanting & Sound Current Alignment',
        start_time: 2780,
        end_time: 3000,
        viral_score: 92,
        timeRange: '46:20 - 50:00',
      },
      {
        clip_id: 'clip-rsm-07-5',
        title: 'Closing Contemplation: Unity in All Manifestation',
        start_time: 3615,
        end_time: 3870,
        viral_score: 89,
        timeRange: '60:15 - 64:30',
      },
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=xaxyyG535Pw',
    channelUrl: RSM_CHANNEL_URL,
    thumbnailUrl: 'https://i.ytimg.com/vi/xaxyyG535Pw/hqdefault.jpg',
    publishedAt: '2 months ago',
    category: 'Discourse & Devotion',
    status: 'READY',
    viralityScore: 92.0,
  },
];


