"use client";

import type { ChatStatus } from "ai";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSend: (message: string) => Promise<void>;
  status: ChatStatus;
  prefill?: string;
  onPrefillConsumed?: () => void;
  className?: string;
};

export function ChatInput({
  onSend,
  status,
  prefill,
  onPrefillConsumed,
  className,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBusy = status === "submitted" || status === "streaming" || isSubmitting;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!prefill) {
      return;
    }

    setInput(prefill);
    onPrefillConsumed?.();
    textareaRef.current?.focus();
  }, [prefill, onPrefillConsumed]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy) {
      return;
    }

    setIsSubmitting(true);
    setInput("");

    try {
      await onSend(trimmed);
    } finally {
      setIsSubmitting(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className={cn("border-t border-border/60 bg-background/95 p-4", className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
        className="flex items-end gap-2"
      >
        <label htmlFor="copilot-chat-input" className="sr-only">
          Message Deepak AI
        </label>
        <textarea
          ref={textareaRef}
          id="copilot-chat-input"
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          disabled={isBusy}
          placeholder="Ask about projects, skills, experience..."
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isBusy || input.trim().length === 0}
          aria-label={isBusy ? "Sending message" : "Send message"}
          className="size-11 shrink-0 rounded-xl"
        >
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
        </Button>
      </form>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Enter to send · Shift + Enter for new line
      </p>
    </div>
  );
}
