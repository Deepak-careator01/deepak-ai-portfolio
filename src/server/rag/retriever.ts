import "server-only";

import {
  buildPortfolioChunks,
  embedText,
  isEmbeddingsConfigured,
  type PortfolioChunkMetadata,
} from "@/server/rag/embeddings.impl";
import { createVectorStore } from "@/server/rag/vector-store.impl";

const DEFAULT_TOP_K = 4;
const MIN_WORD_COUNT_FOR_RAG = 4;
const MIN_SIMILARITY_SCORE = 0.2;
const KEYWORD_WEIGHT = 0.2;
const SIMILARITY_WEIGHT = 0.8;
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "what",
  "when",
  "where",
  "which",
  "who",
  "with",
  "you",
]);

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

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Returns true when the query is long enough to benefit from retrieval. */
export function shouldRunRag(query: string): boolean {
  return countWords(query) >= MIN_WORD_COUNT_FOR_RAG;
}

function resolveTopK(): number {
  const configured = Number(process.env.RAG_TOP_K);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TOP_K;
}

function rewriteQueryForRetrieval(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .slice(0, 20)
    .join(" ");
}

function keywordOverlapScore(query: string, content: string): number {
  const queryTerms = new Set(rewriteQueryForRetrieval(query).split(/\s+/).filter(Boolean));
  if (queryTerms.size === 0) {
    return 0;
  }

  const contentTerms = new Set(
    content
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 1),
  );

  let overlap = 0;
  for (const term of queryTerms) {
    if (contentTerms.has(term)) {
      overlap += 1;
    }
  }

  return overlap / queryTerms.size;
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

/** Retrieves the most relevant portfolio chunks for a user query. */
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
    const rewrittenQuery = rewriteQueryForRetrieval(query);
    const embeddingSource = rewrittenQuery || query;
    const queryEmbedding = await embedText(embeddingSource);
    const vectorStore = createVectorStore();
    const storeIsReady = await vectorStore.exists();

    if (!storeIsReady) {
      console.info("[rag/retriever] Vector store unavailable. Skipping RAG retrieval.");
      return emptyResult;
    }

    const results = await vectorStore.query(queryEmbedding, Math.max(topK * 3, topK));
    const ranked = results
      .map((record) => {
        const overlap = keywordOverlapScore(query, record.metadata.content);
        const semantic = Math.max(record.score ?? 0, 0);
        const score = semantic * SIMILARITY_WEIGHT + overlap * KEYWORD_WEIGHT;

        return {
          id: record.id,
          content: record.metadata.content,
          metadata: {
            type: record.metadata.type,
            slug: record.metadata.slug,
          },
          score,
        } satisfies RetrievalChunk;
      })
      .filter((chunk) => (chunk.score ?? 0) >= MIN_SIMILARITY_SCORE)
      .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
      .slice(0, topK);

    return {
      context: formatRetrievedContext(ranked),
      hits: ranked.length,
      chunks: ranked,
    };
  } catch (error) {
    console.error("[rag/retriever] Retrieval failed:", error);
    return emptyResult;
  }
}

/** Clear hook retained for compatibility; pgvector-backed retrieval has no local cache. */
export function clearRetrievalCache(): void {
  // no-op
}

/** Diagnostics helper retained for compatibility. */
export function getPortfolioChunkCount(): number {
  return buildPortfolioChunks().length;
}
