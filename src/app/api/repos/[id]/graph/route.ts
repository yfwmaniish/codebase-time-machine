// ============================================================
// GET /api/repos/[id]/graph — Knowledge graph data
// Returns nodes (files, authors, commits) and edges for D3 visualization
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface GraphNode {
  id: string;
  type: 'file' | 'author' | 'commit' | 'adr';
  label: string;
  metadata?: Record<string, unknown>;
  size?: number;
  color?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'wrote' | 'modified' | 'decided' | 'depends';
  weight?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;
  const supabase = createServerClient();

  try {
    // Get top files (by commit count)
    const { data: files } = await supabase
      .from('files')
      .select('id, path, language, commit_count, unique_authors, risk_score')
      .eq('repo_id', repoId)
      .order('commit_count', { ascending: false })
      .limit(50);

    // Get top authors
    const { data: authors } = await supabase
      .from('authors')
      .select('id, name, email, total_commits, files_touched, domains')
      .eq('repo_id', repoId)
      .order('total_commits', { ascending: false })
      .limit(20);

    // Get significant commits (high file changes)
    const { data: commits } = await supabase
      .from('commits')
      .select('id, sha, message, author_email, files_changed')
      .eq('repo_id', repoId)
      .order('files_changed', { ascending: false })
      .limit(30);

    // Get ADRs
    const { data: adrs } = await supabase
      .from('adrs')
      .select('id, title, supporting_commits')
      .eq('repo_id', repoId)
      .limit(10);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Create file nodes
    const fileMap = new Map<string, string>();
    files?.forEach((file) => {
      const nodeId = `file-${file.id}`;
      fileMap.set(file.path, nodeId);
      nodes.push({
        id: nodeId,
        type: 'file',
        label: file.path.split('/').pop() || file.path,
        metadata: {
          path: file.path,
          language: file.language,
          commit_count: file.commit_count,
          risk_score: file.risk_score,
        },
        size: Math.max(5, Math.min(20, file.commit_count / 2)),
        color: getFileColor(file.risk_score),
      });
    });

    // Create author nodes
    const authorMap = new Map<string, string>();
    authors?.forEach((author) => {
      const nodeId = `author-${author.id}`;
      authorMap.set(author.email, nodeId);
      nodes.push({
        id: nodeId,
        type: 'author',
        label: author.name,
        metadata: {
          email: author.email,
          total_commits: author.total_commits,
          files_touched: author.files_touched,
          domains: author.domains,
        },
        size: Math.max(8, Math.min(25, author.total_commits / 5)),
        color: '#7C5CFF',
      });
    });

    // Create commit nodes (only major ones)
    commits?.forEach((commit) => {
      if (commit.files_changed > 5) {
        const nodeId = `commit-${commit.id}`;
        nodes.push({
          id: nodeId,
          type: 'commit',
          label: commit.sha.slice(0, 7),
          metadata: {
            sha: commit.sha,
            message: commit.message,
            files_changed: commit.files_changed,
          },
          size: Math.max(4, Math.min(15, commit.files_changed)),
          color: '#22D3EE',
        });

        // Connect commit to author
        const authorNodeId = authorMap.get(commit.author_email);
        if (authorNodeId) {
          edges.push({
            source: authorNodeId,
            target: nodeId,
            type: 'wrote',
            weight: 1,
          });
        }
      }
    });

    // Create ADR nodes
    adrs?.forEach((adr) => {
      const nodeId = `adr-${adr.id}`;
      nodes.push({
        id: nodeId,
        type: 'adr',
        label: adr.title.slice(0, 30),
        metadata: {
          title: adr.title,
          supporting_commits: adr.supporting_commits,
        },
        size: 12,
        color: '#F59E0B',
      });
    });

    // Create edges between authors and files (based on domains)
    authors?.forEach((author) => {
      const authorNodeId = authorMap.get(author.email);
      if (!authorNodeId) return;

      const domains = author.domains as Record<string, number>;
      const topDomains = Object.entries(domains)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([dir]) => dir);

      files?.forEach((file) => {
        const fileNodeId = fileMap.get(file.path);
        if (!fileNodeId) return;

        const fileTopDir = file.path.split('/')[0];
        if (topDomains.includes(fileTopDir)) {
          edges.push({
            source: authorNodeId,
            target: fileNodeId,
            type: 'modified',
            weight: domains[fileTopDir] || 1,
          });
        }
      });
    });

    return NextResponse.json({
      nodes,
      edges,
      stats: {
        total_nodes: nodes.length,
        total_edges: edges.length,
        files: files?.length || 0,
        authors: authors?.length || 0,
        commits: commits?.length || 0,
        adrs: adrs?.length || 0,
      },
    });
  } catch (error) {
    console.error('Graph API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate graph data' },
      { status: 500 }
    );
  }
}

function getFileColor(riskScore: number): string {
  if (riskScore > 0.7) return '#EF4444'; // High risk - red
  if (riskScore > 0.4) return '#F59E0B'; // Medium risk - orange
  return '#10B981'; // Low risk - green
}

// Made with Bob
