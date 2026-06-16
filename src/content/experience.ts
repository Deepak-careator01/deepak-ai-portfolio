import type { Experience } from "@/types/portfolio";

/**
 * Experience timeline — structured for timeline UI and AI agent tools.
 */
export const experience: Experience[] = [
  {
    id: "exp-current",
    company: "Independent",
    role: "AI Full-Stack Engineer",
    duration: "Jan 2024 — Present",
    startDate: "2024-01",
    location: "Remote",
    current: true,
    description:
      "Building AI-native portfolio and agentic copilot experiences with Next.js, TypeScript, and LangGraph.",
    responsibilities: [
      "Architect content-driven portfolios designed for RAG ingestion and agent tooling",
      "Implement streaming AI chat with the Vercel AI SDK",
      "Design scalable Next.js folder structures for production applications",
      "Define TypeScript content models shared by UI, retrieval, and copilot tools",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Vercel AI SDK",
      "LangGraph.js",
      "PostgreSQL",
      "pgvector",
    ],
    achievements: [
      "Established a strict content-layer architecture reusable across UI and AI pipelines",
      "Designed phased roadmap from portfolio UI to agentic copilot with tools and memory",
    ],
    sectionAnchor: "experience",
  },
  {
    id: "exp-fullstack",
    company: "Previous Organization",
    role: "Full-Stack Developer",
    duration: "Jun 2021 — Dec 2023",
    startDate: "2021-06",
    endDate: "2023-12",
    location: "Remote",
    current: false,
    description:
      "Delivered full-stack features across React frontends and API backends in agile product teams.",
    responsibilities: [
      "Shipped responsive web applications with accessibility and performance focus",
      "Collaborated on API design and database schema evolution",
      "Built and maintained shared component libraries for product teams",
      "Participated in code reviews, sprint planning, and technical design discussions",
    ],
    technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
    achievements: [
      "Improved developer experience through reusable UI primitives and documentation",
      "Contributed to performance optimizations on high-traffic product surfaces",
    ],
    sectionAnchor: "experience",
  },
  {
    id: "exp-early",
    company: "Earlier Role",
    role: "Software Developer",
    duration: "2019 — May 2021",
    startDate: "2019-01",
    endDate: "2021-05",
    location: "India",
    current: false,
    description:
      "Developed web features and internal tools while strengthening fundamentals in JavaScript, APIs, and product delivery.",
    responsibilities: [
      "Implemented UI components and form workflows for internal dashboards",
      "Integrated third-party APIs and handled error states for production reliability",
      "Wrote unit tests and supported QA during release cycles",
    ],
    technologies: ["JavaScript", "React", "Node.js", "SQL"],
    achievements: [
      "Gained end-to-end ownership of features from requirements through deployment",
    ],
    sectionAnchor: "experience",
  },
];
