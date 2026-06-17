import "server-only";

import { profile } from "@/content/profile";
import { skillCategories } from "@/content/skills";
import { experience } from "@/content/experience";
import { getProjects } from "@/lib/projects";
import { getBlogs } from "@/lib/blog";

/**
 * Flattens the structured portfolio content into a single text document
 * that can be passed as context to the AI model.
 *
 * This is intentionally deterministic and easy to regenerate, so the same
 * data can be reused for:
 * - System prompts
 * - RAG ingestion
 * - Agent tools that need a quick, human-readable snapshot
 */
export function getPortfolioContext(): string {
  const lines: string[] = [];

  lines.push("=== Deepak M — Portfolio Overview ===");
  lines.push("");

  // Profile
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

  // Skills
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

  // Experience
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

  // Projects
  const projects = getProjects();
  lines.push("## Projects");
  for (const project of projects) {
    lines.push("");
    lines.push(`### ${project.title}`);
    lines.push(`Slug: ${project.slug}`);
    lines.push(`Category: ${project.category}`);
    lines.push(`Status: ${project.status}`);
    lines.push(`Summary: ${project.summary}`);
    if (project.technologies.length > 0) {
      lines.push(`Technologies: ${project.technologies.join(", ")}`);
    }
  }
  lines.push("");

  // Blog posts
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

