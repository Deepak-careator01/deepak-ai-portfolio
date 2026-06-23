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
import { isValidCopilotThreadId } from "@/lib/copilot/thread-id";
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

function buildFirstUserMessageSignature(
  messages: Array<{ id: string; role: string; parts: Array<{ type: string; text?: string }> }>,
): string {
  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage) {
    return "";
  }

  return `${firstUserMessage.id}:${extractUIMessageText(firstUserMessage as Parameters<typeof extractUIMessageText>[0]).length}`;
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
    transport,
    onError: onChatError,
    onFinish: onChatFinish,
  });

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const errorRef = useRef(error);
  errorRef.current = error;

  const clearErrorRef = useRef(clearError);
  clearErrorRef.current = clearError;

  const setMessagesRef = useRef(setMessages);
  setMessagesRef.current = setMessages;

  const messagesSignature = useMemo(() => buildMessagesSignature(messages), [messages]);
  const firstUserMessageSignature = useMemo(
    () => buildFirstUserMessageSignature(messages),
    [messages],
  );

  const refreshThreads = useCallback(() => {
    setThreads((current) => {
      const next = getThreads();
      return threadsAreEqual(current, next) ? current : next;
    });
  }, []);

  const hasHydratedRef = useRef(false);
  const skipNextMessagesLoadRef = useRef(false);
  const previousStatusRef = useRef<ChatStatus>("ready");
  const handledTerminalTransitionRef = useRef<string | null>(null);
  const clearedStaleErrorRef = useRef(false);
  const lastAppliedTitleRef = useRef<string | null>(null);

  const loadMessagesForThread = useCallback((threadId: string) => {
    setMessagesRef.current(loadStoredMessages(threadId));
  }, []);

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }

    hasHydratedRef.current = true;
    const threadId = resolveInitialActiveThreadId();
    skipNextMessagesLoadRef.current = true;
    setActiveThreadId(threadId);
    setThreads(getThreads());
    loadMessagesForThread(threadId);
  }, [loadMessagesForThread]);

  useEffect(() => {
    if (activeThreadId === "ssr-placeholder") {
      return;
    }

    if (skipNextMessagesLoadRef.current) {
      skipNextMessagesLoadRef.current = false;
      return;
    }

    loadMessagesForThread(activeThreadId);
  }, [activeThreadId, loadMessagesForThread]);

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

    if (!firstUserMessageSignature) {
      lastAppliedTitleRef.current = null;
      return;
    }

    const firstUserMessage = messagesRef.current.find((message) => message.role === "user");
    if (!firstUserMessage) {
      return;
    }

    const title = generateThreadTitle(extractUIMessageText(firstUserMessage));
    if (lastAppliedTitleRef.current === title) {
      return;
    }

    const existingTitle = getThreads().find((thread) => thread.id === activeThreadId)?.title;
    if (existingTitle === title) {
      lastAppliedTitleRef.current = title;
      return;
    }

    updateThreadMetadata(activeThreadId, { title });
    lastAppliedTitleRef.current = title;
    refreshThreads();
  }, [activeThreadId, firstUserMessageSignature, refreshThreads]);

  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      clearedStaleErrorRef.current = false;
      handledTerminalTransitionRef.current = null;
    }

    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;

    const reachedTerminalState =
      (previousStatus === "streaming" || previousStatus === "submitted") &&
      (status === "ready" || status === "error");

    if (!reachedTerminalState || activeThreadId === "ssr-placeholder") {
      return;
    }

    const transitionKey = `${activeThreadId}:${previousStatus}->${status}`;
    if (handledTerminalTransitionRef.current === transitionKey) {
      return;
    }
    handledTerminalTransitionRef.current = transitionKey;

    updateThreadMetadata(activeThreadId, { lastUpdated: Date.now() });
    refreshThreads();

    if (
      status === "error" &&
      errorRef.current &&
      hasSuccessfulAssistantReply(messagesRef.current) &&
      !clearedStaleErrorRef.current
    ) {
      clearedStaleErrorRef.current = true;
      clearErrorRef.current();
    }
  }, [activeThreadId, refreshThreads, status]);

  const switchThread = useCallback(
    (threadId: string) => {
      if (threadId === activeThreadId) {
        return;
      }

      stop();
      clearError();
      skipNextMessagesLoadRef.current = true;
      setActiveThread(threadId);
      setActiveThreadId(threadId);
      loadMessagesForThread(threadId);
      lastAppliedTitleRef.current = null;
      refreshThreads();
    },
    [activeThreadId, clearError, loadMessagesForThread, refreshThreads, stop],
  );

  const createNewChat = useCallback(() => {
    stop();
    clearError();
    const thread = createThread();
    skipNextMessagesLoadRef.current = true;
    setActiveThreadId(thread.id);
    setMessagesRef.current([]);
    lastAppliedTitleRef.current = null;
    refreshThreads();
  }, [clearError, refreshThreads, stop]);

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
          skipNextMessagesLoadRef.current = true;
          setActiveThreadId(thread.id);
          setMessagesRef.current([]);
          lastAppliedTitleRef.current = null;
        }
      }

      refreshThreads();
    },
    [activeThreadId, refreshThreads, switchThread],
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
      if (!isValidCopilotThreadId(activeThreadId)) {
        return;
      }

      clearError();
      await sendMessage({ text });
    },
    [activeThreadId, clearError, sendMessage],
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
    isChatReady: isValidCopilotThreadId(activeThreadId),
  };
}

export type CopilotChatState = ReturnType<typeof useCopilotChat>;
