import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ExperienceCard } from "@/components/shared/ExperienceCard";
import { experience } from "@/content/experience";
import { sortExperience } from "@/lib/experience";
import { cn } from "@/lib/utils";

const EXPERIENCE_TITLE_ID = "experience-heading";

export function Experience() {
  const entries = sortExperience(experience);

  return (
    <Section id="experience" labelledBy={EXPERIENCE_TITLE_ID} className="border-b border-border/40">
      <Container size="wide">
        <SectionHeader
          eyebrow="Experience"
          title="Career journey"
          description="Roles, responsibilities, and outcomes across AI engineering and full-stack product development."
          titleId={EXPERIENCE_TITLE_ID}
        />

        <ol className="relative space-y-8 md:space-y-10">
          <div
            aria-hidden
            className="absolute top-2 bottom-2 left-[11px] w-px bg-border/80 md:left-[15px]"
          />

          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-10 md:pl-12">
              <div
                aria-hidden
                className="absolute top-7 left-0 flex size-6 items-center justify-center md:top-8 md:size-8"
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full ring-4 ring-background md:size-3",
                    entry.current
                      ? "bg-foreground"
                      : "bg-muted-foreground/60",
                  )}
                />
              </div>

              <ExperienceCard entry={entry} />
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
