import type { UIMessage } from "ai";

import { extractUIMessageText } from "@/lib/copilot/chat-transport";

export type ChatErrorDetails = {
  title: string;
  hint: string;
};

function matchesAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

/** Maps SDK/network/provider errors to user-friendly copilot messages. */
export function getChatErrorDetails(error: Error): ChatErrorDetails {
  const message = error.message.toLowerCase();

  if (
    matchesAny(message, [
      "rate limit",
      "rate_limit",
      "429",
      "too many requests",
      "quota",
      "tokens per day",
      "tpd",
      "try again in",
      "rate_limit_exceeded",
      "limit exceeded",
    ])
  ) {
    return {
      title: "AI usage limit reached",
      hint: "The AI service has reached its temporary usage limit. Please try again later.",
    };
  }

  if (
    matchesAny(message, [
      "not configured",
      "unauthorized",
      "401",
      "invalid api key",
      "authentication",
    ])
  ) {
    return {
      title: "AI service unavailable",
      hint: "The server AI configuration may be missing or invalid.",
    };
  }

  if (
    matchesAny(message, [
      "network",
      "failed to fetch",
      "aborted",
      "timeout",
      "connection",
    ])
  ) {
    return {
      title: "Connection problem",
      hint: "Check your internet connection and try again.",
    };
  }

  if (matchesAny(message, ["503", "service unavailable", "temporarily unavailable"])) {
    return {
      title: "AI service temporarily unavailable",
      hint: "The AI service is down or misconfigured. Try again shortly.",
    };
  }

  return {
    title: "Something went wrong",
    hint: "The response could not be completed. Try again or start a new chat.",
  };
}

/** Returns true when the latest assistant message looks like a successful reply. */
export function hasSuccessfulAssistantReply(messages: UIMessage[]): boolean {
  const lastMessage = messages.at(-1);
  if (lastMessage?.role !== "assistant") {
    return false;
  }

  return extractUIMessageText(lastMessage).trim().length > 0;
}

/** Shows the global banner only when the latest turn has no completed assistant reply. */
export function shouldShowChatErrorBanner(
  messages: UIMessage[],
  error: Error | undefined,
): boolean {
  if (!error) {
    return false;
  }

  return !hasSuccessfulAssistantReply(messages);
}
