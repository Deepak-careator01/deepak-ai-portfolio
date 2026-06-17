"use client";

import { MessageSquarePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatThreadUpdated, type CopilotThread } from "@/lib/copilot/thread-manager";
import { cn } from "@/lib/utils";

type ChatSidebarProps = {
  threads: CopilotThread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void;
  className?: string;
};

export function ChatSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  className,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-44 shrink-0 flex-col border-r border-border/60 bg-muted/10",
        className,
      )}
      aria-label="Chat history"
    >
      <div className="border-b border-border/60 p-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onNewChat}
        >
          <MessageSquarePlus className="size-4" aria-hidden />
          New chat
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Conversation threads">
        {threads.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">No conversations yet</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {threads.map((thread) => {
              const isActive = thread.id === activeThreadId;

              return (
                <li key={thread.id}>
                  <div
                    className={cn(
                      "group relative flex items-start rounded-lg transition-colors",
                      isActive ? "bg-muted/60" : "hover:bg-muted/40",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectThread(thread.id)}
                      className={cn(
                        "min-w-0 flex-1 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        isActive && "font-medium",
                      )}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span className="block truncate text-sm text-foreground">{thread.title}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {formatThreadUpdated(thread.lastUpdated)}
                      </span>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute top-2 right-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                      aria-label={`Delete ${thread.title}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}
