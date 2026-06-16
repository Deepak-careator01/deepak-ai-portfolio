import { cn } from "@/lib/utils";

type TechnologyBadgeProps = {
  label: string;
  className?: string;
};

export function TechnologyBadge({ label, className }: TechnologyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground/90",
        className,
      )}
    >
      {label}
    </span>
  );
}
