// ============================================================
// IBM watsonx.ai Granite — Client Wrapper
// DEMO_MODE: returns realistic mock responses (zero credit usage)
// Set DEMO_MODE=false + real API key for live AI calls
// ============================================================

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

const isDemoMode = () => {
  const demoMode = process.env.DEMO_MODE === 'true';
  const hasApiKey = !!process.env.WATSONX_API_KEY;
  console.log('[watsonx] Demo mode check:', {
    DEMO_MODE: process.env.DEMO_MODE,
    demoMode,
    hasApiKey,
    result: demoMode || !hasApiKey
  });
  return demoMode || !hasApiKey;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

function getConfig() {
  return {
    apiKey: process.env.WATSONX_API_KEY || '',
    projectId: process.env.WATSONX_PROJECT_ID || '',
    region: process.env.WATSONX_REGION || 'us-south',
  };
}

async function getIAMToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }
  const config = getConfig();
  const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${config.apiKey}`,
  });
  if (!response.ok) throw new Error(`IAM auth failed: ${response.status}`);
  const data = await response.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in * 1000) };
  return cachedToken.token;
}

function getBaseUrl(region: string): string {
  return `https://${region}.ml.cloud.ibm.com`;
}

// ============ DEMO MODE RESPONSES ============

function generateDemoResponse(messages: ChatMessage[]): string {
  const userMsg = messages.find(m => m.role === 'user')?.content || '';
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const isGhost = systemMsg.includes('synthesizing the perspective');
  const isADR = systemMsg.includes('architectural decisions');

  if (isADR) {
    return `## ADR: Migration to Modular Architecture

**Status:** Accepted

**Context:** The codebase had grown organically with tightly coupled modules, making it difficult to test individual components and onboard new developers.

**Decision:** The team decided to refactor into a modular architecture with clear separation of concerns, introducing dependency injection and interface-based contracts between modules.

**Consequences:** Build times improved by 40%, test coverage increased from 45% to 78%, and new developer onboarding time decreased from 2 weeks to 3 days.

**Supporting Commits:** a1b2c3d, e4f5g6h, i7j8k9l

---

## ADR: Adoption of TypeScript

**Status:** Accepted

**Context:** Increasing runtime errors in production and difficulty understanding data flow through the application prompted a review of the type system.

**Decision:** Migrate from JavaScript to TypeScript with strict mode enabled, prioritizing core business logic modules first.

**Consequences:** Runtime type errors dropped by 90%, IDE support improved developer productivity, but initial migration required 3 weeks of refactoring effort.

**Supporting Commits:** m1n2o3p, q4r5s6t

---

## ADR: Database Query Optimization

**Status:** Accepted

**Context:** API response times exceeded 2 seconds for dashboard queries as the dataset grew beyond 100k records.

**Decision:** Implement query optimization with proper indexing strategy, connection pooling, and selective denormalization for read-heavy paths.

**Consequences:** Average query time reduced from 2.1s to 180ms, but write operations became slightly more complex due to denormalized data maintenance.

**Supporting Commits:** u1v2w3x, y4z5a6b`;
  }

  if (isGhost) {
    const authorName = systemMsg.match(/perspective of (.+?) based/)?.[1] || 'this developer';
    return `Based on my commit history, I focused primarily on the core infrastructure and API layer. My biggest contributions were around establishing the testing patterns and CI/CD pipeline that the team still uses today.

I made the choice to use a modular architecture early on because I'd seen monolithic codebases become unmaintainable at my previous projects. The commit [a1b2c3d] shows where I introduced the plugin system, and [e4f5g6h] is where I refactored the middleware chain.

*Note: This is an AI synthesis based on ${authorName}'s public Git contributions, not the actual person.*`;
  }

  // Why Engine response
  if (userMsg.toLowerCase().includes('architecture')) {
    return `Based on the commit history, the architectural decisions in this codebase evolved through three distinct phases:

**Phase 1 — Initial Setup (early commits):** The project started with a simple flat structure. Commit [a1b2c3d] shows the initial scaffolding with a basic MVC pattern.

**Phase 2 — Modular Refactor:** Around 6 months in, several commits (particularly [e4f5g6h] and [i7j8k9l]) show a major refactoring toward a modular architecture. The commit messages mention "separation of concerns" and "plugin architecture."

**Phase 3 — Performance Optimization:** Later commits like [m1n2o3p] introduced caching layers and query optimization, suggesting the team encountered scaling challenges.

The architectural choices reflect a pragmatic "start simple, refactor when needed" approach that's common in successful open source projects.`;
  }

  if (userMsg.toLowerCase().includes('refactor')) {
    return `I found several significant refactoring efforts in the commit history:

1. **Module System Refactor** [commits a1b2c3d..e4f5g6h]: The largest refactor involved splitting a monolithic entry point into separate modules. This touched 47 files across 12 commits over 2 weeks.

2. **Error Handling Overhaul** [commit i7j8k9l]: A single large commit that standardized error handling across the entire codebase, introducing a unified error class hierarchy.

3. **Test Infrastructure** [commits m1n2o3p..q4r5s6t]: Migration from one test framework to another, with significant improvements to test coverage (evidenced by new test files in every module).

The refactoring pattern suggests a team that prioritizes code health and isn't afraid to invest in foundational improvements.`;
  }

  return `Looking at the commit history, I can provide some insights about "${userMsg}":

The codebase shows a consistent pattern of iterative development. Key contributors have focused on maintaining clean separation between modules, as evidenced by commits like [a1b2c3d] which introduced clearer boundaries.

Several commit messages reference design discussions and RFC documents, suggesting the team has a thoughtful decision-making process. The most active periods of development correlate with major feature additions, followed by stabilization phases with bug fixes and documentation updates.

The coding patterns are consistent across contributors, indicating good code review practices and shared style guidelines. Commits [e4f5g6h] through [i7j8k9l] show a particularly well-executed feature rollout with proper testing.`;
}

function generateDemoEmbedding(): number[] {
  return Array.from({ length: 384 }, () => Math.random() * 2 - 1);
}

// ============ REAL API CALLS ============

export async function chatCompletion(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
  if (isDemoMode()) {
    console.log('[watsonx] Using demo mode');
    return generateDemoResponse(messages);
  }

  console.log('[watsonx] Calling real watsonx.ai...');
  const config = getConfig();
  const token = await getIAMToken();
  const model = options.model || 'ibm/granite-4-h-small';

  try {
    const response = await fetch(
      `${getBaseUrl(config.region)}/ml/v1/text/chat?version=2023-05-29`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: model, project_id: config.projectId, messages,
          parameters: { max_new_tokens: options.maxTokens || 2048, temperature: options.temperature || 0.7 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[watsonx] API error:', response.status, err);
      throw new Error(`watsonx chat failed: ${response.status} — ${err}`);
    }
    const data = await response.json();
    console.log('[watsonx] Got response from real API');
    console.log('[watsonx] Response data:', JSON.stringify(data, null, 2));
    const content = data.choices?.[0]?.message?.content || data.results?.[0]?.generated_text || '';
    console.log('[watsonx] Extracted content:', content.substring(0, 200) + '...');
    return content;
  } catch (error) {
    console.error('[watsonx] Chat error:', error);
    throw error;
  }
}

export async function chatCompletionStream(messages: ChatMessage[], options: ChatOptions = {}): Promise<ReadableStream> {
  if (isDemoMode()) {
    const text = generateDemoResponse(messages);
    return new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode(text)); controller.close(); }
    });
  }

  const config = getConfig();
  const token = await getIAMToken();
  const model = options.model || 'ibm/granite-3-8b-instruct';

  const response = await fetch(
    `${getBaseUrl(config.region)}/ml/v1/text/chat_stream?version=2023-05-29`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: model, project_id: config.projectId, messages,
        parameters: { max_new_tokens: options.maxTokens || 2048, temperature: options.temperature || 0.7 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`watsonx stream failed: ${response.status} — ${err}`);
  }
  return response.body!;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (isDemoMode()) return generateDemoEmbedding();

  const config = getConfig();
  const token = await getIAMToken();
  
  // Try the newer slate model first, fallback to demo on error
  try {
    const response = await fetch(
      `${getBaseUrl(config.region)}/ml/v1/text/embeddings?version=2023-05-29`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: 'ibm/slate-125m-english-rtrvr',
          project_id: config.projectId,
          inputs: [text]
        }),
      }
    );
    
    if (!response.ok) {
      console.warn(`watsonx embedding failed (${response.status}), falling back to demo mode`);
      return generateDemoEmbedding();
    }
    
    const data = await response.json();
    return data.results?.[0]?.embedding || generateDemoEmbedding();
  } catch (error) {
    console.warn('watsonx embedding error, falling back to demo mode:', error);
    return generateDemoEmbedding();
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (isDemoMode()) return texts.map(() => generateDemoEmbedding());

  const config = getConfig();
  const token = await getIAMToken();
  const batchSize = 20;
  const all: number[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    try {
      const response = await fetch(
        `${getBaseUrl(config.region)}/ml/v1/text/embeddings?version=2023-05-29`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model_id: 'ibm/slate-125m-english-rtrvr',
            project_id: config.projectId,
            inputs: batch
          }),
        }
      );
      
      if (!response.ok) {
        console.warn(`watsonx batch embedding failed (${response.status}), using demo embeddings for batch`);
        all.push(...batch.map(() => generateDemoEmbedding()));
        continue;
      }
      
      const data = await response.json();
      all.push(...(data.results?.map((r: { embedding: number[] }) => r.embedding) || batch.map(() => generateDemoEmbedding())));
    } catch (error) {
      console.warn('watsonx batch embedding error, using demo embeddings:', error);
      all.push(...batch.map(() => generateDemoEmbedding()));
    }
  }
  
  return all;
}

// Made with Bob
