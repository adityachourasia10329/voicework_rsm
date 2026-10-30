import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PROJECTS } from '../../../../lib/mockData';

/**
 * Dual-Route Video Resolver API
 * Endpoint: /api/videos/[id]
 * 
 * Resolves video entity via either:
 * - 5-character alphanumeric code (e.g. '7K9Q2', 'B4T81')
 * - Full UUID (e.g. '7f2a1884-2c63-4b08-9df8-013143527a91')
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = params.id.trim();
  const tokenUpper = token.toUpperCase();

  // 1. Try resolving via 5-character code
  let found = INITIAL_PROJECTS.find(
    (p) => (p.code && p.code.toUpperCase() === tokenUpper)
  );

  // 2. Try resolving via UUID / projectId
  if (!found) {
    found = INITIAL_PROJECTS.find(
      (p) => p.projectId.toLowerCase() === token.toLowerCase()
    );
  }

  // 3. Try resolving via YouTube ID
  if (!found) {
    found = INITIAL_PROJECTS.find(
      (p) => p.youtubeId && p.youtubeId.toLowerCase() === token.toLowerCase()
    );
  }

  if (!found) {
    return NextResponse.json(
      { error: `Video with identifier '${params.id}' not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: 'SUCCESS',
    video: found,
  });
}
