import { cn } from "@/lib/utils";

type BlogCategoryBadgeProps = {
  category: string;
  className?: string;
};

export function BlogCategoryBadge({ category, className }: BlogCategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-medium tracking-wide text-foreground/90 uppercase",
        className,
      )}
    >
      {category}
    </span>
  );
}
