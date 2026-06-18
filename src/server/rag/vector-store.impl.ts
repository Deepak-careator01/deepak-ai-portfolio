import type { PortfolioChunkMetadata } from "@/server/rag/embeddings.impl";
import { env } from "@/server/config/env.shared";
import { isDatabaseConfigured } from "@/server/db/client";
import { PgVectorStore } from "@/server/rag/vector-stores/pgvector.store";

/** A single vector record ready for persistence. */
export type VectorRecord<TMetadata = Record<string, unknown>> = {
  id: string;
  values: number[];
  metadata: TMetadata;
};

export type PortfolioVectorMetadata = PortfolioChunkMetadata & {
  content: string;
};

export type VectorQueryResult<TMetadata = Record<string, unknown>> = VectorRecord<TMetadata> & {
  score: number;
};

/**
 * Provider-agnostic vector store contract.
 *
 * Implementations (pgvector, Upstash, Pinecone, etc.) plug in via createVectorStore().
 */
export interface VectorStore<TMetadata = Record<string, unknown>> {
  upsert(vectors: VectorRecord<TMetadata>[]): Promise<void>;
  clear(): Promise<void>;
  exists(): Promise<boolean>;
  query(embedding: number[], topK: number): Promise<VectorQueryResult<TMetadata>[]>;
}

export type VectorStoreProviderName = "pgvector" | "upstash";

function resolveVectorStoreProvider(): VectorStoreProviderName | null {
  const configured = env.vectorStoreProvider;

  if (configured === "none") {
    return null;
  }

  return configured;
}

/** Returns true when a vector store provider and its required env vars are set. */
export function isVectorStoreConfigured(): boolean {
  try {
    const provider = resolveVectorStoreProvider();
    if (!provider) {
      return false;
    }

    if (provider === "pgvector") return isDatabaseConfigured();

    if (provider === "upstash") {
      return Boolean(env.upstashVectorRestUrl && env.upstashVectorRestToken);
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * No-op store used when persistence is not configured.
 * Methods log intent so the ingestion pipeline remains observable.
 */
class UnconfiguredVectorStore implements VectorStore<PortfolioVectorMetadata> {
  async upsert(vectors: VectorRecord<PortfolioVectorMetadata>[]): Promise<void> {
    console.warn(
      `[vector-store] Skipping upsert for ${vectors.length} vector(s) — vector store is not configured.`,
    );
  }

  async clear(): Promise<void> {
    console.warn("[vector-store] Skipping clear — vector store is not configured.");
  }

  async exists(): Promise<boolean> {
    return false;
  }

  async query(): Promise<VectorQueryResult<PortfolioVectorMetadata>[]> {
    return [];
  }
}

/**
 * Placeholder for configured providers that are not implemented yet.
 * Surfaces a clear message instead of failing silently.
 */
class PendingVectorStore implements VectorStore<PortfolioVectorMetadata> {
  constructor(private readonly provider: VectorStoreProviderName) {}

  async upsert(vectors: VectorRecord<PortfolioVectorMetadata>[]): Promise<void> {
    console.warn(
      `[vector-store] Provider "${this.provider}" is configured but not implemented yet. ` +
        `${vectors.length} vector(s) were not persisted.`,
    );
  }

  async clear(): Promise<void> {
    console.warn(
      `[vector-store] Provider "${this.provider}" is configured but clear() is not implemented yet.`,
    );
  }

  async exists(): Promise<boolean> {
    return false;
  }

  async query(): Promise<VectorQueryResult<PortfolioVectorMetadata>[]> {
    return [];
  }
}

/**
 * Creates the active vector store adapter.
 *
 * Returns an unconfigured no-op store when VECTOR_STORE_PROVIDER is unset.
 * Returns a pending placeholder when configured but the adapter is not built yet.
 */
export function createVectorStore(): VectorStore<PortfolioVectorMetadata> {
  const provider = resolveVectorStoreProvider();

  if (!provider) {
    return new UnconfiguredVectorStore();
  }

  if (!isVectorStoreConfigured()) {
    console.warn(
      `[vector-store] VECTOR_STORE_PROVIDER="${provider}" is set but required credentials are missing.`,
    );
    return new UnconfiguredVectorStore();
  }

  if (provider === "pgvector") {
    return new PgVectorStore();
  }

  return new PendingVectorStore(provider);
}
