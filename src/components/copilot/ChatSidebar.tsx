"use client";

import { Plus, Trash2 } from "lucide-react";

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
        "flex w-[11.5rem] shrink-0 flex-col border-r border-border/40 bg-muted/20",
        className,
      )}
      aria-label="Chat history"
    >
      <div className="p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 px-2 text-xs font-normal text-foreground hover:bg-muted/50"
          onClick={onNewChat}
        >
          <Plus className="size-3.5" aria-hidden />
          New chat
        </Button>
      </div>

      <nav
        className="copilot-scrollbar flex-1 overflow-y-auto px-1.5 pb-2"
        aria-label="Conversation threads"
      >
        {threads.length === 0 ? (
          <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">No chats yet</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {threads.map((thread) => {
              const isActive = thread.id === activeThreadId;

              return (
                <li key={thread.id}>
                  <div
                    className={cn(
                      "group relative flex items-center rounded-md transition-colors duration-150",
                      isActive ? "bg-muted/50" : "hover:bg-muted/30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectThread(thread.id)}
                      className={cn(
                        "min-w-0 flex-1 px-2 py-1.5 text-left",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      )}
                      aria-current={isActive ? "true" : undefined}
                      title={`${thread.title} · ${formatThreadUpdated(thread.lastUpdated)}`}
                    >
                      <span
                        className={cn(
                          "block truncate text-xs",
                          isActive ? "font-medium text-foreground" : "text-foreground/80",
                        )}
                      >
                        {thread.title}
                      </span>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className={cn(
                        "mr-0.5 h-6 w-6 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-150",
                        "group-hover:opacity-100 group-focus-within:opacity-100",
                        "hover:text-foreground",
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                      aria-label={`Delete ${thread.title}`}
                    >
                      <Trash2 className="size-3" aria-hidden />
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
