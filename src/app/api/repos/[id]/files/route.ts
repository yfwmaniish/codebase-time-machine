// ============================================================
// GET /api/repos/[id]/files — File tree
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

  const { data: files, error } = await supabase
    .from('files')
    .select('id, path, language, commit_count, unique_authors, risk_score')
    .eq('repo_id', repoId)
    .order('path', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }

  // Build tree structure
  const tree = buildFileTree(files || []);

  return NextResponse.json({ files: files || [], tree });
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  language?: string;
  commit_count?: number;
  risk_score?: number;
}

function buildFileTree(files: Array<{ path: string; language: string | null; commit_count: number; risk_score: number }>): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const existing = current.find(n => n.name === part);

      if (existing) {
        if (!isFile && existing.children) {
          current = existing.children;
        }
      } else {
        const node: TreeNode = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          type: isFile ? 'file' : 'directory',
          ...(isFile ? { language: file.language || undefined, commit_count: file.commit_count, risk_score: file.risk_score } : { children: [] }),
        };
        current.push(node);
        if (!isFile && node.children) {
          current = node.children;
        }
      }
    }
  }

  return root;
}
