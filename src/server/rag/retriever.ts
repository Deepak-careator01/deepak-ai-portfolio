import "server-only";

import {
  buildPortfolioChunks,
  embedPortfolioChunks,
  embedText,
  isEmbeddingsConfigured,
  type EmbeddedDocument,
  type PortfolioChunkMetadata,
} from "@/server/rag/embeddings.impl";
import { createVectorStore } from "@/server/rag/vector-store.impl";

const DEFAULT_TOP_K = 4;
const MIN_WORD_COUNT_FOR_RAG = 4;
const MIN_SIMILARITY_SCORE = 0.35;

export type RetrievalChunk = {
  id: string;
  content: string;
  metadata: PortfolioChunkMetadata;
  score?: number;
};

export type RetrievalResult = {
  context: string;
  hits: number;
  chunks: RetrievalChunk[];
};

let cachedPortfolioEmbeddings: EmbeddedDocument<PortfolioChunkMetadata>[] | null = null;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Returns true when the query is long enough to benefit from retrieval. */
export function shouldRunRag(query: string): boolean {
  return countWords(query) >= MIN_WORD_COUNT_FOR_RAG;
}

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length === 0 || vectorB.length === 0 || vectorA.length !== vectorB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    dotProduct += vectorA[index] * vectorB[index];
    normA += vectorA[index] * vectorA[index];
    normB += vectorB[index] * vectorB[index];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function resolveTopK(): number {
  const configured = Number(process.env.RAG_TOP_K);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TOP_K;
}

async function getCachedPortfolioEmbeddings(): Promise<EmbeddedDocument<PortfolioChunkMetadata>[]> {
  if (!cachedPortfolioEmbeddings) {
    cachedPortfolioEmbeddings = await embedPortfolioChunks();
  }

  return cachedPortfolioEmbeddings;
}

function formatRetrievedContext(chunks: RetrievalChunk[]): string {
  if (chunks.length === 0) {
    return "";
  }

  return chunks
    .map((chunk, index) => {
      const label = [
        `Source ${index + 1}`,
        chunk.metadata.type,
        chunk.metadata.slug,
        chunk.id,
      ]
        .filter(Boolean)
        .join(" | ");

      return `[${label}]\n${chunk.content}`;
    })
    .join("\n\n");
}

async function retrieveFromInMemoryIndex(
  queryEmbedding: number[],
  topK: number,
): Promise<RetrievalChunk[]> {
  const embeddedDocuments = await getCachedPortfolioEmbeddings();

  return embeddedDocuments
    .map((document) => ({
      id: document.id,
      content: document.content,
      metadata: document.metadata,
      score: cosineSimilarity(queryEmbedding, document.embedding),
    }))
    .filter((chunk) => chunk.score >= MIN_SIMILARITY_SCORE)
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
    .slice(0, topK);
}

/**
 * Retrieves the most relevant portfolio chunks for a user query.
 *
 * Uses the configured vector store when available; otherwise falls back to an
 * in-memory semantic index built from portfolio content embeddings.
 */
export async function retrieveContext(query: string): Promise<RetrievalResult> {
  const emptyResult: RetrievalResult = { context: "", hits: 0, chunks: [] };

  if (!shouldRunRag(query)) {
    return emptyResult;
  }

  if (!isEmbeddingsConfigured()) {
    return emptyResult;
  }

  try {
    const topK = resolveTopK();
    const queryEmbedding = await embedText(query);
    const vectorStore = createVectorStore();
    const storeIsReady = await vectorStore.exists();

    if (storeIsReady && "query" in vectorStore && typeof vectorStore.query === "function") {
      const results = await vectorStore.query(queryEmbedding, topK);
      const chunks: RetrievalChunk[] = results.map((record) => ({
        id: record.id,
        content: record.metadata.content,
        metadata: {
          type: record.metadata.type,
          slug: record.metadata.slug,
        },
      }));

      return {
        context: formatRetrievedContext(chunks),
        hits: chunks.length,
        chunks,
      };
    }

    const chunks = await retrieveFromInMemoryIndex(queryEmbedding, topK);

    return {
      context: formatRetrievedContext(chunks),
      hits: chunks.length,
      chunks,
    };
  } catch (error) {
    console.error("[rag/retriever] Retrieval failed:", error);
    return emptyResult;
  }
}

/** Clears the in-memory embedding cache (useful after content re-ingestion). */
export function clearRetrievalCache(): void {
  cachedPortfolioEmbeddings = null;
}

/** Exposes chunk count for diagnostics without embedding. */
export function getPortfolioChunkCount(): number {
  return buildPortfolioChunks().length;
}
