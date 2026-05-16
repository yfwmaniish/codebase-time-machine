# 🕰️ Codebase Time Machine

> **Git tells you *what* changed. We tell you *why*.**

Transform any Git repository into a queryable, interactive knowledge base powered by IBM watsonx.ai. Never lose tribal knowledge again.

[![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-7C5CFF?style=for-the-badge)](https://www.ibm.com/products/watsonx-ai)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

[Live Demo](./docs/videos/live-demo.mp4) • [Documentation](./docs/BACKEND.md) • [Video Pitch](./docs/videos/video-pitch.mp4) • [Hackathon Submission](#)

---

> **⚠️ Important Note:** This project was built entirely **solo**. I currently have a **throat infection** and am unable to speak, which is why the video presentation uses an **AI voiceover** instead of my own voice. I apologize for the inconvenience — the project, code, and all development work are 100% my own.

---

## 🎯 The Problem

Software teams lose **2-4 weeks of productivity per new hire** on codebase onboarding. When senior engineers leave, critical context vanishes with them. The "why" behind code decisions lives in:
- 💬 Dead Slack threads
- 🧠 Departed engineers' heads  
- 📝 Vague PR descriptions ("fix")
- 🗑️ Lost documentation

**Existing tools (Copilot, Cursor, Cody) treat code as a snapshot. We treat it as a story.**

---

## 💡 The Solution

Codebase Time Machine reframes your Git repository as a **temporal knowledge graph**. Ask questions in natural language. Travel through time. Understand the "why" behind every line of code.

### Core Features

#### 🤖 **Why Engine** — Chat with Your Codebase's History
Ask questions like:
- "Why does the auth middleware check tokens twice?"
- "What led to the decision to use Redis?"
- "Who designed the payment flow and what were their considerations?"

Get narrative answers with **commit-level citations**.

#### ⏰ **Time Travel Mode** — Visual File Evolution
- Scrub through any file's complete history
- See major moments with AI-generated summaries
- Understand how code evolved and why

#### 📜 **Auto-Generated ADRs** — Capture Architectural Decisions
Automatically extract Architectural Decision Records from Git history:
- What was decided
- Why it was decided
- What the consequences were
- Which commits prove it

#### 👻 **Ghost Author Mode** — Chat with Departed Engineers
Synthesize expertise profiles from Git contributions:
- "What would Sarah say about this module?"
- Scoped to their actual work
- Clearly labeled as AI synthesis

#### 🗺️ **Knowledge Graph** — Visualize Relationships
Interactive D3 graph showing:
- Files ↔ Authors ↔ Commits ↔ Decisions
- Who owns what
- Where the expertise lives

#### 🔥 **Risk Heatmap** — Identify Technical Debt
Treemap visualization of file risk scores based on:
- Commit churn
- Number of authors
- Time since last touch
- Complexity indicators

#### 🎓 **Onboarding Mode** — Personalized Learning Paths
Generate role-specific 2-week onboarding plans:
- Which files to read first
- Who to pair with
- Suggested starter tasks

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- IBM watsonx.ai credentials (or use demo mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codebase-time-machine.git
cd codebase-time-machine

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
# 1. Create Supabase project
# 2. Run supabase-schema.sql in SQL Editor
# 3. Enable pgvector extension

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Demo Mode (No Credentials Required)

```bash
# In .env.local
DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
```

Demo mode uses realistic mock AI responses — perfect for testing!

---

## 📖 Usage

### 1. Index a Repository

```bash
# Via UI
Paste GitHub URL → Click "Index Repository"

# Via API
curl -X POST http://localhost:3000/api/repos/ingest \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/expressjs/express"}'
```

### 2. Ask Questions

Navigate to the repository dashboard and start chatting:

```
You: "Why was Express.js designed with middleware?"

AI: Based on commit [a1b2c3d] by TJ Holowaychuk (2010-01-03), 
the middleware pattern was adopted to provide a flexible, 
composable way to handle HTTP requests...

[Citations: 3 commits, 2 PRs]
```

### 3. Explore Time Travel

Select any file → Scrub through its timeline → See AI summaries of major changes.

### 4. Generate ADRs

Click "Generate ADRs" → Get 5-15 architectural decision records extracted from history.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend — Next.js 14 (App Router)                     │
│  • React + TailwindCSS + shadcn/ui                      │
│  • D3.js for visualizations                             │
│  • Framer Motion for animations                         │
└─────────────────────────┬───────────────────────────────┘
                          │ REST + SSE
┌─────────────────────────▼───────────────────────────────┐
│  Backend — Next.js API Routes (Serverless)              │
│  • Repository ingestion pipeline                        │
│  • RAG (Retrieval-Augmented Generation)                 │
│  • Real-time progress streaming                         │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Data Layer                                              │
│  • PostgreSQL (Supabase) + pgvector                     │
│  • Redis (optional) for caching                         │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  AI Layer — IBM watsonx.ai                              │
│  • Granite 3.3 8B Instruct (LLM)                        │
│  • Slate 30M (Embeddings)                               │
└─────────────────────────────────────────────────────────┘
```

See [docs/BACKEND.md](./docs/BACKEND.md) for detailed API documentation.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14, React 19, TailwindCSS | Modern, fast, great DX |
| **UI Components** | shadcn/ui, Radix UI | Accessible, customizable |
| **Visualizations** | D3.js, Recharts | Powerful, flexible |
| **Backend** | Next.js API Routes | Serverless, easy deploy |
| **Database** | PostgreSQL (Supabase) | Robust, free tier |
| **Vector Search** | pgvector | Native Postgres extension |
| **LLM** | IBM watsonx.ai Granite | Powerful, cost-effective |
| **Git Operations** | simple-git | Battle-tested Node.js lib |
| **Deployment** | Vercel | One-click, edge network |

---

## 🎨 Screenshots

### Landing Page
![Landing Page](./docs/screenshots/landing.png)

### Why Engine Chat
![Chat Interface](./docs/screenshots/chat.png)

### Time Travel Mode
![Time Travel](./docs/screenshots/time-travel.png)

### Knowledge Graph
![Knowledge Graph](./docs/screenshots/graph.png)

### Risk Heatmap
![Heatmap](./docs/screenshots/heatmap.png)

---

## 🤖 Built with IBM Bob

This entire application was designed and built inside the **IBM Bob IDE** as part of the Build on Bob Hackathon. Every feature, from the ingestion pipeline to the AI chat interface, was implemented with Bob as the development partner.

### Bob Session Reports

See the complete development journey in [`bob_sessions/`](./bob_sessions/):
- 16+ task sessions
- Architecture planning
- Feature implementation
- Debugging and refinement

**Bob was used both as:**
1. **Build Partner** — The IDE that built the app
2. **Runtime Brain** — watsonx.ai powers the live AI features

---

## 📊 Performance

- **Ingestion:** 500 commits in < 60 seconds
- **Chat Response:** Streams in < 3 seconds
- **Vector Search:** < 100ms for 10k commits
- **Graph Rendering:** < 2s for 200 nodes

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add WATSONX_API_KEY
# ... etc
```

### Environment Variables

Required in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WATSONX_API_KEY`
- `WATSONX_PROJECT_ID`

See [`.env.example`](./.env.example) for complete list.

---

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test ingestion
curl -X POST http://localhost:3000/api/repos/ingest \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/lodash/lodash"}'

# Monitor progress (SSE)
curl -N http://localhost:3000/api/repos/[id]/status

# Test chat
curl -X POST http://localhost:3000/api/repos/[id]/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Why was this architecture chosen?","mode":"why"}'
```

---

## 🗺️ Roadmap

### Phase 2 (Post-Hackathon)
- [ ] User authentication & workspaces
- [ ] Private repository support (GitHub OAuth)
- [ ] Slack integration
- [ ] VS Code extension

### Phase 3 (Future)
- [ ] Team knowledge graphs across repos
- [ ] Custom ADR templates
- [ ] Code review assistant
- [ ] Jira/Linear integration

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- **IBM watsonx.ai** for the powerful Granite models
- **Supabase** for the excellent PostgreSQL platform
- **Vercel** for seamless deployment
- **Build on Bob Hackathon** for the inspiration

---

## 📞 Contact

Built by Manish Tiwari for the IBM Build on Bob Hackathon 2026.

- 🌐 [Live Demo](./docs/videos/live-demo.mp4)
- 📧 [Email](mailto:tiwarimanish2810@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/manish-tiwarisec/)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ and IBM Bob

</div>
