import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { BlogHero } from "@/components/blog/BlogHero";
import { compileBlogMDX, getBlogBySlug, getBlogSlugs } from "@/lib/blog";
import { createMetadata } from "@/lib/metadata";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = getBlogBySlug(slug);

  if (!article) {
    return createMetadata({ title: "Article Not Found", noIndex: true });
  }

  return createMetadata({
    title: article.title,
    description: article.description,
    path: `/blog/${article.slug}`,
    type: "article",
    image: article.coverImage,
    publishedTime: article.publishedDate,
    modifiedTime: article.updatedDate,
    tags: article.tags,
  });
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const compiled = await compileBlogMDX(slug);

  if (!compiled) {
    notFound();
  }

  const { meta, content } = compiled;

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Container size="wide" className="py-12 md:py-16 lg:py-20">
          <BlogHero article={meta} />
        </Container>

        <Container size="narrow" className="pb-20 md:pb-28">
          <article className="max-w-none">{content}</article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
