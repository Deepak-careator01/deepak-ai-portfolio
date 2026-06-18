# Launch Checklist — Deepak AI Portfolio v1.0

Use this checklist before and after every production deployment.

## Infrastructure

- [ ] Vercel project connected to `main` branch
- [ ] GitHub Actions CI passing on latest commit
- [ ] `GROQ_API_KEY` set in Vercel production environment
- [ ] `DATABASE_URL` set (if using memory or RAG)
- [ ] `OPENAI_API_KEY` or `EMBEDDING_API_KEY` set (if using RAG)
- [ ] `VECTOR_STORE_PROVIDER=pgvector` configured (if using RAG)
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain
- [ ] Custom domain configured and SSL active

## Database

- [ ] PostgreSQL provisioned with pgvector extension enabled
- [ ] `bun run migrate` executed successfully against production DB
- [ ] `bun run ingest` completed (if RAG enabled)
- [ ] Backup strategy documented (see [database-operations.md](./database-operations.md))

## AI — Chat

- [ ] Open copilot and send a test message
- [ ] Streaming response renders without errors
- [ ] Follow-up message works in same thread
- [ ] "New chat" creates a fresh thread
- [ ] Groq quota / billing limits verified

## AI — RAG

- [ ] Ask: "What projects has Deepak built?"
- [ ] Response references portfolio content accurately
- [ ] Server logs show `rag_hit` or `rag_retrieval_completed` with hits > 0
- [ ] `/api/health` reports `embeddings: true` and `vectorStore: true`

## AI — Memory

- [ ] Send a message with `threadId` (automatic via UI)
- [ ] Refresh page — thread history persists in sidebar
- [ ] PostgreSQL `messages` table contains rows for the thread

## Security

- [ ] Rate limit triggers after threshold (optional stress test)
- [ ] Oversized payload rejected (e.g. message > 2000 chars returns 400)
- [ ] Prompt injection attempt handled safely (no system prompt leak)
- [ ] No API keys exposed in client bundle or error responses
- [ ] `.env.local` not committed to git

## Reliability

- [ ] `GET /api/health` returns `200` with `"status": "healthy"`
- [ ] Chat works when `DATABASE_URL` is unset (graceful degradation test in staging)
- [ ] Error boundaries render friendly pages (trigger test error in staging)
- [ ] Structured JSON logs visible in Vercel log drain

## Monitoring (foundation)

- [ ] Analytics events appear in production logs (`chat_completed`, etc.)
- [ ] `health_check_failed` alerts configured (optional — wire to Sentry/Datadog later)
- [ ] Groq usage dashboard monitored for quota exhaustion

## Documentation

- [ ] [README.md](../README.md) reflects current setup
- [ ] [.env.example](../.env.example) matches all supported variables
- [ ] Team knows how to run migrations and ingest

## Post-launch

- [ ] Monitor error rate for 24 hours
- [ ] Verify Groq token usage within plan limits
- [ ] Schedule first database backup verification

---

**Sign-off**

| Role | Name | Date |
|------|------|------|
| Developer | | |
| Reviewer | | |
