"use client";

import type { ChatStatus, UIMessage } from "ai";
import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/copilot/EmptyState";
import { MessageBubble } from "@/components/copilot/MessageBubble";
import { TypingIndicator } from "@/components/copilot/TypingIndicator";
import { extractUIMessageText } from "@/lib/copilot/chat-transport";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: UIMessage[];
  status: ChatStatus;
  onSuggestionClick: (prompt: string) => void;
  className?: string;
};

export function MessageList({
  messages,
  status,
  onSuggestionClick,
  className,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  const visibleMessages = messages.filter(
    (message) => message.role === "user" || message.role === "assistant",
  );

  const lastMessage = visibleMessages.at(-1);
  const showTypingIndicator =
    isLoading &&
    (visibleMessages.length === 0 ||
      lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" && !extractUIMessageText(lastMessage).trim()));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  return (
    <div
      className={cn("flex-1 overflow-y-auto px-4 py-4", className)}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-busy={isLoading}
    >
      {visibleMessages.length === 0 && !isLoading ? (
        <EmptyState onSuggestionClick={onSuggestionClick} />
      ) : (
        <div className="flex flex-col gap-4">
          {visibleMessages.map((message, index) => {
            const isLast = index === visibleMessages.length - 1;
            const isEmptyAssistant =
              message.role === "assistant" && !extractUIMessageText(message).trim();

            if (isLast && isEmptyAssistant && isLoading) {
              return null;
            }

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={isLoading && isLast && message.role === "assistant"}
              />
            );
          })}
          {showTypingIndicator ? <TypingIndicator /> : null}
        </div>
      )}

      <div ref={bottomRef} aria-hidden />
    </div>
  );
}
