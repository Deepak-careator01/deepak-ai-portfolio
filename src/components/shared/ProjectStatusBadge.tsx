import { projectStatusLabels } from "@/lib/project-status";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
  className?: string;
};

const statusStyles: Record<ProjectStatus, string> = {
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "in-progress": "border-foreground/20 bg-foreground/10 text-foreground",
  beta: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  archived: "border-border bg-muted/50 text-muted-foreground",
};

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {projectStatusLabels[status]}
    </span>
  );
}
