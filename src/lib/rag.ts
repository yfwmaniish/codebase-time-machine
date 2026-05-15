// ============================================================
// RAG Pipeline — Retrieval Augmented Generation
// Embeds queries, retrieves relevant context, constructs prompts
// ============================================================

import { createServerClient } from './supabase';
import { chatCompletion, chatCompletionStream, generateEmbedding } from './watsonx';
import type { Citation } from '@/types';

interface RAGContext {
  commits: Array<{
    sha: string;
    message: string;
    author_name: string;
    authored_at: string;
    files_changed: number;
    similarity: number;
  }>;
  files?: Array<{ path: string; language: string }>;
}

// Retrieve relevant commits via vector similarity
async function retrieveContext(
  repoId: string,
  query: string,
  topK: number = 10
): Promise<RAGContext> {
  const supabase = createServerClient();

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Vector similarity search using pgvector
  const { data: commits, error } = await supabase.rpc('match_commits', {
    query_embedding: queryEmbedding,
    match_count: topK,
    filter_repo_id: repoId,
  });

  if (error) {
    console.error('Vector search failed:', error);
    // Fallback: text search
    const { data: fallbackCommits } = await supabase
      .from('commits')
      .select('sha, message, author_name, authored_at, files_changed')
      .eq('repo_id', repoId)
      .textSearch('message', query.split(' ').join(' | '))
      .limit(topK);

    return { commits: (fallbackCommits || []).map(c => ({ ...c, similarity: 0.5 })) };
  }

  return { commits: commits || [] };
}

// Build the system prompt for Why Engine
function buildWhyEnginePrompt(context: RAGContext): string {
  const commitContext = context.commits
    .map((c, i) => `[${i + 1}] Commit ${c.sha.slice(0, 8)} by ${c.author_name} (${new Date(c.authored_at).toLocaleDateString()}):\n"${c.message}"`)
    .join('\n\n');

  return `You are the "Why Engine" of Codebase Time Machine — an AI that explains WHY code exists the way it does by analyzing Git history.

RULES:
- Answer based ONLY on the provided commit history. Never fabricate.
- If you cannot find evidence, say "I couldn't find historical evidence for this."
- ALWAYS cite your sources using [commit SHA] format.
- Write in a clear narrative style, not bullet lists.
- Be concise but thorough.

RELEVANT COMMITS FROM HISTORY:
${commitContext}

Answer the user's question about this codebase, citing the commits above as evidence.`;
}

// Build prompt for Ghost Author mode
function buildGhostAuthorPrompt(
  authorName: string,
  authorProfile: string,
  context: RAGContext
): string {
  const commitContext = context.commits
    .map((c, i) => `[${i + 1}] ${c.sha.slice(0, 8)}: "${c.message}" (${new Date(c.authored_at).toLocaleDateString()})`)
    .join('\n');

  return `You are synthesizing the perspective of ${authorName} based on their Git contributions.

IMPORTANT DISCLAIMER: You are an AI synthesis based on public Git data. You are NOT the actual person.

AUTHOR PROFILE:
${authorProfile}

RELEVANT COMMITS BY ${authorName.toUpperCase()}:
${commitContext}

Respond to questions as if channeling ${authorName}'s expertise and perspective, based solely on their commit history. Always cite specific commits. If asked about something outside their documented work, say "I don't have evidence of ${authorName} working on that area."`;
}

// Build prompt for ADR generation
function buildADRPrompt(commits: Array<{ sha: string; message: string; authored_at: string; files_changed: number }>): string {
  const commitList = commits
    .map(c => `- ${c.sha.slice(0, 8)} (${new Date(c.authored_at).toLocaleDateString()}): "${c.message}" [${c.files_changed} files]`)
    .join('\n');

  return `You are an expert software architect. Analyze these commits and identify architectural decisions.

COMMITS:
${commitList}

For each significant architectural decision you identify, generate an ADR (Architectural Decision Record) in this format:

## ADR: [Title]

**Status:** Accepted

**Context:** [What problem or situation led to this decision?]

**Decision:** [What was decided and why?]

**Consequences:** [What are the results of this decision?]

**Supporting Commits:** [List the commit SHAs that evidence this decision]

---

Identify 3-8 significant decisions. Focus on: major refactors, new dependencies, architecture changes, pattern adoptions.`;
}

// Build prompt for commit summary
function buildCommitSummaryPrompt(commitMessage: string, diff: string): string {
  return `Summarize this code change in 2-3 plain English sentences. Explain WHAT changed and WHY (based on the commit message and diff).

COMMIT MESSAGE: "${commitMessage}"

DIFF (truncated):
${diff.slice(0, 3000)}

Write a clear, non-technical summary.`;
}

// Main RAG chat function
export async function ragChat(
  repoId: string,
  userMessage: string,
  mode: 'why' | 'ghost' = 'why',
  ghostAuthorProfile?: string,
  ghostAuthorName?: string
): Promise<{ content: string; citations: Citation[] }> {
  // Retrieve relevant context
  const context = await retrieveContext(repoId, userMessage);

  // Build appropriate system prompt
  let systemPrompt: string;
  if (mode === 'ghost' && ghostAuthorProfile && ghostAuthorName) {
    systemPrompt = buildGhostAuthorPrompt(ghostAuthorName, ghostAuthorProfile, context);
  } else {
    systemPrompt = buildWhyEnginePrompt(context);
  }

  // Call watsonx.ai
  const response = await chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    { temperature: 0.3, maxTokens: 2048 }
  );

  // Extract citations from context
  const citations: Citation[] = context.commits.map(c => ({
    type: 'commit' as const,
    sha: c.sha,
    message: c.message,
    author: c.author_name,
    date: c.authored_at,
  }));

  return { content: response, citations };
}

// Streaming RAG chat
export async function ragChatStream(
  repoId: string,
  userMessage: string,
  mode: 'why' | 'ghost' = 'why',
  ghostAuthorProfile?: string,
  ghostAuthorName?: string
): Promise<{ stream: ReadableStream; citations: Citation[] }> {
  const context = await retrieveContext(repoId, userMessage);

  let systemPrompt: string;
  if (mode === 'ghost' && ghostAuthorProfile && ghostAuthorName) {
    systemPrompt = buildGhostAuthorPrompt(ghostAuthorName, ghostAuthorProfile, context);
  } else {
    systemPrompt = buildWhyEnginePrompt(context);
  }

  const stream = await chatCompletionStream(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    { temperature: 0.3, maxTokens: 2048 }
  );

  const citations: Citation[] = context.commits.map(c => ({
    type: 'commit' as const,
    sha: c.sha,
    message: c.message,
    author: c.author_name,
    date: c.authored_at,
  }));

  return { stream, citations };
}

// Generate ADRs from commit history
export async function generateADRs(
  repoId: string
): Promise<string> {
  const supabase = createServerClient();

  // Get commits with high impact (many files changed, or long messages indicating decisions)
  const { data: commits } = await supabase
    .from('commits')
    .select('sha, message, authored_at, files_changed, insertions, deletions')
    .eq('repo_id', repoId)
    .order('files_changed', { ascending: false })
    .limit(100);

  if (!commits || commits.length === 0) {
    return 'No commits found to analyze.';
  }

  const prompt = buildADRPrompt(commits);
  return chatCompletion(
    [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate ADRs from the commit history above.' },
    ],
    { temperature: 0.2, maxTokens: 4096 }
  );
}

// Summarize a single commit
export async function summarizeCommit(
  commitMessage: string,
  diff: string
): Promise<string> {
  const prompt = buildCommitSummaryPrompt(commitMessage, diff);
  return chatCompletion(
    [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Summarize this change.' },
    ],
    { temperature: 0.2, maxTokens: 300 }
  );
}

export { retrieveContext, buildWhyEnginePrompt, buildGhostAuthorPrompt };
