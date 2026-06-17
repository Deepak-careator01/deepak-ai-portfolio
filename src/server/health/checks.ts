import "server-only";

import { env } from "@/server/config/env";
import { withDbClientSafe } from "@/server/db";
import { isEmbeddingsConfigured } from "@/server/rag/embeddings.impl";
import {
  createVectorStore,
  isVectorStoreConfigured,
} from "@/server/rag/vector-store.impl";

export type HealthStatus = "healthy" | "degraded";

export type HealthCheckResult = {
  status: HealthStatus;
  services: {
    groq: boolean;
    database: boolean;
    vectorStore: boolean;
    embeddings: boolean;
  };
  version: string;
};

const APP_VERSION = "1.0.0";

async function checkDatabaseConnectivity(): Promise<boolean> {
  if (!env.databaseConfigured) {
    return false;
  }

  const result = await withDbClientSafe(async (client) => {
    const response = await client.query("SELECT 1 AS ok");
    return response.rowCount === 1;
  });

  return result === true;
}

async function checkVectorStoreAvailability(): Promise<boolean> {
  if (!isVectorStoreConfigured()) {
    return false;
  }

  try {
    const store = createVectorStore();
    return await store.exists();
  } catch {
    return false;
  }
}

/** Runs lightweight production health checks (no expensive queries). */
export async function runHealthChecks(): Promise<HealthCheckResult> {
  const groq = env.groqConfigured;
  const embeddings = isEmbeddingsConfigured();
  const database = await checkDatabaseConnectivity();
  const vectorStore = await checkVectorStoreAvailability();

  const coreReady = groq;
  const optionalReady = (!env.databaseConfigured || database) && (!isVectorStoreConfigured() || vectorStore);

  return {
    status: coreReady && optionalReady ? "healthy" : "degraded",
    services: {
      groq,
      database,
      vectorStore,
      embeddings,
    },
    version: APP_VERSION,
  };
}
