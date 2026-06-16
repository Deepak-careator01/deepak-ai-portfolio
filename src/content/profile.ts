import type { Profile } from "@/types/portfolio";

import { socialLinks } from "@/lib/constants";

/**
 * Profile content — single source of truth for personal information.
 * Consumed by UI sections, RAG ingestion, and AI agent tools.
 */
export const profile: Profile = {
  id: "profile-deepak",
  name: "Deepak M",
  headline: "AI Full-Stack Engineer",
  subheadline: "Building intelligent, production-grade web experiences",
  summary:
    "Full-stack engineer specializing in AI-native applications, modern TypeScript stacks, and agentic systems.",
  bio: "I design and ship production-quality web applications that blend polished user experiences with intelligent AI capabilities. My work spans Next.js, TypeScript, and agentic AI architectures — from retrieval-augmented assistants to tool-using copilots that understand complex domain data.",
  journey:
    "I started in full-stack web development, shipping user-facing products end to end. Over time, my focus shifted toward AI-native systems — combining strong engineering fundamentals with LLMs, retrieval, and agent workflows to build assistants that feel genuinely useful.",
  currentFocus:
    "Deepak AI Portfolio — an AI-native portfolio with a copilot that understands my work, powered by RAG and LangGraph agent tooling.",
  strengths: [
    "Designing content-driven architectures ready for RAG and agents",
    "Shipping type-safe full-stack apps with Next.js and TypeScript",
    "Building streaming AI experiences with thoughtful UX",
    "Translating complex technical work into clear product narratives",
  ],
  highlights: [
    {
      id: "highlight-ai",
      title: "AI Engineering",
      description:
        "LLM applications, retrieval-augmented generation, and agentic workflows with tools and memory.",
      icon: "Sparkles",
    },
    {
      id: "highlight-fullstack",
      title: "Full Stack Development",
      description:
        "Modern React and Next.js applications with server components, APIs, and production deployments.",
      icon: "Layers",
    },
    {
      id: "highlight-focus",
      title: "Current Focus",
      description:
        "An AI-native portfolio copilot that can answer questions, explain projects, and guide visitors.",
      icon: "Target",
    },
  ],
  location: "India",
  email: "hello@deepak.dev",
  sectionAnchor: "about",
  socialLinks,
};
