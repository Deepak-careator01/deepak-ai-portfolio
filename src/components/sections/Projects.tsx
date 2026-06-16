import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { getFeaturedProjects } from "@/lib/projects";

const PROJECTS_TITLE_ID = "projects-heading";

export function Projects() {
  const featuredProjects = getFeaturedProjects();

  return (
    <Section id="projects" labelledBy={PROJECTS_TITLE_ID} className="border-b border-border/40">
      <Container size="wide">
        <SectionHeader
          eyebrow="Projects"
          title="Featured work"
          description="Engineering case studies across AI-native applications, agent systems, and production full-stack products."
          titleId={PROJECTS_TITLE_ID}
        />

        {featuredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Featured projects will appear here soon.</p>
        )}
      </Container>
    </Section>
  );
}
