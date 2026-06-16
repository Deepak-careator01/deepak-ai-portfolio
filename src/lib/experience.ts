import type { Experience } from "@/types/portfolio";

/** Sort experience entries newest-first using startDate. */
export function sortExperience(entries: Experience[]): Experience[] {
  return [...entries].sort((a, b) => b.startDate.localeCompare(a.startDate));
}
