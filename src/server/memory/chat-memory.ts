import "server-only";

import { isDatabaseConfigured, withDbClientSafe } from "@/server/db";
import { CHAT_MESSAGES_TABLE, CHAT_THREADS_TABLE } from "@/server/db/schema";

export type ChatMemoryRole = "user" | "assistant";

export type ChatMemoryMessage = {
  role: ChatMemoryRole;
  content: string;
};

type RequestMessage = {
  role: ChatMemoryRole;
  content: string;
};

/** Inserts a thread row when it does not already exist. */
export async function createThread(threadId: string): Promise<void> {
  if (!isDatabaseConfigured() || !threadId.trim()) {
    return;
  }

  try {
    await withDbClientSafe(async (client) => {
      await client.query(
        `INSERT INTO ${CHAT_THREADS_TABLE} (id)
         VALUES ($1)
         ON CONFLICT (id) DO NOTHING`,
        [threadId],
      );
    });
  } catch (error) {
    console.error("[memory] Failed to create thread:", error);
  }
}

/** Persists a chat message and bumps the parent thread timestamp. */
export async function saveMessage(
  threadId: string,
  message: ChatMemoryMessage,
): Promise<void> {
  if (!isDatabaseConfigured() || !threadId.trim() || !message.content.trim()) {
    return;
  }

  try {
    await withDbClientSafe(async (client) => {
      await client.query("BEGIN");

      try {
        await client.query(
          `INSERT INTO ${CHAT_THREADS_TABLE} (id)
           VALUES ($1)
           ON CONFLICT (id) DO NOTHING`,
          [threadId],
        );

        await client.query(
          `INSERT INTO ${CHAT_MESSAGES_TABLE} (thread_id, role, content)
           VALUES ($1, $2, $3)`,
          [threadId, message.role, message.content.trim()],
        );

        await client.query(
          `UPDATE ${CHAT_THREADS_TABLE}
           SET updated_at = NOW()
           WHERE id = $1`,
          [threadId],
        );

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });
  } catch (error) {
    console.error("[memory] Failed to save message:", error);
  }
}

/**
 * Returns the most recent messages for a thread, ordered oldest → newest.
 * Never throws — returns an empty array when memory is unavailable.
 */
export async function getRecentMessages(
  threadId: string,
  limit = 20,
): Promise<ChatMemoryMessage[]> {
  if (!isDatabaseConfigured() || !threadId.trim()) {
    return [];
  }

  try {
    const rows = await withDbClientSafe(async (client) => {
      const result = await client.query<{ role: ChatMemoryRole; content: string }>(
        `SELECT role, content
         FROM ${CHAT_MESSAGES_TABLE}
         WHERE thread_id = $1
         ORDER BY created_at DESC, id DESC
         LIMIT $2`,
        [threadId, limit],
      );

      return result.rows.reverse();
    });

    return rows ?? [];
  } catch (error) {
    console.error("[memory] Failed to load recent messages:", error);
    return [];
  }
}

/** Formats stored messages for injection into the system prompt. */
export function formatChatMemoryContext(messages: ChatMemoryMessage[]): string {
  if (messages.length === 0) {
    return "";
  }

  return messages.map((message) => `${message.role}: ${message.content}`).join("\n");
}

/**
 * Avoids duplicating conversation history when the client already sent it.
 * Injects DB memory when the request is missing prior turns (e.g. cleared local storage).
 */
export function shouldInjectChatMemory(
  storedMessages: ChatMemoryMessage[],
  requestMessages: RequestMessage[],
): boolean {
  if (storedMessages.length === 0) {
    return false;
  }

  if (requestMessages.length <= 1) {
    return true;
  }

  return !storedMessages.every((stored) =>
    requestMessages.some(
      (request) => request.role === stored.role && request.content === stored.content,
    ),
  );
}
