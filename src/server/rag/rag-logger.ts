import "server-only";

export type RagSkipReason =
  | "query_too_short"
  | "embeddings_not_configured"
  | "vector_store_unavailable"
  | "no_relevant_chunks"
  | "retrieval_error";

export type RagLogEntry = {
  retrievalMs: number;
  chunksRetrieved: number;
  chunksAfterFilter: number;
  topScores: number[];
  contextCharCount: number;
  used: boolean;
  skippedReason?: RagSkipReason;
  rewrittenQuery?: string;
};

/** Logs a structured RAG pipeline event for observability. */
export function logRagPipeline(entry: RagLogEntry): void {
  const topScores = entry.topScores.map((score) => score.toFixed(3)).join(", ") || "none";

  if (!entry.used) {
    console.info(
      `[rag] skipped reason=${entry.skippedReason ?? "unknown"} retrievalMs=${entry.retrievalMs} retrieved=${entry.chunksRetrieved} filtered=${entry.chunksAfterFilter}`,
    );
    return;
  }

  console.info(
    `[rag] used=true retrievalMs=${entry.retrievalMs} retrieved=${entry.chunksRetrieved} filtered=${entry.chunksAfterFilter} contextChars=${entry.contextCharCount} topScores=[${topScores}]`,
  );

  if (entry.rewrittenQuery) {
    console.info(`[rag] rewrittenQuery="${entry.rewrittenQuery}"`);
  }
}
