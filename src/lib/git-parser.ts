// ============================================================
// Git Parser — Clone, parse log, extract structured data
// Uses simple-git for Node.js git operations
// ============================================================

import simpleGit, { SimpleGit, LogResult } from 'simple-git';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdtemp, rm } from 'fs/promises';
import { v4 as uuid } from 'uuid';

export interface ParsedCommit {
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_at: string;
  files: ParsedFileChange[];
}

export interface ParsedFileChange {
  path: string;
  change_type: 'added' | 'modified' | 'deleted' | 'renamed';
  insertions: number;
  deletions: number;
}

export interface ParsedRepo {
  name: string;
  default_branch: string;
  commits: ParsedCommit[];
  file_paths: string[];
}

export type ProgressCallback = (stage: string, progress: number, message: string) => void;

// Validate GitHub URL
export function validateGitHubUrl(url: string): boolean {
  const pattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/;
  return pattern.test(url.trim());
}

// Extract repo name from URL
export function extractRepoName(url: string): string {
  const parts = url.replace(/\.git$/, '').split('/');
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

// Clone and parse a repository
export async function cloneAndParse(
  githubUrl: string,
  maxCommits: number = 1000,
  onProgress?: ProgressCallback
): Promise<{ repoDir: string; data: ParsedRepo }> {
  const cleanUrl = githubUrl.trim().replace(/\.git$/, '');
  const repoName = extractRepoName(cleanUrl);

  onProgress?.('cloning', 5, `Cloning ${repoName}...`);

  // Clone to temp directory
  const tempBase = join(tmpdir(), 'ctm-repos');
  const repoDir = await mkdtemp(join(tempBase, `${repoName.replace('/', '-')}-`).replace(/\\/g, '/'));
  const git: SimpleGit = simpleGit();

  await git.clone(cleanUrl, repoDir, ['--depth', String(maxCommits + 50), '--single-branch']);

  onProgress?.('parsing', 20, 'Parsing git log...');

  const repoGit = simpleGit(repoDir);

  // Get default branch
  const branchResult = await repoGit.branch();
  const defaultBranch = branchResult.current || 'main';

  // Parse git log
  const log: LogResult = await repoGit.log({
    maxCount: maxCommits,
    '--stat': null,
    '--stat-count': '1000',
  } as Record<string, unknown>);

  onProgress?.('parsing', 40, `Parsed ${log.all.length} commits`);

  const commits: ParsedCommit[] = [];
  const allFilePaths = new Set<string>();
  const totalCommits = log.all.length;

  for (let i = 0; i < totalCommits; i++) {
    const entry = log.all[i];
    const progress = 40 + (i / totalCommits) * 30;

    if (i % 50 === 0) {
      onProgress?.('parsing', progress, `Processing commit ${i + 1}/${totalCommits}`);
    }

    // Get detailed diff stat for this commit
    let files: ParsedFileChange[] = [];
    try {
      const diffStat = await repoGit.raw([
        'diff-tree', '--no-commit-id', '-r', '--numstat', entry.hash
      ]);

      files = diffStat
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const parts = line.split('\t');
          const insertions = parts[0] === '-' ? 0 : parseInt(parts[0], 10) || 0;
          const deletions = parts[1] === '-' ? 0 : parseInt(parts[1], 10) || 0;
          const filePath = parts[2] || '';

          allFilePaths.add(filePath);
          return {
            path: filePath,
            change_type: 'modified' as const,
            insertions,
            deletions,
          };
        })
        .filter((f) => f.path);
    } catch {
      // Skip commits where diff fails (e.g., initial commit)
    }

    commits.push({
      sha: entry.hash,
      message: entry.message,
      author_name: entry.author_name,
      author_email: entry.author_email,
      authored_at: entry.date,
      files,
    });
  }

  onProgress?.('parsing', 75, `Processed ${totalCommits} commits, ${allFilePaths.size} files`);

  return {
    repoDir,
    data: {
      name: repoName,
      default_branch: defaultBranch,
      commits,
      file_paths: Array.from(allFilePaths),
    },
  };
}

// Get file content at a specific commit
export async function getFileAtCommit(
  repoDir: string,
  filePath: string,
  commitSha: string
): Promise<string | null> {
  try {
    const git = simpleGit(repoDir);
    return await git.show([`${commitSha}:${filePath}`]);
  } catch {
    return null;
  }
}

// Get diff between two commits for a file
export async function getFileDiff(
  repoDir: string,
  filePath: string,
  fromSha: string,
  toSha: string
): Promise<string> {
  try {
    const git = simpleGit(repoDir);
    return await git.diff([fromSha, toSha, '--', filePath]);
  } catch {
    return '';
  }
}

// Cleanup cloned repo
export async function cleanupRepo(repoDir: string): Promise<void> {
  try {
    await rm(repoDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
