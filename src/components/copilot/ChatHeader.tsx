"use client";

import { History, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatHeaderProps = {
  titleId: string;
  onClose: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  showMobileMenu?: boolean;
  className?: string;
};

export function ChatHeader({
  titleId,
  onClose,
  onToggleSidebar,
  sidebarOpen = false,
  showMobileMenu = false,
  className,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-3 py-2.5 sm:px-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {showMobileMenu ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground sm:hidden"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Hide chat history" : "Show chat history"}
          >
            <History className="size-4" aria-hidden />
          </Button>
        ) : null}

        <h2 id={titleId} className="truncate text-sm font-medium text-foreground">
          Deepak AI
        </h2>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label="Close chat panel"
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </header>
  );
}
