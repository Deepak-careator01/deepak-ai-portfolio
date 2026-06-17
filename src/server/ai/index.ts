/**
 * Public AI entrypoint for the Deepak AI portfolio.
 *
 * API routes and future LangGraph agents should import from here rather than
 * reaching into submodules directly.
 */

import { getPortfolioContext } from "@/server/ai/context/portfolio-context";
import { DEEPAK_AI_SYSTEM_PROMPT } from "@/server/ai/prompts/system";

export { DEEPAK_AI_SYSTEM_PROMPT } from "@/server/ai/prompts/system";
export { getPortfolioContext } from "@/server/ai/context/portfolio-context";
export { deepakAiChatModel, models } from "@/server/ai/models";

/**
 * Builds the full system instruction passed to the model.
 *
 * Phase 3+ can replace the static context block with RAG-retrieved chunks
 * without changing the public API surface of this function.
 */
export function getDeepakAiSystemInstruction(): string {
  return `${DEEPAK_AI_SYSTEM_PROMPT}

PORTFOLIO KNOWLEDGE:

${getPortfolioContext()}`;
}
