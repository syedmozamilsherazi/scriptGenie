/**
 * YouTube Script Generation Workflow Orchestrator
 * 
 * This is the main entry point that orchestrates the entire workflow.
 * It coordinates all services to transform a transcript into a YouTube script.
 * 
 * Workflow Pipeline:
 * 1. Receive transcript via webhook
 * 2. Perform Perplexity web research
 * 3. Generate Part 1 with Claude
 * 4. Generate Part 2 with Claude
 * 5. Combine parts and respond
 */

import { PerplexityService, performPerplexitySearch } from "./services/perplexity.service";
import { ClaudeService, generateScriptPart1, generateScriptPart2 } from "./services/claude.service";
import { combineScriptParts, validateCombinedScript } from "./services/combiner.service";
import { parseWebhookRequest, preprocessTranscript, formatResponseForN8n } from "./services/webhook.service";
import type { WorkflowState, WorkflowResult, CombineNodeOutput } from "./types";

/**
 * Main Workflow Orchestrator Class
 */
export class ScriptGenerationWorkflow {
  private perplexityService: PerplexityService;
  private claudeService: ClaudeService;
  private state: WorkflowState;

  constructor() {
    this.perplexityService = new PerplexityService();
    this.claudeService = new ClaudeService();
    this.state = this.initializeState();
  }

  /**
   * Initialize workflow state
   */
  private initializeState(): WorkflowState {
    return {
      transcript: "",
      perplexityResearch: null,
      part1Script: null,
      part2Script: null,
      mergedScript: null,
      error: null,
      startTime: Date.now(),
      endTime: null
    };
  }

  /**
   * Reset workflow state for new execution
   */
  reset(): void {
    this.state = this.initializeState();
  }

  /**
   * Get current workflow state
   */
  getState(): WorkflowState {
    return { ...this.state };
  }

  /**
   * Execute the complete workflow
   * 
   * This is the main entry point that runs all steps in sequence.
   * Matches the n8n workflow execution order.
   */
  async execute(transcript: string): Promise<WorkflowResult> {
    this.reset();
    this.state.startTime = Date.now();

    try {
      // Step 1: Preprocess transcript
      console.log("[Workflow] Step 1: Preprocessing transcript...");
      this.state.transcript = preprocessTranscript(transcript);

      // Step 2: Perplexity Search
      console.log("[Workflow] Step 2: Performing Perplexity web research...");
      this.state.perplexityResearch = await this.perplexityService.search(this.state.transcript);
      console.log(`[Workflow] Perplexity research complete: ${this.state.perplexityResearch.length} characters`);

      // Step 3: Generate Part 1 with Claude
      console.log("[Workflow] Step 3: Generating Part 1 with Claude...");
      this.state.part1Script = await this.claudeService.generatePart1(
        this.state.perplexityResearch,
        this.state.transcript
      );
      console.log(`[Workflow] Part 1 complete: ${countWords(this.state.part1Script)} words`);

      // Step 4: Generate Part 2 with Claude
      console.log("[Workflow] Step 4: Generating Part 2 with Claude...");
      this.state.part2Script = await this.claudeService.generatePart2(this.state.part1Script);
      console.log(`[Workflow] Part 2 complete: ${countWords(this.state.part2Script)} words`);

      // Step 5: Combine parts
      console.log("[Workflow] Step 5: Combining script parts...");
      const combined = combineScriptParts(this.state.part1Script, this.state.part2Script);
      this.state.mergedScript = combined.merged;

      // Validate result
      const validation = validateCombinedScript(combined);
      if (validation.warnings.length > 0) {
        console.warn("[Workflow] Validation warnings:", validation.warnings);
      }

      this.state.endTime = Date.now();
      const executionTime = this.state.endTime - this.state.startTime;
      console.log(`[Workflow] Complete! Total execution time: ${executionTime}ms`);

      return {
        success: true,
        mergedScript: this.state.mergedScript,
        executionTime,
        wordCount: combined.wordCount,
        error: null
      };

    } catch (error) {
      this.state.endTime = Date.now();
      this.state.error = error instanceof Error ? error.message : "Unknown error";
      
      console.error("[Workflow] Error:", this.state.error);

      return {
        success: false,
        mergedScript: null,
        executionTime: this.state.endTime - this.state.startTime,
        wordCount: 0,
        error: this.state.error
      };
    }
  }

  /**
   * Execute individual steps (for debugging/testing)
   */
  async executeStep(step: "perplexity" | "part1" | "part2" | "combine"): Promise<unknown> {
    switch (step) {
      case "perplexity":
        if (!this.state.transcript) throw new Error("Transcript not set");
        this.state.perplexityResearch = await this.perplexityService.search(this.state.transcript);
        return this.state.perplexityResearch;

      case "part1":
        if (!this.state.perplexityResearch) throw new Error("Perplexity research not complete");
        this.state.part1Script = await this.claudeService.generatePart1(
          this.state.perplexityResearch,
          this.state.transcript
        );
        return this.state.part1Script;

      case "part2":
        if (!this.state.part1Script) throw new Error("Part 1 not complete");
        this.state.part2Script = await this.claudeService.generatePart2(this.state.part1Script);
        return this.state.part2Script;

      case "combine":
        if (!this.state.part1Script || !this.state.part2Script) {
          throw new Error("Both parts must be complete");
        }
        const combined = combineScriptParts(this.state.part1Script, this.state.part2Script);
        this.state.mergedScript = combined.merged;
        return combined;

      default:
        throw new Error(`Unknown step: ${step}`);
    }
  }
}

/**
 * Standalone function to execute the complete workflow
 * This is the simplest way to use the workflow
 */
export async function generateYouTubeScript(transcript: string): Promise<WorkflowResult> {
  const workflow = new ScriptGenerationWorkflow();
  return workflow.execute(transcript);
}

/**
 * Helper function to count words
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Simulate the n8n workflow execution order
 */
export const workflowExecutionOrder = [
  {
    step: 1,
    node: "Script or Article",
    type: "webhook",
    description: "Receives POST request with transcript",
    output: "{ body: { transcript: '...' } }"
  },
  {
    step: 2,
    node: "Perplexity Search",
    type: "httpRequest",
    description: "Performs web research on topic",
    output: "{ choices: [{ message: { content: '...' } }] }"
  },
  {
    step: 3,
    node: "Transcript Part  ",
    type: "agent",
    description: "Generates Part 1 of script (900-1100 words)",
    output: "{ output: '...' }"
  },
  {
    step: 4,
    node: "Transcript Part ",
    type: "agent",
    description: "Generates Part 2 of script (900-1100 words)",
    output: "{ output: '...' }"
  },
  {
    step: 5,
    node: "Combining Parts1",
    type: "code",
    description: "Merges both parts into final script",
    output: "{ merged: '...', wordCount: 2100 }"
  },
  {
    step: 6,
    node: "Respond to Webhook",
    type: "respondToWebhook",
    description: "Returns merged script to caller",
    output: "Plain text response"
  }
];

/**
 * Example usage
 */
export const exampleUsage = `
// Using the workflow class
const workflow = new ScriptGenerationWorkflow();
const result = await workflow.execute("Your article or transcript here...");

if (result.success) {
  console.log("Generated script:", result.mergedScript);
  console.log("Word count:", result.wordCount);
  console.log("Execution time:", result.executionTime, "ms");
} else {
  console.error("Error:", result.error);
}

// Using the standalone function
const result = await generateYouTubeScript("Your article or transcript here...");
`;
