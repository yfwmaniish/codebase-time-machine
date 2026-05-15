// ============================================================
// ADR Generation + Listing API
// POST: Generate ADRs | GET: List existing ADRs
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateADRs } from '@/lib/rag';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

// GET /api/repos/[id]/adrs — List ADRs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;
  const supabase = createServerClient();

  const { data: adrs, error } = await supabase
    .from('adrs')
    .select('*')
    .eq('repo_id', repoId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch ADRs' }, { status: 500 });
  }

  return NextResponse.json({ adrs: adrs || [] });
}

// POST /api/repos/[id]/adrs — Generate ADRs
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;
  const supabase = createServerClient();

  try {
    // Check repo exists
    const { data: repo } = await supabase
      .from('repositories')
      .select('id, status')
      .eq('id', repoId)
      .single();

    if (!repo || repo.status !== 'ready') {
      return NextResponse.json({ error: 'Repository not ready' }, { status: 400 });
    }

    // Generate ADRs via AI
    const rawADRs = await generateADRs(repoId);

    // Parse the AI response into individual ADRs
    const adrBlocks = rawADRs.split(/## ADR:/i).filter(block => block.trim());
    const adrRecords = adrBlocks.map((block) => {
      const lines = block.trim().split('\n');
      const title = lines[0]?.trim() || 'Untitled Decision';

      const getSection = (label: string): string => {
        const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+?)(?=\\*\\*|$)`, 's');
        const match = block.match(regex);
        return match?.[1]?.trim() || '';
      };

      return {
        id: uuid(),
        repo_id: repoId,
        title,
        status: getSection('Status') || 'Accepted',
        context: getSection('Context'),
        decision: getSection('Decision'),
        consequences: getSection('Consequences'),
        supporting_commits: [],
        created_at: new Date().toISOString(),
      };
    });

    if (adrRecords.length > 0) {
      // Clear old ADRs for this repo
      await supabase.from('adrs').delete().eq('repo_id', repoId);
      // Insert new ones
      await supabase.from('adrs').insert(adrRecords);
    }

    return NextResponse.json({
      count: adrRecords.length,
      adrs: adrRecords,
    });
  } catch (error) {
    console.error('ADR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate ADRs' }, { status: 500 });
  }
}
