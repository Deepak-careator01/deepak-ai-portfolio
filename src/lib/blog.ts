import "server-only";

import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";

import {
  getBlogBySlug,
  getBlogPlainText,
  getBlogSlugs,
  getBlogs,
  getFeaturedBlogs,
} from "@/lib/blog.reader";
import { mdxComponents } from "@/components/mdx/mdx-components";
import type { BlogMeta } from "@/types/blog";

export { getBlogBySlug, getBlogPlainText, getBlogSlugs, getBlogs, getFeaturedBlogs };

export type CompiledBlog = {
  meta: BlogMeta;
  content: ReactElement;
};

/** Compile MDX body for blog article pages (Server Components). */
export async function compileBlogMDX(slug: string): Promise<CompiledBlog | null> {
  const article = getBlogBySlug(slug);
  if (!article) return null;

  const { content: mdxSource, ...meta } = article;
  const { content } = await compileMDX({
    source: mdxSource,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  return { meta, content };
}
