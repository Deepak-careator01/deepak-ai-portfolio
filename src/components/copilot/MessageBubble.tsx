import type { UIMessage } from "ai";

import { MarkdownContent } from "@/components/copilot/MarkdownContent";
import { extractUIMessageText } from "@/lib/copilot/chat-transport";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: UIMessage;
  isStreaming?: boolean;
  className?: string;
};

export function MessageBubble({ message, isStreaming = false, className }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const text = extractUIMessageText(message);

  if (!text.trim() && !isStreaming) {
    return null;
  }

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start", className)}
      role="article"
      aria-label={isUser ? "Your message" : "Deepak AI message"}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border/60 bg-card/80 text-foreground",
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
        ) : text.trim() ? (
          <MarkdownContent content={text} />
        ) : (
          <span className="text-sm text-muted-foreground">…</span>
        )}
      </div>
    </div>
  );
}
