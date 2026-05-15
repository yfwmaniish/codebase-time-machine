// ============================================================
// GET /api/repos/[id] — Repository metadata + stats
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;
  const supabase = createServerClient();

  const { data: repo, error } = await supabase
    .from('repositories')
    .select('*')
    .eq('id', repoId)
    .single();

  if (error || !repo) {
    return NextResponse.json(
      { error: 'Repository not found' },
      { status: 404 }
    );
  }

  // Get top authors
  const { data: authors } = await supabase
    .from('authors')
    .select('id, name, email, total_commits, files_touched, domains')
    .eq('repo_id', repoId)
    .order('total_commits', { ascending: false })
    .limit(10);

  // Get language breakdown
  const { data: files } = await supabase
    .from('files')
    .select('language')
    .eq('repo_id', repoId);

  const languages: Record<string, number> = {};
  files?.forEach((f) => {
    if (f.language) {
      languages[f.language] = (languages[f.language] || 0) + 1;
    }
  });

  return NextResponse.json({
    ...repo,
    top_authors: authors || [],
    languages,
  });
}
