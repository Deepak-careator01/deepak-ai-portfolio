"use client";

import { useChat } from "@ai-sdk/react";
import type { ChatStatus } from "ai";
import { useCallback, useEffect, useMemo } from "react";

import {
  createCopilotChatTransport,
  extractUIMessageText,
} from "@/lib/copilot/chat-transport";
import {
  clearStoredMessages,
  getOrCreateThreadId,
  loadStoredMessages,
  saveStoredMessages,
} from "@/lib/copilot/chat-storage";

export function useCopilotChat() {
  const threadId = useMemo(() => getOrCreateThreadId(), []);
  const initialMessages = useMemo(() => loadStoredMessages(threadId), [threadId]);
  const transport = useMemo(() => createCopilotChatTransport({ threadId }), [threadId]);

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
    id: threadId,
    messages: initialMessages,
    transport,
  });

  useEffect(() => {
    saveStoredMessages(threadId, messages);
  }, [messages, threadId]);

  const clearChat = useCallback(() => {
    stop();
    clearError();
    setMessages([]);
    clearStoredMessages(threadId);
  }, [clearError, setMessages, stop, threadId]);

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
      await sendMessage({ text });
    },
    [clearError, sendMessage],
  );

  const abortStream = useCallback(() => {
    if (status === "submitted" || status === "streaming") {
      stop();
    }
  }, [status, stop]);

  return {
    threadId,
    messages,
    status: status as ChatStatus,
    error,
    sendMessage: handleSend,
    clearChat,
    retryLastResponse,
    abortStream,
    clearError,
    hasMessages: messages.length > 0,
  };
}

export type CopilotChatState = ReturnType<typeof useCopilotChat>;
