"use client";

import type { ChatStatus, UIMessage } from "ai";
import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/copilot/EmptyState";
import { MessageBubble } from "@/components/copilot/MessageBubble";
import { TypingIndicator } from "@/components/copilot/TypingIndicator";
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
      {messages.length === 0 ? (
        <EmptyState onSuggestionClick={onSuggestionClick} />
      ) : (
        <div className="flex flex-col gap-4">
          {messages
            .filter((message) => message.role === "user" || message.role === "assistant")
            .map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          {isLoading ? <TypingIndicator /> : null}
        </div>
      )}

      <div ref={bottomRef} aria-hidden />
    </div>
  );
}
