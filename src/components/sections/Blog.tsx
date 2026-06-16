import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { BlogCard } from "@/components/shared/BlogCard";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedBlogs } from "@/lib/blog";
import { cn } from "@/lib/utils";

const BLOG_TITLE_ID = "blog-heading";

export function Blog() {
  const featuredArticles = getFeaturedBlogs();

  return (
    <Section id="blog" labelledBy={BLOG_TITLE_ID} className="border-b border-border/40">
      <Container size="wide">
        <SectionHeader
          eyebrow="Blog"
          title="Technical writing"
          description="Essays on agentic AI, retrieval systems, and modern full-stack engineering."
          titleId={BLOG_TITLE_ID}
        />

        {featuredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredArticles.map((article) => (
              <BlogCard key={article.id} article={article} highlighted />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Featured articles will appear here soon.</p>
        )}

        <div className="mt-10">
          <Link
            href="/blog"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            View all articles
          </Link>
        </div>
      </Container>
    </Section>
  );
}
