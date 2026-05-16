# Backend API Documentation

## Overview

The Codebase Time Machine backend is built with Next.js 14 App Router, providing a RESTful API with Server-Sent Events (SSE) for real-time updates. All endpoints are serverless functions deployed on Vercel.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js API Routes (Serverless Functions)              │
├─────────────────────────────────────────────────────────┤
│  • Repository Ingestion & Processing                    │
│  • RAG Pipeline (Retrieval-Augmented Generation)        │
│  • Real-time Progress Streaming (SSE)                   │
│  • Knowledge Graph Generation                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Data Layer                                              │
├─────────────────────────────────────────────────────────┤
│  • PostgreSQL (Supabase) - Structured data              │
│  • pgvector - Semantic search via embeddings            │
│  • Redis (Optional) - Caching & queue management        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  AI Layer                                                │
├─────────────────────────────────────────────────────────┤
│  • IBM watsonx.ai Granite - LLM inference               │
│  • Embeddings - Semantic search                         │
│  • Demo Mode - Mock responses (zero credits)            │
└─────────────────────────────────────────────────────────┘
```

## Environment Setup

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# IBM watsonx.ai (or set DEMO_MODE=true)
WATSONX_API_KEY=your-api-key
WATSONX_PROJECT_ID=your-project-id
WATSONX_REGION=us-south
```

### Optional Variables

```bash
# Demo Mode (uses mock AI responses)
DEMO_MODE=true

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Background Jobs
MAX_INGESTION_COMMITS=1000
INGESTION_TIMEOUT_MS=300000
```

## API Endpoints

### Repository Management

#### `POST /api/repos/ingest`
Start repository ingestion process.

**Request:**
```json
{
  "url": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "repo_id": "uuid",
  "status": "pending",
  "message": "Ingestion started"
}
```

**Status Codes:**
- `200` - Success (new or existing repo)
- `400` - Invalid URL or missing parameters
- `500` - Server error

---

#### `GET /api/repos/[id]`
Get repository metadata and statistics.

**Response:**
```json
{
  "id": "uuid",
  "name": "owner/repo",
  "status": "ready",
  "total_commits": 500,
  "total_files": 150,
  "total_authors": 12,
  "top_authors": [...],
  "languages": {
    "TypeScript": 45,
    "JavaScript": 30
  }
}
```

---

#### `GET /api/repos/[id]/status`
Server-Sent Events stream for real-time ingestion progress.

**Response (SSE):**
```
data: {"status":"cloning","progress":20,"message":"Cloning repository..."}

data: {"status":"parsing","progress":50,"total_commits":500}

data: {"status":"ready","progress":100,"message":"Repository indexed!"}
```

**Status Values:**
- `pending` - Queued for processing
- `cloning` - Cloning from GitHub
- `parsing` - Parsing Git history
- `embedding` - Generating embeddings
- `ready` - Complete and queryable
- `failed` - Error occurred

---

### Chat & AI Features

#### `POST /api/repos/[id]/chat`
Why Engine and Ghost Author chat interface.

**Request:**
```json
{
  "message": "Why does the auth middleware check tokens twice?",
  "mode": "why",
  "session_id": "uuid (optional)",
  "ghost_author_id": "uuid (for ghost mode)"
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "Based on commit [a1b2c3d]...",
    "citations": [
      {
        "type": "commit",
        "sha": "a1b2c3d",
        "message": "Add double-check for security",
        "author": "Jane Doe",
        "date": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Modes:**
- `why` - Historical context and reasoning
- `ghost` - Synthesized author perspective

---

#### `POST /api/repos/[id]/adrs`
Generate Architectural Decision Records.

**Response:**
```json
{
  "count": 5,
  "adrs": [
    {
      "id": "uuid",
      "title": "Migration to Modular Architecture",
      "status": "Accepted",
      "context": "...",
      "decision": "...",
      "consequences": "...",
      "supporting_commits": ["sha1", "sha2"]
    }
  ]
}
```

---

#### `GET /api/repos/[id]/adrs`
List existing ADRs.

---

### File & Code Exploration

#### `GET /api/repos/[id]/files`
Get file tree and metadata.

**Response:**
```json
{
  "files": [...],
  "tree": [
    {
      "name": "src",
      "type": "directory",
      "children": [
        {
          "name": "app.ts",
          "type": "file",
          "path": "src/app.ts",
          "language": "TypeScript",
          "risk_score": 0.45,
          "commit_count": 23
        }
      ]
    }
  ],
  "total": 150
}
```

---

#### `GET /api/repos/[id]/timeline?file=path/to/file`
Get commit timeline for a specific file.

**Response:**
```json
{
  "file": "src/app.ts",
  "timeline": [
    {
      "sha": "abc123",
      "message": "Refactor app initialization",
      "author_name": "John Doe",
      "authored_at": "2024-01-15T10:30:00Z",
      "files_changed": 3,
      "insertions": 45,
      "deletions": 12
    }
  ]
}
```

---

### Visualization & Analysis

#### `GET /api/repos/[id]/graph`
Knowledge graph data for D3 visualization.

**Response:**
```json
{
  "nodes": [
    {
      "id": "file-uuid",
      "type": "file",
      "label": "app.ts",
      "size": 15,
      "color": "#10B981",
      "metadata": {...}
    },
    {
      "id": "author-uuid",
      "type": "author",
      "label": "Jane Doe",
      "size": 20,
      "color": "#7C5CFF"
    }
  ],
  "edges": [
    {
      "source": "author-uuid",
      "target": "file-uuid",
      "type": "modified",
      "weight": 15
    }
  ],
  "stats": {
    "total_nodes": 75,
    "total_edges": 120
  }
}
```

**Node Types:**
- `file` - Source code files
- `author` - Contributors
- `commit` - Major commits
- `adr` - Architectural decisions

**Edge Types:**
- `wrote` - Author created commit
- `modified` - Author changed file
- `decided` - ADR references commit
- `depends` - File dependencies

---

#### `GET /api/repos/[id]/heatmap?explain=true`
Risk heatmap data for treemap visualization.

**Query Parameters:**
- `explain` - Generate AI explanations for high-risk files (optional)

**Response:**
```json
{
  "nodes": [
    {
      "name": "app.ts",
      "path": "src/app.ts",
      "value": 23,
      "risk_score": 0.75,
      "risk_level": "high",
      "risk_explanation": "High churn with 23 commits...",
      "metadata": {
        "language": "TypeScript",
        "commit_count": 23,
        "unique_authors": 5
      }
    }
  ],
  "hierarchy": {...},
  "stats": {
    "total": 150,
    "critical": 5,
    "high_risk": 15,
    "medium_risk": 45,
    "low_risk": 85,
    "avg_risk": 0.32
  }
}
```

**Risk Levels:**
- `critical` - Score ≥ 0.8
- `high` - Score ≥ 0.6
- `medium` - Score ≥ 0.3
- `low` - Score < 0.3

---

### Contributors

#### `GET /api/repos/[id]/authors`
List all contributors sorted by impact.

**Response:**
```json
{
  "authors": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "total_commits": 145,
      "total_insertions": 5420,
      "total_deletions": 2130,
      "files_touched": 67,
      "domains": {
        "src": 45,
        "tests": 23
      },
      "first_commit_at": "2023-01-15T10:00:00Z",
      "last_commit_at": "2024-03-20T15:30:00Z"
    }
  ]
}
```

---

### Onboarding

#### `POST /api/repos/[id]/onboarding`
Generate personalized onboarding plan.

**Request:**
```json
{
  "role": "fullstack",
  "seniority": "mid",
  "focus_area": "API development"
}
```

**Roles:**
- `frontend`
- `backend`
- `fullstack`
- `devops`
- `mobile`

**Seniority:**
- `junior`
- `mid`
- `senior`

**Response:**
```json
{
  "plan": "## Week 1: Foundation & Exploration\n...",
  "metadata": {
    "repo_name": "owner/repo",
    "role": "fullstack",
    "seniority": "mid",
    "generated_at": "2024-03-20T10:00:00Z"
  }
}
```

---

### Commits

#### `GET /api/commits/[sha]?summary=true`
Get commit details with optional AI summary.

**Query Parameters:**
- `summary` - Generate plain-English summary (optional)

**Response:**
```json
{
  "id": "uuid",
  "sha": "abc123def456",
  "message": "Refactor authentication middleware",
  "author_name": "John Doe",
  "author_email": "john@example.com",
  "authored_at": "2024-01-15T10:30:00Z",
  "files_changed": 5,
  "insertions": 120,
  "deletions": 45,
  "summary": "This commit refactored the auth middleware to improve security..."
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (dev mode only)",
  "timestamp": "2024-03-20T10:00:00Z"
}
```

**Common Status Codes:**
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

Default limits (configurable via environment):
- **100 requests** per **15 minutes** per IP
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `Retry-After` (on 429 errors)

## Demo Mode

Set `DEMO_MODE=true` to use mock AI responses:
- ✅ Zero watsonx.ai credits used
- ✅ Realistic demo data
- ✅ Full feature testing
- ⚠️ Not for production

## Database Schema

See `supabase-schema.sql` for complete schema. Key tables:

- `repositories` - Indexed repos
- `commits` - Git commits with embeddings
- `files` - File metadata and risk scores
- `authors` - Contributor profiles
- `adrs` - Generated architectural decisions
- `chat_sessions` - Conversation history
- `chat_messages` - Individual messages

## Performance Considerations

### Ingestion
- Capped at 1,000 commits (configurable)
- Background processing with SSE progress
- Automatic cleanup of cloned repos
- Batch inserts for efficiency

### Queries
- Vector similarity search via pgvector
- Text search fallback when embeddings unavailable
- Indexed queries on common patterns
- Pagination on large result sets

### Caching
- In-memory rate limiting
- Optional Redis for distributed caching
- Supabase connection pooling

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set all required variables in Vercel dashboard or via CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add WATSONX_API_KEY
# ... etc
```

### Database Setup
1. Create Supabase project
2. Run `supabase-schema.sql` in SQL Editor
3. Enable pgvector extension
4. Copy connection details to `.env.local`

## Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Testing

```bash
# Test repository ingestion
curl -X POST http://localhost:3000/api/repos/ingest \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/expressjs/express"}'

# Monitor progress (SSE)
curl -N http://localhost:3000/api/repos/[id]/status

# Test chat
curl -X POST http://localhost:3000/api/repos/[id]/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Why was this architecture chosen?","mode":"why"}'
```

## Troubleshooting

### Ingestion Fails
- Check GitHub URL is valid and public
- Verify Supabase connection
- Check serverless function timeout (max 300s on Vercel)
- Review logs in Vercel dashboard

### AI Responses Empty
- Verify watsonx.ai credentials
- Check DEMO_MODE setting
- Review API quota/limits
- Check embedding generation logs

### Rate Limiting Issues
- Adjust `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`
- Implement Redis-backed rate limiting for production
- Use API keys for authenticated rate limits

## Support

For issues or questions:
1. Check this documentation
2. Review environment variables
3. Check Vercel function logs
4. Enable `NODE_ENV=development` for detailed errors