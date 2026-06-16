import type { SkillCategory } from "@/types/portfolio";

/**
 * Skills content — structured for UI grids and AI retrieval.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: "ai-engineering",
    title: "AI Engineering",
    description:
      "Designing intelligent systems with LLMs, retrieval, and agent orchestration.",
    icon: "Brain",
    skills: [
      { id: "llm-apps", name: "LLM Applications" },
      { id: "agentic-ai", name: "Agentic AI" },
      { id: "rag", name: "RAG" },
      { id: "langgraph", name: "LangGraph" },
      { id: "prompt-engineering", name: "Prompt Engineering" },
    ],
  },
  {
    id: "full-stack",
    title: "Full Stack",
    description: "Building polished, performant web applications from UI to API.",
    icon: "Code2",
    skills: [
      { id: "nextjs", name: "Next.js" },
      { id: "react", name: "React" },
      { id: "typescript", name: "TypeScript" },
      { id: "apis", name: "APIs" },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    description: "Reliable services, data modeling, and integration layers.",
    icon: "Database",
    skills: [
      { id: "python", name: "Python" },
      { id: "fastapi", name: "FastAPI" },
      { id: "databases", name: "Databases" },
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    description: "Shipping and operating applications with modern CI/CD workflows.",
    icon: "Cloud",
    skills: [
      { id: "docker", name: "Docker" },
      { id: "github-actions", name: "GitHub Actions" },
      { id: "vercel", name: "Vercel" },
    ],
  },
];
