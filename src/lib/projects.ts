import "server-only";

import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";

import { mdxComponents } from "@/components/mdx/mdx-components";
import {
  getFeaturedProjects,
  getProjectBySlug,
  getProjectPlainText,
  getProjectSlugs,
  getProjects,
} from "@/lib/projects.reader";
import type { ProjectMeta } from "@/types/project";

export {
  getFeaturedProjects,
  getProjectBySlug,
  getProjectPlainText,
  getProjectSlugs,
  getProjects,
};

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
