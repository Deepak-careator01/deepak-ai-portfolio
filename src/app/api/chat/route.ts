import "server-only";

import { streamText } from "ai";
import { z } from "zod";

import {
  deepakAiChatModel,
  getDeepakAiSystemInstruction,
  isAiServiceConfigured,
} from "@/server/ai";
import { retrieveContext } from "@/server/rag/retriever";

/**
 * POST /api/chat
 *
 * Streaming chat endpoint for the Deepak AI copilot.
 * - Validates request body with Zod
 * - Injects portfolio-grounded system instruction
 * - Augments context with RAG retrieval when available
 * - Streams model output via Vercel AI SDK v6
 */

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1, "Message content cannot be empty"),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "At least one message is required"),
  threadId: z.string().uuid().optional(),
});

type ChatMessage = z.infer<typeof chatMessageSchema>;

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function getLastUserMessage(messages: ChatMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === "user") {
      return message.content;
    }
  }

  return null;
}

function buildSystemInstruction(ragContext: string): string {
  const baseInstruction = getDeepakAiSystemInstruction();

  if (!ragContext.trim()) {
    return baseInstruction;
  }

  return `${baseInstruction}

---
RELEVANT MEMORY CONTEXT (RAG):
${ragContext}
---`;
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
  const lastUserMessage = getLastUserMessage(messages);

  let ragContext = "";

  if (lastUserMessage) {
    try {
      const rag = await retrieveContext(lastUserMessage);
      ragContext = rag.context;
      console.info(`[/api/chat] RAG hits: ${rag.hits} chunks used`);
    } catch (error) {
      console.error("[/api/chat] RAG retrieval failed, continuing without RAG:", error);
    }
  }

  try {
    const result = streamText({
      model: deepakAiChatModel,
      system: buildSystemInstruction(ragContext),
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[/api/chat] Failed to generate response:", error);

    return jsonError("Failed to generate AI response. Please try again later.", 500);
  }
}
