/**
 * Workflow Configuration
 * 
 * Central configuration for all API endpoints and credentials.
 * API keys are loaded from environment variables.
 */

export const config = {
  // Perplexity AI Configuration
  perplexity: {
    apiUrl: "https://api.perplexity.ai/chat/completions",
    apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY || "",
    model: "sonar-pro"
  },

  // Anthropic Claude Configuration
  anthropic: {
    apiUrl: "https://api.anthropic.com/v1/messages",
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "",
    model: "claude-sonnet-4-20250514",
    maxTokens: 4096
  },

  // Webhook Configuration
  webhook: {
    testUrl: import.meta.env.VITE_WEBHOOK_TEST_URL || "https://n8n-14pv.onrender.com/webhook-test/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce",
    productionUrl: import.meta.env.VITE_WEBHOOK_PRODUCTION_URL || "https://n8n-14pv.onrender.com/webhook/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce"
  },

  // Script Generation Settings
  scriptSettings: {
    part1WordCount: { min: 900, max: 1100 },
    part2WordCount: { min: 900, max: 1100 },
    totalWordCount: { min: 1800, max: 2200 },
    perplexityMinWords: 2000
  }
};

export type Config = typeof config;
