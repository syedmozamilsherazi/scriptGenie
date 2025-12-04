/**
 * Claude (Anthropic) Service
 * 
 * Handles script generation using Claude Sonnet 4 model.
 * Generates both Part 1 and Part 2 of the YouTube script.
 */

import { config } from "./config";
import { buildPart1Prompt, buildPart2Prompt } from "./prompts";
import type { ClaudeRequest, ClaudeResponse, ClaudeMessage } from "./types";

/**
 * Claude API client class
 */
export class ClaudeService {
  private apiUrl: string;
  private apiKey: string;
  private model: string;
  private maxTokens: number;

  constructor() {
    this.apiUrl = config.anthropic.apiUrl;
    this.apiKey = config.anthropic.apiKey;
    this.model = config.anthropic.model;
    this.maxTokens = config.anthropic.maxTokens;
  }

  /**
   * Build the request payload for Claude API
   */
  private buildRequest(prompt: string): ClaudeRequest {
    const messages: ClaudeMessage[] = [
      {
        role: "user",
        content: prompt
      }
    ];

    return {
      model: this.model,
      max_tokens: this.maxTokens,
      messages
    };
  }

  /**
   * Send a request to Claude API
   */
  private async sendRequest(prompt: string): Promise<string> {
    const requestBody = this.buildRequest(prompt);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data: ClaudeResponse = await response.json();

    if (!data.content || data.content.length === 0) {
      throw new Error("Claude API returned no content");
    }

    return data.content[0].text;
  }

  /**
   * Generate Part 1 of the YouTube script
   * Takes Perplexity research and original transcript
   */
  async generatePart1(perplexityResearch: string, transcript: string): Promise<string> {
    const prompt = buildPart1Prompt(perplexityResearch, transcript);
    return this.sendRequest(prompt);
  }

  /**
   * Generate Part 2 of the YouTube script
   * Takes Part 1 content and continues the narrative
   */
  async generatePart2(part1Script: string): Promise<string> {
    const prompt = buildPart2Prompt(part1Script);
    return this.sendRequest(prompt);
  }

  /**
   * Get the raw API response for debugging
   */
  async generateRaw(prompt: string): Promise<ClaudeResponse> {
    const requestBody = this.buildRequest(prompt);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

/**
 * Standalone function to generate Part 1
 * Matches the n8n Agent node behavior for "Transcript Part  " (Part 1)
 */
export async function generateScriptPart1(
  perplexityResearch: string,
  transcript: string
): Promise<string> {
  const service = new ClaudeService();
  return service.generatePart1(perplexityResearch, transcript);
}

/**
 * Standalone function to generate Part 2
 * Matches the n8n Agent node behavior for "Transcript Part " (Part 2)
 */
export async function generateScriptPart2(part1Script: string): Promise<string> {
  const service = new ClaudeService();
  return service.generatePart2(part1Script);
}

/**
 * Example usage and expected output structure
 */
export const exampleUsage = {
  part1: {
    input: {
      perplexityResearch: "## Recent Developments\nApple officially unveiled...",
      transcript: "Apple just announced their new AI features..."
    },
    expectedOutput: `In the next eighteen months, every smartphone in your pocket will become more powerful than the supercomputers that once filled entire rooms. But here's what's truly mind-bending: these devices won't just be running apps anymore—they'll be running artificial minds capable of genuine reasoning, creativity, and decision-making that rivals human intelligence.

The transformation happening right now isn't just another tech upgrade. It's the moment digital assistants stop being simple voice-activated search engines and evolve into something far more profound: true digital companions that can think, plan, and execute complex tasks entirely on their own.

For over a decade, we've been stuck with digital assistants that were essentially glorified parlor tricks. Siri could tell you the weather. Alexa could play your music. Google Assistant could answer basic questions by searching the internet. These systems were impressive when they launched, but they were fundamentally limited by a crucial flaw: they couldn't actually think.

Ask them to do anything that required genuine reasoning, creativity, or multi-step problem-solving, and they would fail spectacularly. That era is ending with shocking speed. The artificial intelligence models powering today's digital assistants have undergone a revolutionary transformation that most people don't fully appreciate yet.

"We're witnessing the biggest shift in personal computing since the introduction of the smartphone itself," explains Dr. Michael Torres, a leading AI researcher at Stanford University. "The gap between what these systems could do two years ago and what they can do today is almost incomprehensible."

[Continues for 900-1100 words...]`
  },
  part2: {
    input: {
      part1Script: "In the next eighteen months, every smartphone..."
    },
    expectedOutput: `The implications of this shift extend far beyond convenience. When your phone can genuinely understand context, remember your preferences across months of interactions, and anticipate your needs before you even articulate them, the relationship between human and machine fundamentally changes.

Consider what happened last month when a beta tester in San Francisco asked their AI assistant to help plan a surprise anniversary dinner. The system didn't just suggest restaurants—it analyzed the user's calendar, identified scheduling conflicts, checked the weather forecast, researched the couple's dining history from previous conversations, and even suggested a backup plan in case the first reservation fell through.

"We're not just building smarter tools," explains Dr. Sarah Chen, a cognitive scientist who has been studying human-AI interaction for over a decade. "We're creating entities that can genuinely collaborate with humans in ways that were science fiction just three years ago."

The financial stakes are staggering. Industry analysts estimate that the market for AI-powered personal assistants will exceed four hundred billion dollars by 2027. That's not a typo. Four hundred billion. And the companies racing to capture this market are pulling out all the stops.

[Continues for 900-1100 words...]`
  }
};

/**
 * n8n equivalent node configuration for Part 1
 */
export const n8nPart1NodeConfig = {
  name: "Transcript Part  ",
  type: "@n8n/n8n-nodes-langchain.agent",
  parameters: {
    promptType: "define",
    text: "..." // Full Part 1 prompt
  },
  connectedModel: {
    name: "Anthropic Chat Model2",
    type: "@n8n/n8n-nodes-langchain.lmChatAnthropic",
    model: "claude-sonnet-4-20250514"
  }
};

/**
 * n8n equivalent node configuration for Part 2
 */
export const n8nPart2NodeConfig = {
  name: "Transcript Part ",
  type: "@n8n/n8n-nodes-langchain.agent",
  parameters: {
    promptType: "define",
    text: "..." // Full Part 2 prompt
  },
  connectedModel: {
    name: "Anthropic Chat Model3",
    type: "@n8n/n8n-nodes-langchain.lmChatAnthropic",
    model: "claude-sonnet-4-20250514"
  }
};
