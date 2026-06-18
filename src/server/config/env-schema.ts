/**
 * Environment variable schema used by CI validation and documentation.
 * Intentionally free of `server-only` so scripts can import it.
 */

export const REQUIRED_ENV_VARS = ["GROQ_API_KEY"] as const;

export const OPTIONAL_ENV_VARS = [
  "DATABASE_URL",
  "OPENAI_API_KEY",
  "EMBEDDING_API_KEY",
  "EMBEDDING_PROVIDER",
  "EMBEDDING_MODEL",
  "VECTOR_STORE_PROVIDER",
  "UPSTASH_VECTOR_REST_URL",
  "UPSTASH_VECTOR_REST_TOKEN",
  "RATE_LIMIT_MAX_REQUESTS",
  "RATE_LIMIT_WINDOW_MS",
  "RAG_TOP_K",
  "RAG_MAX_CONTEXT_CHARS",
  "RAG_MAX_CHUNK_CHARS",
  "RAG_EMBEDDING_CACHE_SIZE",
  "NEXT_PUBLIC_SITE_URL",
  "INGEST_CLEAR",
] as const;

export type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];
export type OptionalEnvVar = (typeof OPTIONAL_ENV_VARS)[number];

const VALID_VECTOR_STORE_PROVIDERS = new Set(["pgvector", "upstash", "none", ""]);

/** Validates environment schema rules without requiring real secrets. */
export function validateEnvironmentSchema(): void {
  const provider = process.env.VECTOR_STORE_PROVIDER?.trim().toLowerCase() ?? "";

  if (provider && !VALID_VECTOR_STORE_PROVIDERS.has(provider)) {
    throw new Error(
      `Invalid VECTOR_STORE_PROVIDER "${provider}". Supported: pgvector, upstash, none.`,
    );
  }

  for (const name of ["RATE_LIMIT_MAX_REQUESTS", "RATE_LIMIT_WINDOW_MS", "RAG_TOP_K"]) {
    const value = process.env[name];
    if (value !== undefined && value.trim() !== "" && Number(value) <= 0) {
      throw new Error(`${name} must be a positive number when set.`);
    }
  }
}
