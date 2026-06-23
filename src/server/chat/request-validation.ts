import "server-only";

import { z } from "zod";

export const CHAT_LIMITS = {
  maxMessages: 20,
  maxMessageChars: 2_000,
  maxTotalChars: 20_000,
} as const;

/** Payload-stage message schema — structure only, no character limits. */
const chatPayloadMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .trim()
    .min(1, "Message content cannot be empty"),
});

/** Validates incoming client payload before context window trimming. */
export const chatRequestPayloadSchema = z.object({
  messages: z
    .array(chatPayloadMessageSchema)
    .min(1, "At least one message is required")
    .max(CHAT_LIMITS.maxMessages, `Cannot send more than ${CHAT_LIMITS.maxMessages} messages`),
  threadId: z.string().uuid("Invalid thread ID format").optional(),
});

/** @deprecated Use chatRequestPayloadSchema — kept for compatibility. */
export const chatRequestSchema = chatRequestPayloadSchema;

export type ChatMessage = z.infer<typeof chatPayloadMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestPayloadSchema>;

/** Returns total character count across message contents. */
export function countConversationCharacters(messages: ChatMessage[]): number {
  return messages.reduce((sum, message) => sum + message.content.length, 0);
}

/** Validates trimmed LLM context against per-message and total character limits. */
export function validateLlmContext(messages: ChatMessage[]): string | null {
  for (const message of messages) {
    if (message.content.length > CHAT_LIMITS.maxMessageChars) {
      return `Message content cannot exceed ${CHAT_LIMITS.maxMessageChars} characters`;
    }
  }

  const totalChars = countConversationCharacters(messages);
  if (totalChars > CHAT_LIMITS.maxTotalChars) {
    return `Total conversation size cannot exceed ${CHAT_LIMITS.maxTotalChars} characters`;
  }

  return null;
}

/** @deprecated Use validateLlmContext on trimmed messages after context windowing. */
export function validateConversationSize(messages: ChatMessage[]): string | null {
  return validateLlmContext(messages);
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
