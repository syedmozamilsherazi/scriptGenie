/**
 * Workflow Module Index
 * 
 * Main entry point for the YouTube Script Generation Workflow.
 * This module is completely standalone and not connected to the website functionality.
 */

// Main workflow orchestrator
export { 
  ScriptGenerationWorkflow, 
  generateYouTubeScript,
  workflowExecutionOrder 
} from "./workflow";

// Configuration
export { config } from "./config";

// Type definitions
export type {
  WebhookRequest,
  WebhookResponse,
  PerplexityMessage,
  PerplexityRequest,
  PerplexityResponse,
  ClaudeMessage,
  ClaudeRequest,
  ClaudeResponse,
  WorkflowState,
  WorkflowResult,
  CombineNodeOutput
} from "./types";

// Prompts
export {
  PERPLEXITY_SYSTEM_PROMPT,
  PERPLEXITY_USER_PROMPT_TEMPLATE,
  CLAUDE_PART1_PROMPT_TEMPLATE,
  CLAUDE_PART2_PROMPT_TEMPLATE,
  buildPerplexityPrompt,
  buildPart1Prompt,
  buildPart2Prompt,
  prompts
} from "./prompts";

// Services
export {
  PerplexityService,
  performPerplexitySearch,
  ClaudeService,
  generateScriptPart1,
  generateScriptPart2,
  combineScriptParts,
  countWords,
  validateCombinedScript,
  formatScript,
  parseWebhookRequest,
  preprocessTranscript,
  buildWebhookResponse,
  formatResponseForN8n
} from "./services";

/**
 * Quick Reference
 * 
 * This workflow module implements the n8n YouTube script generation pipeline:
 * 
 * 1. WEBHOOK: Receives transcript from frontend
 *    - File: services/webhook.service.ts
 * 
 * 2. PERPLEXITY: Web research for facts and context
 *    - File: services/perplexity.service.ts
 *    - Prompt: prompts.ts (PERPLEXITY_SYSTEM_PROMPT, PERPLEXITY_USER_PROMPT_TEMPLATE)
 * 
 * 3. CLAUDE PART 1: Generate opening script (900-1100 words)
 *    - File: services/claude.service.ts
 *    - Prompt: prompts.ts (CLAUDE_PART1_PROMPT_TEMPLATE)
 * 
 * 4. CLAUDE PART 2: Continue script (900-1100 words)
 *    - File: services/claude.service.ts
 *    - Prompt: prompts.ts (CLAUDE_PART2_PROMPT_TEMPLATE)
 * 
 * 5. COMBINE: Merge both parts into final script
 *    - File: services/combiner.service.ts
 * 
 * 6. RESPOND: Return merged script to caller
 *    - File: services/webhook.service.ts
 * 
 * Usage:
 * ```typescript
 * import { generateYouTubeScript } from './workflow';
 * 
 * const result = await generateYouTubeScript("Your article here...");
 * console.log(result.mergedScript);
 * ```
 */
