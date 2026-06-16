import type { SkillCategory } from "@/types/portfolio";

import { getLucideIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type SkillCardProps = {
  category: SkillCategory;
  className?: string;
};

export function SkillCard({ category, className }: SkillCardProps) {
  const Icon = getLucideIcon(category.icon);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60",
        "bg-gradient-to-br from-card/80 to-muted/15 p-6 shadow-sm",
        "transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--gradient-hero-start)_0%,_transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/60">
          <Icon className="size-5 text-foreground/80" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{category.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${category.title} skills`}>
          {category.skills.map((skill) => (
            <li key={skill.id}>
              <span className="inline-flex rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground/90">
                {skill.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
