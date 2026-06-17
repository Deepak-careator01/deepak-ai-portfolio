import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";

import { mdxComponents } from "@/components/mdx/mdx-components";
import type { ProjectDocument, ProjectMeta } from "@/types/project";

const PROJECTS_DIR = path.join(process.cwd(), "src/content/projects");

function parseProjectMeta(slug: string, raw: string): ProjectDocument {
  const { data, content } = matter(raw);
  const meta = data as Omit<ProjectMeta, "slug">;

  return {
    ...meta,
    slug,
    content,
  };
}

function readProjectFile(slug: string): ProjectDocument | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return parseProjectMeta(slug, raw);
}

function getMdxSlugs(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function toProjectMeta(project: ProjectDocument): ProjectMeta {
  const {
    id,
    slug,
    title,
    summary,
    featured,
    status,
    technologies,
    technologiesPlanned,
    category,
    startDate,
    links,
    image,
    sectionAnchor,
  } = project;

  return {
    id,
    slug,
    title,
    summary,
    featured,
    status,
    technologies,
    technologiesPlanned,
    category,
    startDate,
    links,
    image,
    sectionAnchor,
  };
}

/** All projects sorted by startDate (newest first). */
export function getProjects(): ProjectMeta[] {
  return getMdxSlugs()
    .map((slug) => readProjectFile(slug))
    .filter((project): project is ProjectDocument => project !== null)
    .map(toProjectMeta)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/** Featured projects for the home page showcase. */
export function getFeaturedProjects(): ProjectMeta[] {
  return getProjects().filter((project) => project.featured);
}

export function getProjectSlugs(): string[] {
  return getProjects().map((project) => project.slug);
}

/** Load project metadata and raw MDX body by slug. */
export function getProjectBySlug(slug: string): ProjectDocument | null {
  return readProjectFile(slug);
}

/** Plain-text representation for future RAG ingestion. */
export function getProjectPlainText(slug: string): string | null {
  const project = getProjectBySlug(slug);
  if (!project) return null;

  const { content, ...meta } = project;
  const sections = [
    `Title: ${meta.title}`,
    `Summary: ${meta.summary}`,
    `Category: ${meta.category}`,
    `Status: ${meta.status}`,
    "Technologies Used Today:",
    ...meta.technologies.map((tech) => `- ${tech}`),
  ];

  if (meta.technologiesPlanned && meta.technologiesPlanned.length > 0) {
    sections.push("Future Roadmap (planned):", ...meta.technologiesPlanned.map((tech) => `- ${tech}`));
  }

  sections.push("", content);

  return sections.join("\n");
}

export type CompiledProject = {
  meta: ProjectMeta;
  content: ReactElement;
};

/** Compile MDX body for project detail pages (Server Components). */
export async function compileProjectMDX(slug: string): Promise<CompiledProject | null> {
  const project = getProjectBySlug(slug);
  if (!project) return null;

  const { content: mdxSource, ...meta } = project;
  const { content } = await compileMDX({
    source: mdxSource,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  return { meta, content };
}
