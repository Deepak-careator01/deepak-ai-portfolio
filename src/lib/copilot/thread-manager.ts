import type { UIMessage } from "ai";

import { clearStoredMessages, loadStoredMessages } from "@/lib/copilot/chat-storage";

export type CopilotThread = {
  id: string;
  title: string;
  lastUpdated: number;
};

const THREADS_STORAGE_KEY = "deepak-ai-copilot-threads";
const ACTIVE_THREAD_STORAGE_KEY = "deepak-ai-copilot-thread-id";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readThreads(): CopilotThread[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(THREADS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (thread): thread is CopilotThread =>
        typeof thread === "object" &&
        thread !== null &&
        typeof thread.id === "string" &&
        typeof thread.title === "string" &&
        typeof thread.lastUpdated === "number",
    );
  } catch {
    return [];
  }
}

function writeThreads(threads: CopilotThread[]): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // Ignore quota errors — in-memory state remains usable.
  }
}

function migrateLegacyThread(threads: CopilotThread[]): CopilotThread[] {
  if (!isBrowser() || threads.length > 0) {
    return threads;
  }

  const legacyId = localStorage.getItem(ACTIVE_THREAD_STORAGE_KEY);
  if (!legacyId) {
    return threads;
  }

  const legacyMessages = loadStoredMessages(legacyId);
  const firstUser = legacyMessages.find((message) => message.role === "user");
  const title = firstUser
    ? generateThreadTitle(extractMessageText(firstUser))
    : "Previous chat";

  return [
    {
      id: legacyId,
      title,
      lastUpdated: Date.now(),
    },
  ];
}

function extractMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/** Derives a short thread title from the first user message. */
export function generateThreadTitle(firstMessage: string): string {
  const normalized = firstMessage.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "New chat";
  }

  return normalized.length > 48 ? `${normalized.slice(0, 45)}…` : normalized;
}

/** Returns all threads sorted by most recently updated. */
export function getThreads(): CopilotThread[] {
  const threads = migrateLegacyThread(readThreads());
  if (threads.length > 0 && readThreads().length === 0) {
    writeThreads(threads);
  }

  return [...threads].sort((left, right) => right.lastUpdated - left.lastUpdated);
}

/** Creates a new thread and marks it active. */
export function createThread(): CopilotThread {
  const thread: CopilotThread = {
    id: crypto.randomUUID(),
    title: "New chat",
    lastUpdated: Date.now(),
  };

  writeThreads([thread, ...getThreads()]);
  setActiveThread(thread.id);
  return thread;
}

/** Sets the active thread ID in localStorage. */
export function setActiveThread(threadId: string): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(ACTIVE_THREAD_STORAGE_KEY, threadId);
}

/** Returns the active thread ID, if any. */
export function getActiveThreadId(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(ACTIVE_THREAD_STORAGE_KEY);
}

/** Ensures a thread record exists for the given ID. */
export function ensureThreadExists(threadId: string, title = "New chat"): void {
  const threads = getThreads();
  if (threads.some((thread) => thread.id === threadId)) {
    return;
  }

  writeThreads([{ id: threadId, title, lastUpdated: Date.now() }, ...threads]);
}

/** Updates thread metadata such as title or last activity time. */
export function updateThreadMetadata(
  threadId: string,
  updates: Partial<Pick<CopilotThread, "title" | "lastUpdated">>,
): void {
  const threads = getThreads();
  const index = threads.findIndex((thread) => thread.id === threadId);
  if (index === -1) {
    ensureThreadExists(threadId, updates.title ?? "New chat");
    return updateThreadMetadata(threadId, updates);
  }

  threads[index] = { ...threads[index], ...updates };
  writeThreads(threads);
}

/** Deletes a thread and its stored messages. */
export function deleteThread(threadId: string): void {
  writeThreads(getThreads().filter((thread) => thread.id !== threadId));
  clearStoredMessages(threadId);

  if (getActiveThreadId() === threadId) {
    const remaining = getThreads();
    if (remaining.length > 0) {
      setActiveThread(remaining[0].id);
    } else {
      localStorage.removeItem(ACTIVE_THREAD_STORAGE_KEY);
    }
  }
}

/** Human-readable relative time for sidebar display. */
export function formatThreadUpdated(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "Just now";
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)}m ago`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)}h ago`;
  }

  if (diffMs < day * 7) {
    return `${Math.floor(diffMs / day)}d ago`;
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Resolves the initial active thread ID for client hydration. */
export function resolveInitialActiveThreadId(): string {
  if (!isBrowser()) {
    return "ssr-placeholder";
  }

  const activeId = getActiveThreadId();
  const threads = getThreads();

  if (activeId && threads.some((thread) => thread.id === activeId)) {
    return activeId;
  }

  if (threads.length > 0) {
    setActiveThread(threads[0].id);
    return threads[0].id;
  }

  return createThread().id;
}
