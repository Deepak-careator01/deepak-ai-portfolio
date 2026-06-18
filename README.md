# Deepak AI Portfolio v1.0

Production-ready AI portfolio with a Groq-powered streaming copilot, pgvector RAG, PostgreSQL memory, and ChatGPT-style UI.

## Features

- **Portfolio site** — Projects, blog, experience (Next.js 15 App Router)
- **AI Copilot** — Streaming chat with thread history and suggested prompts
- **RAG** — OpenAI embeddings + pgvector hybrid semantic retrieval
- **Memory** — PostgreSQL thread-based persistent conversations
- **Security** — Rate limiting, request validation, prompt-injection detection
- **Observability** — Structured logging, health checks, analytics event foundation

## Architecture

```
Copilot UI
      |
      v
POST /api/chat
      |
      +-- Security Layer (rate limit, validation, input safety)
      |
      +-- Memory Layer (PostgreSQL threads/messages)
      |
      +-- RAG Layer (embeddings → pgvector → context builder)
      |
      +-- Groq Streaming (llama-3.3-70b-versatile)
```

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15, React 19, TypeScript |
| Runtime | Bun |
| Chat LLM | Groq via Vercel AI SDK |
| Embeddings | OpenAI `text-embedding-3-small` |
| Vector DB | pgvector (PostgreSQL) |
| Memory | PostgreSQL |
| UI | Tailwind CSS v4, shadcn/ui |

## Local setup

### Prerequisites

- [Bun](https://bun.sh) 1.1+
- Node.js 18+ (for tooling compatibility)
- Groq API key ([console.groq.com](https://console.groq.com))

### Install and run

```bash
git clone <repository-url>
cd deepak-ai-portfolio
bun install
cp .env.example .env.local
# Edit .env.local — set GROQ_API_KEY at minimum
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: full AI stack

```bash
# .env.local
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgres://...
VECTOR_STORE_PROVIDER=pgvector

# Run migrations and ingest portfolio content
bun run migrate
bun run ingest
```

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local`.

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | **Yes** | Groq chat API key |
| `DATABASE_URL` | No | PostgreSQL (memory + pgvector) |
| `OPENAI_API_KEY` | No | Embeddings for RAG |
| `VECTOR_STORE_PROVIDER` | No | `pgvector`, `upstash`, or `none` |

See [docs/deployment.md](docs/deployment.md) for the complete reference.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Production build |
| `bun run typecheck` | TypeScript validation |
| `bun run verify:env` | Validate environment schema |
| `bun run migrate` | Apply database migrations |
| `bun run ingest` | Embed and upsert portfolio content |

## Development workflow

1. Create a feature branch
2. Make changes
3. Run `bun run typecheck` and `bun run build`
4. Open a pull request — CI runs automatically
5. Merge to `main` after review

## API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Streaming copilot chat |
| `/api/health` | GET | Service health probe |

## Deployment

1. Connect repository to [Vercel](https://vercel.com)
2. Configure environment variables
3. Run `bun run migrate` against production database
4. Run `bun run ingest` if RAG is enabled
5. Complete the [launch checklist](docs/launch-checklist.md)

Full guide: [docs/deployment.md](docs/deployment.md)

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on PRs and pushes to `main`:

- Install dependencies (`bun install --frozen-lockfile`)
- Verify environment schema
- TypeScript check
- Production build

## Documentation

| Document | Description |
|----------|-------------|
| [docs/deployment.md](docs/deployment.md) | Vercel, env vars, PostgreSQL |
| [docs/database-operations.md](docs/database-operations.md) | Migrations, backups, recovery |
| [docs/rate-limiting.md](docs/rate-limiting.md) | Rate limit roadmap |
| [docs/launch-checklist.md](docs/launch-checklist.md) | Pre-launch verification |

## Monitoring

Monitoring adapters live in `src/server/monitoring/`:

- **No-op by default** — events log to console/JSON in production
- **Pluggable** — `configureMonitoring()` for Sentry, PostHog, Vercel Observability

Analytics events (metadata only, no user content):

- `chat_started`, `chat_completed`, `chat_failed`, `rate_limit_triggered`
- `rag_hit`, `rag_miss`, `rag_failure`
- `health_check_failed`, `database_error`

## License

Private — Deepak M portfolio project.
