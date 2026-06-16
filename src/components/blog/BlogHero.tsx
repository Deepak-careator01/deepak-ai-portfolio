import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BlogCategoryBadge } from "@/components/shared/BlogCategoryBadge";
import { ReadingTime } from "@/components/shared/ReadingTime";
import { TechnologyBadge } from "@/components/shared/TechnologyBadge";
import { buttonVariants } from "@/components/ui/button";
import { formatPublishedDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { BlogMeta } from "@/types/blog";

type BlogHeroProps = {
  article: BlogMeta;
  className?: string;
};

export function BlogHero({ article, className }: BlogHeroProps) {
  return (
    <header className={cn("border-b border-border/40", className)}>
      <div className="mb-8">
        <Link
          href="/blog"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to blog
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-12">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <BlogCategoryBadge category={article.category} />
            {article.featured ? (
              <span className="inline-flex rounded-full border border-foreground/20 bg-foreground/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
                Featured
              </span>
            ) : null}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {article.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>By {article.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedDate}>
              {formatPublishedDate(article.publishedDate)}
            </time>
            {article.updatedDate ? (
              <>
                <span aria-hidden>·</span>
                <span>Updated {formatPublishedDate(article.updatedDate)}</span>
              </>
            ) : null}
            <span aria-hidden>·</span>
            <ReadingTime minutes={article.readingTime} />
          </div>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Article tags">
            {article.tags.map((tag) => (
              <li key={tag}>
                <TechnologyBadge label={tag} />
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-sm">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={`${article.title} cover`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gradient-hero-start)_0%,_transparent_65%)]"
            />
          )}
        </div>
      </div>
    </header>
  );
}
