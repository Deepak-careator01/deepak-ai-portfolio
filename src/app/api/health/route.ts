import "server-only";

import { runHealthChecks } from "@/server/health/checks";
import { trackAnalyticsEvent } from "@/server/monitoring/analytics";

/**
 * GET /api/health
 *
 * Lightweight health probe for monitoring tools.
 */
export async function GET(): Promise<Response> {
  try {
    const result = await runHealthChecks();
    const statusCode = result.status === "healthy" ? 200 : 503;

    if (result.status !== "healthy") {
      trackAnalyticsEvent("health_check_failed", {
        groq: result.services.groq,
        database: result.services.database,
        vectorStore: result.services.vectorStore,
        embeddings: result.services.embeddings,
      });
    }

    return Response.json(result, { status: statusCode });
  } catch {
    trackAnalyticsEvent("health_check_failed");
    return Response.json(
      {
        status: "degraded",
        services: {
          groq: false,
          database: false,
          vectorStore: false,
          embeddings: false,
        },
        version: "1.0.0",
      },
      { status: 503 },
    );
  }
}
