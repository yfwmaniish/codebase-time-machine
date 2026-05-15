-- ============================================================
-- Codebase Time Machine — Supabase Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- Enable pgvector extension
create extension if not exists vector;

-- Repositories
create table if not exists repositories (
  id uuid primary key default gen_random_uuid(),
  github_url text unique not null,
  name text not null,
  default_branch text default 'main',
  indexed_at timestamptz,
  status text not null default 'pending',
  total_commits int default 0,
  total_files int default 0,
  total_authors int default 0,
  description text,
  language text,
  created_at timestamptz default now()
);

-- Commits
create table if not exists commits (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid references repositories(id) on delete cascade,
  sha text not null,
  message text,
  author_name text,
  author_email text,
  authored_at timestamptz,
  files_changed int default 0,
  insertions int default 0,
  deletions int default 0,
  embedding vector(384)
);

create index if not exists idx_commits_repo_id on commits(repo_id);
create index if not exists idx_commits_sha on commits(repo_id, sha);

-- Files
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid references repositories(id) on delete cascade,
  path text not null,
  language text,
  loc int default 0,
  first_seen_commit text,
  last_modified_commit text,
  unique_authors int default 0,
  commit_count int default 0,
  risk_score float default 0
);

create index if not exists idx_files_repo_id on files(repo_id);
create index if not exists idx_files_path on files(repo_id, path);

-- Authors
create table if not exists authors (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid references repositories(id) on delete cascade,
  name text not null,
  email text,
  first_commit_at timestamptz,
  last_commit_at timestamptz,
  total_commits int default 0,
  total_insertions int default 0,
  total_deletions int default 0,
  files_touched int default 0,
  domains jsonb default '{}'
);

create index if not exists idx_authors_repo_id on authors(repo_id);

-- ADRs
create table if not exists adrs (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid references repositories(id) on delete cascade,
  title text not null,
  status text default 'Accepted',
  context text,
  decision text,
  consequences text,
  supporting_commits jsonb default '[]',
  created_at timestamptz default now()
);

-- Chat Sessions
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid references repositories(id) on delete cascade,
  mode text not null default 'why',
  ghost_author_id uuid,
  created_at timestamptz default now(),
  title text
);

-- Chat Messages
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  citations jsonb default '[]',
  created_at timestamptz default now()
);

create index if not exists idx_messages_session on chat_messages(session_id);

-- Vector similarity search function
create or replace function match_commits(
  query_embedding vector(384),
  match_count int default 10,
  filter_repo_id uuid default null
)
returns table (
  sha text,
  message text,
  author_name text,
  authored_at timestamptz,
  files_changed int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    c.sha,
    c.message,
    c.author_name,
    c.authored_at,
    c.files_changed,
    1 - (c.embedding <=> query_embedding) as similarity
  from commits c
  where c.repo_id = filter_repo_id
    and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;
