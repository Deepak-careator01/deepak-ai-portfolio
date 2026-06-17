import "server-only";

export type VectorStoreProvider = "pgvector" | "upstash" | "none";

type ServerEnv = {
  groqApiKey: string | undefined;
  databaseUrl: string | undefined;
  openAiApiKey: string | undefined;
  embeddingApiKey: string | undefined;
  vectorStoreProvider: VectorStoreProvider;
  upstashVectorRestUrl: string | undefined;
  upstashVectorRestToken: string | undefined;
  embeddingProvider: string | undefined;
  embeddingModel: string | undefined;
  ragTopK: number | undefined;
  ragMaxChunkChars: number | undefined;
  ragMaxContextChars: number | undefined;
  ragEmbeddingCacheSize: number | undefined;
  rateLimitMaxRequests: number;
  rateLimitWindowMs: number;
  isProduction: boolean;
  groqConfigured: boolean;
  databaseConfigured: boolean;
  embeddingsConfigured: boolean;
};

let cachedEnv: ServerEnv | null = null;
let warningsLogged = false;

function readOptional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function readPositiveInt(name: string): number | undefined {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function resolveVectorStoreProvider(): VectorStoreProvider {
  const configured = readOptional("VECTOR_STORE_PROVIDER")?.toLowerCase();

  if (!configured || configured === "none") {
    return "none";
  }

  if (configured === "pgvector" || configured === "upstash") {
    return configured;
  }

  throw new Error(
    `Invalid VECTOR_STORE_PROVIDER "${configured}". Supported values: pgvector, upstash, none.`,
  );
}

function buildEnv(): ServerEnv {
  const groqApiKey = readOptional("GROQ_API_KEY");
  const databaseUrl = readOptional("DATABASE_URL");
  const openAiApiKey = readOptional("OPENAI_API_KEY");
  const embeddingApiKey = readOptional("EMBEDDING_API_KEY");
  const isProduction = process.env.NODE_ENV === "production";

  return {
    groqApiKey,
    databaseUrl,
    openAiApiKey,
    embeddingApiKey,
    vectorStoreProvider: resolveVectorStoreProvider(),
    upstashVectorRestUrl: readOptional("UPSTASH_VECTOR_REST_URL"),
    upstashVectorRestToken: readOptional("UPSTASH_VECTOR_REST_TOKEN"),
    embeddingProvider: readOptional("EMBEDDING_PROVIDER"),
    embeddingModel: readOptional("EMBEDDING_MODEL"),
    ragTopK: readPositiveInt("RAG_TOP_K"),
    ragMaxChunkChars: readPositiveInt("RAG_MAX_CHUNK_CHARS"),
    ragMaxContextChars: readPositiveInt("RAG_MAX_CONTEXT_CHARS"),
    ragEmbeddingCacheSize: readPositiveInt("RAG_EMBEDDING_CACHE_SIZE"),
    rateLimitMaxRequests: readPositiveInt("RATE_LIMIT_MAX_REQUESTS") ?? 20,
    rateLimitWindowMs: readPositiveInt("RATE_LIMIT_WINDOW_MS") ?? 5 * 60 * 1000,
    isProduction,
    groqConfigured: Boolean(groqApiKey),
    databaseConfigured: Boolean(databaseUrl),
    embeddingsConfigured: Boolean(embeddingApiKey ?? openAiApiKey),
  };
}

function logDevelopmentWarnings(config: ServerEnv): void {
  if (warningsLogged || config.isProduction) {
    return;
  }

  warningsLogged = true;

  if (!config.groqConfigured) {
    console.warn("[env] GROQ_API_KEY is missing — chat API will be unavailable.");
  }

  if (!config.databaseConfigured) {
    console.warn("[env] DATABASE_URL is missing — memory and pgvector RAG are disabled.");
  }

  if (!config.embeddingsConfigured) {
    console.warn("[env] OPENAI_API_KEY / EMBEDDING_API_KEY missing — RAG embeddings are disabled.");
  }

  if (config.vectorStoreProvider === "none") {
    console.warn("[env] VECTOR_STORE_PROVIDER is unset — vector retrieval is disabled.");
  }
}

/** Returns the typed server environment (singleton). */
export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = buildEnv();
    logDevelopmentWarnings(cachedEnv);
  }

  return cachedEnv;
}

/** Convenience accessor for typed environment configuration. */
export const env = {
  get groqApiKey(): string | undefined {
    return getServerEnv().groqApiKey;
  },
  get databaseUrl(): string | undefined {
    return getServerEnv().databaseUrl;
  },
  get openAiApiKey(): string | undefined {
    return getServerEnv().openAiApiKey;
  },
  get embeddingApiKey(): string | undefined {
    return getServerEnv().embeddingApiKey;
  },
  get vectorStoreProvider(): VectorStoreProvider {
    return getServerEnv().vectorStoreProvider;
  },
  get upstashVectorRestUrl(): string | undefined {
    return getServerEnv().upstashVectorRestUrl;
  },
  get upstashVectorRestToken(): string | undefined {
    return getServerEnv().upstashVectorRestToken;
  },
  get embeddingProvider(): string | undefined {
    return getServerEnv().embeddingProvider;
  },
  get embeddingModel(): string | undefined {
    return getServerEnv().embeddingModel;
  },
  get ragTopK(): number | undefined {
    return getServerEnv().ragTopK;
  },
  get ragMaxChunkChars(): number | undefined {
    return getServerEnv().ragMaxChunkChars;
  },
  get ragMaxContextChars(): number | undefined {
    return getServerEnv().ragMaxContextChars;
  },
  get ragEmbeddingCacheSize(): number | undefined {
    return getServerEnv().ragEmbeddingCacheSize;
  },
  get rateLimitMaxRequests(): number {
    return getServerEnv().rateLimitMaxRequests;
  },
  get rateLimitWindowMs(): number {
    return getServerEnv().rateLimitWindowMs;
  },
  get isProduction(): boolean {
    return getServerEnv().isProduction;
  },
  get groqConfigured(): boolean {
    return getServerEnv().groqConfigured;
  },
  get databaseConfigured(): boolean {
    return getServerEnv().databaseConfigured;
  },
  get embeddingsConfigured(): boolean {
    return getServerEnv().embeddingsConfigured;
  },
};
