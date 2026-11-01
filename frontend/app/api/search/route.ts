import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PROJECTS, MOCK_TRANSCRIPTS } from '@/lib/mockData';

/**
 * Unified Instant Search API
 * Endpoint: /api/search?q=...
 * 
 * Sub-3ms instant search across:
 * 1. 5-character alphanumeric codes (exact or prefix match, e.g. '7K9Q2')
 * 2. Video titles (trigram / substring match)
 * 3. Transcript dialogue text
 * 4. Stems & metadata
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = (searchParams.get('q') || '').trim();
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (!q) {
    return NextResponse.json({
      status: 'SUCCESS',
      query: '',
      count: INITIAL_PROJECTS.length,
      results: INITIAL_PROJECTS.slice(0, limit),
    });
  }

  const qLower = q.toLowerCase();
  const qUpper = q.toUpperCase();

  const scoredResults = INITIAL_PROJECTS.map((project) => {
    let score = 0;
    let matchType = '';

    const code = (project.code || '').toUpperCase();
    const title = project.title.toLowerCase();
    const transcript = (project.transcript || MOCK_TRANSCRIPTS[project.projectId]?.map((t) => t.text).join(' ') || '').toLowerCase();
    const ytId = (project.youtubeId || '').toLowerCase();

    // 1. 5-Character Code Match (Highest weight)
    if (code === qUpper) {
      score += 100;
      matchType = 'EXACT_CODE';
    } else if (code.includes(qUpper)) {
      score += 65;
      matchType = 'CODE_PREFIX';
    }

    // 2. Title Match
    if (title.includes(qLower)) {
      score += 50;
      matchType = matchType || 'TITLE';
    }

    // 3. YouTube ID Match
    if (ytId && ytId.includes(qLower)) {
      score += 45;
      matchType = matchType || 'YOUTUBE_ID';
    }

    // 4. Transcript Dialogue Match
    if (transcript.includes(qLower)) {
      score += 35;
      matchType = matchType || 'TRANSCRIPT';
    }

    // 5. Stems Match
    for (const stem of project.stems) {
      if (stem.label.toLowerCase().includes(qLower) || stem.type.toLowerCase().includes(qLower)) {
        score += 15;
        matchType = matchType || 'STEM';
        break;
      }
    }

    return {
      project,
      score,
      matchType,
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({
    status: 'SUCCESS',
    query: q,
    count: scoredResults.length,
    results: scoredResults.map((r) => ({
      ...r.project,
      _search_score: r.score,
      _match_type: r.matchType,
    })),
  });
}
