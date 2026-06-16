import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { BlogCategoryBadge } from "@/components/shared/BlogCategoryBadge";
import { ReadingTime } from "@/components/shared/ReadingTime";
import { TechnologyBadge } from "@/components/shared/TechnologyBadge";
import { buttonVariants } from "@/components/ui/button";
import { formatPublishedDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { BlogMeta } from "@/types/blog";

type BlogCardProps = {
  article: BlogMeta;
  highlighted?: boolean;
  className?: string;
};

export function BlogCard({ article, highlighted = false, className }: BlogCardProps) {
  const articleHref = `/blog/${article.slug}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60",
        "bg-gradient-to-br from-card/80 to-muted/15 shadow-sm",
        "transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
        highlighted && "border-foreground/20 ring-1 ring-foreground/10",
        className,
      )}
    >
      <Link href={articleHref} className="block overflow-hidden">
        <div className="relative aspect-[16/10] w-full border-b border-border/40 bg-muted/20">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={`${article.title} cover`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gradient-hero-start)_0%,_transparent_65%)]"
            />
          )}
        </div>
      </Link>

      <div className="relative flex flex-1 flex-col p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-hero-start)_0%,_transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="relative flex flex-1 flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <BlogCategoryBadge category={article.category} />
            {highlighted ? (
              <span className="inline-flex rounded-full border border-foreground/20 bg-foreground/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
                Featured
              </span>
            ) : null}
          </div>

          <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            <Link href={articleHref} className="hover:underline underline-offset-4">
              {article.title}
            </Link>
          </h3>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <time dateTime={article.publishedDate}>
              {formatPublishedDate(article.publishedDate)}
            </time>
            <span aria-hidden>·</span>
            <ReadingTime minutes={article.readingTime} />
          </div>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${article.title} tags`}>
            {article.tags.map((tag) => (
              <li key={tag}>
                <TechnologyBadge label={tag} />
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              href={articleHref}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              Read Article
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
