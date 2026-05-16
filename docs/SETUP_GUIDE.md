# Complete Setup Guide

## 🎯 What's Required vs Optional

### ✅ REQUIRED (Must Have)

#### 1. Supabase Database Setup
**Status**: Schema ready, needs manual setup

**Steps:**
1. Create free Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor
4. Copy and paste entire `supabase-schema.sql` file
5. Click "Run"
6. Enable pgvector extension:
   ```sql
   create extension if not exists vector;
   ```
7. Copy credentials to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

**Where to find credentials:**
- Go to Project Settings → API
- Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

**Time**: ~5 minutes

---

#### 2. AI Provider (Choose One)

**Option A: IBM watsonx.ai (Production)**
1. Get IBM Cloud account
2. Create watsonx.ai project
3. Get API key from IBM Cloud
4. Add to `.env.local`:
   ```bash
   WATSONX_API_KEY=your-api-key
   WATSONX_PROJECT_ID=your-project-id
   WATSONX_REGION=us-south
   ```

**Option B: Demo Mode (Development/Testing)**
Just set in `.env.local`:
```bash
DEMO_MODE=true
```
- ✅ Zero AI credits used
- ✅ Realistic mock responses
- ✅ Perfect for testing
- ⚠️ Not for production

**Time**: 10 minutes (watsonx) or 1 second (demo mode)

---

### 🔧 OPTIONAL (Nice to Have)

#### 3. Redis/Upstash (For Production Scale)
**Status**: Not implemented, in-memory rate limiting works for MVP

**Why you might want it:**
- Distributed rate limiting across multiple Vercel instances
- Persistent rate limit counters
- Caching for faster responses
- Queue management for background jobs

**Current workaround:**
- In-memory Map for rate limiting
- Works fine for single Vercel instance
- Resets on cold start (acceptable for MVP)

**If you want to add it:**
1. Create free Upstash account
2. Create Redis database
3. Add to `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```
4. Install package:
   ```bash
   npm install @upstash/redis
   ```
5. Update `src/lib/middleware.ts` to use Redis instead of Map

**Time**: 15 minutes
**Priority**: Low (only needed at scale)

---

#### 4. file_changes Junction Table
**Status**: Not implemented, commit parsing works for MVP

**What it would do:**
- Explicit many-to-many relationship between commits and files
- Faster timeline queries
- More accurate file history

**Current workaround:**
- File changes tracked during commit parsing
- Timeline endpoint returns all commits (client filters)
- Works fine for MVP

**If you want to add it:**
1. Add to `supabase-schema.sql`:
   ```sql
   create table if not exists file_changes (
     id uuid primary key default gen_random_uuid(),
     commit_id uuid references commits(id) on delete cascade,
     file_id uuid references files(id) on delete cascade,
     change_type text not null,
     insertions int default 0,
     deletions int default 0
   );
   create index idx_file_changes_commit on file_changes(commit_id);
   create index idx_file_changes_file on file_changes(file_id);
   ```
2. Update `src/app/api/repos/[id]/process/route.ts` to populate it
3. Update `src/app/api/repos/[id]/timeline/route.ts` to query it

**Time**: 30 minutes
**Priority**: Medium (nice optimization)

---

## 📋 Complete Setup Checklist

### Phase 1: Minimum Viable Setup (15 minutes)

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `DEMO_MODE=true` in `.env.local`
- [ ] Create Supabase project
- [ ] Run `supabase-schema.sql` in Supabase SQL Editor
- [ ] Enable pgvector extension
- [ ] Copy Supabase credentials to `.env.local`
- [ ] Run `npm run setup` to validate
- [ ] Run `npm run dev`
- [ ] Test at http://localhost:3000

**Result**: Fully functional app with demo AI responses

---

### Phase 2: Production Setup (30 minutes)

- [ ] Get IBM watsonx.ai credentials
- [ ] Add watsonx credentials to `.env.local`
- [ ] Set `DEMO_MODE=false`
- [ ] Test AI responses work
- [ ] Run `npm run test:api`
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Add environment variables to Vercel
- [ ] Test production deployment

**Result**: Production-ready app with real AI

---

### Phase 3: Optional Enhancements (1-2 hours)

- [ ] Set up Upstash Redis
- [ ] Implement Redis-backed rate limiting
- [ ] Add `file_changes` junction table
- [ ] Update timeline queries
- [ ] Add caching layer
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Add analytics

**Result**: Optimized for scale

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Validate setup
npm run setup

# 3. Start development server
npm run dev

# 4. Test all endpoints
npm run test:api

# 5. Deploy to production
vercel --prod
```

---

## 🔍 What's Already Done

### ✅ Backend Infrastructure
- All 15 API endpoints implemented
- Git parsing and ingestion pipeline
- RAG pipeline with vector search
- Rate limiting and error handling
- Environment validation
- Deployment configuration

### ✅ Database Schema
- All 7 tables defined
- Indexes created
- Vector similarity function
- Ready to run in Supabase

### ✅ AI Integration
- watsonx.ai Granite integration
- Streaming chat responses
- Embedding generation
- Demo mode fallback

### ✅ Documentation
- Complete API reference
- Setup guides
- Testing utilities
- Deployment instructions

---

## 🐛 Troubleshooting

### "Missing Supabase env vars"
→ Make sure you've copied credentials from Supabase dashboard to `.env.local`

### "Repository not found" errors
→ Check that you ran `supabase-schema.sql` in Supabase SQL Editor

### "Embedding generation failed"
→ Either add watsonx.ai credentials OR set `DEMO_MODE=true`

### "Rate limit exceeded" immediately
→ This is normal on cold start with in-memory rate limiting. Wait 15 minutes or restart server.

### SSE stream not working
→ Make sure you're using a browser that supports Server-Sent Events (all modern browsers do)

---

## 📊 What Each Component Does

### Supabase (REQUIRED)
- **Purpose**: Database for all repository data
- **Used by**: Every API endpoint
- **Can skip?**: ❌ No - core infrastructure
- **Free tier**: ✅ Yes, 500MB database

### watsonx.ai (OPTIONAL with DEMO_MODE)
- **Purpose**: AI responses for chat, ADRs, onboarding
- **Used by**: Chat, ADR generation, onboarding, commit summaries
- **Can skip?**: ✅ Yes with `DEMO_MODE=true`
- **Free tier**: ❌ No, but demo mode is free

### Redis/Upstash (OPTIONAL)
- **Purpose**: Distributed rate limiting and caching
- **Used by**: Rate limiting (currently in-memory)
- **Can skip?**: ✅ Yes for MVP
- **Free tier**: ✅ Yes, 10k requests/day

### file_changes table (OPTIONAL)
- **Purpose**: Faster file timeline queries
- **Used by**: Timeline endpoint (currently uses commit parsing)
- **Can skip?**: ✅ Yes, current approach works
- **Performance impact**: Minimal for MVP

---

## 🎯 Recommended Setup Path

### For Hackathon Demo (Fastest)
1. Supabase setup (5 min)
2. Set `DEMO_MODE=true` (1 sec)
3. Deploy to Vercel (5 min)
4. **Total: 10 minutes**

### For Production (Best)
1. Supabase setup (5 min)
2. watsonx.ai setup (10 min)
3. Test locally (5 min)
4. Deploy to Vercel (5 min)
5. **Total: 25 minutes**

### For Scale (Overkill for MVP)
1. Everything above (25 min)
2. Upstash Redis (15 min)
3. file_changes table (30 min)
4. Monitoring setup (30 min)
5. **Total: 100 minutes**

---

## 💡 Pro Tips

1. **Start with demo mode** - Get everything working first, then add real AI
2. **Use Supabase free tier** - More than enough for hackathon/MVP
3. **Skip Redis for now** - In-memory rate limiting is fine for single instance
4. **Skip file_changes** - Current approach works, optimize later if needed
5. **Deploy early** - Test in production environment ASAP

---

## 📞 Need Help?

1. Check `docs/BACKEND.md` for API details
2. Run `npm run setup` to validate environment
3. Run `npm run test:api` to test endpoints
4. Check Vercel function logs for errors
5. Enable `NODE_ENV=development` for detailed errors

---

## ✅ Final Checklist

**Minimum to run locally:**
- [x] Code is ready
- [ ] Supabase project created
- [ ] Schema loaded
- [ ] Credentials in `.env.local`
- [ ] `DEMO_MODE=true` set

**Minimum to deploy:**
- [x] Everything above
- [ ] Vercel account
- [ ] Environment variables in Vercel
- [ ] Domain configured (optional)

**For production AI:**
- [x] Everything above
- [ ] watsonx.ai credentials
- [ ] `DEMO_MODE=false`
- [ ] Test AI responses

**For scale (optional):**
- [x] Everything above
- [ ] Redis/Upstash
- [ ] file_changes table
- [ ] Monitoring

---

**Bottom line**: You need **Supabase** (5 min setup) and either **watsonx.ai** (10 min) or **DEMO_MODE** (instant). Everything else is optional optimization! 🚀