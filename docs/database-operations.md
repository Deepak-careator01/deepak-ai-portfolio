# Database Operations

Operational guide for PostgreSQL, pgvector, and chat memory in Deepak AI Portfolio v1.0.

## Schema overview

| Migration | Tables | Purpose |
|-----------|--------|---------|
| `0001_create_rag_embeddings.sql` | `rag_embeddings` | pgvector RAG storage |
| `0002_chat_memory.sql` | `threads`, `messages` | Persistent chat memory |

Migration tracking table (created by tooling):

- `schema_migrations` — records applied migration filenames

## Running migrations

### Prerequisites

- `DATABASE_URL` set
- Network access to PostgreSQL
- pgvector extension allowed on the database host

### Apply migrations

```bash
bun run migrate
```

The script:

1. Discovers `migrations/*.sql` in lexical order
2. Skips already-applied migrations
3. Runs each pending migration in a transaction
4. Records the filename in `schema_migrations`

### Production deployment

Run migrations **before** or **immediately after** deploying a version that depends on new schema:

```bash
DATABASE_URL="postgres://..." bun run migrate
```

Integrate into CI/CD as a manual approval step or post-deploy hook.

## Backup strategy

### Recommended approach

| Tier | Method | Frequency |
|------|--------|-----------|
| Managed PostgreSQL | Provider automated backups (Neon, Supabase, RDS) | Daily + PITR |
| Self-hosted | `pg_dump` to object storage | Daily |

### What to back up

- `threads` and `messages` — conversation memory
- `rag_embeddings` — vector index (can be rebuilt via `bun run ingest`)
- `schema_migrations` — migration state

### Example manual backup

```bash
pg_dump "$DATABASE_URL" \
  --format=custom \
  --file=backup-$(date +%Y%m%d).dump
```

Store backups encrypted in S3, GCS, or your provider's backup vault.

## Restore process

1. **Stop write traffic** (optional maintenance mode).
2. Restore the database:

```bash
pg_restore --clean --if-exists --dbname="$DATABASE_URL" backup-YYYYMMDD.dump
```

3. Verify schema:

```bash
bun run migrate
```

4. Smoke test `/api/health` and a chat conversation.

### Rebuilding RAG without full restore

If only `rag_embeddings` is lost:

```bash
bun run ingest
```

This re-embeds portfolio content and upserts vectors.

## pgvector maintenance

### Index health

The cosine IVFFlat index is created in migration `0001`:

```sql
CREATE INDEX rag_embeddings_embedding_cosine_idx
  ON rag_embeddings USING ivfflat (embedding vector_cosine_ops);
```

After large re-ingestion, consider:

```sql
REINDEX INDEX rag_embeddings_embedding_cosine_idx;
ANALYZE rag_embeddings;
```

### Dimension consistency

Embeddings must be **1536-dimensional** (`text-embedding-3-small`). Changing embedding models requires re-ingestion and schema updates.

## Disaster recovery

| Scenario | Recovery |
|----------|----------|
| DB unavailable | Chat continues without memory/RAG; restore DB from backup |
| RAG data lost | Run `bun run ingest` after DB is restored |
| Migration failure | Fix SQL, restore from backup if needed, re-run `bun run migrate` |
| Full region outage | Failover to replica; update `DATABASE_URL` in Vercel |

### RTO / RPO targets (suggested)

- **RPO**: 24 hours (daily backups) or minutes with PITR
- **RTO**: 1–4 hours depending on provider restore time

## Monitoring

Watch for:

- `database_error` analytics events
- `/api/health` returning `database: false`
- Connection pool errors in server logs (`[db] Operation failed`)

## Security

- Never commit `DATABASE_URL` to git
- Use TLS connections (`sslmode=require` in connection string)
- Restrict database network access to Vercel IP ranges or use connection pooling (Neon/Supabase pooler)
