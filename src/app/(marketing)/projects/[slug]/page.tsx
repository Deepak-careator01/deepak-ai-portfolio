import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { compileProjectMDX, getProjectBySlug, getProjectSlugs } from "@/lib/projects";
import { createMetadata } from "@/lib/metadata";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return createMetadata({ title: "Project Not Found", noIndex: true });
  }

  return createMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const compiled = await compileProjectMDX(slug);

  if (!compiled) {
    notFound();
  }

  const { meta, content } = compiled;

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Container size="wide" className="py-12 md:py-16 lg:py-20">
          <ProjectHero project={meta} />
        </Container>

        <Container size="narrow" className="pb-20 md:pb-28">
          <article className="max-w-none">{content}</article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
