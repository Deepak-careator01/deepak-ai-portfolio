import type { ProjectStatus } from "@/types/project";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  beta: "Beta",
  archived: "Archived",
};
