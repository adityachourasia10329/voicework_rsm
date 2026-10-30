import { NextRequest, NextResponse } from 'next/server';
import { generate5CharCode } from '../../../../lib/codeGenerator';
import { INITIAL_PROJECTS } from '../../../../lib/mockData';

/**
 * YouTube Channel Cron Ingestor
 * Endpoint: /api/cron/sync-channel
 * 
 * Scheduled sync fallback querying the channel using YouTube Data API v3 or yt-dlp.
 * Idempotently ignores existing videos and ingests newly detected uploads.
 */

// Registry sets to guarantee idempotency and uniqueness
const INGESTED_CHANNEL_VIDEOS = new Set<string>(
  INITIAL_PROJECTS.map((p) => p.youtubeId || p.projectId).filter(Boolean) as string[]
);
const TAKEN_CODES = new Set<string>(
  INITIAL_PROJECTS.map((p) => p.code).filter(Boolean) as string[]
);

export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

async function handleSync(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const channelId = searchParams.get('channelId') || process.env.YOUTUBE_CHANNEL_ID || 'UC_x5XG1OV2P6uZZ5FSM9Ttw';
  const maxVideos = parseInt(searchParams.get('maxVideos') || '10', 10);

  console.log(`[Cron Sync] Triggering channel ingest fallback for channel: ${channelId}`);

  // In production, queries YouTube Data API v3:
  // https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=UU...&key=...
  // Or runs yt-dlp flat-playlist.
  // Here we simulate the discovered videos list for the sync job:
  const discoveredUploads = [
    {
      youtube_id: '9bZkp7q19f0',
      title: 'Neural Audio Demixing & BS-RoFormer v2 Spectral Benchmarks',
      duration_seconds: 184,
      thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      original_video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      published_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      youtube_id: 'dQw4w9WgXcQ',
      title: 'VoiceWork Masterclass - Lossless 48kHz Audio Isolation',
      duration_seconds: 212,
      thumbnail_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      original_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      published_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const newlyIngested = [];
  const skippedExisting = [];

  for (const upload of discoveredUploads) {
    if (INGESTED_CHANNEL_VIDEOS.has(upload.youtube_id)) {
      skippedExisting.push(upload.youtube_id);
      continue;
    }

    // Generate collision-proof 5-character alphanumeric code
    let code = generate5CharCode();
    while (TAKEN_CODES.has(code)) {
      code = generate5CharCode();
    }
    TAKEN_CODES.add(code);
    INGESTED_CHANNEL_VIDEOS.add(upload.youtube_id);

    const videoId = `vid-${upload.youtube_id}-${code.toLowerCase()}`;
    const newVideo = {
      id: videoId,
      code,
      youtube_id: upload.youtube_id,
      title: upload.title,
      duration_seconds: upload.duration_seconds,
      thumbnail_url: upload.thumbnail_url,
      original_video_url: upload.original_video_url,
      transcript: `Official studio transcript for: ${upload.title}. Automatically ingested from YouTube channel.`,
      captions: [
        { start: 0.0, end: 5.0, text: `Welcome to ${upload.title}.` },
        { start: 5.0, end: 15.0, text: 'This session showcases neural audio separation and spectrogram analysis.' },
      ],
      clips: [
        { clip_id: `clip-${code}-1`, title: 'Highlight Reel', start_time: 0.0, end_time: 30.0, viral_score: 91.5 },
      ],
      virality_score: 91.5,
      virality_metrics: {
        pacing: 88,
        hookRetention: 94,
        audioClarity: 97,
      },
      status: 'ready',
      created_at: upload.published_at,
    };

    newlyIngested.push(newVideo);
  }

  return NextResponse.json({
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    channel_id: channelId,
    total_scanned: discoveredUploads.length,
    newly_ingested_count: newlyIngested.length,
    newly_ingested: newlyIngested,
    skipped_existing_count: skippedExisting.length,
    skipped_existing: skippedExisting,
  });
}
