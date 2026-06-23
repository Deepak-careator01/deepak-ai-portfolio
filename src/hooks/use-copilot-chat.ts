"use client";

import { useChat } from "@ai-sdk/react";
import type { ChatStatus } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createCopilotChatTransport,
  extractUIMessageText,
} from "@/lib/copilot/chat-transport";
import { hasSuccessfulAssistantReply, shouldShowChatErrorBanner } from "@/lib/copilot/chat-errors";
import { loadStoredMessages, saveStoredMessages } from "@/lib/copilot/chat-storage";
import {
  createThread,
  deleteThread as deleteThreadRecord,
  ensureThreadExists,
  generateThreadTitle,
  getThreads,
  resolveInitialActiveThreadId,
  setActiveThread,
  updateThreadMetadata,
  type CopilotThread,
} from "@/lib/copilot/thread-manager";

function buildMessagesSignature(
  messages: Array<{ id: string; role: string; parts: Array<{ type: string; text?: string }> }>,
): string {
  return messages
    .map(
      (message) =>
        `${message.id}:${message.role}:${extractUIMessageText(message as Parameters<typeof extractUIMessageText>[0]).length}`,
    )
    .join("|");
}

function threadsAreEqual(left: CopilotThread[], right: CopilotThread[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every(
    (thread, index) =>
      thread.id === right[index]?.id &&
      thread.title === right[index]?.title &&
      thread.lastUpdated === right[index]?.lastUpdated,
  );
}

export function useCopilotChat() {
  const [activeThreadId, setActiveThreadId] = useState("ssr-placeholder");
  const [threads, setThreads] = useState<CopilotThread[]>([]);

  const initialMessages = useMemo(
    () => (activeThreadId === "ssr-placeholder" ? [] : loadStoredMessages(activeThreadId)),
    [activeThreadId],
  );
  const transport = useMemo(
    () => createCopilotChatTransport({ threadId: activeThreadId }),
    [activeThreadId],
  );

  const onChatError = useCallback((streamError: Error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[copilot] COPILOT ERROR", streamError);
    }
  }, []);

  const onChatFinish = useCallback(
    ({
      isError,
      isAbort,
      isDisconnect,
    }: {
      isError: boolean;
      isAbort: boolean;
      isDisconnect: boolean;
    }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[copilot] STREAM FINISHED", {
          status: isError ? "error" : "success",
          isAbort,
          isDisconnect,
        });
      }
    },
    [],
  );

  const {
    messages,
    sendMessage,
    status,
    error,
    setMessages,
    regenerate,
    stop,
    clearError,
  } = useChat({
    id: activeThreadId,
    messages: initialMessages,
    transport,
    onError: onChatError,
    onFinish: onChatFinish,
  });

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const messagesSignature = useMemo(() => buildMessagesSignature(messages), [messages]);

  const refreshThreads = useCallback(() => {
    setThreads((current) => {
      const next = getThreads();
      return threadsAreEqual(current, next) ? current : next;
    });
  }, []);

  const hasHydratedRef = useRef(false);
  const previousStatusRef = useRef<ChatStatus>("ready");

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }

    hasHydratedRef.current = true;
    const threadId = resolveInitialActiveThreadId();
    setActiveThreadId(threadId);
    setThreads(getThreads());
    setMessages(loadStoredMessages(threadId));
  }, [setMessages]);

  useEffect(() => {
    if (activeThreadId === "ssr-placeholder") {
      return;
    }

    ensureThreadExists(activeThreadId);
    setActiveThread(activeThreadId);
    saveStoredMessages(activeThreadId, messagesRef.current);
  }, [activeThreadId, messagesSignature]);

  useEffect(() => {
    if (activeThreadId === "ssr-placeholder") {
      return;
    }

    const firstUserMessage = messagesRef.current.find((message) => message.role === "user");
    if (!firstUserMessage) {
      return;
    }

    const title = generateThreadTitle(extractUIMessageText(firstUserMessage));
    const existingTitle = getThreads().find((thread) => thread.id === activeThreadId)?.title;
    if (existingTitle === title) {
      return;
    }

    updateThreadMetadata(activeThreadId, { title });
    refreshThreads();
  }, [activeThreadId, messagesSignature, refreshThreads]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;

    const reachedTerminalState =
      (previousStatus === "streaming" || previousStatus === "submitted") &&
      (status === "ready" || status === "error");

    if (!reachedTerminalState || activeThreadId === "ssr-placeholder") {
      return;
    }

    updateThreadMetadata(activeThreadId, { lastUpdated: Date.now() });
    refreshThreads();

    if (
      status === "error" &&
      error &&
      hasSuccessfulAssistantReply(messagesRef.current)
    ) {
      clearError();
    }
  }, [activeThreadId, clearError, error, refreshThreads, status]);

  const switchThread = useCallback(
    (threadId: string) => {
      if (threadId === activeThreadId) {
        return;
      }

      stop();
      clearError();
      setActiveThread(threadId);
      setActiveThreadId(threadId);
      setMessages(loadStoredMessages(threadId));
      refreshThreads();
    },
    [activeThreadId, clearError, refreshThreads, setMessages, stop],
  );

  const createNewChat = useCallback(() => {
    stop();
    clearError();
    const thread = createThread();
    setActiveThreadId(thread.id);
    setMessages([]);
    refreshThreads();
  }, [clearError, refreshThreads, setMessages, stop]);

  const deleteThread = useCallback(
    (threadId: string) => {
      const isActive = threadId === activeThreadId;
      deleteThreadRecord(threadId);

      if (isActive) {
        const remaining = getThreads();
        if (remaining.length > 0) {
          switchThread(remaining[0].id);
        } else {
          const thread = createThread();
          setActiveThreadId(thread.id);
          setMessages([]);
        }
      }

      refreshThreads();
    },
    [activeThreadId, refreshThreads, setMessages, switchThread],
  );

  const retryLastResponse = useCallback(async () => {
    clearError();
    stop();

    setMessages((current) => {
      const last = current.at(-1);
      if (last?.role === "assistant" && !extractUIMessageText(last).trim()) {
        return current.slice(0, -1);
      }
      return current;
    });

    await regenerate();
  }, [clearError, regenerate, setMessages, stop]);

  const handleSend = useCallback(
    async (text: string) => {
      clearError();
      try {
        await sendMessage({ text });
      } catch (caught) {
        if (process.env.NODE_ENV === "development") {
          console.error("[copilot] sendMessage failed", caught);
        }
      }
    },
    [clearError, sendMessage],
  );

  const abortStream = useCallback(() => {
    if (status === "submitted" || status === "streaming") {
      stop();
    }
  }, [status, stop]);

  const handleRegenerate = useCallback(() => {
    void retryLastResponse();
  }, [retryLastResponse]);

  return {
    threadId: activeThreadId,
    activeThreadId,
    threads,
    messages,
    status: status as ChatStatus,
    error,
    sendMessage: handleSend,
    switchThread,
    createNewChat,
    deleteThread,
    clearChat: createNewChat,
    retryLastResponse,
    regenerate: handleRegenerate,
    abortStream,
    clearError,
    showErrorBanner: shouldShowChatErrorBanner(messages, error),
    hasMessages: messages.length > 0,
  };
}

export type CopilotChatState = ReturnType<typeof useCopilotChat>;
