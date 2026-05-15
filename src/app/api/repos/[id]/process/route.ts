// ============================================================
// POST /api/repos/[id]/process — Background ingestion worker
// Clones repo, parses git log, stores data, generates embeddings
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cloneAndParse, cleanupRepo } from '@/lib/git-parser';
import { generateEmbeddings } from '@/lib/watsonx';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min timeout for serverless

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;
  const supabase = createServerClient();
  let repoDir = '';

  try {
    const body = await request.json();
    const { url } = body;

    // Update status to cloning
    await supabase
      .from('repositories')
      .update({ status: 'cloning' })
      .eq('id', repoId);

    // Clone and parse
    const result = await cloneAndParse(url, 500, async (stage, progress, message) => {
      await supabase
        .from('repositories')
        .update({ status: stage as string })
        .eq('id', repoId);
    });

    repoDir = result.repoDir;
    const { data } = result;

    // Update status to parsing
    await supabase
      .from('repositories')
      .update({ status: 'parsing' })
      .eq('id', repoId);

    // Build author map
    const authorMap = new Map<string, {
      name: string;
      email: string;
      commits: number;
      insertions: number;
      deletions: number;
      files: Set<string>;
      firstCommit: string;
      lastCommit: string;
    }>();

    // Build file map
    const fileMap = new Map<string, {
      authors: Set<string>;
      commitCount: number;
      firstCommit: string;
      lastCommit: string;
    }>();

    // Process commits
    const commitRecords = data.commits.map((commit) => {
      // Track authors
      const authorKey = commit.author_email;
      if (!authorMap.has(authorKey)) {
        authorMap.set(authorKey, {
          name: commit.author_name,
          email: commit.author_email,
          commits: 0,
          insertions: 0,
          deletions: 0,
          files: new Set(),
          firstCommit: commit.authored_at,
          lastCommit: commit.authored_at,
        });
      }
      const author = authorMap.get(authorKey)!;
      author.commits++;
      author.lastCommit = commit.authored_at;

      // Track files
      let totalInsertions = 0;
      let totalDeletions = 0;
      for (const file of commit.files) {
        totalInsertions += file.insertions;
        totalDeletions += file.deletions;
        author.files.add(file.path);
        author.insertions += file.insertions;
        author.deletions += file.deletions;

        if (!fileMap.has(file.path)) {
          fileMap.set(file.path, {
            authors: new Set(),
            commitCount: 0,
            firstCommit: commit.sha,
            lastCommit: commit.sha,
          });
        }
        const fileInfo = fileMap.get(file.path)!;
        fileInfo.authors.add(commit.author_email);
        fileInfo.commitCount++;
        fileInfo.lastCommit = commit.sha;
      }

      return {
        id: uuid(),
        repo_id: repoId,
        sha: commit.sha,
        message: commit.message.slice(0, 2000),
        author_name: commit.author_name,
        author_email: commit.author_email,
        authored_at: commit.authored_at,
        files_changed: commit.files.length,
        insertions: totalInsertions,
        deletions: totalDeletions,
      };
    });

    // Insert commits in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < commitRecords.length; i += BATCH_SIZE) {
      const batch = commitRecords.slice(i, i + BATCH_SIZE);
      await supabase.from('commits').insert(batch);
    }

    // Insert authors
    const authorRecords = Array.from(authorMap.entries()).map(([, author]) => {
      // Build domains (top directories)
      const domainCounts: Record<string, number> = {};
      for (const filePath of author.files) {
        const topDir = filePath.split('/')[0] || filePath;
        domainCounts[topDir] = (domainCounts[topDir] || 0) + 1;
      }

      return {
        id: uuid(),
        repo_id: repoId,
        name: author.name,
        email: author.email,
        first_commit_at: author.firstCommit,
        last_commit_at: author.lastCommit,
        total_commits: author.commits,
        total_insertions: author.insertions,
        total_deletions: author.deletions,
        files_touched: author.files.size,
        domains: domainCounts,
      };
    });

    await supabase.from('authors').insert(authorRecords);

    // Insert files
    const fileRecords = Array.from(fileMap.entries()).map(([path, info]) => {
      // Simple risk score: high churn + many authors = higher risk
      const churnScore = Math.min(info.commitCount / 50, 1);
      const authorScore = Math.min(info.authors.size / 5, 1);
      const riskScore = (churnScore * 0.6 + authorScore * 0.4);

      const ext = path.split('.').pop() || '';
      const langMap: Record<string, string> = {
        ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
        py: 'Python', rb: 'Ruby', go: 'Go', rs: 'Rust', java: 'Java',
        css: 'CSS', html: 'HTML', md: 'Markdown', json: 'JSON', yml: 'YAML',
      };

      return {
        id: uuid(),
        repo_id: repoId,
        path,
        language: langMap[ext] || ext,
        loc: 0,
        unique_authors: info.authors.size,
        commit_count: info.commitCount,
        risk_score: riskScore,
        first_seen_commit: info.firstCommit,
        last_modified_commit: info.lastCommit,
      };
    });

    for (let i = 0; i < fileRecords.length; i += BATCH_SIZE) {
      const batch = fileRecords.slice(i, i + BATCH_SIZE);
      await supabase.from('files').insert(batch);
    }

    // Generate embeddings for commit messages
    await supabase
      .from('repositories')
      .update({ status: 'embedding' })
      .eq('id', repoId);

    try {
      const messages = commitRecords.map(c => `${c.message} (by ${c.author_name})`);
      const embeddings = await generateEmbeddings(messages);

      // Update commits with embeddings
      for (let i = 0; i < commitRecords.length; i++) {
        if (embeddings[i]) {
          await supabase
            .from('commits')
            .update({ embedding: JSON.stringify(embeddings[i]) })
            .eq('id', commitRecords[i].id);
        }
      }
    } catch (embError) {
      console.error('Embedding generation failed (non-fatal):', embError);
      // Continue without embeddings — text search fallback will work
    }

    // Mark as ready
    await supabase
      .from('repositories')
      .update({
        status: 'ready',
        indexed_at: new Date().toISOString(),
        total_commits: commitRecords.length,
        total_files: fileRecords.length,
        total_authors: authorRecords.length,
        default_branch: data.default_branch,
      })
      .eq('id', repoId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Processing error:', error);
    await supabase
      .from('repositories')
      .update({ status: 'failed' })
      .eq('id', repoId);

    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  } finally {
    if (repoDir) {
      await cleanupRepo(repoDir);
    }
  }
}
