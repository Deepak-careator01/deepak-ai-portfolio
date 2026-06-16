import type { SectionId } from "@/types/portfolio";

export type AvailabilityStatus = "available" | "limited" | "unavailable";

export interface ContactAvailability {
  status: AvailabilityStatus;
  label: string;
  description: string;
}

/**
 * Contact content — single source of truth for the Contact section and CTAs.
 * Consumed by UI, RAG ingestion, and future agent tools.
 */
export interface ContactInfo {
  id: string;
  headline: string;
  introduction: string;
  collaborationMessage: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl?: string;
  availability: ContactAvailability;
  sectionAnchor: SectionId;
}
