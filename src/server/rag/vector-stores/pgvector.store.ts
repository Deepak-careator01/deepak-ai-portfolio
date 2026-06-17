import "server-only";

import type { PoolClient, QueryResultRow } from "pg";

import { withDbClient } from "@/server/db";
import { EMBEDDING_DIMENSIONS, RAG_EMBEDDINGS_TABLE } from "@/server/db/schema";
import type {
  PortfolioVectorMetadata,
  VectorQueryResult,
  VectorRecord,
  VectorStore,
} from "@/server/rag/vector-store.impl";

function toVectorLiteral(values: number[]): string {
  if (values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Invalid embedding dimension: expected ${EMBEDDING_DIMENSIONS}, got ${values.length}.`,
    );
  }

  return `[${values.join(",")}]`;
}

function parseMetadata(row: QueryResultRow): PortfolioVectorMetadata {
  const metadata = row.metadata as PortfolioVectorMetadata | string;
  if (typeof metadata === "string") {
    return JSON.parse(metadata) as PortfolioVectorMetadata;
  }
  return metadata;
}

async function ensureSchema(client: PoolClient): Promise<void> {
  await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${RAG_EMBEDDINGS_TABLE} (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      metadata JSONB NOT NULL,
      embedding VECTOR(${EMBEDDING_DIMENSIONS}) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS ${RAG_EMBEDDINGS_TABLE}_embedding_cosine_idx
      ON ${RAG_EMBEDDINGS_TABLE}
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
  `);
}

type PgvectorRow = {
  id: string;
  content: string;
  metadata: PortfolioVectorMetadata | string;
  similarity: number;
};

export class PgVectorStore implements VectorStore<PortfolioVectorMetadata> {
  async exists(): Promise<boolean> {
    return withDbClient(async (client) => {
      const result = await client.query<{ exists: boolean }>(
        `SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        ) AS exists;`,
        [RAG_EMBEDDINGS_TABLE],
      );

      return Boolean(result.rows[0]?.exists);
    });
  }

  async clear(): Promise<void> {
    await withDbClient(async (client) => {
      await ensureSchema(client);
      await client.query(`TRUNCATE TABLE ${RAG_EMBEDDINGS_TABLE};`);
    });
  }

  async upsert(vectors: VectorRecord<PortfolioVectorMetadata>[]): Promise<void> {
    if (vectors.length === 0) {
      return;
    }

    await withDbClient(async (client) => {
      await ensureSchema(client);
      await client.query("BEGIN");
      try {
        for (const vector of vectors) {
          await client.query(
            `
              INSERT INTO ${RAG_EMBEDDINGS_TABLE} (id, content, metadata, embedding, updated_at)
              VALUES ($1, $2, $3::jsonb, $4::vector, NOW())
              ON CONFLICT (id)
              DO UPDATE SET
                content = EXCLUDED.content,
                metadata = EXCLUDED.metadata,
                embedding = EXCLUDED.embedding,
                updated_at = NOW();
            `,
            [
              vector.id,
              vector.metadata.content,
              JSON.stringify(vector.metadata),
              toVectorLiteral(vector.values),
            ],
          );
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });
  }

  async query(embedding: number[], topK: number): Promise<VectorQueryResult<PortfolioVectorMetadata>[]> {
    if (topK <= 0) {
      return [];
    }

    return withDbClient(async (client) => {
      await ensureSchema(client);

      const result = await client.query<PgvectorRow>(
        `
          SELECT
            id,
            content,
            metadata,
            1 - (embedding <=> $1::vector) AS similarity
          FROM ${RAG_EMBEDDINGS_TABLE}
          ORDER BY embedding <=> $1::vector
          LIMIT $2;
        `,
        [toVectorLiteral(embedding), topK],
      );

      return result.rows.map((row) => {
        const metadata = parseMetadata(row);
        return {
          id: row.id,
          values: [],
          metadata: {
            ...metadata,
            content: row.content,
          },
          score: Number(row.similarity) || 0,
        };
      });
    });
  }
}
