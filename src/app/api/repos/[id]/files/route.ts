// ============================================================
// GET /api/repos/[id]/files — File tree and file details
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

  try {
    // Get all files for the repository
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('repo_id', repoId)
      .order('path', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      );
    }

    // Build file tree structure
    const fileTree = buildFileTree(files || []);

    return NextResponse.json({
      files: files || [],
      tree: fileTree,
      total: files?.length || 0,
    });
  } catch (error) {
    console.error('Files API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  language?: string;
  risk_score?: number;
  commit_count?: number;
  unique_authors?: number;
  children?: FileNode[];
}

function buildFileTree(files: Array<{
  path: string;
  language: string | null;
  risk_score: number;
  commit_count: number;
  unique_authors: number;
}>): FileNode[] {
  const root: FileNode[] = [];
  const nodeMap = new Map<string, FileNode>();

  // Sort files by path for consistent tree building
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    const parts = file.path.split('/');
    let currentPath = '';
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Check if node already exists
      let node = nodeMap.get(currentPath);

      if (!node) {
        // Create new node
        node = {
          name: part,
          path: currentPath,
          type: isLastPart ? 'file' : 'directory',
        };

        // Add file-specific properties
        if (isLastPart) {
          node.language = file.language || undefined;
          node.risk_score = file.risk_score;
          node.commit_count = file.commit_count;
          node.unique_authors = file.unique_authors;
        } else {
          node.children = [];
        }

        nodeMap.set(currentPath, node);
        currentLevel.push(node);
      }

      // Move to next level
      if (!isLastPart && node.children) {
        currentLevel = node.children;
      }
    }
  }

  return root;
}

// Made with Bob
