import { DefaultChatTransport, type UIMessage } from "ai";

import { isValidCopilotThreadId } from "@/lib/copilot/thread-id";

/** Extracts plain text from AI SDK UI message parts. */
export function extractUIMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

type CopilotChatTransportOptions = {
  threadId: string;
};

/**
 * Chat transport configured for the portfolio `/api/chat` route.
 *
 * The API expects `{ messages: [{ role, content }], threadId? }` while useChat
 * works with UIMessage parts — prepareSendMessagesRequest bridges the two formats
 * without changing the backend streaming contract.
 */
export function createCopilotChatTransport({ threadId }: CopilotChatTransportOptions) {
  return new DefaultChatTransport({
    api: "/api/chat",
    prepareSendMessagesRequest: ({ messages, body }) => ({
      body: {
        ...body,
        ...(isValidCopilotThreadId(threadId) ? { threadId } : {}),
        messages: messages
          .filter((message) => message.role === "user" || message.role === "assistant")
          .map((message) => ({
            role: message.role,
            content: extractUIMessageText(message),
          }))
          .filter((message) => message.content.trim().length > 0),
      },
    }),
  });
}
