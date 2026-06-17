type ChatErrorDetails = {
  title: string;
  hint: string;
};

/** Maps SDK/network errors to user-friendly copilot messages. */
export function getChatErrorDetails(error: Error): ChatErrorDetails {
  const message = error.message.toLowerCase();

  if (
    message.includes("not configured") ||
    message.includes("api key") ||
    message.includes("unauthorized") ||
    message.includes("401")
  ) {
    return {
      title: "AI service temporarily unavailable",
      hint: "Check your API key or try again.",
    };
  }

  if (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("aborted") ||
    message.includes("timeout")
  ) {
    return {
      title: "AI service temporarily unavailable",
      hint: "Check your connection or try again.",
    };
  }

  return {
    title: "AI service temporarily unavailable",
    hint: "Check your API key or try again.",
  };
}
