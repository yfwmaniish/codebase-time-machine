// ============================================================
// GET /api/repos/[id]/authors — List contributors
// GET /api/repos/[id]/authors/[authorId] — Author profile
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

  const { data: authors, error } = await supabase
    .from('authors')
    .select('*')
    .eq('repo_id', repoId)
    .order('total_commits', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }

  return NextResponse.json({ authors: authors || [] });
}
