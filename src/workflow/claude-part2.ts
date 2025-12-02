/**
 * Claude Part 2 - Script Generation (Continuation)
 * 
 * Uses Claude Sonnet 4 to generate the second part of the YouTube script.
 * Takes Part 1's output and continues the narrative seamlessly.
 * 
 * Node: @n8n/n8n-nodes-langchain.agent
 * Version: 2.2
 * Model: Claude 4 Sonnet (claude-sonnet-4-20250514)
 */

export interface ClaudeModelConfig {
  model: string;
  cachedResultName: string;
}

export interface AgentConfig {
  promptType: "define";
  text: string;
  options: Record<string, unknown>;
}

export interface Part2Input {
  output: string; // Part 1 script content
}

export interface ClaudeResponse {
  output: string;
}

/**
 * Claude Model Configuration
 */
export const claudeModelConfig: ClaudeModelConfig = {
  model: "claude-sonnet-4-20250514",
  cachedResultName: "Claude 4 Sonnet"
};

/**
 * Anthropic API Credentials Reference
 */
export const credentials = {
  anthropicApi: {
    id: "ceXChOrWNeMtjLn1",
    name: "TubeRisers Anthropic account"
  }
};

/**
 * Part 2 Generation Prompt
 * 
 * This prompt instructs Claude to continue the script from where Part 1 ended.
 * It receives Part 1's output and creates a seamless continuation.
 * 
 * Variables:
 * - {{ $json.output }} - Part 1 script content
 */
export const part2Prompt = `You are a professional YouTube script writer who specializes in turning any topic — including global news, technology, politics, investigations, business, science, world events, culture, and historical stories — into highly engaging long-form video scripts. You adapt your style to any subject matter provided.

I will give you Part 1 of a script. Your job is to write **Part 2** that:

- Continues the narrative smoothly from exactly where Part 1 ends  
- Maintains a natural, documentary-style storytelling flow  
- Does NOT use section titles, bullet points, headers, or formatting  
- Seamlessly integrates accurate factual information (dates, numbers, names, quotes, events, outcomes)  
- Adds original, realistic expert-style quotes to strengthen the story  
- Keeps the pacing tight and maintains viewer retention with rising emotional or narrative momentum  
- Rewrites everything in fresh, original language — **no copy/paste from sources**  
- Does NOT include any ending, conclusion, summary, outro, or final thoughts  
- Returns ONLY the script — without labels like "Part 2," "Script," "Conclusion," or headings  

Here is Part 1 of the script you must continue from:
{{ $json.output }}

Now write **Part 2** of the script (900–1100 words), making it fully original, plagiarism-free, deeply engaging, and rich with verified details.  
Do NOT use special characters like asterisks or AI-style formatting.  
Return ONLY the script content.`;

/**
 * Node Definition - Anthropic Chat Model (for Part 2)
 */
export const anthropicModelNode = {
  id: "9962022b-8432-4e36-9278-69cec7ad08ec",
  name: "Anthropic Chat Model3",
  type: "@n8n/n8n-nodes-langchain.lmChatAnthropic",
  typeVersion: 1.3,
  position: [336, 288],
  parameters: {
    model: {
      __rl: true,
      mode: "list",
      value: "claude-sonnet-4-20250514",
      cachedResultName: "Claude 4 Sonnet"
    },
    options: {}
  },
  credentials: {
    anthropicApi: {
      id: "ceXChOrWNeMtjLn1",
      name: "TubeRisers Anthropic account"
    }
  }
};

/**
 * Node Definition - Agent (Transcript Part 2)
 */
export const agentNode = {
  id: "e8e00e7d-9bb2-405b-93cf-d77df72f5cbb",
  name: "Transcript Part ", // Note: One space - this is Part 2
  type: "@n8n/n8n-nodes-langchain.agent",
  typeVersion: 2.2,
  position: [192, 64],
  parameters: {
    promptType: "define",
    text: part2Prompt,
    options: {}
  }
};

/**
 * Connections
 * 
 * Input: Transcript Part 1 (first half of script)
 * AI Model: Anthropic Chat Model3 (Claude Sonnet 4)
 * Output: Combining Parts1 (merges both parts)
 */
export const connections = {
  input: {
    from: "Transcript Part  ", // Part 1
    type: "main"
  },
  aiModel: {
    from: "Anthropic Chat Model3",
    type: "ai_languageModel"
  },
  output: {
    main: [
      {
        node: "Combining Parts1",
        type: "main",
        index: 0
      }
    ]
  }
};

/**
 * Example Input (from Part 1)
 */
export const exampleInput: Part2Input = {
  output: `In the next eighteen months, every smartphone in your pocket will become more powerful than the supercomputers that once filled entire rooms. But here's what's truly mind-bending: these devices won't just be running apps anymore—they'll be running artificial minds capable of genuine reasoning, creativity, and decision-making that rivals human intelligence.

The transformation happening right now isn't just another tech upgrade. It's the moment digital assistants stop being simple voice-activated search engines and evolve into something far more profound: true digital companions that can think, plan, and execute complex tasks entirely on their own...

[900-1100 words of Part 1 content]`
};

/**
 * Example Output
 * 
 * The output is accessible via: $json.output
 * This will contain the second 900-1100 words of the YouTube script.
 */
export const exampleOutput: ClaudeResponse = {
  output: `The implications of this shift extend far beyond convenience. When your phone can genuinely understand context, remember your preferences across months of interactions, and anticipate your needs before you even articulate them, the relationship between human and machine fundamentally changes.

Consider what happened last month when a beta tester in San Francisco asked their AI assistant to help plan a surprise anniversary dinner. The system didn't just suggest restaurants—it analyzed the user's calendar, identified scheduling conflicts, checked the weather forecast, researched the couple's dining history from previous conversations, and even suggested a backup plan in case the first reservation fell through.

"We're not just building smarter tools," explains Dr. Sarah Chen, a cognitive scientist who has been studying human-AI interaction for over a decade. "We're creating entities that can genuinely collaborate with humans in ways that were science fiction just three years ago."

The financial stakes are staggering. Industry analysts estimate that the market for AI-powered personal assistants will exceed four hundred billion dollars by 2027...

[Continues for 900-1100 words, picking up exactly where Part 1 ended]`
};

/**
 * Script Continuation Guidelines
 * 
 * 1. SEAMLESS: Continue exactly where Part 1 ends
 * 2. FLOW: Maintain documentary-style storytelling
 * 3. FACTS: Keep integrating dates, numbers, names, quotes
 * 4. ORIGINAL: Fresh language throughout
 * 5. QUOTES: More realistic expert-style quotes
 * 6. MOMENTUM: Rising emotional/narrative stakes
 * 7. NO ENDING: Still no conclusion (script ends open for viewer engagement)
 */
export const writingGuidelines = {
  wordCount: { min: 900, max: 1100 },
  style: "documentary",
  formatting: "none",
  plagiarism: "strictly forbidden",
  continuation: "seamless from Part 1",
  ending: "no conclusion, summary, or outro"
};

/**
 * Key Differences from Part 1
 * 
 * - Receives Part 1 output instead of Perplexity research
 * - Must continue narrative seamlessly
 * - Still no ending (leaves viewers wanting more)
 * - Same style and quality standards
 */
export const keyDifferences = {
  input: "Part 1 script (not research)",
  task: "continue, not start",
  context: "inherits narrative from Part 1"
};
