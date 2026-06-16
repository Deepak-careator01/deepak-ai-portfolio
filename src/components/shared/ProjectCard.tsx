import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ProjectStatusBadge } from "@/components/shared/ProjectStatusBadge";
import { TechnologyBadge } from "@/components/shared/TechnologyBadge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectMeta } from "@/types/project";

type ProjectCardProps = {
  project: ProjectMeta;
  className?: string;
};

export function ProjectCard({ project, className }: ProjectCardProps) {
  const caseStudyHref = `/projects/${project.slug}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60",
        "bg-gradient-to-br from-card/80 to-muted/15 shadow-sm",
        "transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
        className,
      )}
    >
      <Link href={caseStudyHref} className="block overflow-hidden">
        <div className="relative aspect-[16/10] w-full border-b border-border/40 bg-muted/20">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} preview`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gradient-hero-start)_0%,_transparent_65%)]"
            />
          )}
        </div>
      </Link>

      <div className="relative flex flex-1 flex-col p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-hero-start)_0%,_transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="relative flex flex-1 flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {project.category}
            </span>
            <ProjectStatusBadge status={project.status} />
          </div>

          <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            <Link href={caseStudyHref} className="hover:underline underline-offset-4">
              {project.title}
            </Link>
          </h3>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {project.summary}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${project.title} technologies`}>
            {project.technologies.map((tech) => (
              <li key={tech}>
                <TechnologyBadge label={tech} />
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              href={caseStudyHref}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              View Case Study
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
