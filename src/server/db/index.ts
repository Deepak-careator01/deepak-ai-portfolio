import "server-only";

import { Pool, type PoolClient } from "pg";

let pool: Pool | null = null;

/** Returns true when DATABASE_URL is configured. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Singleton PostgreSQL pool for server-side RAG operations. */
export function getDbPool(): Pool {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return pool;
}

/** Helper to execute work with a checked-out client. */
export async function withDbClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getDbPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Safe DB helper for optional features (e.g. chat memory).
 * Returns null when the database is unavailable or the operation fails.
 */
export async function withDbClientSafe<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    return await withDbClient(fn);
  } catch (error) {
    console.error("[db] Operation failed:", error);
    return null;
  }
}
