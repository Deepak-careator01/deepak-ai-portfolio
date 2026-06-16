import type { NavItem, SocialLink } from "@/types/portfolio";

export const siteConfig = {
  name: "Deepak AI Portfolio",
  title: "Deepak M — AI Full-Stack Engineer",
  description:
    "AI-native portfolio showcasing full-stack engineering, agentic AI, and modern web development.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: "Deepak M",
  locale: "en_US",
  keywords: [
    "AI engineer",
    "full-stack developer",
    "Next.js",
    "TypeScript",
    "agentic AI",
    "portfolio",
  ],
} as const;

export const navLinks: NavItem[] = [
  { id: "about", label: "About", href: "/#about", sectionId: "about" },
  { id: "skills", label: "Skills", href: "/#skills", sectionId: "skills" },
  {
    id: "experience",
    label: "Experience",
    href: "/#experience",
    sectionId: "experience",
  },
  { id: "projects", label: "Projects", href: "/#projects", sectionId: "projects" },
  { id: "blog", label: "Blog", href: "/#blog", sectionId: "blog" },
  { id: "contact", label: "Contact", href: "/#contact", sectionId: "contact" },
];

export const socialLinks: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com",
    icon: "Github",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: "Linkedin",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    href: "https://twitter.com",
    icon: "Twitter",
  },
];
