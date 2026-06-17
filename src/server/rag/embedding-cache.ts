import "server-only";

import { embedText, normalizeTextForEmbedding } from "@/server/rag/embeddings.impl";
import { env } from "@/server/config/env";

const DEFAULT_MAX_ENTRIES = 128;

type CacheEntry = {
  embedding: number[];
  lastAccessed: number;
};

const cache = new Map<string, CacheEntry>();

function resolveMaxEntries(): number {
  return env.ragEmbeddingCacheSize ?? DEFAULT_MAX_ENTRIES;
}

function evictIfNeeded(): void {
  const maxEntries = resolveMaxEntries();
  if (cache.size <= maxEntries) {
    return;
  }

  const entries = [...cache.entries()].sort(
    (left, right) => left[1].lastAccessed - right[1].lastAccessed,
  );

  const overflow = cache.size - maxEntries;
  for (let index = 0; index < overflow; index += 1) {
    cache.delete(entries[index][0]);
  }
}

/** Embeds text with an in-memory LRU cache for repeated queries. */
export async function embedTextCached(text: string): Promise<number[]> {
  const key = normalizeTextForEmbedding(text);
  if (!key) {
    throw new Error("Cannot embed empty text.");
  }

  const existing = cache.get(key);
  if (existing) {
    existing.lastAccessed = Date.now();
    return existing.embedding;
  }

  const embedding = await embedText(key);
  cache.set(key, { embedding, lastAccessed: Date.now() });
  evictIfNeeded();

  return embedding;
}

/** Clears the in-memory embedding cache. */
export function clearEmbeddingCache(): void {
  cache.clear();
}
