"use client";

import { History, Sparkles, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { ChatErrorBanner } from "@/components/copilot/ChatErrorBanner";
import { ChatInput } from "@/components/copilot/ChatInput";
import { ChatSidebar } from "@/components/copilot/ChatSidebar";
import { MessageList } from "@/components/copilot/MessageList";
import { Button } from "@/components/ui/button";
import { useCopilotChat } from "@/hooks/use-copilot-chat";
import { cn } from "@/lib/utils";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestionPrefill, setSuggestionPrefill] = useState<string | undefined>();

  const {
    activeThreadId,
    threads,
    messages,
    status,
    error,
    sendMessage,
    switchThread,
    createNewChat,
    deleteThread,
    retryLastResponse,
    regenerate,
    abortStream,
    clearError,
    showErrorBanner,
  } = useCopilotChat();

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

  useEffect(() => {
    if (!open) {
      abortStream();
      setSidebarOpen(false);
    }
  }, [open, abortStream]);

  const handleSelectThread = (threadId: string) => {
    switchThread(threadId);
    setSidebarOpen(false);
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
          "h-[min(100dvh,100%)] sm:right-4 sm:bottom-24 sm:h-[min(36rem,calc(100dvh-6rem))] sm:w-[min(42rem,calc(100vw-2rem))] sm:rounded-2xl",
          "transition-[transform,opacity] duration-200",
          open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              onClick={() => setSidebarOpen((current) => !current)}
              aria-label={sidebarOpen ? "Hide chat history" : "Show chat history"}
            >
              <History className="size-4" aria-hidden />
            </Button>

            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
              <Sparkles className="size-4 text-foreground/80" aria-hidden />
            </div>

            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-base font-semibold text-foreground">
                Ask Deepak AI
              </h2>
              <p className="truncate text-xs text-muted-foreground">Portfolio copilot</p>
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

        {showErrorBanner && error ? (
          <ChatErrorBanner
            error={error}
            onRetry={() => {
              void retryLastResponse();
            }}
            onDismiss={clearError}
          />
        ) : null}

        <div className="relative flex min-h-0 flex-1">
          <ChatSidebar
            threads={threads}
            activeThreadId={activeThreadId}
            onSelectThread={handleSelectThread}
            onNewChat={createNewChat}
            onDeleteThread={deleteThread}
            className="hidden sm:flex"
          />

          {sidebarOpen ? (
            <>
              <button
                type="button"
                className="absolute inset-0 z-10 bg-background/40 sm:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close chat history"
              />
              <ChatSidebar
                threads={threads}
                activeThreadId={activeThreadId}
                onSelectThread={handleSelectThread}
                onNewChat={() => {
                  createNewChat();
                  setSidebarOpen(false);
                }}
                onDeleteThread={deleteThread}
                className="absolute inset-y-0 left-0 z-20 shadow-lg sm:hidden"
              />
            </>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col">
            <MessageList
              messages={messages}
              status={status}
              onSuggestionClick={setSuggestionPrefill}
              onRegenerate={regenerate}
            />

            <ChatInput
              onSend={sendMessage}
              status={status}
              prefill={suggestionPrefill}
              onPrefillConsumed={() => setSuggestionPrefill(undefined)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
