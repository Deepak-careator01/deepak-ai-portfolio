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
      className={cn("group/message w-full", className)}
      role="article"
      aria-label={isUser ? "Your message" : "Deepak AI message"}
    >
      {isUser ? (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl bg-muted/50 px-3.5 py-2 text-sm leading-relaxed text-foreground">
            <p className="whitespace-pre-wrap">{text}</p>
          </div>
        </div>
      ) : (
        <div className="max-w-none">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
            Deepak AI
          </div>
          <div className="text-sm leading-[1.7] text-foreground">
            {text.trim() ? (
              isStreaming ? (
                <p className="whitespace-pre-wrap">{text}</p>
              ) : (
                <MarkdownContent content={text} />
              )
            ) : (
              <span className="text-muted-foreground">…</span>
            )}
          </div>

          {text.trim() && !isStreaming ? (
            <div
              className={cn(
                "mt-1.5 flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-150",
                "sm:group-hover/message:opacity-100 sm:group-focus-within/message:opacity-100",
              )}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  void handleCopy();
                }}
                aria-label={copied ? "Copied" : "Copy message"}
              >
                {copied ? (
                  <Check className="size-3 text-emerald-600" aria-hidden />
                ) : (
                  <Copy className="size-3" aria-hidden />
                )}
              </Button>

              {onRegenerate ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={onRegenerate}
                  aria-label="Regenerate response"
                >
                  <RotateCcw className="size-3" aria-hidden />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
