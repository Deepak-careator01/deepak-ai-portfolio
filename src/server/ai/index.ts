/**
 * Public AI entrypoint for the Deepak AI portfolio.
 *
 * This file re-exports the primitives needed by API routes and future
 * LangGraph agents, while keeping implementation details encapsulated
 * in submodules.
 */

export { DEEPAK_AI_SYSTEM_PROMPT } from "@/server/ai/prompts/system";
export { getPortfolioContext } from "@/server/ai/context/portfolio-context";
export { deepakAiChatModel, models } from "@/server/ai/models";

