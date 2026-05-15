// ============================================================
// IBM watsonx.ai Granite — Client Wrapper
// Handles auth, chat completion, embeddings, and streaming
// ============================================================

interface WatsonxConfig {
  apiKey: string;
  projectId: string;
  region: string;
}

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

let cachedToken: { token: string; expiresAt: number } | null = null;

function getConfig(): WatsonxConfig {
  return {
    apiKey: process.env.WATSONX_API_KEY || '',
    projectId: process.env.WATSONX_PROJECT_ID || '',
    region: process.env.WATSONX_REGION || 'us-south',
  };
}

// Get IAM bearer token from API key
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

  if (!response.ok) {
    throw new Error(`IAM auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
  return cachedToken.token;
}

function getBaseUrl(region: string): string {
  return `https://${region}.ml.cloud.ibm.com`;
}

// Chat completion (non-streaming)
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const config = getConfig();
  const token = await getIAMToken();
  const model = options.model || 'ibm/granite-3-3-8b-instruct';

  const response = await fetch(
    `${getBaseUrl(config.region)}/ml/v1/text/chat?version=2025-02-06`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: model,
        project_id: config.projectId,
        messages,
        parameters: {
          max_new_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`watsonx chat failed: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Chat completion with streaming
export async function chatCompletionStream(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ReadableStream> {
  const config = getConfig();
  const token = await getIAMToken();
  const model = options.model || 'ibm/granite-3-3-8b-instruct';

  const response = await fetch(
    `${getBaseUrl(config.region)}/ml/v1/text/chat_stream?version=2025-02-06`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: model,
        project_id: config.projectId,
        messages,
        parameters: {
          max_new_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`watsonx stream failed: ${response.status} — ${err}`);
  }

  return response.body!;
}

// Generate text embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
  const config = getConfig();
  const token = await getIAMToken();

  const response = await fetch(
    `${getBaseUrl(config.region)}/ml/v1/text/embeddings?version=2025-02-06`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'ibm/slate-30m-english-rtrvr-v2',
        project_id: config.projectId,
        inputs: [text],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`watsonx embedding failed: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.results?.[0]?.embedding || [];
}

// Batch embeddings
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const config = getConfig();
  const token = await getIAMToken();
  const batchSize = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await fetch(
      `${getBaseUrl(config.region)}/ml/v1/text/embeddings?version=2025-02-06`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: 'ibm/slate-30m-english-rtrvr-v2',
          project_id: config.projectId,
          inputs: batch,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`watsonx batch embedding failed: ${response.status} — ${err}`);
    }

    const data = await response.json();
    const embeddings = data.results?.map((r: { embedding: number[] }) => r.embedding) || [];
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}
