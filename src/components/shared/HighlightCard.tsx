import { getLucideIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type HighlightCardProps = {
  title: string;
  description: string;
  icon: string;
  className?: string;
};

export function HighlightCard({ title, description, icon, className }: HighlightCardProps) {
  const Icon = getLucideIcon(icon);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60",
        "bg-gradient-to-br from-card/80 to-muted/20 p-6 shadow-sm",
        "transition-[border-color,box-shadow,background] duration-300",
        "hover:border-border hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-hero-start)_0%,_transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/60">
          <Icon className="size-5 text-foreground/80" aria-hidden />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </article>
  );
}
