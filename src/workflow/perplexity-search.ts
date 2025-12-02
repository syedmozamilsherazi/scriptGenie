/**
 * Perplexity Search Node
 * 
 * Performs deep web research using Perplexity AI's sonar-pro model.
 * Searches the internet for the latest news, facts, and context related to the transcript.
 * 
 * Node: n8n-nodes-base.httpRequest
 * Version: 4.2
 */

export interface PerplexityConfig {
  method: "POST";
  url: string;
  headers: {
    Authorization: string;
    "Content-Type": string;
  };
}

export interface PerplexityMessage {
  role: "system" | "user";
  content: string;
}

export interface PerplexityRequestBody {
  model: string;
  messages: PerplexityMessage[];
}

export interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Perplexity API Configuration
 */
export const perplexityConfig: PerplexityConfig = {
  method: "POST",
  url: "https://api.perplexity.ai/chat/completions",
  headers: {
    Authorization: "Bearer pplx-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with actual API key
    "Content-Type": "application/json"
  }
};

/**
 * System Prompt for Perplexity
 * 
 * Instructs the AI to act as a news research assistant that collects
 * verified facts without writing a script.
 */
export const systemPrompt = `You are an advanced news research assistant. Your job is to perform deep web searches and return a comprehensive factual outline that a YouTube scriptwriter can use. Do NOT write a script. Only collect verified facts, events, context, historical background, expert opinions, quotes, and the latest updates.`;

/**
 * User Prompt Template
 * 
 * The {{transcript}} placeholder is replaced with the actual content from the webhook.
 */
export const userPromptTemplate = `Search the entire internet for the most relevant news, reports, and updates from the last 24 hours related to the transcript below.

Return a detailed **factual outline** that includes:

- All recent developments and newsworthy updates
- Accurate stats: financials, shipments, sanctions, market data, political impacts
- Real quotes from officials, CEOs, analysts, or government statements
- Names of companies, countries, alliances, and institutions involved
- Chronological events or timelines
- Technical/regulatory details (laws, bans, technologies, policies)
- Expert analysis from reputable sources
- Short-term and long-term consequences
- Geopolitical, economic, or technological implications

Important rules:
- **Do NOT write a script.** Only return structured facts and context.
- **No opinions. No speculation. No analysis beyond what sources confirm.**
- Minimum length: **2000 words**, broken into clear paragraphs.
- Combine multiple sources. Do not rely on a single article.
- Make the outline exhaustive — as if preparing research for a 10-minute YouTube video.

Here is the transcript for context:

{{transcript}}

Now perform a full web search and return the complete factual outline.`;

/**
 * Build the request body for Perplexity API
 */
export function buildPerplexityRequest(transcript: string): PerplexityRequestBody {
  return {
    model: "sonar-pro",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPromptTemplate.replace("{{transcript}}", transcript)
      }
    ]
  };
}

/**
 * Node Definition
 */
export const nodeDefinition = {
  id: "eb6828eb-8929-46a0-8c03-d0d4af36af29",
  name: "Perplexity Search",
  type: "n8n-nodes-base.httpRequest",
  typeVersion: 4.2,
  position: [-256, 144],
  parameters: {
    method: "POST",
    url: "https://api.perplexity.ai/chat/completions",
    sendHeaders: true,
    headerParameters: {
      parameters: [
        {
          name: "Authorization",
          value: "Bearer pplx-XXXX" // API Key placeholder
        },
        {
          name: "Content-Type",
          value: "application/json"
        }
      ]
    },
    sendBody: true,
    specifyBody: "json",
    jsonBody: `{
  "model": "sonar-pro",
  "messages": [
    {
      "role": "system",
      "content": "${systemPrompt}"
    },
    {
      "role": "user",
      "content": "..." // Dynamic content with transcript
    }
  ]
}`,
    options: {}
  }
};

/**
 * Connection:
 * Perplexity Search → Transcript Part 1 (Claude)
 * 
 * The research output flows to Claude for script generation.
 * Output accessible via: $json.choices[0].message.content
 */
export const connections = {
  input: {
    from: "Script or Article"
  },
  output: {
    main: [
      {
        node: "Transcript Part  ", // Part 1
        type: "main",
        index: 0
      }
    ]
  }
};

/**
 * Example Response Structure
 */
export const exampleResponse: PerplexityResponse = {
  id: "chatcmpl-xxx",
  model: "sonar-pro",
  choices: [
    {
      index: 0,
      finish_reason: "stop",
      message: {
        role: "assistant",
        content: `## Factual Research Outline

### Recent Developments
- Key event 1 with date and details...
- Key event 2 with statistics...

### Expert Quotes
- "Quote from official" - Name, Title, Organization
- "Another quote" - Name, Title

### Financial/Market Data
- Specific numbers and statistics...

### Timeline of Events
- Date 1: Event description
- Date 2: Event description

### Implications
- Short-term consequences...
- Long-term impacts...

[2000+ words of comprehensive research]`
      }
    }
  ],
  usage: {
    prompt_tokens: 500,
    completion_tokens: 2500,
    total_tokens: 3000
  }
};
