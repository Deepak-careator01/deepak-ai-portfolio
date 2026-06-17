import "server-only";

import { z } from "zod";

export const CHAT_LIMITS = {
  maxMessages: 20,
  maxMessageChars: 2_000,
  maxTotalChars: 20_000,
} as const;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .trim()
    .min(1, "Message content cannot be empty")
    .max(
      CHAT_LIMITS.maxMessageChars,
      `Message content cannot exceed ${CHAT_LIMITS.maxMessageChars} characters`,
    ),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required")
    .max(CHAT_LIMITS.maxMessages, `Cannot send more than ${CHAT_LIMITS.maxMessages} messages`),
  threadId: z.string().uuid("Invalid thread ID format").optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** Validates total conversation character budget. */
export function validateConversationSize(messages: ChatMessage[]): string | null {
  const totalChars = messages.reduce((sum, message) => sum + message.content.length, 0);

  if (totalChars > CHAT_LIMITS.maxTotalChars) {
    return `Total conversation size cannot exceed ${CHAT_LIMITS.maxTotalChars} characters`;
  }

  return null;
}

/** Returns the last user message content, if any. */
export function getLastUserMessage(messages: ChatMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === "user") {
      return message.content;
    }
  }

  return null;
}
