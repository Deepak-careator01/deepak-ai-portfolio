import "server-only";

import { createOpenAI } from "@ai-sdk/openai";

/**
 * Centralised AI model configuration.
 *
 * API keys are read from environment variables at runtime — never hard-coded.
 * Swap providers or model names here without changing API route handlers.
 */

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Default chat model for the Deepak AI copilot. */
export const deepakAiChatModel = openai.chat("gpt-4.1-mini");

export const models = {
  openai,
  defaultChat: deepakAiChatModel,
};
