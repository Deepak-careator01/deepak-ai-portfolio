import "server-only";

import { env } from "@/server/config/env";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

/** Pluggable rate limiter interface (swap for Redis/Upstash in production). */
export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

type WindowEntry = {
  timestamps: number[];
};

class InMemorySlidingWindowRateLimiter implements RateLimiter {
  private readonly store = new Map<string, WindowEntry>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key) ?? { timestamps: [] };
    entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < this.windowMs);

    if (entry.timestamps.length >= this.limit) {
      const oldest = entry.timestamps[0] ?? now;
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        resetAt: oldest + this.windowMs,
      };
    }

    entry.timestamps.push(now);
    this.store.set(key, entry);

    return {
      success: true,
      limit: this.limit,
      remaining: Math.max(this.limit - entry.timestamps.length, 0),
      resetAt: now + this.windowMs,
    };
  }
}

let chatRateLimiter: RateLimiter | null = null;

/** Returns the shared chat rate limiter instance. */
export function getChatRateLimiter(): RateLimiter {
  if (!chatRateLimiter) {
    chatRateLimiter = new InMemorySlidingWindowRateLimiter(
      env.rateLimitMaxRequests,
      env.rateLimitWindowMs,
    );
  }

  return chatRateLimiter;
}

/** Checks per-IP rate limits for the chat API. */
export async function checkChatRateLimit(ip: string): Promise<RateLimitResult> {
  return getChatRateLimiter().check(`chat:${ip}`);
}
