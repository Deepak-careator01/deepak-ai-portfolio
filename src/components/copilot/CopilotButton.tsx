"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopilotButtonProps = {
  onClick: () => void;
  className?: string;
};

export function CopilotButton({ onClick, className }: CopilotButtonProps) {
  return (
    <div className={cn("group fixed bottom-6 right-6 z-40", className)}>
      <Button
        onClick={onClick}
        size="lg"
        className="h-12 gap-2 rounded-full px-5 shadow-lg shadow-black/10 dark:shadow-black/30"
        aria-haspopup="dialog"
        aria-label="Ask Deepak AI — open chat assistant"
      >
        <Sparkles className="size-4" aria-hidden />
        <span className="hidden sm:inline">Ask Deepak AI</span>
        <span className="sm:hidden">Ask AI</span>
      </Button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 bottom-full mb-2 hidden rounded-md border border-border/60 bg-background px-2 py-1 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:block"
      >
        AI Copilot — ask about my portfolio
      </span>
    </div>
  );
}
