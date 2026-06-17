import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "What AI projects have you built?",
  "Tell me about your experience.",
  "What technologies do you specialize in?",
] as const;

type EmptyStateProps = {
  onSuggestionClick: (prompt: string) => void;
  className?: string;
};

export function EmptyState({ onSuggestionClick, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-2 py-6 text-center", className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
        <Sparkles className="size-5 text-foreground/80" aria-hidden />
      </div>

      <h3 className="text-base font-semibold text-foreground">Hi, I&apos;m Deepak AI.</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Ask me about my projects, skills, experience, or blog posts. I answer using only what
        is in this portfolio.
      </p>

      <ul className="mt-6 flex w-full flex-col gap-2" aria-label="Suggested prompts">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              onClick={() => onSuggestionClick(prompt)}
              className="w-full rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
