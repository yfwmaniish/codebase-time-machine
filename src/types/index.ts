// ============================================================
// Codebase Time Machine — Core Type Definitions
// ============================================================

export interface Repository {
  id: string;
  github_url: string;
  name: string;
  default_branch: string;
  indexed_at: string | null;
  status: 'pending' | 'cloning' | 'parsing' | 'embedding' | 'ready' | 'failed';
  total_commits: number;
  total_files: number;
  total_authors: number;
  description: string | null;
  language: string | null;
  created_at: string;
}

export interface Commit {
  id: string;
  repo_id: string;
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_at: string;
  files_changed: number;
  insertions: number;
  deletions: number;
}

export interface FileRecord {
  id: string;
  repo_id: string;
  path: string;
  language: string | null;
  loc: number;
  first_seen_commit: string | null;
  last_modified_commit: string | null;
  unique_authors: number;
  commit_count: number;
  risk_score: number;
}

export interface FileChange {
  commit_id: string;
  file_id: string;
  change_type: 'added' | 'modified' | 'deleted' | 'renamed';
  insertions: number;
  deletions: number;
}

export interface Author {
  id: string;
  repo_id: string;
  name: string;
  email: string;
  first_commit_at: string;
  last_commit_at: string;
  total_commits: number;
  total_insertions: number;
  total_deletions: number;
  files_touched: number;
  domains: Record<string, number>; // path -> commit count
  avatar_url?: string;
}

export interface ADR {
  id: string;
  repo_id: string;
  title: string;
  status: string;
  context: string;
  decision: string;
  consequences: string;
  supporting_commits: string[]; // SHA list
  created_at: string;
}

export interface ChatSession {
  id: string;
  repo_id: string;
  mode: 'why' | 'ghost';
  ghost_author_id: string | null;
  created_at: string;
  title: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface Citation {
  type: 'commit' | 'file' | 'author';
  sha?: string;
  path?: string;
  message?: string;
  author?: string;
  date?: string;
}

export interface TimelineEntry {
  commit: Commit;
  diff?: string;
  ai_summary?: string;
  change_type: string;
  insertions: number;
  deletions: number;
}

export interface AuthorProfile {
  author: Author;
  top_commits: Commit[];
  domains: { path: string; commits: number; percentage: number }[];
  patterns: string[];
  expertise_summary: string;
  voice_sample: string[];
}

export interface IngestionProgress {
  stage: Repository['status'];
  progress: number; // 0-100
  message: string;
  commits_processed?: number;
  total_commits?: number;
  files_processed?: number;
  total_files?: number;
}

export interface RiskInfo {
  file: FileRecord;
  risk_factors: string[];
  ai_narrative?: string;
}

export interface GraphNode {
  id: string;
  type: 'file' | 'author' | 'commit';
  label: string;
  size: number;
  color: string;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'wrote' | 'modified' | 'depends_on';
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
