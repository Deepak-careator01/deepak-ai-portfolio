import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ProjectStatusBadge } from "@/components/shared/ProjectStatusBadge";
import { TechnologyBadge } from "@/components/shared/TechnologyBadge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectMeta } from "@/types/project";

type ProjectHeroProps = {
  project: ProjectMeta;
  className?: string;
};

export function ProjectHero({ project, className }: ProjectHeroProps) {
  return (
    <header className={cn("border-b border-border/40", className)}>
      <div className="mb-8">
        <Link
          href="/#projects"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to projects
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-12">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {project.category}
            </span>
            <ProjectStatusBadge status={project.status} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {project.summary}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Project technologies">
            {project.technologies.map((tech) => (
              <li key={tech}>
                <TechnologyBadge label={tech} />
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.github ? (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                GitHub
              </a>
            ) : null}
            {project.links.live ? (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
              >
                <ExternalLink className="size-4" aria-hidden />
                Live Demo
              </a>
            ) : null}
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-sm">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} cover`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gradient-hero-start)_0%,_transparent_65%)]"
            />
          )}
        </div>
      </div>
    </header>
  );
}
