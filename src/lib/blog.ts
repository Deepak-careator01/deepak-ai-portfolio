import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";

import { mdxComponents } from "@/components/mdx/mdx-components";
import type { BlogDocument, BlogMeta } from "@/types/blog";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

function parseBlogDocument(slug: string, raw: string): BlogDocument {
  const { data, content } = matter(raw);
  const meta = data as Omit<BlogMeta, "slug">;

  return {
    ...meta,
    slug,
    content,
  };
}

function readBlogFile(slug: string): BlogDocument | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return parseBlogDocument(slug, raw);
}

function getMdxSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function toBlogMeta(article: BlogDocument): BlogMeta {
  const {
    id,
    slug,
    title,
    description,
    summary,
    publishedDate,
    updatedDate,
    author,
    category,
    tags,
    featured,
    readingTime,
    coverImage,
    sectionAnchor,
  } = article;

  return {
    id,
    slug,
    title,
    description,
    summary,
    publishedDate,
    updatedDate,
    author,
    category,
    tags,
    featured,
    readingTime,
    coverImage,
    sectionAnchor,
  };
}

/** All articles sorted by publishedDate (newest first). */
export function getBlogs(): BlogMeta[] {
  return getMdxSlugs()
    .map((slug) => readBlogFile(slug))
    .filter((article): article is BlogDocument => article !== null)
    .map(toBlogMeta)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

/** Featured articles for the home page section. */
export function getFeaturedBlogs(): BlogMeta[] {
  return getBlogs().filter((article) => article.featured);
}

export function getBlogSlugs(): string[] {
  return getBlogs().map((article) => article.slug);
}

/** Load article metadata and raw MDX body by slug. */
export function getBlogBySlug(slug: string): BlogDocument | null {
  return readBlogFile(slug);
}

/** Plain-text representation for future RAG ingestion. */
export function getBlogPlainText(slug: string): string | null {
  const article = getBlogBySlug(slug);
  if (!article) return null;

  const { content, ...meta } = article;
  return [
    `Title: ${meta.title}`,
    `Summary: ${meta.summary}`,
    `Description: ${meta.description}`,
    `Category: ${meta.category}`,
    `Tags: ${meta.tags.join(", ")}`,
    `Author: ${meta.author}`,
    `Published: ${meta.publishedDate}`,
    ...(meta.updatedDate ? [`Updated: ${meta.updatedDate}`] : []),
    "",
    content,
  ].join("\n");
}

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
