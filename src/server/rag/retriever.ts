import "server-only";

import { buildRagContext } from "@/server/rag/context-builder";
import { clearEmbeddingCache, embedTextCached } from "@/server/rag/embedding-cache";
import { env } from "@/server/config/env";
import {
  buildPortfolioChunks,
  isEmbeddingsConfigured,
  type PortfolioChunkMetadata,
} from "@/server/rag/embeddings.impl";
import { logRagPipeline, type RagSkipReason } from "@/server/rag/rag-logger";
import { createVectorStore } from "@/server/rag/vector-store.impl";

const DEFAULT_TOP_K = 4;
const MIN_WORD_COUNT_FOR_RAG = 4;
const MIN_HYBRID_SCORE = 0.22;
const MIN_SEMANTIC_SCORE = 0.12;
const MIN_KEYWORD_OVERLAP = 0.08;
const STRONG_SEMANTIC_SCORE = 0.28;
const STRONG_KEYWORD_OVERLAP = 0.25;
const KEYWORD_WEIGHT = 0.2;
const SIMILARITY_WEIGHT = 0.8;
const QUERY_CANDIDATE_MULTIPLIER = 3;
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

const DOMAIN_TERMS = new Set([
  "ai",
  "api",
  "blog",
  "copilot",
  "deepak",
  "embedding",
  "embeddings",
  "experience",
  "groq",
  "llm",
  "nextjs",
  "openai",
  "pgvector",
  "portfolio",
  "project",
  "projects",
  "rag",
  "react",
  "resume",
  "typescript",
  "vector",
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

type RankedChunk = RetrievalChunk & {
  semanticScore: number;
  keywordScore: number;
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Returns true when the query is long enough to benefit from retrieval. */
export function shouldRunRag(query: string): boolean {
  return countWords(query) >= MIN_WORD_COUNT_FOR_RAG;
}

function resolveTopK(): number {
  return env.ragTopK ?? DEFAULT_TOP_K;
}

function extractQueryTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1);
}

function extractTechnicalTerms(query: string): string[] {
  const matches = query.match(/\b[a-z]*[A-Z][a-zA-Z0-9]*\b|[\w]+-[\w]+/g) ?? [];
  return matches.map((term) => term.toLowerCase());
}

/** Rewrites noisy user queries into retrieval-friendly search text. */
function rewriteQueryForRetrieval(query: string): string {
  const baseTerms = extractQueryTerms(query).filter((word) => !STOP_WORDS.has(word));
  const technicalTerms = extractTechnicalTerms(query);
  const domainTerms = extractQueryTerms(query).filter((word) => DOMAIN_TERMS.has(word));

  const uniqueTerms = [...new Set([...baseTerms, ...technicalTerms, ...domainTerms])];
  return uniqueTerms.slice(0, 24).join(" ");
}

function keywordOverlapScore(query: string, content: string): number {
  const queryTerms = new Set(
    rewriteQueryForRetrieval(query).split(/\s+/).filter(Boolean),
  );
  if (queryTerms.size === 0) {
    return 0;
  }

  const contentTerms = new Set(extractQueryTerms(content));

  let overlap = 0;
  for (const term of queryTerms) {
    if (contentTerms.has(term)) {
      overlap += 1;
    }
  }

  return overlap / queryTerms.size;
}

function passesRelevanceGate(chunk: RankedChunk): boolean {
  const hybrid = chunk.score ?? 0;

  if (hybrid < MIN_HYBRID_SCORE) {
    return false;
  }

  if (chunk.semanticScore >= STRONG_SEMANTIC_SCORE || chunk.keywordScore >= STRONG_KEYWORD_OVERLAP) {
    return true;
  }

  if (chunk.semanticScore < MIN_SEMANTIC_SCORE && chunk.keywordScore < MIN_KEYWORD_OVERLAP) {
    return false;
  }

  return true;
}

function logSkipped(
  reason: RagSkipReason,
  startedAt: number,
  partial: Partial<Parameters<typeof logRagPipeline>[0]> = {},
): void {
  logRagPipeline({
    retrievalMs: Date.now() - startedAt,
    chunksRetrieved: 0,
    chunksAfterFilter: 0,
    topScores: [],
    contextCharCount: 0,
    used: false,
    skippedReason: reason,
    ...partial,
  });
}

/** Retrieves the most relevant portfolio chunks for a user query. */
export async function retrieveContext(query: string): Promise<RetrievalResult> {
  const startedAt = Date.now();
  const emptyResult: RetrievalResult = { context: "", hits: 0, chunks: [] };

  if (!shouldRunRag(query)) {
    logSkipped("query_too_short", startedAt);
    return emptyResult;
  }

  if (!isEmbeddingsConfigured()) {
    logSkipped("embeddings_not_configured", startedAt);
    return emptyResult;
  }

  try {
    const topK = resolveTopK();
    const rewrittenQuery = rewriteQueryForRetrieval(query);
    const embeddingSource = rewrittenQuery || query;
    const queryEmbedding = await embedTextCached(embeddingSource);
    const vectorStore = createVectorStore();
    const storeIsReady = await vectorStore.exists();

    if (!storeIsReady) {
      logSkipped("vector_store_unavailable", startedAt, { rewrittenQuery });
      return emptyResult;
    }

    const candidateCount = Math.max(topK * QUERY_CANDIDATE_MULTIPLIER, topK);
    const results = await vectorStore.query(queryEmbedding, candidateCount);
    const chunksRetrieved = results.length;

    const ranked = results
      .map((record) => {
        const keywordScore = keywordOverlapScore(query, record.metadata.content);
        const semanticScore = Math.max(record.score ?? 0, 0);
        const score = semanticScore * SIMILARITY_WEIGHT + keywordScore * KEYWORD_WEIGHT;

        return {
          id: record.id,
          content: record.metadata.content,
          metadata: {
            type: record.metadata.type,
            slug: record.metadata.slug,
          },
          score,
          semanticScore,
          keywordScore,
        } satisfies RankedChunk;
      })
      .filter(passesRelevanceGate)
      .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
      .slice(0, topK);

    if (ranked.length === 0) {
      logSkipped("no_relevant_chunks", startedAt, {
        chunksRetrieved,
        rewrittenQuery,
      });
      return emptyResult;
    }

    const { context, charCount } = buildRagContext(ranked);
    const topScores = ranked.map((chunk) => chunk.score ?? 0);

    logRagPipeline({
      retrievalMs: Date.now() - startedAt,
      chunksRetrieved,
      chunksAfterFilter: ranked.length,
      topScores,
      contextCharCount: charCount,
      used: true,
      rewrittenQuery,
    });

    return {
      context,
      hits: ranked.length,
      chunks: ranked,
    };
  } catch (error) {
    console.error("[rag/retriever] Retrieval failed:", error);
    logSkipped("retrieval_error", startedAt);
    return emptyResult;
  }
}

/** Clears in-memory retrieval caches (embedding cache). */
export function clearRetrievalCache(): void {
  clearEmbeddingCache();
}

/** Diagnostics helper retained for compatibility. */
export function getPortfolioChunkCount(): number {
  return buildPortfolioChunks().length;
}
