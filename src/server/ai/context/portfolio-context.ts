import "server-only";

import { experience } from "@/content/experience";
import { profile } from "@/content/profile";
import { skillCategories } from "@/content/skills";
import { getBlogs } from "@/lib/blog";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import type { ProjectStatus } from "@/types/project";

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress (active development)",
  beta: "Beta",
  archived: "Archived",
};

function formatProjectStatus(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status];
}

/**
 * Flattens structured portfolio content into a single text document for AI context.
 *
 * Deterministic and easy to regenerate — reusable for prompts, RAG ingestion,
 * and future agent tools that need a human-readable snapshot.
 *
 * Projects preserve implementation status: technologies in production are listed
 * separately from planned roadmap items and case study body content.
 */
export function getPortfolioContext(): string {
  const lines: string[] = [];

  lines.push("=== Deepak M — Portfolio Overview ===");
  lines.push("");
  lines.push("## Implementation Status Guidance");
  lines.push(
    "When answering architecture questions, distinguish 'Technologies Used Today' from 'Future Roadmap'.",
  );
  lines.push(
    "Only describe roadmap items as planned — never as currently built unless explicitly under current implementation.",
  );
  lines.push("");

  lines.push("## Profile");
  lines.push(`Name: ${profile.name}`);
  lines.push(`Headline: ${profile.headline}`);
  lines.push(`Subheadline: ${profile.subheadline}`);
  lines.push(`Location: ${profile.location}`);
  lines.push("");
  lines.push("Summary:");
  lines.push(profile.summary);
  lines.push("");
  lines.push("Bio:");
  lines.push(profile.bio);
  lines.push("");
  lines.push("Journey:");
  lines.push(profile.journey);
  lines.push("");
  lines.push("Current focus:");
  lines.push(profile.currentFocus);
  lines.push("");
  lines.push("Core strengths:");
  for (const strength of profile.strengths) {
    lines.push(`- ${strength}`);
  }
  lines.push("");

  lines.push("## Skills");
  for (const category of skillCategories) {
    lines.push("");
    lines.push(`### ${category.title}`);
    lines.push(category.description);
    if (category.skills.length > 0) {
      lines.push("Skills:");
      for (const skill of category.skills) {
        lines.push(`- ${skill.name}`);
      }
    }
  }
  lines.push("");

  lines.push("## Experience Timeline");
  for (const role of experience) {
    lines.push("");
    lines.push(
      `### ${role.role} @ ${role.company} (${role.duration}${
        role.location ? `, ${role.location}` : ""
      })`,
    );
    lines.push(`Current role: ${role.current ? "yes" : "no"}`);
    lines.push("Summary:");
    lines.push(role.description);
    if (role.responsibilities.length > 0) {
      lines.push("Key responsibilities:");
      for (const item of role.responsibilities) {
        lines.push(`- ${item}`);
      }
    }
    if (role.technologies.length > 0) {
      lines.push(`Technologies: ${role.technologies.join(", ")}`);
    }
    if (role.achievements.length > 0) {
      lines.push("Achievements:");
      for (const item of role.achievements) {
        lines.push(`- ${item}`);
      }
    }
  }
  lines.push("");

  const projects = getProjects();
  lines.push("## Projects");
  for (const project of projects) {
    const document = getProjectBySlug(project.slug);

    lines.push("");
    lines.push(`### ${project.title}`);
    lines.push(`Slug: ${project.slug}`);
    lines.push(`Category: ${project.category}`);
    lines.push(`Project Status: ${formatProjectStatus(project.status)}`);
    lines.push(`Summary: ${project.summary}`);

    if (project.technologies.length > 0) {
      lines.push("Technologies Used Today:");
      for (const tech of project.technologies) {
        lines.push(`- ${tech}`);
      }
    }

    if (project.technologiesPlanned && project.technologiesPlanned.length > 0) {
      lines.push("Future Roadmap (planned — not yet implemented):");
      for (const tech of project.technologiesPlanned) {
        lines.push(`- ${tech}`);
      }
    }

    if (document?.content.trim()) {
      lines.push("");
      lines.push("Current Implementation and Case Study Details:");
      lines.push(document.content.trim());
    }
  }
  lines.push("");

  const blogs = getBlogs();
  lines.push("## Blog Articles");
  for (const article of blogs) {
    lines.push("");
    lines.push(`### ${article.title}`);
    lines.push(`Slug: ${article.slug}`);
    lines.push(`Category: ${article.category}`);
    lines.push(`Published: ${article.publishedDate}`);
    if (article.tags.length > 0) {
      lines.push(`Tags: ${article.tags.join(", ")}`);
    }
    lines.push(`Summary: ${article.summary}`);
  }

  lines.push("");
  lines.push("=== End of Portfolio Context ===");

  return lines.join("\n");
}
