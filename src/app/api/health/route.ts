import "server-only";

import { runHealthChecks } from "@/server/health/checks";

/**
 * GET /api/health
 *
 * Lightweight health probe for monitoring tools.
 */
export async function GET(): Promise<Response> {
  try {
    const result = await runHealthChecks();
    const statusCode = result.status === "healthy" ? 200 : 503;

    return Response.json(result, { status: statusCode });
  } catch {
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
