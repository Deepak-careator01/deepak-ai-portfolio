"use client";

import { Sparkles, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopilotPlaceholderProps = {
  open: boolean;
  onClose: () => void;
};

export function CopilotPlaceholder({ open, onClose }: CopilotPlaceholderProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

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
        aria-label="Close copilot panel"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute right-4 bottom-24 w-[min(100vw-2rem,24rem)] rounded-2xl border border-border/60 bg-background p-5 shadow-xl",
          "transition-[transform,opacity] duration-200",
          open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
              <Sparkles className="size-5 text-foreground/80" aria-hidden />
            </div>
            <div>
              <h2 id={titleId} className="text-base font-semibold text-foreground">
                AI Copilot
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Coming soon in Phase 2</p>
            </div>
          </div>
          <Button
            ref={closeRef}
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close copilot panel"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          The Deepak AI Copilot will understand this portfolio, answer questions about projects
          and experience, and guide you to relevant sections — powered by RAG and LangGraph
          agent tooling.
        </p>
      </div>
    </div>
  );
}
