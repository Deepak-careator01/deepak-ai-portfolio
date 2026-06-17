# Deployment Guide

This document describes how to deploy **Deepak AI Portfolio v1.0** to production.

## Architecture overview

```
Copilot UI (Next.js)
      |
      v
POST /api/chat
      |
      +-- Rate limiting
      +-- Request validation
      +-- Input safety
      +-- Memory (PostgreSQL, optional)
      +-- RAG (pgvector + OpenAI embeddings, optional)
      +-- Groq streaming LLM
```

## Recommended platform

**Vercel** is the recommended host for the Next.js application.

1. Connect the GitHub repository to Vercel.
2. Set the production branch to `main`.
3. Configure environment variables in the Vercel project settings.
4. Deploy — GitHub Actions CI must pass before merging to `main`.

## Required environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | **Yes** | Groq API key for chat streaming |

## Optional environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL for chat memory + pgvector RAG |
| `OPENAI_API_KEY` / `EMBEDDING_API_KEY` | OpenAI embeddings for RAG |
| `VECTOR_STORE_PROVIDER` | `pgvector`, `upstash`, or `none` |
| `RATE_LIMIT_MAX_REQUESTS` | Per-IP chat limit (default: 20) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (default: 300000) |
| `RAG_TOP_K` | Retrieved chunks per query (default: 4) |
| `RAG_MAX_CONTEXT_CHARS` | Max RAG context size |
| `RAG_MAX_CHUNK_CHARS` | Per-chunk compression limit |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata |

See [`.env.example`](../.env.example) for the full list.

## PostgreSQL setup

1. Provision PostgreSQL 15+ (Neon, Supabase, Railway, or self-hosted).
2. Enable the **pgvector** extension (required for RAG).
3. Set `DATABASE_URL` in Vercel.
4. Run migrations:

```bash
bun run migrate
```

Or execute migrations from a CI/CD post-deploy step with `DATABASE_URL` available.

### pgvector requirements

- Extension: `CREATE EXTENSION IF NOT EXISTS vector;` (included in `0001_create_rag_embeddings.sql`)
- Embedding dimensions: **1536** (`text-embedding-3-small`)

## Groq configuration

1. Create an API key at [console.groq.com](https://console.groq.com).
2. Set `GROQ_API_KEY` in production.
3. Monitor Groq usage limits — the system prompt is large (~4k+ tokens per request).

## Embedding configuration

RAG requires embeddings:

```env
OPENAI_API_KEY=sk-...
VECTOR_STORE_PROVIDER=pgvector
DATABASE_URL=postgres://...
```

After deployment, run ingestion:

```bash
bun run ingest
```

## Rate limiting

The default in-memory rate limiter works for single-instance deployments. For multi-region serverless, see [rate-limiting.md](./rate-limiting.md).

## Environment differences

| Concern | Local | Staging | Production |
|---------|-------|---------|------------|
| `GROQ_API_KEY` | Dev key | Staging key | Production key |
| `DATABASE_URL` | Local Docker / Neon branch | Staging DB | Production DB |
| Rate limiting | Relaxed optional | Production values | Production values |
| Logging | Console (verbose) | JSON structured | JSON structured |
| Migrations | Manual `bun run migrate` | CI/CD step | CI/CD step |

## Post-deploy verification

Use the [launch checklist](./launch-checklist.md) after every production deployment.

Quick smoke test:

```bash
curl https://your-domain.com/api/health
```

Expected: `"status": "healthy"` with `groq: true`.

## CI/CD

GitHub Actions runs on every PR and push to `main`:

- `bun install --frozen-lockfile`
- `bun run verify:env`
- `bun run typecheck`
- `bun run build`

See [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).
