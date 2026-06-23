import "server-only";

import { createGroq } from "@ai-sdk/groq";

import { env } from "@/server/config/env";

/**
 * Centralised AI model configuration.
 *
 * API keys are read from environment variables at runtime — never hard-coded.
 * Swap providers or model names here without changing API route handlers.
 */

const groq = createGroq({
  apiKey: env.groqApiKey ?? "",
});

/** Default chat model for the Deepak AI copilot. */
export const deepakAiChatModel = groq(env.groqModel);

export const models = {
  groq,
  defaultChat: deepakAiChatModel,
};

/** Returns true when the Groq API key is present (server-only). */
export function isAiServiceConfigured(): boolean {
  return env.groqConfigured;
}
