import type { SectionId } from "@/types/portfolio";

/**
 * Blog frontmatter — shared by listings, detail pages, SEO, RAG, and agent tools.
 */
export interface BlogMeta {
  id: string;
  slug: string;
  title: string;
  /** SEO meta description */
  description: string;
  /** Card excerpt and AI summary */
  summary: string;
  /** ISO date string, e.g. "2025-03-15" */
  publishedDate: string;
  updatedDate?: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  /** Estimated reading time in minutes */
  readingTime: number;
  /** Path under /public, e.g. /images/blog/article.svg */
  coverImage?: string;
  sectionAnchor: SectionId;
}

/** Raw blog document including MDX body (for RAG ingestion). */
export interface BlogDocument extends BlogMeta {
  content: string;
}
