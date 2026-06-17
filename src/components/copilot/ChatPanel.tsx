"use client";

import { useChat } from "@ai-sdk/react";
import { Sparkles, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef } from "react";

import { ChatInput } from "@/components/copilot/ChatInput";
import { MessageList } from "@/components/copilot/MessageList";
import { Button } from "@/components/ui/button";
import { createCopilotChatTransport } from "@/lib/copilot/chat-transport";
import { cn } from "@/lib/utils";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(() => createCopilotChatTransport(), []);

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLButtonElement>("button[aria-label='Close chat panel']")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const handleSend = async (text: string) => {
    await sendMessage({ text });
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition-opacity duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/50 backdrop-blur-[2px]"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        aria-label="Close chat panel"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute right-0 bottom-0 flex w-full flex-col border border-border/60 bg-background shadow-2xl",
          "h-[min(100dvh,100%)] sm:right-4 sm:bottom-24 sm:h-[min(32rem,calc(100dvh-6rem))] sm:w-[28rem] sm:rounded-2xl",
          "transition-[transform,opacity] duration-200",
          open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
              <Sparkles className="size-5 text-foreground/80" aria-hidden />
            </div>
            <div>
              <h2 id={titleId} className="text-base font-semibold text-foreground">
                Ask Deepak AI
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                AI assistant for my portfolio
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close chat panel"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </header>

        {error ? (
          <div
            className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            role="alert"
          >
            Something went wrong. Please try again.
          </div>
        ) : null}

        <MessageList
          messages={messages}
          status={status}
          onSuggestionClick={(prompt) => {
            void handleSend(prompt);
          }}
        />

        <ChatInput onSend={handleSend} status={status} />
      </div>
    </div>
  );
}
