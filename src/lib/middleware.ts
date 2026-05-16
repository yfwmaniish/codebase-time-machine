// ============================================================
// Middleware utilities — Rate limiting, error handling, validation
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (for MVP)
// In production, use Redis-backed rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
}

export function rateLimit(config: RateLimitConfig = {}) {
  const maxRequests = config.maxRequests || parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
  const windowMs = config.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

  return (request: NextRequest): NextResponse | null => {
    // Get client identifier (IP or user ID)
    const identifier = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'anonymous';
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitMap.get(identifier);
    
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitMap.set(identifier, entry);
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${Math.ceil((entry.resetAt - now) / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetAt.toString(),
            'Retry-After': Math.ceil((entry.resetAt - now) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    return null; // No rate limit hit, continue
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Error response helper
export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Success response helper
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// Validation helpers
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: T[],
  fieldName: string
): value is T {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    return false;
  }
  return true;
}

// Environment validation
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Warn about optional but recommended vars
  const recommended = ['WATSONX_API_KEY', 'WATSONX_PROJECT_ID'];
  const missingRecommended: string[] = [];
  
  for (const key of recommended) {
    if (!process.env[key]) {
      missingRecommended.push(key);
    }
  }

  if (missingRecommended.length > 0 && process.env.DEMO_MODE !== 'true') {
    console.warn(
      `⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}\n` +
      `   Set DEMO_MODE=true to use mock AI responses, or provide watsonx.ai credentials.`
    );
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

// CORS headers helper
export function corsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Request logging helper
export function logRequest(request: NextRequest, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`, context || '');
  }
}

// Async error wrapper
export function asyncHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('Unhandled error in API route:', error);
      return errorResponse(
        'Internal server error',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
}

// Made with Bob
