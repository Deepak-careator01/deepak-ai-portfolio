/**
 * Portfolio RAG ingestion script (Phase 4).
 *
 * Usage:
 *   bun scripts/ingest.ts
 *
 * Flow:
 *   1. Build portfolio text chunks
 *   2. Generate embeddings via OpenAI (embeddings provider)
 *   3. Map to vector records and upsert via the vector store adapter
 *
 * Environment:
 *   OPENAI_API_KEY or EMBEDDING_API_KEY  — required for embeddings
 *   VECTOR_STORE_PROVIDER                — optional (pgvector | upstash | none)
 *   DATABASE_URL                         — required when VECTOR_STORE_PROVIDER=pgvector
 */

import {
  buildPortfolioChunks,
  embedPortfolioChunks,
  isEmbeddingsConfigured,
  type PortfolioChunkMetadata,
  type PortfolioChunkType,
} from "@/server/rag/embeddings.impl";
import {
  createVectorStore,
  isVectorStoreConfigured,
  type PortfolioVectorMetadata,
  type VectorRecord,
} from "@/server/rag/vector-store.impl";

const LOG_PREFIX = "[ingest]";

function log(message: string): void {
  console.info(`${LOG_PREFIX} ${message}`);
}

function warn(message: string): void {
  console.warn(`${LOG_PREFIX} ${message}`);
}

function countChunksByType(chunks: { metadata: PortfolioChunkMetadata }[]): Record<PortfolioChunkType, number> {
  return chunks.reduce<Record<PortfolioChunkType, number>>(
    (counts, chunk) => {
      counts[chunk.metadata.type] += 1;
      return counts;
    },
    { project: 0, blog: 0, experience: 0 },
  );
}

function toVectorRecords(
  embedded: Awaited<ReturnType<typeof embedPortfolioChunks>>,
): VectorRecord<PortfolioVectorMetadata>[] {
  return embedded.map((document) => ({
    id: document.id,
    values: document.embedding,
    metadata: {
      ...document.metadata,
      content: document.content,
    },
  }));
}

function shouldClearBeforeIngest(): boolean {
  const value = process.env.INGEST_CLEAR?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

async function main(): Promise<void> {
  log("Starting portfolio RAG ingestion pipeline…");

  if (!isEmbeddingsConfigured()) {
    throw new Error(
      "Embeddings are not configured. Set OPENAI_API_KEY or EMBEDDING_API_KEY before running ingest.",
    );
  }

  log("Embeddings provider: configured");

  const vectorStoreConfigured = isVectorStoreConfigured();
  if (vectorStoreConfigured) {
    log(`Vector store: configured (${process.env.VECTOR_STORE_PROVIDER})`);
  } else {
    warn(
      "Vector store is not configured. Embeddings will be generated but not persisted. " +
        "Set VECTOR_STORE_PROVIDER and provider credentials when ready.",
    );
  }

  log("Building portfolio chunks…");
  const chunks = buildPortfolioChunks();
  const chunkCounts = countChunksByType(chunks);

  if (chunks.length === 0) {
    warn("No portfolio chunks found. Nothing to ingest.");
    return;
  }

  log(
    `Built ${chunks.length} chunk(s) — projects: ${chunkCounts.project}, blogs: ${chunkCounts.blog}, experience: ${chunkCounts.experience}`,
  );

  log("Generating embeddings…");
  let embedded: Awaited<ReturnType<typeof embedPortfolioChunks>> = [];
  let embeddingFailures = 0;

  try {
    embedded = await embedPortfolioChunks();
  } catch (error) {
    embeddingFailures = chunks.length;
    const message = error instanceof Error ? error.message : "Unknown embedding error";
    throw new Error(`Embedding generation failed: ${message}`);
  }

  const embeddingSuccessCount = embedded.length;
  embeddingFailures = Math.max(0, chunks.length - embeddingSuccessCount);

  log(`Embedded ${embeddingSuccessCount}/${chunks.length} chunk(s) successfully`);

  if (embeddingFailures > 0) {
    warn(`${embeddingFailures} chunk(s) failed to embed.`);
  }

  log("Mapping embedded documents to vector records…");
  const vectors = toVectorRecords(embedded);
  log(`Prepared ${vectors.length} vector record(s) for persistence`);

  if (!vectorStoreConfigured) {
    warn("Skipping vector upsert — configure VECTOR_STORE_PROVIDER to enable persistence.");
    log("Ingestion complete (embeddings only, no persistence).");
    return;
  }

  const vectorStore = createVectorStore();
  if (shouldClearBeforeIngest()) {
    log("Clearing existing vectors before upsert (INGEST_CLEAR enabled)…");
    await vectorStore.clear();
  } else {
    log("Preserving existing vectors (set INGEST_CLEAR=true to clear first).");
  }

  log("Upserting vectors…");
  await vectorStore.upsert(vectors);

  const storeReady = await vectorStore.exists();
  if (!storeReady) {
    warn("Vector store is configured but not query-ready after ingestion.");
  }

  log(
    `Ingestion complete — attempted: ${vectors.length}, embedded: ${embeddingSuccessCount}, failures: ${embeddingFailures}.`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown ingestion error";
  console.error(`${LOG_PREFIX} Failed: ${message}`);
  process.exit(1);
});
