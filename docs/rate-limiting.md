# Rate Limiting

Production roadmap for chat API rate limiting in Deepak AI Portfolio v1.0.

## Current implementation

Location: `src/server/security/rate-limit.ts`

| Setting | Default | Env var |
|---------|---------|---------|
| Max requests | 20 | `RATE_LIMIT_MAX_REQUESTS` |
| Window | 5 minutes | `RATE_LIMIT_WINDOW_MS` |
| Algorithm | Sliding window | — |
| Scope | Per client IP | — |
| Storage | In-memory `Map` | — |

The limiter runs **before** the LLM is called. Exceeded limits return:

```json
HTTP 429
{ "error": "Rate limit exceeded. Please try again later.", "requestId": "req_..." }
```

## Limitations in serverless

The in-memory store is **per server instance**:

| Issue | Impact |
|-------|--------|
| Cold starts | Counter resets on new lambda |
| Multi-region | Each region has independent counters |
| Horizontal scale | Limits are not shared across instances |

This is acceptable for:

- Local development
- Single-region deployments
- Low-traffic portfolio sites

This is **not** sufficient for:

- High-traffic public APIs
- Abuse-resistant production at scale
- Multi-instance Vercel deployments under attack

## Recommended migration path

### Phase 1 — Upstash Redis (recommended)

1. Create an Upstash Redis database.
2. Implement `RedisRateLimiter` against the existing `RateLimiter` interface:

```typescript
export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}
```

3. Use a sliding window via `INCR` + `EXPIRE` or Upstash's `@upstash/ratelimit` package.
4. Swap `getChatRateLimiter()` to return the Redis implementation when `UPSTASH_REDIS_REST_URL` is set.

### Phase 2 — Vercel KV / Edge Config

Alternative if already on Vercel ecosystem — same interface, different backing store.

## Key design

```
chat:{clientIp}
```

For shared NAT (corporate networks), consider:

- Rate limit by IP + optional `threadId` for authenticated futures
- Add `X-RateLimit-Remaining` response headers

## Configuration

```env
RATE_LIMIT_MAX_REQUESTS=20
RATE_LIMIT_WINDOW_MS=300000
```

Tune per environment:

| Environment | Suggested limit |
|-------------|-----------------|
| Local | Disabled or very high |
| Staging | 20 / 5 min |
| Production | 20–50 / 5 min |

## Observability

Rate limit events are logged and tracked:

- Structured log: `rate_limit_triggered`
- Analytics event: `rate_limit_triggered` (metadata only — no message content)

## Do not change in v1.0

The in-memory implementation remains the default. Distributed rate limiting is documented here for post-launch scaling.
