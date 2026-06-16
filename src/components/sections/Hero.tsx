import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { MotionReveal } from "@/components/shared/MotionReveal";
import { profile } from "@/content/profile";

/**
 * Hero placeholder — verifies layout system and content-driven architecture.
 * Final hero design will be implemented in Phase 1 feature work.
 */
export function Hero() {
  return (
    <Section id="hero" spacing="hero" className="border-b border-border/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gradient-hero-start)_0%,_transparent_55%)]" />
      <Container>
        <MotionReveal>
          <div className="relative max-w-3xl">
            <p className="mb-4 text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Portfolio
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-4 text-xl text-foreground/90 md:text-2xl">{profile.headline}</p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {profile.subheadline}
            </p>
          </div>
        </MotionReveal>
      </Container>
    </Section>
  );
}
