# Codebase Time Machine

Codebase Time Machine turns a public Git repository into a queryable, AI-assisted knowledge base. It clones a repo, parses its full commit history, and stores it in Postgres alongside vector embeddings of each commit message. From there it exposes a set of tools — a RAG-backed chat interface, auto-generated architectural decision records, a contributor knowledge graph, and a file risk heatmap — that are meant to answer the question Git alone can't: *why* does the code look the way it does. It was originally built solo for the IBM "Build on Bob" hackathon (developed inside the IBM Bob IDE, see `bob_sessions/`), using IBM watsonx.ai's Granite models for generation and embeddings.

## What it actually does

Based on the implemented API routes (`src/app/api/**`) and the corresponding frontend pages (`src/app/[repoId]/**`):

- **Repository ingestion** — `POST /api/repos/ingest` validates a `https://github.com/owner/repo` URL, creates a `repositories` row, and kicks off a background worker (`POST /api/repos/[id]/process`) that clones the repo with `simple-git`, walks up to 500 commits (`git log --stat` + `git diff-tree --numstat` per commit), and derives per-file and per-author statistics (churn, insertions/deletions, files touched, "domains" based on top-level directories).
- **Live ingestion progress** — `GET /api/repos/[id]/status` is a Server-Sent Events endpoint that polls the repository's status column (`pending → cloning → parsing → embedding → ready`/`failed`) once a second and streams progress percentages to the indexing page.
- **Why Engine (chat)** — `POST /api/repos/[id]/chat` runs a small RAG pipeline (`src/lib/rag.ts`): it embeds the user's question, does a `pgvector` similarity search over commit-message embeddings (via the `match_commits` SQL function, with a Postgres full-text-search fallback if vector search errors out), and asks the LLM to answer using only the retrieved commits, citing them by SHA. Chat sessions and messages are persisted (`chat_sessions`, `chat_messages`).
- **Ghost Author mode** — the same chat endpoint accepts `mode: "ghost"` plus a `ghost_author_id`; it builds a profile of that contributor from their aggregated stats and prompts the model to answer "in character," with an explicit disclaimer baked into the prompt that this is an AI synthesis, not the real person.
- **Auto-generated ADRs** — `POST /api/repos/[id]/adrs` pulls the 100 commits with the most files changed and asks the LLM to extract 3–8 Architectural Decision Records (context/decision/consequences/supporting commits) in Markdown; `GET /api/repos/[id]/adrs` lists what's been generated and stored.
- **File timeline** — `GET /api/repos/[id]/timeline?file=<path>` returns the commit history for a single file, and `GET /api/commits/[sha]?summary=true` returns commit metadata with an optional AI-generated plain-English summary of the diff.
- **Knowledge graph** — `GET /api/repos/[id]/graph` assembles nodes for top files, authors, high-impact commits, and generated ADRs, plus edges (author→commit "wrote", author→file "modified" inferred from directory overlap) for a D3-driven force graph on the frontend.
- **Risk heatmap** — `GET /api/repos/[id]/heatmap` scores every file as `0.6 * churn + 0.4 * unique-author-count`, buckets it into low/medium/high/critical, and (with `?explain=true`) asks the LLM for a one-to-two-sentence explanation of the top risky files; the frontend renders this as a treemap.
- **Onboarding plans** — `POST /api/repos/[id]/onboarding` takes a role (`frontend`/`backend`/`fullstack`/`devops`/`mobile`) and seniority level and asks the LLM to generate a role-specific onboarding plan grounded in the repo's actual language breakdown and file list.
- **Contributors** — `GET /api/repos/[id]/authors` lists contributors with commit/insertion/deletion counts and inferred domains of expertise.
- **Demo mode** — every LLM and embedding call in `src/lib/watsonx.ts` checks `DEMO_MODE=true` (or the absence of a watsonx API key) and returns realistic canned responses instead of calling IBM watsonx.ai, so the whole app is runnable and clickable without any AI credentials.

The frontend (`src/app/page.tsx` + `src/components/sections/*`) is a marketing-style landing page with a repo-ingestion form, followed by a per-repo dashboard (`src/app/[repoId]/page.tsx`) that links out to dedicated pages for chat, time travel, ADRs, ghost author, and the knowledge graph.

## Not implemented / known gaps

These are referenced in the docs as planned or partial and are worth being upfront about:

- No user authentication — this is a single-user MVP; anyone with a repo ID can query it.
- No private repository support — ingestion only works against public GitHub URLs.
- The `file_changes` junction table defined in `supabase-schema.sql` exists in the schema but isn't populated by the ingestion worker; file↔commit relationships are reconstructed from the raw commit/file records instead.
- Rate limiting (`src/lib/middleware.ts`) is an in-memory `Map`, not the Redis-backed limiter implemented in `src/lib/queue.ts` — the BullMQ/Upstash queue module exists in the codebase but isn't currently wired into the ingestion or chat routes, which run as plain fire-and-forget `fetch` calls instead of queued jobs.
- No `.env.example` file is currently checked into the repo (the `.gitignore` pattern `.env*` excludes it); see [Environment variables](#environment-variables) below for what to set manually.

## Tech stack

Read directly from `package.json`:

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack dev server), React 19, TypeScript |
| Styling / UI | Tailwind CSS 4, Radix UI primitives, `class-variance-authority`, `lucide-react` icons, Framer Motion (used throughout the UI, though not currently declared in `package.json` — see note below) |
| Visualization | D3.js |
| State / data fetching | Zustand, TanStack Query |
| Database | Supabase (PostgreSQL) with the `pgvector` extension for embedding similarity search |
| Background jobs / caching | BullMQ + Upstash Redis (`ioredis`, `@upstash/redis`) — implemented in `src/lib/queue.ts` but not yet called from any route |
| Git operations | `simple-git` |
| AI | IBM watsonx.ai — Granite models for chat/completion, Slate for embeddings (with a demo-mode mock fallback) |
| Markdown rendering | `react-markdown` + `remark-gfm` |
| Deployment | Vercel (see `vercel.json`) |

> Note: several UI components import from `framer-motion`, but it isn't listed in `package.json`'s dependencies. Run `npm install framer-motion` if you hit a module-not-found error after `npm install`.

## Architecture

```
Frontend (Next.js App Router, client components)
  landing page + repo dashboard + chat/time-travel/adrs/ghost/graph pages
        │  fetch() calls + SSE
        ▼
API routes (Next.js Route Handlers, src/app/api/**)
  ingestion · chat (RAG) · ADR generation · graph · heatmap · onboarding
        │
        ├──► src/lib/git-parser.ts   — clone + parse commit history (simple-git)
        ├──► src/lib/rag.ts          — retrieval + prompt construction
        ├──► src/lib/watsonx.ts      — IBM watsonx.ai client (or demo-mode mocks)
        ├──► src/lib/middleware.ts   — in-memory rate limiting, error helpers
        └──► src/lib/supabase.ts     — lazily-initialized Supabase clients
        ▼
Supabase Postgres + pgvector
  repositories · commits (+ embedding vector(384)) · files · authors
  adrs · chat_sessions · chat_messages
  match_commits() — pgvector cosine-similarity RPC
```

Repository ingestion is a two-step handoff: `POST /api/repos/ingest` creates the DB row and fires an unawaited `fetch` to `POST /api/repos/[id]/process`, which does the actual cloning/parsing/embedding work and updates the row's `status` as it goes. The frontend polls `GET /api/repos/[id]/status` (SSE) to show progress. See `docs/BACKEND.md` for the full endpoint-by-endpoint request/response reference.

## Setup

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) project

### Install

```bash
npm install
npm install framer-motion   # see tech-stack note above
```

### Environment variables

Create `.env.local` in the repo root (no `.env.example` is checked in, so set these manually):

```bash
# Required — Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI — pick one
DEMO_MODE=true                       # no AI credentials needed, uses mock responses
# --- or ---
WATSONX_API_KEY=your-api-key
WATSONX_PROJECT_ID=your-project-id
WATSONX_REGION=us-south              # defaults to us-south

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
MAX_INGESTION_COMMITS=1000
UPSTASH_REDIS_REST_URL=...           # only used by src/lib/queue.ts, currently unwired
UPSTASH_REDIS_REST_TOKEN=...
```

### Database

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase-schema.sql` — this creates the `repositories`, `commits`, `files`, `authors`, `adrs`, `chat_sessions`, and `chat_messages` tables, plus the `match_commits()` pgvector similarity function.
3. Confirm the `vector` extension is enabled (the schema script does this with `create extension if not exists vector;`).

### Run

```bash
npm run setup     # validates .env.local and dependencies (scripts/setup.js)
npm run dev       # start the dev server (Turbopack) at http://localhost:3000
npm run test:api  # smoke-tests the API endpoints against a running dev server (scripts/test-api.js)
npm run build     # production build
npm start         # run the production build
npm run lint      # eslint
```

### Trying it out

```bash
curl -X POST http://localhost:3000/api/repos/ingest \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/expressjs/express"}'

curl -N http://localhost:3000/api/repos/<id>/status   # watch ingestion progress via SSE

curl -X POST http://localhost:3000/api/repos/<id>/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Why was this architecture chosen?","mode":"why"}'
```

## Notable technical decisions

- **Demo mode by default.** Every AI call path (`chatCompletion`, `chatCompletionStream`, `generateEmbedding(s)` in `src/lib/watsonx.ts`) transparently falls back to deterministic mock output when `DEMO_MODE=true` or no API key is configured, including a graceful fallback if a live watsonx embedding call fails. This keeps the app fully clickable without IBM Cloud credentials.
- **Vector search with a text-search fallback.** `retrieveContext()` in `src/lib/rag.ts` tries `pgvector` similarity search first and falls back to Postgres `textSearch` on the commit message if the RPC errors, rather than failing the chat request outright.
- **Serverless-first ingestion.** Cloning and parsing run inside a Next.js API route with a 300-second `maxDuration` (see `vercel.json`), capped at 500 commits per repo and depth-limited git clones, to fit inside Vercel's serverless function limits rather than requiring a persistent worker process.
- **Batch inserts.** Commits and files are inserted into Supabase in batches of 100, and embeddings are generated in batches of 20, to stay under request size/time limits during ingestion.
- **Queue infrastructure exists ahead of use.** `src/lib/queue.ts` implements a full BullMQ + Upstash Redis job queue, distributed rate limiter, and cache layer, but the current ingestion and rate-limiting code paths don't call into it yet — ingestion is a fire-and-forget HTTP call and rate limiting is an in-memory `Map`. This looks like groundwork for a Phase 2 migration rather than dead code to delete.

## Project structure

```
src/
  app/
    page.tsx                 # landing page
    [repoId]/                # per-repo dashboard + chat/time-travel/adrs/ghost/graph pages
    api/
      repos/ingest/          # POST — start ingestion
      repos/[id]/            # status, process, chat, adrs, files, timeline, authors, graph, heatmap, onboarding
      commits/[sha]/         # commit detail + AI summary
  components/
    sections/                 # landing page sections (hero, features, pricing, faq, ...)
    shared/                   # repo shell, navbar, ingest form, etc.
    ui/                       # small Radix-based primitives (button, input, accordion, sheet, badge)
  lib/
    git-parser.ts             # clone + parse git history
    watsonx.ts                 # IBM watsonx.ai client + demo-mode mocks
    rag.ts                     # retrieval-augmented generation pipeline
    queue.ts                   # BullMQ/Upstash queue, cache, rate limiter (not yet wired in)
    middleware.ts              # in-memory rate limiting, error/response helpers
    supabase.ts                 # Supabase client factories
  types/index.ts               # shared TypeScript types
supabase-schema.sql             # full Postgres schema + match_commits() RPC
docs/BACKEND.md                 # detailed API reference
docs/SETUP_GUIDE.md             # step-by-step setup walkthrough
```

## Documentation

- [`docs/BACKEND.md`](./docs/BACKEND.md) — full API endpoint reference (request/response shapes, status codes)
- [`docs/SETUP_GUIDE.md`](./docs/SETUP_GUIDE.md) — a more granular setup walkthrough, including what's required vs. optional
