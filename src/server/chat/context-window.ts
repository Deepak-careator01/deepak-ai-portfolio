import "server-only";

import type { ChatMessage } from "@/server/chat/request-validation";

/**
 * Trims conversation history for the LLM while preserving order.
 * Client-side history is unchanged — only the model request is reduced.
 */
export function trimChatHistoryForModel(
  messages: ChatMessage[],
  maxMessages: number,
): ChatMessage[] {
  if (maxMessages <= 0 || messages.length <= maxMessages) {
    return messages;
  }

  return messages.slice(-maxMessages);
}
