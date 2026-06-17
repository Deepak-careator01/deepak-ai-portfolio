import "server-only";

import { createGroq } from "@ai-sdk/groq";

/**
 * Centralised AI model configuration.
 *
 * API keys are read from environment variables at runtime — never hard-coded.
 * Swap providers or model names here without changing API route handlers.
 */

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

/** Default chat model for the Deepak AI copilot. */
export const deepakAiChatModel = groq("llama-3.3-70b-versatile");

export const models = {
  groq,
  defaultChat: deepakAiChatModel,
};

/** Returns true when the Groq API key is present (server-only). */
export function isAiServiceConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}
