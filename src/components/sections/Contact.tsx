import { ExternalLink, FileText, Mail } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ContactLinkCard } from "@/components/shared/ContactLinkCard";
import { contact } from "@/content/contact";
import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/types/contact";

const CONTACT_TITLE_ID = "contact-heading";

const availabilityStyles: Record<AvailabilityStatus, string> = {
  available: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  limited: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  unavailable: "border-border bg-muted/50 text-muted-foreground",
};

export function Contact() {
  const mailtoHref = `mailto:${contact.email}`;

  return (
    <Section id="contact" labelledBy={CONTACT_TITLE_ID}>
      <Container size="wide">
        <SectionHeader
          eyebrow="Contact"
          title={contact.headline}
          description={contact.introduction}
          titleId={CONTACT_TITLE_ID}
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {contact.collaborationMessage}
            </p>

            <div
              className={cn(
                "inline-flex flex-col gap-1 rounded-2xl border px-4 py-3",
                availabilityStyles[contact.availability.status],
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full",
                    contact.availability.status === "available" && "bg-emerald-500",
                    contact.availability.status === "limited" && "bg-amber-500",
                    contact.availability.status === "unavailable" && "bg-muted-foreground",
                  )}
                />
                <p className="text-sm font-medium">{contact.availability.label}</p>
              </div>
              <p className="text-sm opacity-90">{contact.availability.description}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ContactLinkCard
              title="Email"
              description={contact.email}
              href={mailtoHref}
              icon={<Mail className="size-5 text-foreground/80" aria-hidden />}
            />
            <ContactLinkCard
              title="GitHub"
              description="Projects, code, and open-source work"
              href={contact.github}
              external
              icon={<ExternalLink className="size-5 text-foreground/80" aria-hidden />}
            />
            <ContactLinkCard
              title="LinkedIn"
              description="Professional background and network"
              href={contact.linkedin}
              external
              icon={<ExternalLink className="size-5 text-foreground/80" aria-hidden />}
            />
            {contact.resumeUrl ? (
              <ContactLinkCard
                title="Resume"
                description="Download CV and experience summary"
                href={contact.resumeUrl}
                external={contact.resumeUrl.startsWith("http")}
                icon={<FileText className="size-5 text-foreground/80" aria-hidden />}
              />
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
