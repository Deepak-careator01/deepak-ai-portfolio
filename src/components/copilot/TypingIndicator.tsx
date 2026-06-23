import { cn } from "@/lib/utils";

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("py-1", className)} role="status" aria-live="polite" aria-label="Deepak AI is responding">
      <p className="text-sm leading-[1.7] text-muted-foreground">Thinking…</p>
    </div>
  );
}
