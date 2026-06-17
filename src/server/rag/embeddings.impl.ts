import { createOpenAI } from "@ai-sdk/openai";
import { embed, embedMany, type EmbeddingModel } from "ai";

import { experience } from "@/content/experience";
import { getBlogBySlug, getBlogs } from "@/lib/blog.reader";
import { getProjectBySlug, getProjects } from "@/lib/projects.reader";
import { env } from "@/server/config/env";

/** Supported embedding providers — extend when Groq or others add embedding APIs. */
export type EmbeddingProviderName = "openai";

export type PortfolioChunkType = "project" | "blog" | "experience";

export type PortfolioChunkMetadata = {
  type: PortfolioChunkType;
  slug?: string;
};

export type PortfolioChunk = {
  id: string;
  content: string;
  metadata: PortfolioChunkMetadata;
};

export type EmbedDocumentInput<TMetadata = Record<string, unknown>> = {
  id: string;
  content: string;
  metadata: TMetadata;
};

export type EmbeddedDocument<TMetadata = Record<string, unknown>> = EmbedDocumentInput<TMetadata> & {
  embedding: number[];
};

const DEFAULT_EMBEDDING_PROVIDER: EmbeddingProviderName = "openai";
const DEFAULT_OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_BATCH_SIZE = 64;
const MAX_CHUNK_CHARACTERS = 2_000;

/**
 * Normalizes text for deterministic embedding input.
 * Trims edges, collapses whitespace, and standardizes line breaks.
 */
export function normalizeTextForEmbedding(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00A0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/** Light MDX/markdown cleanup before chunking — keeps semantic structure. */
function cleanContentForChunking(content: string): string {
  return normalizeTextForEmbedding(
    content
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
  );
}

function resolveEmbeddingProviderName(): EmbeddingProviderName {
  const configured = env.embeddingProvider?.toLowerCase();

  if (!configured || configured === DEFAULT_EMBEDDING_PROVIDER) {
    return DEFAULT_EMBEDDING_PROVIDER;
  }

  throw new Error(
    `Unsupported embedding provider "${configured}". Supported providers: openai.`,
  );
}

function resolveEmbeddingApiKey(): string {
  const apiKey = env.embeddingApiKey ?? env.openAiApiKey;

  if (!apiKey) {
    throw new Error(
      "Embeddings are not configured. Set OPENAI_API_KEY or EMBEDDING_API_KEY.",
    );
  }

  return apiKey;
}

/** Returns true when an embedding provider API key is available. */
export function isEmbeddingsConfigured(): boolean {
  return env.embeddingsConfigured;
}

/**
 * Creates the active embedding model.
 *
 * Groq does not expose an embeddings API today, so OpenAI is the default provider.
 * Chat remains on Groq — only the RAG embedding step uses this module.
 */
export function createEmbeddingModel(
  provider: EmbeddingProviderName = resolveEmbeddingProviderName(),
): EmbeddingModel {
  if (provider === "openai") {
    const openai = createOpenAI({
      apiKey: resolveEmbeddingApiKey(),
    });

    const modelId = env.embeddingModel ?? DEFAULT_OPENAI_EMBEDDING_MODEL;
    return openai.embedding(modelId);
  }

  throw new Error(`Unsupported embedding provider: ${provider satisfies never}`);
}

let cachedEmbeddingModel: EmbeddingModel | null = null;

function getEmbeddingModel(): EmbeddingModel {
  if (!cachedEmbeddingModel) {
    cachedEmbeddingModel = createEmbeddingModel();
  }

  return cachedEmbeddingModel;
}

/** Embeds a single normalized text string. */
export async function embedText(text: string): Promise<number[]> {
  const normalized = normalizeTextForEmbedding(text);

  if (!normalized) {
    throw new Error("Cannot embed empty text.");
  }

  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: normalized,
  });

  return embedding;
}

/**
 * Embeds multiple documents with batching support.
 * Content is normalized before embedding; empty documents are skipped.
 */
export async function embedDocuments<TMetadata = Record<string, unknown>>(
  docs: EmbedDocumentInput<TMetadata>[],
): Promise<EmbeddedDocument<TMetadata>[]> {
  if (docs.length === 0) {
    return [];
  }

  const prepared = docs
    .map((doc) => ({
      ...doc,
      content: normalizeTextForEmbedding(doc.content),
    }))
    .filter((doc) => doc.content.length > 0);

  if (prepared.length === 0) {
    return [];
  }

  const embedded: EmbeddedDocument<TMetadata>[] = [];

  for (let index = 0; index < prepared.length; index += DEFAULT_BATCH_SIZE) {
    const batch = prepared.slice(index, index + DEFAULT_BATCH_SIZE);
    const { embeddings } = await embedMany({
      model: getEmbeddingModel(),
      values: batch.map((doc) => doc.content),
    });

    for (let batchIndex = 0; batchIndex < batch.length; batchIndex += 1) {
      const doc = batch[batchIndex];
      const embedding = embeddings[batchIndex];

      if (!embedding) {
        throw new Error(`Missing embedding for document "${doc.id}".`);
      }

      embedded.push({
        ...doc,
        embedding,
      });
    }
  }

  return embedded;
}

function splitIntoChunks(
  baseId: string,
  text: string,
  metadata: PortfolioChunkMetadata,
): PortfolioChunk[] {
  const normalized = normalizeTextForEmbedding(text);

  if (!normalized) {
    return [];
  }

  if (normalized.length <= MAX_CHUNK_CHARACTERS) {
    return [{ id: baseId, content: normalized, metadata }];
  }

  const sections = normalized.split(/\n(?=## )/);
  const chunks: PortfolioChunk[] = [];
  let buffer = "";

  const flushBuffer = (suffix: string) => {
    const content = normalizeTextForEmbedding(buffer);
    if (!content) {
      return;
    }

    chunks.push({
      id: suffix === "0" ? baseId : `${baseId}:${suffix}`,
      content,
      metadata,
    });
    buffer = "";
  };

  for (const section of sections) {
    const candidate = buffer ? `${buffer}\n\n${section}` : section;

    if (candidate.length <= MAX_CHUNK_CHARACTERS) {
      buffer = candidate;
      continue;
    }

    if (buffer) {
      flushBuffer(String(chunks.length));
    }

    if (section.length <= MAX_CHUNK_CHARACTERS) {
      buffer = section;
      continue;
    }

    let offset = 0;
    let part = 0;

    while (offset < section.length) {
      const slice = section.slice(offset, offset + MAX_CHUNK_CHARACTERS);
      chunks.push({
        id: `${baseId}:part-${part}`,
        content: normalizeTextForEmbedding(slice),
        metadata,
      });
      offset += MAX_CHUNK_CHARACTERS;
      part += 1;
    }
  }

  if (buffer) {
    flushBuffer(String(chunks.length));
  }

  return chunks;
}

function buildProjectChunks(): PortfolioChunk[] {
  const chunks: PortfolioChunk[] = [];

  for (const project of getProjects()) {
    const document = getProjectBySlug(project.slug);
    if (!document) {
      continue;
    }

    const header = [
      `Project: ${document.title}`,
      `Slug: ${document.slug}`,
      `Category: ${document.category}`,
      `Status: ${document.status}`,
      `Summary: ${document.summary}`,
      document.technologies.length > 0
        ? `Technologies Used Today: ${document.technologies.join(", ")}`
        : "",
      document.technologiesPlanned && document.technologiesPlanned.length > 0
        ? `Future Roadmap: ${document.technologiesPlanned.join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const body = cleanContentForChunking(document.content);
    const fullText = body ? `${header}\n\n${body}` : header;

    chunks.push(
      ...splitIntoChunks(`project:${document.slug}`, fullText, {
        type: "project",
        slug: document.slug,
      }),
    );
  }

  return chunks;
}

function buildBlogChunks(): PortfolioChunk[] {
  const chunks: PortfolioChunk[] = [];

  for (const article of getBlogs()) {
    const document = getBlogBySlug(article.slug);
    if (!document) {
      continue;
    }

    const header = [
      `Article: ${document.title}`,
      `Slug: ${document.slug}`,
      `Category: ${document.category}`,
      `Published: ${document.publishedDate}`,
      document.tags.length > 0 ? `Tags: ${document.tags.join(", ")}` : "",
      `Summary: ${document.summary}`,
      `Description: ${document.description}`,
    ]
      .filter(Boolean)
      .join("\n");

    const body = cleanContentForChunking(document.content);
    const fullText = body ? `${header}\n\n${body}` : header;

    chunks.push(
      ...splitIntoChunks(`blog:${document.slug}`, fullText, {
        type: "blog",
        slug: document.slug,
      }),
    );
  }

  return chunks;
}

function buildExperienceChunks(): PortfolioChunk[] {
  const chunks: PortfolioChunk[] = [];

  for (const role of experience) {
    const content = normalizeTextForEmbedding(
      [
        `Role: ${role.role}`,
        `Company: ${role.company}`,
        `Duration: ${role.duration}`,
        role.location ? `Location: ${role.location}` : "",
        `Current role: ${role.current ? "yes" : "no"}`,
        "",
        "Summary:",
        role.description,
        "",
        "Key responsibilities:",
        ...role.responsibilities.map((item) => `- ${item}`),
        "",
        `Technologies: ${role.technologies.join(", ")}`,
        "",
        "Achievements:",
        ...role.achievements.map((item) => `- ${item}`),
      ]
        .filter((line) => line.length > 0)
        .join("\n"),
    );

    chunks.push(
      ...splitIntoChunks(`experience:${role.id}`, content, {
        type: "experience",
      }),
    );
  }

  return chunks;
}

/**
 * Builds normalized, chunk-friendly portfolio documents for RAG ingestion.
 * Pulls from projects, blog posts, and experience content.
 */
export function buildPortfolioChunks(): PortfolioChunk[] {
  return [...buildProjectChunks(), ...buildBlogChunks(), ...buildExperienceChunks()];
}

/**
 * Convenience helper: build portfolio chunks and embed them in batches.
 * Does not persist vectors — storage is handled in a later phase.
 */
export async function embedPortfolioChunks(): Promise<EmbeddedDocument<PortfolioChunkMetadata>[]> {
  return embedDocuments(buildPortfolioChunks());
}
