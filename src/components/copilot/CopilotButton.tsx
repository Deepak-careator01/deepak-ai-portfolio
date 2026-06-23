"use client";

import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopilotButtonProps = {
  onClick: () => void;
  className?: string;
};

export function CopilotButton({ onClick, className }: CopilotButtonProps) {
  return (
    <div className={cn("fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6", className)}>
      <Button
        onClick={onClick}
        size="default"
        variant="secondary"
        className="h-10 gap-2 rounded-full border border-border/50 bg-background px-4 shadow-sm hover:bg-muted/50"
        aria-haspopup="dialog"
        aria-label="Open Deepak AI chat"
      >
        <MessageSquare className="size-4" aria-hidden />
        <span className="text-sm">Chat</span>
      </Button>
    </div>
  );
}
