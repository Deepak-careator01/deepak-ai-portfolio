import "server-only";

import { createOpenAI } from "@ai-sdk/openai";

/**
 * Centralised AI model configuration.
 *
 * This wraps the Vercel AI SDK + OpenAI provider so that:
 * - Providers and models can be swapped in one place.
 * - API keys are read from environment variables, not hard-coded.
 * - Server-only usage is enforced via the `server-only` import.
 *
 * NOTE:
 * - This module does not validate that an API key is present.
 * - Call sites (e.g. route handlers) should handle missing keys gracefully.
 */

const openai = createOpenAI({
  // API key is expected to be provided via environment variable at runtime.
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Default chat model for the Deepak AI copilot.
 *
 * Chosen to balance capability and cost; can be swapped for a different
 * provider or model name without changing call sites.
 */
export const deepakAiChatModel = openai.chat("gpt-4.1-mini");

export const models = {
  openai,
  defaultChat: deepakAiChatModel,
};

