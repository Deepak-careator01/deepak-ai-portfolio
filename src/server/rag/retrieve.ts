/**
 * Vector retrieval utilities — re-exports from the RAG retriever module.
 */
export type { RetrievalChunk, RetrievalResult } from "@/server/rag/retriever";
export {
  clearRetrievalCache,
  getPortfolioChunkCount,
  retrieveContext,
  shouldRunRag,
} from "@/server/rag/retriever";
