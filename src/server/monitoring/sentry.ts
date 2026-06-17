import "server-only";

import type { ErrorReporter } from "@/server/monitoring/monitoring";

/**
 * Stub Sentry adapter — replace captureException with @sentry/nextjs when enabled.
 *
 * Enable by setting SENTRY_DSN and calling configureMonitoring({ errors: createSentryErrorReporter() }).
 */
export function createSentryErrorReporter(): ErrorReporter {
  return {
    captureException(error: unknown, context?: Record<string, unknown>): void {
      console.error(
        JSON.stringify({
          type: "sentry_stub",
          message: error instanceof Error ? error.message : "unknown_error",
          context,
        }),
      );
    },
  };
}
