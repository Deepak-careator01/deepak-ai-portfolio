"use client";

import type { UIMessage } from "ai";
import { Check, Copy, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";

import { MarkdownContent } from "@/components/copilot/MarkdownContent";
import { Button } from "@/components/ui/button";
import { extractUIMessageText } from "@/lib/copilot/chat-transport";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: UIMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  className?: string;
};

export function MessageBubble({
  message,
  isStreaming = false,
  onRegenerate,
  className,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const text = extractUIMessageText(message);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable — fail silently.
    }
  }, [text]);

  if (!text.trim() && !isStreaming) {
    return null;
  }

  return (
    <div
      className={cn("group/message flex w-full gap-2", isUser ? "justify-end" : "justify-start", className)}
      role="article"
      aria-label={isUser ? "Your message" : "Deepak AI message"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isUser ? (
        <div
          className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-[10px] font-semibold text-muted-foreground"
          aria-hidden
        >
          AI
        </div>
      ) : null}

      <div className={cn("flex max-w-[min(88%,32rem)] flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 shadow-sm transition-colors",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border/60 bg-card/90 text-foreground",
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          ) : text.trim() ? (
            isStreaming ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
            ) : (
              <MarkdownContent content={text} />
            )
          ) : (
            <span className="text-sm text-muted-foreground">…</span>
          )}
        </div>

        {!isUser && text.trim() && !isStreaming ? (
          <div
            className={cn(
              "mt-1.5 flex items-center gap-1 transition-opacity duration-150",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                void handleCopy();
              }}
              aria-label={copied ? "Copied" : "Copy message"}
              title={copied ? "Copied" : "Copy"}
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
            </Button>

            {onRegenerate ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onRegenerate}
                aria-label="Regenerate response"
                title="Regenerate"
              >
                <RotateCcw className="size-3.5" aria-hidden />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
