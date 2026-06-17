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
    } catch (error) {
      logger.warn("rag_retrieval_failed", {
        error: error instanceof Error ? error.message : "unknown_error",
      });
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
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    logger.error("request_failed", {
      threadId,
      latencyMs: Date.now() - startedAt,
      ragHits,
      memoryUsed,
      status: "error",
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return internalError("Failed to generate AI response. Please try again later.", requestId);
  }
}
