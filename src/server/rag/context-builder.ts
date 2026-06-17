import "server-only";

import type { PortfolioChunkType } from "@/server/rag/embeddings.impl";
import type { RetrievalChunk } from "@/server/rag/retriever";

const DEFAULT_MAX_CHUNK_CHARS = 900;
const DEFAULT_MAX_TOTAL_CHARS = 5_500;
const SECTION_ORDER: PortfolioChunkType[] = ["project", "blog", "experience"];

const SECTION_LABELS: Record<PortfolioChunkType, string> = {
  project: "Projects",
  blog: "Blog",
  experience: "Experience",
};

function resolveMaxChunkChars(): number {
  const configured = Number(process.env.RAG_MAX_CHUNK_CHARS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_CHUNK_CHARS;
}

function resolveMaxTotalChars(): number {
  const configured = Number(process.env.RAG_MAX_CONTEXT_CHARS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_TOTAL_CHARS;
}

function normalizeForDedup(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function compressContent(content: string, maxChars: number): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxChars - 3).trimEnd()}...`;
}

function isNearDuplicate(candidate: string, existing: string): boolean {
  const normalizedCandidate = normalizeForDedup(candidate);
  const normalizedExisting = normalizeForDedup(existing);

  if (!normalizedCandidate || !normalizedExisting) {
    return false;
  }

  if (normalizedCandidate === normalizedExisting) {
    return true;
  }

  if (
    normalizedCandidate.length > 120 &&
    normalizedExisting.includes(normalizedCandidate.slice(0, 120))
  ) {
    return true;
  }

  if (
    normalizedExisting.length > 120 &&
    normalizedCandidate.includes(normalizedExisting.slice(0, 120))
  ) {
    return true;
  }

  return false;
}

/** Removes overlapping or duplicate chunks while preserving highest scores. */
export function deduplicateChunks(chunks: RetrievalChunk[]): RetrievalChunk[] {
  const sorted = [...chunks].sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
  const unique: RetrievalChunk[] = [];

  for (const chunk of sorted) {
    const duplicate = unique.some(
      (existing) =>
        existing.id === chunk.id ||
        (existing.metadata.slug &&
          chunk.metadata.slug &&
          existing.metadata.slug === chunk.metadata.slug &&
          isNearDuplicate(existing.content, chunk.content)) ||
        isNearDuplicate(existing.content, chunk.content),
    );

    if (!duplicate) {
      unique.push(chunk);
    }
  }

  return unique;
}

function formatChunkLine(chunk: RetrievalChunk, maxChars: number): string {
  const label = [chunk.metadata.type, chunk.metadata.slug, chunk.id].filter(Boolean).join(" | ");
  const compressed = compressContent(chunk.content, maxChars);
  const score = chunk.score !== undefined ? ` (relevance: ${chunk.score.toFixed(2)})` : "";

  return `- [${label}]${score}\n${compressed}`;
}

/**
 * Builds structured, token-efficient RAG context grouped by content type.
 */
export function buildRagContext(chunks: RetrievalChunk[]): { context: string; charCount: number } {
  if (chunks.length === 0) {
    return { context: "", charCount: 0 };
  }

  const maxChunkChars = resolveMaxChunkChars();
  const maxTotalChars = resolveMaxTotalChars();
  const deduped = deduplicateChunks(chunks);

  const sections: string[] = [];
  let remaining = maxTotalChars;

  for (const type of SECTION_ORDER) {
    const typeChunks = deduped.filter((chunk) => chunk.metadata.type === type);
    if (typeChunks.length === 0) {
      continue;
    }

    const lines: string[] = [];
    for (const chunk of typeChunks) {
      const line = formatChunkLine(chunk, maxChunkChars);
      if (line.length > remaining) {
        break;
      }

      lines.push(line);
      remaining -= line.length + 1;
    }

    if (lines.length > 0) {
      sections.push(`### ${SECTION_LABELS[type]}\n${lines.join("\n\n")}`);
    }
  }

  const context = sections.join("\n\n");
  return { context, charCount: context.length };
}
