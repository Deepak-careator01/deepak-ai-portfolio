import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { BlogCard } from "@/components/shared/BlogCard";
import { getBlogs, getFeaturedBlogs } from "@/lib/blog";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Technical articles on agentic AI, RAG systems, and modern full-stack engineering by Deepak M.",
  path: "/blog",
});

export default function BlogListingPage() {
  const articles = getBlogs();
  const featuredArticles = getFeaturedBlogs();
  const featuredIds = new Set(featuredArticles.map((article) => article.id));

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Container size="wide" className="py-12 md:py-16 lg:py-20">
          <header className="max-w-3xl">
            <p className="mb-3 text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Writing
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Technical blog
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Deep dives on AI engineering, retrieval systems, and building production-grade
              applications. Structured for clarity — and for future AI-assisted discovery.
            </p>
            <p className="mt-6">
              <Link
                href="/#blog"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Back to homepage section
              </Link>
            </p>
          </header>

          {featuredArticles.length > 0 ? (
            <section className="mt-14" aria-labelledby="featured-articles-heading">
              <h2
                id="featured-articles-heading"
                className="mb-6 text-sm font-medium tracking-widest text-muted-foreground uppercase"
              >
                Featured articles
              </h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredArticles.map((article) => (
                  <BlogCard key={article.id} article={article} highlighted />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-14" aria-labelledby="all-articles-heading">
            <h2
              id="all-articles-heading"
              className="mb-6 text-sm font-medium tracking-widest text-muted-foreground uppercase"
            >
              All articles
            </h2>
            {articles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {articles.map((article) => (
                  <BlogCard
                    key={article.id}
                    article={article}
                    highlighted={featuredIds.has(article.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Articles will appear here soon.</p>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
