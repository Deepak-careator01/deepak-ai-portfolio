"use client";

import type { ChatStatus } from "ai";
import { ArrowUp, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  canSendMessage,
  isMessageTooLong,
  MAX_MESSAGE_LENGTH,
  MESSAGE_TOO_LONG_ERROR,
  WARNING_MESSAGE_LENGTH,
} from "@/lib/copilot/chat-limits";
import { cn } from "@/lib/utils";

const TEXTAREA_MAX_HEIGHT_PX = 140;

type ChatInputProps = {
  onSend: (message: string) => Promise<void>;
  status: ChatStatus;
  prefill?: string;
  onPrefillConsumed?: () => void;
  disabled?: boolean;
  className?: string;
};

export function ChatInput({
  onSend,
  status,
  prefill,
  onPrefillConsumed,
  disabled = false,
  className,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onPrefillConsumedRef = useRef(onPrefillConsumed);
  onPrefillConsumedRef.current = onPrefillConsumed;

  const isBusy = status === "submitted" || status === "streaming" || isSubmitting;
  const isDisabled = disabled || isBusy;
  const trimmedLength = input.trim().length;
  const isTooLong = isMessageTooLong(input);
  const canSubmit = canSendMessage(input) && !isDisabled;
  const showCharCount =
    trimmedLength >= WARNING_MESSAGE_LENGTH || isTooLong || Boolean(validationError);
  const showHint = Boolean(validationError) || showCharCount;

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!prefill) {
      return;
    }

    setInput(prefill);
    setValidationError(null);
    onPrefillConsumedRef.current?.();
    textareaRef.current?.focus();
    adjustTextareaHeight();
  }, [prefill, adjustTextareaHeight]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (validationError && canSendMessage(value)) {
      setValidationError(null);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isDisabled) {
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
      adjustTextareaHeight();
    }
  };

  return (
    <div className={cn("shrink-0 px-3 pb-3 pt-2 sm:px-4 sm:pb-4", className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
        className="mx-auto max-w-2xl"
      >
        <label htmlFor="copilot-chat-input" className="sr-only">
          Message Deepak AI
        </label>

        <div
          className={cn(
            "flex items-end gap-1 rounded-xl border border-border/50 bg-muted/25 p-1.5",
            "transition-colors duration-150 focus-within:border-border focus-within:bg-muted/35",
          )}
        >
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
            disabled={isDisabled}
            placeholder="Ask anything…"
            aria-invalid={isTooLong || Boolean(validationError)}
            aria-describedby={showHint ? "copilot-chat-input-hint" : undefined}
            className={cn(
              "max-h-[140px] min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5",
              "text-sm leading-relaxed text-foreground placeholder:text-muted-foreground",
              "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            )}
            style={{ maxHeight: TEXTAREA_MAX_HEIGHT_PX }}
          />

          <Button
            type="submit"
            size="icon-sm"
            disabled={!canSubmit}
            aria-label={isBusy ? "Sending message" : "Send message"}
            className="mb-0.5 size-8 shrink-0 rounded-lg"
          >
            {isBusy ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <ArrowUp className="size-3.5" aria-hidden />
            )}
          </Button>
        </div>

        {showHint ? (
          <div className="mt-1.5 flex items-start justify-between gap-3 px-1">
            <p
              id="copilot-chat-input-hint"
              className={cn(
                "text-[11px] text-muted-foreground",
                validationError && "text-destructive",
              )}
            >
              {validationError ?? "Enter to send · Shift + Enter for new line"}
            </p>
            {showCharCount ? (
              <p
                className={cn(
                  "shrink-0 text-[11px] tabular-nums",
                  isTooLong
                    ? "text-destructive"
                    : trimmedLength >= WARNING_MESSAGE_LENGTH
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-muted-foreground",
                )}
                aria-live="polite"
              >
                {trimmedLength.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
              </p>
            ) : null}
          </div>
        ) : (
          <p id="copilot-chat-input-hint" className="sr-only">
            Enter to send. Shift plus Enter for a new line.
          </p>
        )}
      </form>
    </div>
  );
}
