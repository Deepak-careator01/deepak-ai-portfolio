"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ChatErrorBanner } from "@/components/copilot/ChatErrorBanner";
import { ChatHeader } from "@/components/copilot/ChatHeader";
import { ChatInput } from "@/components/copilot/ChatInput";
import { ChatSidebar } from "@/components/copilot/ChatSidebar";
import { MessageList } from "@/components/copilot/MessageList";
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
    isChatReady,
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

  const handleSelectThread = useCallback((threadId: string) => {
    switchThread(threadId);
    setSidebarOpen(false);
  }, [switchThread]);

  const handlePrefillConsumed = useCallback(() => {
    setSuggestionPrefill(undefined);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition-opacity duration-150",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/25 dark:bg-black/50"
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
          "absolute right-0 bottom-0 flex w-full flex-col overflow-hidden bg-background shadow-2xl",
          "h-[min(100dvh,100%)] sm:right-4 sm:bottom-20 sm:h-[min(40rem,calc(100dvh-5rem))] sm:w-[min(48rem,calc(100vw-2rem))] sm:rounded-xl sm:border sm:border-border/50",
          "transition-[transform,opacity] duration-150 ease-out",
          open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        <ChatHeader
          titleId={titleId}
          onClose={onClose}
          showMobileMenu
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((current) => !current)}
        />

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
                className="absolute inset-0 z-10 bg-black/20 sm:hidden"
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
                className="absolute inset-y-0 left-0 z-20 w-[min(14rem,80vw)] shadow-xl sm:hidden"
              />
            </>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col bg-muted/10">
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
              onPrefillConsumed={handlePrefillConsumed}
              disabled={!isChatReady}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
