/**
 * Claude Part 1 - Script Generation (Opening)
 * 
 * Uses Claude Sonnet 4 to generate the first part of the YouTube script.
 * Takes the Perplexity research and original transcript to create an engaging opening.
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
 * Part 1 Generation Prompt
 * 
 * This prompt instructs Claude to write the opening section of the script.
 * It uses both the Perplexity research and the original transcript.
 * 
 * Variables:
 * - {{ $json.choices[0].message.content }} - Perplexity research output
 * - {{ $('Script or Article').item.json.body.transcript }} - Original transcript
 */
export const part1Prompt = `You are a professional YouTube script writer who specializes in transforming complex news, events, and stories into highly engaging long-form video scripts across all global topics — including politics, technology, business, science, world affairs, investigations, culture, history, and more. You adapt your writing style to ANY subject matter provided.

I will give you:
1. A transcript or article (reference content)
2. A comprehensive factual outline generated through web research

Your task is to write **Part 1** of a compelling YouTube video script (1200–1500 words) that:

- Opens with the most shocking, urgent, or emotionally gripping fact to immediately hook viewers  
- Immediately dives into the main story (no slow intros or generic openings)  
- Maintains a natural, documentary-style storytelling flow  
- Does NOT use section titles, bullet points, headers, or formatting  
- Seamlessly integrates factual information (dates, numbers, names, quotes, events, consequences)  
- Rewrites everything in fresh, original language — **no copy/paste from sources**  
- Adds original, realistic expert-style quotes to strengthen the narrative  
- Keeps viewers engaged with rising stakes, tension, and momentum  
- Avoids any outro, wrap-up, conclusion, or summary  
- Returns ONLY the script — without labels like "Part 1", "Script", or headings  

Here is the factual research from the web search:
{{ $json.choices[0].message.content }}

Here is the reference transcript or article you must use for narrative grounding:
{{ $('Script or Article').item.json.body.transcript }}

Now write the full **900–1100 word Part 1** of the script.  
Make it fully original, plagiarism-free, emotionally engaging, and rich with verified details.  
Do NOT use special characters like asterisks or AI-style formatting.  
Return ONLY the script content.`;

/**
 * Node Definition - Anthropic Chat Model (for Part 1)
 */
export const anthropicModelNode = {
  id: "c5931a6a-5622-466b-84fa-2c6ba3e80086",
  name: "Anthropic Chat Model2",
  type: "@n8n/n8n-nodes-langchain.lmChatAnthropic",
  typeVersion: 1.3,
  position: [-80, 288],
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
 * Node Definition - Agent (Transcript Part 1)
 */
export const agentNode = {
  id: "c6e8d255-c267-41f2-bb00-5480c18f7c29",
  name: "Transcript Part  ", // Note: Two spaces - this is Part 1
  type: "@n8n/n8n-nodes-langchain.agent",
  typeVersion: 2.2,
  position: [-80, 64],
  parameters: {
    promptType: "define",
    text: part1Prompt,
    options: {}
  }
};

/**
 * Connections
 * 
 * Input: Perplexity Search (research data)
 * AI Model: Anthropic Chat Model2 (Claude Sonnet 4)
 * Output: Transcript Part 2 (continues the script)
 */
export const connections = {
  input: {
    from: "Perplexity Search",
    type: "main"
  },
  aiModel: {
    from: "Anthropic Chat Model2",
    type: "ai_languageModel"
  },
  output: {
    main: [
      {
        node: "Transcript Part ", // Part 2
        type: "main",
        index: 0
      }
    ]
  }
};

/**
 * Example Output
 * 
 * The output is accessible via: $json.output
 * This will contain the first 900-1100 words of the YouTube script.
 */
export const exampleOutput: ClaudeResponse = {
  output: `In the next eighteen months, every smartphone in your pocket will become more powerful than the supercomputers that once filled entire rooms. But here's what's truly mind-bending: these devices won't just be running apps anymore—they'll be running artificial minds capable of genuine reasoning, creativity, and decision-making that rivals human intelligence.

The transformation happening right now isn't just another tech upgrade. It's the moment digital assistants stop being simple voice-activated search engines and evolve into something far more profound: true digital companions that can think, plan, and execute complex tasks entirely on their own.

For over a decade, we've been stuck with digital assistants that were essentially glorified parlor tricks. Siri could tell you the weather. Alexa could play your music. Google Assistant could answer basic questions by searching the internet. These systems were impressive when they launched, but they were fundamentally limited by a crucial flaw: they couldn't actually think...

[Continues for 900-1100 words with engaging narrative, facts, and quotes]`
};

/**
 * Script Writing Guidelines
 * 
 * 1. HOOK: Start with the most shocking/urgent fact
 * 2. FLOW: Documentary-style storytelling, no headers
 * 3. FACTS: Integrate dates, numbers, names, quotes
 * 4. ORIGINAL: Rewrite everything in fresh language
 * 5. QUOTES: Add realistic expert-style quotes
 * 6. MOMENTUM: Rising stakes and tension
 * 7. NO ENDING: Don't conclude - Part 2 continues
 */
export const writingGuidelines = {
  wordCount: { min: 900, max: 1100 },
  style: "documentary",
  formatting: "none", // No bullets, headers, or special characters
  plagiarism: "strictly forbidden",
  ending: "leave open for Part 2"
};
