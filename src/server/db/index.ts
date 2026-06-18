import "server-only";

import type { PoolClient } from "pg";

import {
  getDbPool,
  isDatabaseConfigured,
  withDbClient,
  withDbClientSafe as withDbClientSafeCore,
} from "@/server/db/client";
import { trackAnalyticsEvent } from "@/server/monitoring/analytics";

export { getDbPool, isDatabaseConfigured, withDbClient };

/**
 * Safe DB helper for optional features (e.g. chat memory).
 * Returns null when the database is unavailable or the operation fails.
 */
export async function withDbClientSafe<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T | null> {
  return withDbClientSafeCore(fn, {
    onError: () => trackAnalyticsEvent("database_error"),
  });
}
