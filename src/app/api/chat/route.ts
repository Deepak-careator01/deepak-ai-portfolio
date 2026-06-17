import "server-only";

import { streamText } from "ai";
import { z } from "zod";

import {
  deepakAiChatModel,
  getDeepakAiSystemInstruction,
  isAiServiceConfigured,
} from "@/server/ai";
import {
  createThread,
  formatChatMemoryContext,
  getRecentMessages,
  saveMessage,
  shouldInjectChatMemory,
} from "@/server/memory/chat-memory";
import { retrieveContext } from "@/server/rag/retriever";

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

function buildSystemInstruction(ragContext: string, memoryContext: string): string {
  let instruction = getDeepakAiSystemInstruction();

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

  const { messages, threadId } = parsed.data;
  const lastUserMessage = getLastUserMessage(messages);

  let memoryContext = "";

  if (threadId) {
    try {
      await createThread(threadId);

      const storedMessages = await getRecentMessages(threadId, 20);
      if (shouldInjectChatMemory(storedMessages, messages)) {
        memoryContext = formatChatMemoryContext(storedMessages);
      }

      if (lastUserMessage) {
        await saveMessage(threadId, { role: "user", content: lastUserMessage });
      }
    } catch (error) {
      console.error("[/api/chat] Memory operation failed, continuing without memory:", error);
    }
  }

  let ragContext = "";

  if (lastUserMessage) {
    try {
      const rag = await retrieveContext(lastUserMessage);
      ragContext = rag.context;
    } catch (error) {
      console.error("[/api/chat] RAG retrieval failed, continuing without RAG:", error);
    }
  }

  try {
    const result = streamText({
      model: deepakAiChatModel,
      system: buildSystemInstruction(ragContext, memoryContext),
      messages,
      onFinish: async ({ text }) => {
        if (!threadId || !text.trim()) {
          return;
        }

        try {
          await saveMessage(threadId, { role: "assistant", content: text });
        } catch (error) {
          console.error("[/api/chat] Failed to persist assistant message:", error);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[/api/chat] Failed to generate response:", error);

    return jsonError("Failed to generate AI response. Please try again later.", 500);
  }
}
