import "server-only";

import { streamText } from "ai";

import {
  chatRequestSchema,
  getLastUserMessage,
  validateConversationSize,
} from "@/server/chat/request-validation";
import {
  deepakAiChatModel,
  getDeepakAiSystemInstruction,
  isAiServiceConfigured,
} from "@/server/ai";
import {
  createRequestLogger,
  generateRequestId,
  getClientIp,
} from "@/server/logging/logger";
import {
  createThread,
  formatChatMemoryContext,
  getRecentMessages,
  saveMessage,
  shouldInjectChatMemory,
} from "@/server/memory/chat-memory";
import { badRequest, internalError, rateLimited, serviceUnavailable } from "@/server/http/errors";
import { trackAnalyticsEvent } from "@/server/monitoring/analytics";
import { getMonitoring } from "@/server/monitoring/monitoring";
import { retrieveContext } from "@/server/rag/retriever";
import { analyzeInputSafety } from "@/server/security/input-safety";
import { checkChatRateLimit } from "@/server/security/rate-limit";

/**
 * POST /api/chat
 *
 * Streaming chat endpoint for the Deepak AI copilot.
 * - Validates request body with Zod
 * - Injects portfolio-grounded system instruction
 * - Augments context with RAG retrieval when available
 * - Loads persistent thread memory when PostgreSQL is available
 * - Streams model output via Vercel AI SDK v6
 */

function buildSystemInstruction(
  ragContext: string,
  memoryContext: string,
  safetyContext: string,
): string {
  let instruction = getDeepakAiSystemInstruction();

  if (safetyContext.trim()) {
    instruction += `

---
${safetyContext}
---`;
  }

  if (memoryContext.trim()) {
    instruction += `

---
CONVERSATION MEMORY:
${memoryContext}
---`;
  }

  if (ragContext.trim()) {
    instruction += `

---
RELEVANT MEMORY CONTEXT (RAG):
${ragContext}
---`;
  }

  return instruction;
}

const RATE_LIMIT_ERROR_PATTERNS = [
  "rate limit",
  "rate_limit",
  "429",
  "too many requests",
  "quota",
  "tokens per day",
  "tpd",
  "rate_limit_exceeded",
] as const;

/** Maps provider stream errors to safe client-facing text (no stack traces). */
function sanitizeChatStreamError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "An error occurred.";
  const message = raw.trim();

  if (!message) {
    return "The AI service encountered an error. Please try again.";
  }

  const lower = message.toLowerCase();

  if (RATE_LIMIT_ERROR_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return message.length > 320 ? `${message.slice(0, 317)}…` : message;
  }

  if (
    lower.includes("not configured") ||
    lower.includes("unauthorized") ||
    lower.includes("invalid api key") ||
    lower.includes("authentication")
  ) {
    return "The AI service is not configured or authorized.";
  }

  if (lower.includes("service unavailable") || lower.includes("503")) {
    return "The AI service is temporarily unavailable. Please try again shortly.";
  }

  if (message.includes("\n    at ") || message.includes("node_modules")) {
    return "The AI service encountered an error. Please try again.";
  }

  if (message.length <= 320 && !message.includes("```")) {
    return message;
  }

  return "The AI service encountered an error. Please try again.";
}

export async function POST(request: Request): Promise<Response> {
  const requestId = generateRequestId();
  const startedAt = Date.now();
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const logger = createRequestLogger({
    requestId,
    ip,
    userAgent,
    model: "llama-3.3-70b-versatile",
  });

  logger.info("request_started");

  const rateLimit = await checkChatRateLimit(ip);
  if (!rateLimit.success) {
    logger.warn("rate_limit_triggered", {
      metadata: { limit: rateLimit.limit, resetAt: rateLimit.resetAt },
    });
    trackAnalyticsEvent("rate_limit_triggered", {
      limit: rateLimit.limit,
      resetAt: rateLimit.resetAt,
    });

    return rateLimited("Rate limit exceeded. Please try again later.", requestId);
  }

  if (!isAiServiceConfigured()) {
    logger.error("ai_service_unavailable");
    return serviceUnavailable("AI service is not configured.", requestId);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logger.warn("invalid_json_body");
    return badRequest("Invalid JSON body.", requestId);
  }

  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    logger.warn("validation_failed", { error: message });
    return badRequest(message, requestId);
  }

  const { messages, threadId } = parsed.data;
  const sizeError = validateConversationSize(messages);

  if (sizeError) {
    logger.warn("payload_too_large", { error: sizeError });
    return badRequest(sizeError, requestId);
  }

  const lastUserMessage = getLastUserMessage(messages);
  const inputSafety = lastUserMessage ? analyzeInputSafety(lastUserMessage) : null;

  if (inputSafety?.suspicious) {
    logger.warn("suspicious_input_detected", {
      metadata: { reasons: inputSafety.reasons },
    });
  }

  logger.info("request_validated", {
    threadId,
    metadata: { messageCount: messages.length },
  });

  trackAnalyticsEvent("chat_started", {
    messageCount: messages.length,
    hasThreadId: Boolean(threadId),
  });

  let memoryContext = "";
  let memoryUsed = false;

  if (threadId) {
    try {
      await createThread(threadId);

      const storedMessages = await getRecentMessages(threadId, 20);
      if (shouldInjectChatMemory(storedMessages, messages)) {
        memoryContext = formatChatMemoryContext(storedMessages);
        memoryUsed = memoryContext.length > 0;
      }

      if (lastUserMessage) {
        await saveMessage(threadId, { role: "user", content: lastUserMessage });
      }
    } catch (error) {
      logger.warn("memory_operation_failed", {
        error: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  let ragContext = "";
  let ragHits = 0;

  if (lastUserMessage) {
    try {
      const rag = await retrieveContext(lastUserMessage);
      ragContext = rag.context;
      ragHits = rag.hits;

      logger.info("rag_retrieval_completed", {
        ragHits,
        latencyMs: Date.now() - startedAt,
        metadata: { used: ragHits > 0 },
      });

      trackAnalyticsEvent(ragHits > 0 ? "rag_hit" : "rag_miss", {
        ragHits,
        latencyMs: Date.now() - startedAt,
      });
    } catch (error) {
      logger.warn("rag_retrieval_failed", {
        error: error instanceof Error ? error.message : "unknown_error",
      });
      trackAnalyticsEvent("rag_failure");
    }
  }

  try {
    const result = streamText({
      model: deepakAiChatModel,
      system: buildSystemInstruction(
        ragContext,
        memoryContext,
        inputSafety?.safetyContext ?? "",
      ),
      messages,
      onFinish: async ({ text }) => {
        if (threadId && text.trim()) {
          try {
            await saveMessage(threadId, { role: "assistant", content: text });
          } catch (error) {
            logger.warn("assistant_message_persist_failed", {
              error: error instanceof Error ? error.message : "unknown_error",
            });
          }
        }

        logger.info("llm_response_completed", {
          threadId,
          latencyMs: Date.now() - startedAt,
          ragHits,
          memoryUsed,
          status: "success",
        });

        trackAnalyticsEvent("chat_completed", {
          latencyMs: Date.now() - startedAt,
          ragHits,
          memoryUsed,
        });
        getMonitoring().performance.trackDuration("chat.request", Date.now() - startedAt, {
          ragHits,
          memoryUsed,
        });
      },
    });

    return result.toUIMessageStreamResponse({
      onError: sanitizeChatStreamError,
    });
  } catch (error) {
    logger.error("request_failed", {
      threadId,
      latencyMs: Date.now() - startedAt,
      ragHits,
      memoryUsed,
      status: "error",
      error: error instanceof Error ? error.message : "unknown_error",
    });

    trackAnalyticsEvent("chat_failed", {
      latencyMs: Date.now() - startedAt,
    });
    getMonitoring().errors.captureException(error, { requestId, threadId });

    return internalError("Failed to generate AI response. Please try again later.", requestId);
  }
}
