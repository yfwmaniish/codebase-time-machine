// ============================================================
// POST /api/repos/[id]/onboarding — Generate personalized onboarding plan
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { chatCompletion } from '@/lib/watsonx';

export const dynamic = 'force-dynamic';

interface OnboardingRequest {
  role: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'mobile';
  seniority: 'junior' | 'mid' | 'senior';
  focus_area?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;

  try {
    const body: OnboardingRequest = await request.json();
    const { role, seniority, focus_area } = body;

    if (!role || !seniority) {
      return NextResponse.json(
        { error: 'role and seniority are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get repository metadata
    const { data: repo } = await supabase
      .from('repositories')
      .select('name, total_commits, total_files, total_authors, default_branch')
      .eq('id', repoId)
      .single();

    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Get language breakdown
    const { data: files } = await supabase
      .from('files')
      .select('language, path')
      .eq('repo_id', repoId);

    const languages: Record<string, number> = {};
    const keyFiles: string[] = [];
    
    files?.forEach((f) => {
      if (f.language) {
        languages[f.language] = (languages[f.language] || 0) + 1;
      }
      // Identify key files (README, config, main entry points)
      if (
        f.path.toLowerCase().includes('readme') ||
        f.path.toLowerCase().includes('package.json') ||
        f.path.toLowerCase().includes('main') ||
        f.path.toLowerCase().includes('index') ||
        f.path.toLowerCase().includes('app')
      ) {
        keyFiles.push(f.path);
      }
    });

    // Get top contributors
    const { data: authors } = await supabase
      .from('authors')
      .select('name, total_commits, domains')
      .eq('repo_id', repoId)
      .order('total_commits', { ascending: false })
      .limit(5);

    // Get recent significant commits
    const { data: commits } = await supabase
      .from('commits')
      .select('sha, message, authored_at, files_changed')
      .eq('repo_id', repoId)
      .order('authored_at', { ascending: false })
      .limit(20);

    // Get existing ADRs
    const { data: adrs } = await supabase
      .from('adrs')
      .select('title, context')
      .eq('repo_id', repoId)
      .limit(5);

    // Build context for AI
    const context = buildOnboardingContext(
      repo,
      languages,
      keyFiles,
      authors || [],
      commits || [],
      adrs || []
    );

    // Generate personalized plan
    const plan = await generateOnboardingPlan(
      context,
      role,
      seniority,
      focus_area
    );

    return NextResponse.json({
      plan,
      metadata: {
        repo_name: repo.name,
        role,
        seniority,
        focus_area,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate onboarding plan' },
      { status: 500 }
    );
  }
}

function buildOnboardingContext(
  repo: { name: string; total_commits: number; total_files: number; total_authors: number },
  languages: Record<string, number>,
  keyFiles: string[],
  authors: Array<{ name: string; total_commits: number; domains: unknown }>,
  commits: Array<{ message: string; files_changed: number }>,
  adrs: Array<{ title: string; context: string }>
): string {
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang, count]) => `${lang} (${count} files)`)
    .join(', ');

  const topContributors = authors
    .slice(0, 3)
    .map(a => `${a.name} (${a.total_commits} commits)`)
    .join(', ');

  const recentActivity = commits
    .slice(0, 5)
    .map(c => `- ${c.message.slice(0, 80)}`)
    .join('\n');

  const architecturalDecisions = adrs
    .map(a => `- ${a.title}`)
    .join('\n');

  return `Repository: ${repo.name}
Total Commits: ${repo.total_commits}
Total Files: ${repo.total_files}
Contributors: ${repo.total_authors}

Primary Languages: ${topLanguages}

Key Files to Review:
${keyFiles.slice(0, 10).map(f => `- ${f}`).join('\n')}

Top Contributors:
${topContributors}

Recent Activity:
${recentActivity}

Architectural Decisions:
${architecturalDecisions || 'None documented yet'}`;
}

async function generateOnboardingPlan(
  context: string,
  role: string,
  seniority: string,
  focusArea?: string
): Promise<string> {
  const prompt = `You are an expert engineering manager creating a personalized onboarding plan.

REPOSITORY CONTEXT:
${context}

NEW HIRE PROFILE:
- Role: ${role}
- Seniority: ${seniority}
- Focus Area: ${focusArea || 'General'}

Create a structured 2-week onboarding plan in markdown format with:

## Week 1: Foundation & Exploration
### Day 1: Setup & Overview
- Specific setup tasks
- Key files to read first
- High-level architecture understanding

### Days 2-3: Core Modules Deep Dive
- Which modules to study based on role
- Recommended reading order
- Key patterns to understand

### Days 4-5: First Contributions
- Suggested starter tasks (bug fixes, docs, tests)
- Areas to explore for quick wins

## Week 2: Integration & Ownership
### Days 6-8: Feature Work
- Recommended feature areas to tackle
- Who to pair with (based on top contributors)

### Days 9-10: Architecture & Decisions
- ADRs to review
- Design patterns in use
- Technical debt areas

## Resources & Next Steps
- Key documentation
- Team members to connect with
- Suggested learning path

Make it specific to this codebase, not generic advice. Reference actual files, contributors, and patterns from the context.`;

  const response = await chatCompletion(
    [
      { role: 'system', content: 'You are an expert engineering manager and technical mentor.' },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.4, maxTokens: 3000 }
  );

  return response;
}

// Made with Bob
