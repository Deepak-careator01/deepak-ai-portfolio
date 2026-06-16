/**
 * Core portfolio content models.
 * Shared by UI rendering, RAG ingestion, and AI agent tools.
 */

export type SectionId =
  | "hero"
  | "about"
  | "skills"
  | "experience"
  | "projects"
  | "blog"
  | "contact";

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  /** Lucide icon name for UI rendering */
  icon: string;
}

export interface ProfileHighlight {
  id: string;
  title: string;
  description: string;
  /** Lucide icon name for UI rendering */
  icon: string;
}

export interface Profile {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  /** Short bio for cards and AI context */
  summary: string;
  /** Longer narrative for About section and RAG chunks */
  bio: string;
  /** Personal journey narrative for the About section */
  journey: string;
  /** What you're currently building — surfaced in About */
  currentFocus: string;
  /** Core strengths as concise bullet points */
  strengths: string[];
  /** Highlight cards shown in the About section */
  highlights: ProfileHighlight[];
  location: string;
  email: string;
  avatarUrl?: string;
  resumeUrl?: string;
  socialLinks: SocialLink[];
  /** Anchor for copilot navigation tools */
  sectionAnchor: SectionId;
}

export interface Skill {
  id: string;
  name: string;
  /** Proficiency level for UI display (1–5) */
  level?: number;
  /** Plain-text description for AI retrieval */
  description?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  /** Category overview for cards and AI retrieval */
  description: string;
  /** Lucide icon name for UI rendering */
  icon: string;
  skills: Skill[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  /** Human-readable duration for UI, e.g. "Jan 2024 — Present" */
  duration: string;
  /** ISO-like date for sorting and RAG, e.g. "2024-01" */
  startDate: string;
  /** Omit when current role */
  endDate?: string;
  location?: string;
  /** Professional summary for cards and retrieval chunks */
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  current: boolean;
  sectionAnchor: SectionId;
}

/** @deprecated Use ProjectMeta from @/types/project for MDX-backed projects */
export type { ProjectMeta as Project } from "@/types/project";

/** @deprecated Use BlogMeta from @/types/blog for MDX-backed articles */
export type { BlogMeta as BlogPost } from "@/types/blog";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  sectionId?: SectionId;
}
