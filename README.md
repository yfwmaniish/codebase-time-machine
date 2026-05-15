# Codebase Time Machine ⏱

> **Git tells you _what_ changed. We tell you _why_.**

Turn any Git repository into a queryable knowledge base — powered by IBM watsonx.ai Granite.

![IBM Build on Bob Hackathon 2025](https://img.shields.io/badge/IBM-Build%20on%20Bob%202025-blue?style=for-the-badge&logo=ibm)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-green?style=flat-square&logo=supabase)

## 🎯 Problem

Developers spend **58% of their time understanding existing code** (IEEE study). `git log` tells you *what* changed, but never *why*. Tribal knowledge walks out the door when developers leave.

## 💡 Solution

Codebase Time Machine indexes your entire Git history and makes it queryable through AI. Five core features:

### 1. 💬 Why Engine
Ask *any* question about your codebase and get cited answers backed by actual commit history.

### 2. ⏳ Time Travel
Scrub through a file's evolution commit-by-commit with AI-generated summaries explaining each change.

### 3. 📋 Auto ADRs
Generate Architectural Decision Records automatically from commit patterns — no more missing documentation.

### 4. 👻 Ghost Author
Chat with AI-synthesized profiles of past contributors about their work, based solely on their Git history.

### 5. 🕸️ Knowledge Graph
Visualize connections between files, people, and architectural decisions in an interactive graph.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Next.js 16 (App Router)        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Landing  │  │Dashboard │  │  Feature   │ │
│  │  Page    │  │  + Stats │  │   Pages    │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│  ┌──────────────────────────────────────┐   │
│  │         API Routes (7 endpoints)     │   │
│  │  ingest │ process │ chat │ adrs │... │   │
│  └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │  Git     │  │   RAG    │  │ watsonx.ai│ │
│  │ Parser   │  │ Pipeline │  │  Granite  │ │
│  └──────────┘  └──────────┘  └───────────┘ │
├─────────────────────────────────────────────┤
│           Supabase (PostgreSQL + pgvector)  │
│  repos │ commits │ files │ authors │ adrs   │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- IBM watsonx.ai API key

### Setup

```bash
# Clone
git clone https://github.com/your-username/codebase-time-machine.git
cd codebase-time-machine

# Install
npm install

# Environment
cp .env.example .env.local
# Fill in your Supabase + watsonx.ai credentials

# Database
# Copy supabase-schema.sql into Supabase SQL Editor and run

# Dev
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `WATSONX_API_KEY` | IBM watsonx.ai API key |
| `WATSONX_PROJECT_ID` | watsonx.ai project ID |
| `WATSONX_REGION` | watsonx.ai region (default: us-south) |

## 🧠 IBM watsonx.ai Integration

- **Chat/Reasoning**: `ibm/granite-3-3-8b-instruct` — powers Why Engine, Ghost Author, and ADR generation
- **Embeddings**: `ibm/slate-30m-english-rtrvr-v2` — generates 384-dim vectors for semantic commit search
- **RAG Pipeline**: Vector similarity via pgvector → context assembly → Granite inference

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── [repoId]/
│   │   ├── page.tsx                # Dashboard
│   │   ├── chat/page.tsx           # Why Engine
│   │   ├── time-travel/page.tsx    # File timeline
│   │   ├── adrs/page.tsx           # ADR viewer
│   │   ├── ghost/page.tsx          # Ghost Author
│   │   └── indexing/page.tsx       # Progress page
│   └── api/repos/
│       ├── ingest/route.ts         # Start ingestion
│       └── [id]/
│           ├── route.ts            # Repo metadata
│           ├── process/route.ts    # Background worker
│           ├── chat/route.ts       # Chat API
│           ├── adrs/route.ts       # ADR API
│           ├── authors/route.ts    # Authors API
│           ├── files/route.ts      # File tree API
│           └── timeline/route.ts   # Timeline API
├── lib/
│   ├── supabase.ts                 # DB client
│   ├── watsonx.ts                  # AI client
│   ├── git-parser.ts               # Git operations
│   └── rag.ts                      # RAG pipeline
└── types/index.ts                  # TypeScript types
```

## 🏆 Hackathon

Built for **IBM Build on Bob Hackathon 2025** in 48 hours.

**Team**: Codebase Time Machine

## 📄 License

MIT
