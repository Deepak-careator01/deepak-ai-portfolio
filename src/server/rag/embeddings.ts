import "server-only";

export type {
  EmbedDocumentInput,
  EmbeddedDocument,
  EmbeddingProviderName,
  PortfolioChunk,
  PortfolioChunkMetadata,
  PortfolioChunkType,
} from "@/server/rag/embeddings.impl";
export {
  buildPortfolioChunks,
  createEmbeddingModel,
  embedDocuments,
  embedPortfolioChunks,
  embedText,
  isEmbeddingsConfigured,
  normalizeTextForEmbedding,
} from "@/server/rag/embeddings.impl";
