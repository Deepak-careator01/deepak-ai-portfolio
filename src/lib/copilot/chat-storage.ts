import type { UIMessage } from "ai";

const THREAD_ID_STORAGE_KEY = "deepak-ai-copilot-thread-id";
const MESSAGES_STORAGE_PREFIX = "deepak-ai-copilot-messages:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Returns an existing thread ID from localStorage or creates a new UUID. */
export function getOrCreateThreadId(): string {
  if (!isBrowser()) {
    return "ssr-placeholder";
  }

  const existing = localStorage.getItem(THREAD_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const threadId = crypto.randomUUID();
  localStorage.setItem(THREAD_ID_STORAGE_KEY, threadId);
  return threadId;
}

function getMessagesStorageKey(threadId: string): string {
  return `${MESSAGES_STORAGE_PREFIX}${threadId}`;
}

/** Loads persisted chat messages for a thread. */
export function loadStoredMessages(threadId: string): UIMessage[] {
  if (!isBrowser() || threadId === "ssr-placeholder") {
    return [];
  }

  try {
    const raw = localStorage.getItem(getMessagesStorageKey(threadId));
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (message): message is UIMessage =>
        typeof message === "object" &&
        message !== null &&
        "id" in message &&
        "role" in message &&
        "parts" in message,
    );
  } catch {
    return [];
  }
}

/** Persists chat messages for a thread. */
export function saveStoredMessages(threadId: string, messages: UIMessage[]): void {
  if (!isBrowser() || threadId === "ssr-placeholder") {
    return;
  }

  try {
    const storable = messages.filter(
      (message) => message.role === "user" || message.role === "assistant",
    );
    localStorage.setItem(getMessagesStorageKey(threadId), JSON.stringify(storable));
  } catch {
    // Ignore quota or serialization errors — chat remains usable in memory.
  }
}

/** Clears persisted messages for a thread. */
export function clearStoredMessages(threadId: string): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(getMessagesStorageKey(threadId));
}
