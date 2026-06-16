import type { ContactInfo } from "@/types/contact";

/**
 * Contact content — structured for UI rendering and AI retrieval.
 */
export const contact: ContactInfo = {
  id: "contact-deepak",
  headline: "Let's build intelligent systems together",
  introduction:
    "I'm open to conversations about AI engineering, full-stack product work, and ambitious technical collaborations.",
  collaborationMessage:
    "Whether you're hiring, exploring a partnership, or want feedback on an AI-native product idea — I'd love to hear from you.",
  email: "hello@deepak.dev",
  github: "https://github.com/deepakm",
  linkedin: "https://linkedin.com/in/deepakm",
  resumeUrl: "/resume.pdf",
  availability: {
    status: "available",
    label: "Available for opportunities",
    description: "Open to full-time roles, contract work, and selective consulting engagements.",
  },
  sectionAnchor: "contact",
};
