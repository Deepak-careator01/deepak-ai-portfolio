import { cn } from "@/lib/utils";

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn("flex items-center gap-2 px-1 py-2", className)}
      role="status"
      aria-live="polite"
      aria-label="Deepak AI is thinking"
    >
      <div className="flex items-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
            style={{ animationDelay: `${index * 150}ms` }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">Deepak AI is thinking…</span>
    </div>
  );
}
