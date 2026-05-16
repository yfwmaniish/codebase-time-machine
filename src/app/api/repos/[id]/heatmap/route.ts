// ============================================================
// GET /api/repos/[id]/heatmap — Risk heatmap data
// Returns files with risk scores for treemap visualization
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { chatCompletion } from '@/lib/watsonx';

export const dynamic = 'force-dynamic';

interface HeatmapNode {
  name: string;
  path: string;
  value: number; // LOC or commit count
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_explanation?: string;
  metadata: {
    language: string | null;
    commit_count: number;
    unique_authors: number;
    last_modified: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;
  const supabase = createServerClient();
  const includeExplanations = request.nextUrl.searchParams.get('explain') === 'true';

  try {
    // Get all files with risk scores
    const { data: files, error } = await supabase
      .from('files')
      .select('path, language, commit_count, unique_authors, risk_score, last_modified_commit')
      .eq('repo_id', repoId)
      .order('risk_score', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch heatmap data' },
        { status: 500 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json({
        nodes: [],
        stats: { total: 0, high_risk: 0, medium_risk: 0, low_risk: 0 },
      });
    }

    // Get commit dates for last modified
    const commitShas = [...new Set(files.map(f => f.last_modified_commit).filter(Boolean))];
    const { data: commits } = await supabase
      .from('commits')
      .select('sha, authored_at')
      .in('sha', commitShas);

    const commitDateMap = new Map(
      commits?.map(c => [c.sha, c.authored_at]) || []
    );

    // Build heatmap nodes
    const nodes: HeatmapNode[] = files.map((file) => {
      const riskLevel = getRiskLevel(file.risk_score);
      return {
        name: file.path.split('/').pop() || file.path,
        path: file.path,
        value: file.commit_count, // Use commit count as size proxy
        risk_score: file.risk_score,
        risk_level: riskLevel,
        metadata: {
          language: file.language,
          commit_count: file.commit_count,
          unique_authors: file.unique_authors,
          last_modified: commitDateMap.get(file.last_modified_commit) || 'unknown',
        },
      };
    });

    // Generate AI explanations for top 10 risky files if requested
    if (includeExplanations) {
      const topRiskyFiles = nodes
        .filter(n => n.risk_level === 'high' || n.risk_level === 'critical')
        .slice(0, 10);

      for (const node of topRiskyFiles) {
        try {
          const explanation = await generateRiskExplanation(
            node.path,
            node.risk_score,
            node.metadata
          );
          node.risk_explanation = explanation;
        } catch {
          // Skip explanation on error
          node.risk_explanation = 'Unable to generate explanation';
        }
      }
    }

    // Calculate stats
    const stats = {
      total: nodes.length,
      critical: nodes.filter(n => n.risk_level === 'critical').length,
      high_risk: nodes.filter(n => n.risk_level === 'high').length,
      medium_risk: nodes.filter(n => n.risk_level === 'medium').length,
      low_risk: nodes.filter(n => n.risk_level === 'low').length,
      avg_risk: nodes.reduce((sum, n) => sum + n.risk_score, 0) / nodes.length,
    };

    // Build hierarchical structure for treemap
    const hierarchy = buildHierarchy(nodes);

    return NextResponse.json({
      nodes,
      hierarchy,
      stats,
    });
  } catch (error) {
    console.error('Heatmap API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate heatmap' },
      { status: 500 }
    );
  }
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.3) return 'medium';
  return 'low';
}

async function generateRiskExplanation(
  path: string,
  riskScore: number,
  metadata: HeatmapNode['metadata']
): Promise<string> {
  const prompt = `Explain why this file has a high risk score in 1-2 sentences:

File: ${path}
Risk Score: ${(riskScore * 100).toFixed(0)}%
Commits: ${metadata.commit_count}
Authors: ${metadata.unique_authors}
Language: ${metadata.language}

Focus on: code churn, multiple authors, complexity indicators.`;

  const response = await chatCompletion(
    [
      { role: 'system', content: 'You are a code quality expert. Explain risk factors concisely.' },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.3, maxTokens: 150 }
  );

  return response.trim();
}

function buildHierarchy(nodes: HeatmapNode[]): Record<string, unknown> {
  const root: Record<string, unknown> = {
    name: 'root',
    children: [],
  };

  const dirMap = new Map<string, Record<string, unknown>>();
  dirMap.set('', root);

  // Sort by path for consistent tree building
  const sortedNodes = [...nodes].sort((a, b) => a.path.localeCompare(b.path));

  for (const node of sortedNodes) {
    const parts = node.path.split('/');
    let currentPath = '';

    // Create directory nodes
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!dirMap.has(currentPath)) {
        const dirNode = {
          name: part,
          path: currentPath,
          type: 'directory',
          children: [],
        };

        const parent = dirMap.get(parentPath);
        if (parent && Array.isArray(parent.children)) {
          parent.children.push(dirNode);
        }
        dirMap.set(currentPath, dirNode);
      }
    }

    // Add file node
    const parentPath = parts.slice(0, -1).join('/');
    const parent = dirMap.get(parentPath);
    if (parent && Array.isArray(parent.children)) {
      parent.children.push({
        name: node.name,
        path: node.path,
        type: 'file',
        value: node.value,
        risk_score: node.risk_score,
        risk_level: node.risk_level,
        metadata: node.metadata,
      });
    }
  }

  return root;
}

// Made with Bob
