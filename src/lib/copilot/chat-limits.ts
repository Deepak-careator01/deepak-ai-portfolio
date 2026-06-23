/** Client-side chat input limits — mirrors backend `CHAT_LIMITS.maxMessageChars`. */
export const MAX_MESSAGE_LENGTH = 2_000;
export const WARNING_MESSAGE_LENGTH = 1_800;

export const MESSAGE_TOO_LONG_ERROR =
  "Message cannot exceed 2,000 characters. Please shorten your question.";

/** Returns true when trimmed content exceeds the maximum message length. */
export function isMessageTooLong(text: string): boolean {
  return text.trim().length > MAX_MESSAGE_LENGTH;
}

/** Returns true when the message can be sent to the API. */
export function canSendMessage(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH;
}
