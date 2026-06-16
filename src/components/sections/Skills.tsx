import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { SkillCard } from "@/components/shared/SkillCard";
import { skillCategories } from "@/content/skills";

const SKILLS_TITLE_ID = "skills-heading";

export function Skills() {
  return (
    <Section id="skills" labelledBy={SKILLS_TITLE_ID} className="border-b border-border/40">
      <Container size="wide">
        <SectionHeader
          eyebrow="Skills"
          title="Tools, stacks, and domains"
          description="Technologies and areas I work with across AI engineering, full-stack development, and production delivery."
          titleId={SKILLS_TITLE_ID}
        />

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          {skillCategories.map((category) => (
            <SkillCard key={category.id} category={category} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
