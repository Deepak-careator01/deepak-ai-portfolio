import { cn } from "@/lib/utils";

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn("flex items-center gap-2 px-1 py-1", className)}
      role="status"
      aria-live="polite"
      aria-label="Deepak AI is responding"
    >
      <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-3 py-2" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${index * 160}ms`, animationDuration: "1s" }}
          />
        ))}
      </div>
    </div>
  );
}
