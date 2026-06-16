import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { HighlightCard } from "@/components/shared/HighlightCard";
import { profile } from "@/content/profile";

const ABOUT_TITLE_ID = "about-heading";
const STRENGTHS_TITLE_ID = "about-strengths-heading";
const FOCUS_TITLE_ID = "about-focus-heading";

export function About() {
  return (
    <Section id="about" labelledBy={ABOUT_TITLE_ID} className="border-b border-border/40">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div>
            <SectionHeader
              eyebrow="About"
              title="Engineering with clarity and intent"
              description={profile.summary}
              titleId={ABOUT_TITLE_ID}
            />

            <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>{profile.bio}</p>
              <p>{profile.journey}</p>
            </div>

            <div className="mt-10">
              <h3
                id={FOCUS_TITLE_ID}
                className="text-sm font-medium tracking-widest text-muted-foreground uppercase"
              >
                What I&apos;m building now
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground/90 md:text-lg">
                {profile.currentFocus}
              </p>
            </div>

            <div className="mt-10">
              <h3
                id={STRENGTHS_TITLE_ID}
                className="text-sm font-medium tracking-widest text-muted-foreground uppercase"
              >
                Core strengths
              </h3>
              <ul
                className="mt-4 space-y-3"
                aria-labelledby={STRENGTHS_TITLE_ID}
              >
                {profile.strengths.map((strength) => (
                  <li
                    key={strength}
                    className="flex gap-3 text-sm leading-relaxed text-foreground/90 md:text-base"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/50"
                    />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            {profile.highlights.map((highlight) => (
              <HighlightCard
                key={highlight.id}
                title={highlight.title}
                description={highlight.description}
                icon={highlight.icon}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
