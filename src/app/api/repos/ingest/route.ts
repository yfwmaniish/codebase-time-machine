// ============================================================
// POST /api/repos/ingest — Start repository ingestion
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateGitHubUrl, extractRepoName } from '@/lib/git-parser';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim().replace(/\.git$/, '');

    if (!validateGitHubUrl(cleanUrl)) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL. Please use format: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const repoName = extractRepoName(cleanUrl);

    // Check if repo already exists
    const { data: existing } = await supabase
      .from('repositories')
      .select('id, status')
      .eq('github_url', cleanUrl)
      .single();

    if (existing) {
      if (existing.status === 'ready') {
        return NextResponse.json({
          repo_id: existing.id,
          status: 'ready',
          message: 'Repository already indexed',
        });
      }
      // If still indexing, return the existing ID
      return NextResponse.json({
        repo_id: existing.id,
        status: existing.status,
        message: 'Repository is being indexed',
      });
    }

    // Create new repository record
    const repoId = uuid();
    const { error: insertError } = await supabase
      .from('repositories')
      .insert({
        id: repoId,
        github_url: cleanUrl,
        name: repoName,
        status: 'pending',
        total_commits: 0,
        total_files: 0,
        total_authors: 0,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Failed to create repo record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create repository record' },
        { status: 500 }
      );
    }

    // Trigger background ingestion (non-blocking)
    // In production this would be a queue job; for MVP we fire-and-forget
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/repos/${repoId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl }),
    }).catch(console.error);

    return NextResponse.json({
      repo_id: repoId,
      status: 'pending',
      message: 'Ingestion started',
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
