// ============================================================
// Queue Management — BullMQ + Redis for background jobs
// Handles repository ingestion as background jobs
// ============================================================

import { Queue, Worker, Job } from 'bullmq';
import { Redis } from '@upstash/redis';

// Redis connection configuration
const getRedisConfig = () => {
  // Check if Upstash Redis is configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      connection: {
        host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '').replace('http://', ''),
        port: 6379,
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
      },
    };
  }
  
  // Fallback to local Redis or in-memory
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      connection: {
        host: url.hostname,
        port: parseInt(url.port || '6379'),
        password: url.password || undefined,
      },
    };
  }
  
  // Default local Redis
  return {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  };
};

// Check if Redis is available
let redisAvailable = false;
try {
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL) {
    redisAvailable = true;
  }
} catch {
  redisAvailable = false;
}

// Repository ingestion queue
export const ingestionQueue = redisAvailable
  ? new Queue('repository-ingestion', getRedisConfig())
  : null;

// Job data interface
export interface IngestionJobData {
  repoId: string;
  githubUrl: string;
  maxCommits?: number;
}

// Add job to queue
export async function addIngestionJob(data: IngestionJobData): Promise<string | null> {
  if (!ingestionQueue) {
    console.warn('Redis not configured, skipping queue');
    return null;
  }

  try {
    const job = await ingestionQueue.add('ingest-repository', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 100,
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    });

    return job.id || null;
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    return null;
  }
}

// Get job status
export async function getJobStatus(jobId: string): Promise<{
  status: string;
  progress?: number;
  result?: unknown;
  error?: string;
} | null> {
  if (!ingestionQueue) return null;

  try {
    const job = await ingestionQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress as number | undefined;

    return {
      status: state,
      progress,
      result: job.returnvalue,
      error: job.failedReason,
    };
  } catch (error) {
    console.error('Failed to get job status:', error);
    return null;
  }
}

// Worker function (to be called in a separate process or API route)
export function createIngestionWorker(
  processor: (job: Job<IngestionJobData>) => Promise<void>
) {
  if (!redisAvailable) {
    console.warn('Redis not configured, worker not created');
    return null;
  }

  return new Worker('repository-ingestion', processor, {
    ...getRedisConfig(),
    concurrency: 2, // Process 2 repos at a time
    limiter: {
      max: 5, // Max 5 jobs
      duration: 60000, // per minute
    },
  });
}

// Upstash Redis client for caching (REST API)
export const upstashRedis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null;

// Cache helpers
export async function cacheSet(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
  if (!upstashRedis) return;
  
  try {
    await upstashRedis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!upstashRedis) return null;
  
  try {
    const value = await upstashRedis.get(key);
    return value ? (JSON.parse(value as string) as T) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheDelete(key: string): Promise<void> {
  if (!upstashRedis) return;
  
  try {
    await upstashRedis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

// Rate limiting with Redis
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowSeconds: number = 900
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  if (!upstashRedis) {
    // Fallback to allowing all requests if Redis not available
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  try {
    // Get current count
    const current = await upstashRedis.get(key);
    const count = current ? parseInt(current as string, 10) : 0;

    if (count >= maxRequests) {
      const ttl = await upstashRedis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + (ttl * 1000),
      };
    }

    // Increment counter
    const newCount = await upstashRedis.incr(key);
    
    // Set expiry on first request
    if (newCount === 1) {
      await upstashRedis.expire(key, windowSeconds);
    }

    const ttl = await upstashRedis.ttl(key);
    
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - newCount),
      resetAt: now + (ttl * 1000),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request
    return { allowed: true, remaining: maxRequests, resetAt: now + windowMs };
  }
}

export { redisAvailable };

// Made with Bob
