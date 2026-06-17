import "server-only";

import { streamText } from "ai";
import { z } from "zod";

import {
  deepakAiChatModel,
  getDeepakAiSystemInstruction,
  isAiServiceConfigured,
} from "@/server/ai";

/**
 * POST /api/chat
 *
 * Streaming chat endpoint for the Deepak AI copilot.
 * - Validates request body with Zod
 * - Injects portfolio-grounded system instruction
 * - Streams model output via Vercel AI SDK v6
 *
 * Designed for future extension:
 * - Swap getDeepakAiSystemInstruction() for RAG retrieval
 * - Add tool calling / LangGraph orchestration in a later phase
 * - Add conversation persistence via thread IDs
 */

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1, "Message content cannot be empty"),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "At least one message is required"),
  threadId: z.string().uuid().optional(),
});

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  if (!isAiServiceConfigured()) {
    return jsonError("AI service is not configured.", 500);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    return jsonError(message, 400);
  }

  const { messages } = parsed.data;

  try {
    const result = streamText({
      model: deepakAiChatModel,
      system: getDeepakAiSystemInstruction(),
      messages,
    });

    // UI message stream format — compatible with AI SDK v6 useChat when UI is added.
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[/api/chat] Failed to generate response:", error);

    return jsonError("Failed to generate AI response. Please try again later.", 500);
  }
}
