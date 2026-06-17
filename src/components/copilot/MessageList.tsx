"use client";

import type { ChatStatus, UIMessage } from "ai";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/copilot/EmptyState";
import { MessageBubble } from "@/components/copilot/MessageBubble";
import { TypingIndicator } from "@/components/copilot/TypingIndicator";
import { Button } from "@/components/ui/button";
import { extractUIMessageText } from "@/lib/copilot/chat-transport";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: UIMessage[];
  status: ChatStatus;
  onSuggestionClick: (prompt: string) => void;
  onRegenerate?: () => void;
  className?: string;
};

const SCROLL_THRESHOLD_PX = 96;

export function MessageList({
  messages,
  status,
  onSuggestionClick,
  onRegenerate,
  className,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isPinnedToBottomRef = useRef(true);
  const previousMessageCountRef = useRef(messages.length);

  const [showNewMessages, setShowNewMessages] = useState(false);

  const isLoading = status === "submitted" || status === "streaming";

  const visibleMessages = messages.filter(
    (message) => message.role === "user" || message.role === "assistant",
  );

  const lastMessage = visibleMessages.at(-1);
  const lastMessageSignature = lastMessage
    ? `${lastMessage.id}:${extractUIMessageText(lastMessage).length}`
    : "";
  const showTypingIndicator =
    isLoading &&
    (visibleMessages.length === 0 ||
      lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" && !extractUIMessageText(lastMessage).trim()));

  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return true;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    return distanceFromBottom <= SCROLL_THRESHOLD_PX;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const pinned = isNearBottom();
      isPinnedToBottomRef.current = pinned;
      if (pinned) {
        setShowNewMessages(false);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isNearBottom]);

  useEffect(() => {
    const hasNewMessages = messages.length > previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;

    if (isPinnedToBottomRef.current) {
      scrollToBottom(isLoading ? "auto" : "smooth");
      return;
    }

    if (hasNewMessages || isLoading) {
      setShowNewMessages(true);
    }
  }, [messages, lastMessageSignature, status, isLoading, scrollToBottom]);

  return (
    <div className={cn("relative flex-1 min-h-0", className)}>
      <div
        ref={containerRef}
        className="h-full overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={isLoading}
      >
        {visibleMessages.length === 0 && !isLoading ? (
          <EmptyState onSuggestionClick={onSuggestionClick} />
        ) : (
          <div className="flex flex-col gap-5">
            {visibleMessages.map((message, index) => {
              const isLast = index === visibleMessages.length - 1;
              const isEmptyAssistant =
                message.role === "assistant" && !extractUIMessageText(message).trim();

              if (isLast && isEmptyAssistant && isLoading) {
                return null;
              }

              const isStreamingAssistant =
                isLoading && isLast && message.role === "assistant" && !isEmptyAssistant;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={isStreamingAssistant}
                  onRegenerate={
                    !isLoading && isLast && message.role === "assistant"
                      ? onRegenerate
                      : undefined
                  }
                />
              );
            })}
            {showTypingIndicator ? <TypingIndicator /> : null}
          </div>
        )}

        <div ref={bottomRef} aria-hidden className="h-px" />
      </div>

      {showNewMessages ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto h-8 gap-1.5 rounded-full px-3 shadow-md"
            onClick={() => {
              scrollToBottom("smooth");
              isPinnedToBottomRef.current = true;
              setShowNewMessages(false);
            }}
          >
            <ArrowDown className="size-3.5" aria-hidden />
            New messages
          </Button>
        </div>
      ) : null}
    </div>
  );
}
