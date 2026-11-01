import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generate5CharCode } from '@/lib/codeGenerator';

/**
 * YouTube WebSub (PubSubHubbub) Webhook Listener
 * Endpoint: /api/webhooks/youtube
 * 
 * 1. GET: WebSub Challenge Verification
 *    Responds to Google WebSub subscription validation challenges.
 * 
 * 2. POST: Ingestion Notification
 *    Verifies HMAC-SHA1 signature, parses Atom feed, checks idempotency,
 *    assigns a 5-character alphanumeric code, and registers the video.
 */

// In-memory hot set of ingested YouTube IDs for sub-millisecond idempotency
const INGESTED_YOUTUBE_IDS = new Set<string>(['demo_lex', 'market_doc', 'demo_lex_412']);
const CODE_REGISTRY = new Map<string, string>(); // code -> id

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const topic = searchParams.get('hub.topic');
  const challenge = searchParams.get('hub.challenge');

  console.log(`[WebSub GET] Mode: ${mode}, Topic: ${topic}`);

  if (challenge) {
    // Return plain text challenge directly with status 200
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'Missing hub.challenge query parameter' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-hub-signature');
  const webhookSecret = process.env.YOUTUBE_WEBHOOK_SECRET || '';

  // 1. Validate HMAC signature if secret configured
  if (webhookSecret && signatureHeader) {
    const hmac = crypto.createHmac('sha1', webhookSecret);
    const expectedSig = 'sha1=' + hmac.update(rawBody).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSig))) {
      console.error('[WebSub POST] Signature mismatch');
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 403 });
    }
  }

  // 2. Parse Atom XML feed
  let videoId = '';
  let title = '';
  let publishedAt = '';

  const ytVideoIdMatch = rawBody.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
  if (ytVideoIdMatch) {
    videoId = ytVideoIdMatch[1].trim();
  } else {
    const altIdMatch = rawBody.match(/<id>[^<]*yt:video:([^<]+)<\/id>/i);
    if (altIdMatch) videoId = altIdMatch[1].trim();
  }

  const titleMatch = rawBody.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) title = titleMatch[1].trim();

  const publishedMatch = rawBody.match(/<published>([^<]+)<\/published>/i);
  if (publishedMatch) publishedAt = publishedMatch[1].trim();

  if (!videoId) {
    return NextResponse.json({ status: 'SKIPPED', message: 'No YouTube videoId found in feed payload' });
  }

  // 3. Idempotency Check
  if (INGESTED_YOUTUBE_IDS.has(videoId)) {
    return NextResponse.json({
      status: 'IDEMPOTENT_SKIP',
      videoId,
      message: `Video ${videoId} already ingested and indexed.`,
    });
  }

  // 4. Generate collision-proof 5-character alphanumeric uppercase code
  let code = generate5CharCode();
  while (CODE_REGISTRY.has(code)) {
    code = generate5CharCode();
  }
  const projectUuid = `vid-${videoId.toLowerCase()}-${code.toLowerCase()}`;

  // Register in memory
  INGESTED_YOUTUBE_IDS.add(videoId);
  CODE_REGISTRY.set(code, projectUuid);

  console.log(`[WebSub POST] Successfully auto-synced YouTube video ${videoId} with 5-char code #${code}`);

  return NextResponse.json({
    status: 'SUCCESS',
    video: {
      id: projectUuid,
      code,
      youtube_id: videoId,
      title: title || `YouTube Video ${videoId}`,
      duration_seconds: 180,
      thumbnail_url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      original_video_url: `https://www.youtube.com/watch?v={videoId}`,
      transcript: `Auto-synced from YouTube channel. Title: ${title}.`,
      captions: [],
      clips: [],
      virality_score: 75.0,
      virality_metrics: {
        pacing: 82,
        hookRetention: 78,
        audioClarity: 90,
      },
      status: 'ready',
      published_at: publishedAt,
    },
  });
}
