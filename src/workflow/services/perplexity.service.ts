/**
 * Perplexity Search Service
 * 
 * Handles web research using Perplexity AI's sonar-pro model.
 * Searches the internet for facts, quotes, and context related to the transcript.
 */

import { config } from "./config";
import { PERPLEXITY_SYSTEM_PROMPT, buildPerplexityPrompt } from "./prompts";
import type { PerplexityRequest, PerplexityResponse, PerplexityMessage } from "./types";

/**
 * Perplexity API client class
 */
export class PerplexityService {
  private apiUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiUrl = config.perplexity.apiUrl;
    this.apiKey = config.perplexity.apiKey;
    this.model = config.perplexity.model;
  }

  /**
   * Build the request payload for Perplexity API
   */
  buildRequest(transcript: string): PerplexityRequest {
    const messages: PerplexityMessage[] = [
      {
        role: "system",
        content: PERPLEXITY_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: buildPerplexityPrompt(transcript)
      }
    ];

    return {
      model: this.model,
      messages
    };
  }

  /**
   * Execute the Perplexity search
   * Returns comprehensive factual research about the transcript topic
   */
  async search(transcript: string): Promise<string> {
    const requestBody = this.buildRequest(transcript);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data: PerplexityResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Perplexity API returned no choices");
    }

    return data.choices[0].message.content;
  }

  /**
   * Get the raw API response for debugging
   */
  async searchRaw(transcript: string): Promise<PerplexityResponse> {
    const requestBody = this.buildRequest(transcript);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

/**
 * Standalone function to perform Perplexity search
 * Matches the n8n HTTP Request node behavior
 */
export async function performPerplexitySearch(transcript: string): Promise<string> {
  const service = new PerplexityService();
  return service.search(transcript);
}

/**
 * Example usage and expected output structure
 */
export const exampleUsage = {
  input: {
    transcript: "Apple just announced their new AI features for iPhone..."
  },
  expectedOutput: `## Recent Developments

Apple officially unveiled Apple Intelligence at WWDC 2024 on June 10, 2024. The suite of AI features represents Apple's largest software initiative in years, bringing generative AI capabilities directly to iPhone, iPad, and Mac devices.

### Key Announcements
- Apple Intelligence will be available on iPhone 15 Pro and later models
- Features include advanced writing tools, image generation, and Siri improvements
- Partnership with OpenAI announced for ChatGPT integration
- Privacy-focused approach with on-device processing

### Expert Quotes
"This is Apple's answer to the AI revolution," said Ming-Chi Kuo, Apple analyst. "They're prioritizing privacy while still delivering competitive AI features."

Tim Cook stated: "We believe AI should be personal, private, and powerful. Apple Intelligence delivers on all three."

### Financial Impact
- Apple stock rose 3.2% following the announcement
- Analysts predict 15% increase in iPhone 15 Pro sales
- AI features expected to drive upgrade cycle in 2024-2025

### Timeline
- June 10, 2024: Apple Intelligence announced at WWDC
- Fall 2024: iOS 18 public release with AI features
- 2025: Expanded AI capabilities planned

[Continues with 2000+ words of comprehensive research...]`
};

/**
 * n8n equivalent node configuration
 */
export const n8nNodeConfig = {
  name: "Perplexity Search",
  type: "n8n-nodes-base.httpRequest",
  parameters: {
    method: "POST",
    url: "https://api.perplexity.ai/chat/completions",
    sendHeaders: true,
    headerParameters: {
      parameters: [
        { name: "Authorization", value: "Bearer {{API_KEY}}" },
        { name: "Content-Type", value: "application/json" }
      ]
    },
    sendBody: true,
    specifyBody: "json",
    jsonBody: "..." // Dynamic based on transcript
  }
};
