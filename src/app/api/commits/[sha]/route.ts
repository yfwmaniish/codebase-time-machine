// ============================================================
// GET /api/commits/[sha] — Commit details with AI summary
// POST /api/commits/[sha]/diff — Get diff for specific file
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { summarizeCommit } from '@/lib/rag';

export const dynamic = 'force-dynamic';

// GET commit details with optional AI summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sha: string }> }
) {
  const { sha } = await params;
  const supabase = createServerClient();
  const generateSummary = request.nextUrl.searchParams.get('summary') === 'true';

  try {
    // Get commit details
    const { data: commit, error } = await supabase
      .from('commits')
      .select('*')
      .eq('sha', sha)
      .single();

    if (error || !commit) {
      return NextResponse.json(
        { error: 'Commit not found' },
        { status: 404 }
      );
    }

    let summary: string | undefined;
    if (generateSummary) {
      try {
        // Generate AI summary (with mock diff for now)
        summary = await summarizeCommit(
          commit.message,
          `Files changed: ${commit.files_changed}\nInsertions: ${commit.insertions}\nDeletions: ${commit.deletions}`
        );
      } catch (summaryError) {
        console.error('Summary generation failed:', summaryError);
        summary = 'Unable to generate summary';
      }
    }

    return NextResponse.json({
      ...commit,
      summary,
    });
  } catch (error) {
    console.error('Commit API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commit' },
      { status: 500 }
    );
  }
}

// Made with Bob
