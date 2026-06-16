import type { SectionId } from "@/types/portfolio";

export type ProjectStatus = "completed" | "in-progress" | "beta" | "archived";

export interface ProjectLinks {
  github?: string;
  live?: string;
}

/**
 * Project frontmatter — shared by listings, detail pages, RAG, and agent tools.
 */
export interface ProjectMeta {
  id: string;
  slug: string;
  title: string;
  summary: string;
  featured: boolean;
  status: ProjectStatus;
  technologies: string[];
  category: string;
  /** ISO-like date for sorting, e.g. "2024-06" */
  startDate: string;
  links: ProjectLinks;
  /** Path under /public, e.g. /images/projects/ai-portfolio.svg */
  image?: string;
  sectionAnchor: SectionId;
}

/** Raw project document including MDX body (for RAG ingestion). */
export interface ProjectDocument extends ProjectMeta {
  content: string;
}
