import type { PortfolioChunkMetadata } from "@/server/rag/embeddings.impl";

/** A single vector record ready for persistence. */
export type VectorRecord<TMetadata = Record<string, unknown>> = {
  id: string;
  values: number[];
  metadata: TMetadata;
};

export type PortfolioVectorMetadata = PortfolioChunkMetadata & {
  content: string;
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
  /** Optional semantic search — implemented by concrete vector store adapters. */
  query?(
    embedding: number[],
    topK: number,
  ): Promise<VectorRecord<PortfolioVectorMetadata>[]>;
}

export type VectorStoreProviderName = "pgvector" | "upstash";

const SUPPORTED_PROVIDERS: VectorStoreProviderName[] = ["pgvector", "upstash"];

function resolveVectorStoreProvider(): VectorStoreProviderName | null {
  const configured = process.env.VECTOR_STORE_PROVIDER?.trim().toLowerCase();

  if (!configured || configured === "none") {
    return null;
  }

  if (SUPPORTED_PROVIDERS.includes(configured as VectorStoreProviderName)) {
    return configured as VectorStoreProviderName;
  }

  throw new Error(
    `Unsupported VECTOR_STORE_PROVIDER "${configured}". Supported: ${SUPPORTED_PROVIDERS.join(", ")}.`,
  );
}

/** Returns true when a vector store provider and its required env vars are set. */
export function isVectorStoreConfigured(): boolean {
  try {
    const provider = resolveVectorStoreProvider();
    if (!provider) {
      return false;
    }

    if (provider === "pgvector") {
      return Boolean(process.env.DATABASE_URL?.trim());
    }

    if (provider === "upstash") {
      return Boolean(
        process.env.UPSTASH_VECTOR_REST_URL?.trim() &&
          process.env.UPSTASH_VECTOR_REST_TOKEN?.trim(),
      );
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

  // Adapter implementations (pgvector, Upstash, etc.) will be wired in a later phase.
  return new PendingVectorStore(provider);
}
