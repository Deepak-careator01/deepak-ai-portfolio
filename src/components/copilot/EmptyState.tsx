import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  { label: "Explore my projects", prompt: "Explore my projects" },
  { label: "Technical expertise", prompt: "What is your technical expertise?" },
  { label: "System design approach", prompt: "What is your system design approach?" },
  { label: "Professional experience", prompt: "Tell me about your professional experience" },
] as const;

type EmptyStateProps = {
  onSuggestionClick: (prompt: string) => void;
  className?: string;
};

export function EmptyState({ onSuggestionClick, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[min(280px,45vh)] flex-col items-center justify-center px-2 py-8 text-center",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">What would you like to know?</p>

      <div className="mt-5 flex max-w-sm flex-wrap justify-center gap-2" role="list" aria-label="Suggested prompts">
        {SUGGESTED_PROMPTS.map((item) => (
          <button
            key={item.prompt}
            type="button"
            role="listitem"
            onClick={() => onSuggestionClick(item.prompt)}
            className={cn(
              "rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-xs text-foreground",
              "transition-colors duration-150 hover:bg-muted/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
