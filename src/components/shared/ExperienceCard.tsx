import type { Experience } from "@/types/portfolio";

import { cn } from "@/lib/utils";

type ExperienceCardProps = {
  entry: Experience;
  className?: string;
};

export function ExperienceCard({ entry, className }: ExperienceCardProps) {
  const responsibilitiesId = `${entry.id}-responsibilities`;
  const technologiesId = `${entry.id}-technologies`;
  const achievementsId = `${entry.id}-achievements`;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card/80 to-muted/15 p-6 shadow-sm md:p-7",
        entry.current
          ? "border-foreground/20 ring-1 ring-foreground/10"
          : "border-border/60",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-hero-start)_0%,_transparent_60%)]",
          entry.current ? "opacity-60" : "opacity-30",
        )}
      />

      <div className="relative">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                {entry.role}
              </h3>
              {entry.current ? (
                <span className="inline-flex rounded-full border border-foreground/20 bg-foreground/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
                  Current
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-base font-medium text-foreground/90">{entry.company}</p>
          </div>

          <div className="text-sm text-muted-foreground sm:text-right">
            <p>{entry.duration}</p>
            {entry.location ? <p className="mt-0.5">{entry.location}</p> : null}
          </div>
        </header>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
          {entry.description}
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <h4
              id={responsibilitiesId}
              className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
            >
              Key responsibilities
            </h4>
            <ul className="mt-3 space-y-2" aria-labelledby={responsibilitiesId}>
              {entry.responsibilities.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-foreground/90"
                >
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/70"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              id={technologiesId}
              className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
            >
              Technologies
            </h4>
            <ul
              className="mt-3 flex flex-wrap gap-2"
              aria-labelledby={technologiesId}
            >
              {entry.technologies.map((tech) => (
                <li key={tech}>
                  <span className="inline-flex rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground/90">
                    {tech}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              id={achievementsId}
              className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
            >
              Achievements
            </h4>
            <ul className="mt-3 space-y-2" aria-labelledby={achievementsId}>
              {entry.achievements.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-foreground/90"
                >
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
