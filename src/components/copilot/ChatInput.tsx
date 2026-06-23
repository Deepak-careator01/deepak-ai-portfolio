"use client";

import type { ChatStatus } from "ai";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  canSendMessage,
  isMessageTooLong,
  MAX_MESSAGE_LENGTH,
  MESSAGE_TOO_LONG_ERROR,
  WARNING_MESSAGE_LENGTH,
} from "@/lib/copilot/chat-limits";
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBusy = status === "submitted" || status === "streaming" || isSubmitting;
  const trimmedLength = input.trim().length;
  const isTooLong = isMessageTooLong(input);
  const canSubmit = canSendMessage(input) && !isBusy;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!prefill) {
      return;
    }

    setInput(prefill);
    setValidationError(null);
    onPrefillConsumed?.();
    textareaRef.current?.focus();
  }, [prefill, onPrefillConsumed]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (validationError && canSendMessage(value)) {
      setValidationError(null);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy) {
      return;
    }

    if (isMessageTooLong(input)) {
      setValidationError(MESSAGE_TOO_LONG_ERROR);
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      await onSend(trimmed);
      setInput("");
    } catch {
      // API errors are surfaced via useChat error state in the parent hook.
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
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (!canSubmit) {
                if (isTooLong) {
                  setValidationError(MESSAGE_TOO_LONG_ERROR);
                }
                return;
              }
              void handleSend();
            }
          }}
          disabled={isBusy}
          placeholder="Ask about projects, skills, experience..."
          aria-invalid={isTooLong || Boolean(validationError)}
          aria-describedby="copilot-chat-input-hint copilot-chat-char-count"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSubmit}
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
      <div className="mt-2 flex items-start justify-between gap-3">
        <p
          id="copilot-chat-input-hint"
          className={cn(
            "text-[11px]",
            validationError ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {validationError ?? "Enter to send · Shift + Enter for new line"}
        </p>
        <p
          id="copilot-chat-char-count"
          className={cn(
            "shrink-0 text-[11px] tabular-nums",
            isTooLong
              ? "text-destructive"
              : trimmedLength > WARNING_MESSAGE_LENGTH
                ? "text-amber-600 dark:text-amber-500"
                : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {trimmedLength.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
