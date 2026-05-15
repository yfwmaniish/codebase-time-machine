// ============================================================
// GET /api/repos/[id]/timeline?file=path — File commit timeline
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;
  const filePath = request.nextUrl.searchParams.get('file');

  if (!filePath) {
    return NextResponse.json({ error: 'file query param required' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Get the file record
  const { data: fileRecord } = await supabase
    .from('files')
    .select('id')
    .eq('repo_id', repoId)
    .eq('path', filePath)
    .single();

  if (!fileRecord) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Get commits that touched this file via file_changes join
  // For MVP, we search commits by checking if any file change references this file
  const { data: commits, error } = await supabase
    .from('commits')
    .select('id, sha, message, author_name, author_email, authored_at, files_changed, insertions, deletions')
    .eq('repo_id', repoId)
    .order('authored_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }

  // For MVP: filter commits client-side or return all
  // In production, we'd use file_changes join table
  return NextResponse.json({
    file: filePath,
    timeline: commits || [],
  });
}
