/**
 * Type Definitions for YouTube Script Generation Workflow
 */

// ============================================
// Request/Response Types
// ============================================

export interface WebhookRequest {
  transcript: string;
}

export interface WebhookResponse {
  merged: string;
}

// ============================================
// Perplexity Types
// ============================================

export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
}

export interface PerplexityChoice {
  index: number;
  finish_reason: string;
  message: {
    role: string;
    content: string;
  };
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  choices: PerplexityChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================
// Anthropic Claude Types
// ============================================

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
}

export interface ClaudeContentBlock {
  type: "text";
  text: string;
}

export interface ClaudeResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: ClaudeContentBlock[];
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// ============================================
// Workflow State Types
// ============================================

export interface WorkflowState {
  transcript: string;
  perplexityResearch: string | null;
  part1Script: string | null;
  part2Script: string | null;
  mergedScript: string | null;
  error: string | null;
  startTime: number;
  endTime: number | null;
}

export interface WorkflowResult {
  success: boolean;
  mergedScript: string | null;
  executionTime: number;
  wordCount: number;
  error: string | null;
}

// ============================================
// Node Output Types (matching n8n structure)
// ============================================

export interface WebhookNodeOutput {
  body: {
    transcript: string;
  };
  headers: Record<string, string>;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface PerplexityNodeOutput {
  choices: PerplexityChoice[];
}

export interface AgentNodeOutput {
  output: string;
}

export interface CombineNodeOutput {
  merged: string;
  part1: string;
  part2: string;
  wordCount: number;
  generatedAt: string;
}
