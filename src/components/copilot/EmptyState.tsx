import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "What projects has Deepak built?",
  "Explain AI Portfolio architecture",
  "What technologies does he use?",
] as const;

type EmptyStateProps = {
  onSuggestionClick: (prompt: string) => void;
  className?: string;
};

export function EmptyState({ onSuggestionClick, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-2 py-8 text-center", className)}>
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-b from-muted/50 to-muted/20 shadow-sm">
        <Sparkles className="size-6 text-foreground/80" aria-hidden />
      </div>

      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        Hi, I&apos;m Deepak AI
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Your guide to my portfolio — projects, experience, blog posts, and the tech behind this
        site. Pick a prompt below or ask anything.
      </p>

      <ul className="mt-8 flex w-full max-w-sm flex-col gap-2.5" aria-label="Suggested prompts">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              onClick={() => onSuggestionClick(prompt)}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-3.5 text-left text-sm text-foreground shadow-sm transition-all hover:border-border hover:bg-muted/30 hover:shadow focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
