"use client";

import { RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getChatErrorDetails } from "@/lib/copilot/chat-errors";
import { cn } from "@/lib/utils";

type ChatErrorBannerProps = {
  error: Error;
  onRetry: () => void;
  onDismiss: () => void;
  className?: string;
};

export function ChatErrorBanner({ error, onRetry, onDismiss, className }: ChatErrorBannerProps) {
  const { title, hint } = getChatErrorDetails(error);

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-destructive/20 bg-destructive/10 px-4 py-3",
        className,
      )}
      role="alert"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="mt-0.5 text-sm text-destructive/90">{hint}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 h-7 border-destructive/30 bg-background/80 text-destructive hover:bg-destructive/10"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Retry
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="shrink-0 text-destructive hover:bg-destructive/10"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
