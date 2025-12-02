/**
 * Complete n8n Workflow Export
 * 
 * This file contains the entire workflow configuration that can be
 * imported directly into n8n.
 * 
 * To import:
 * 1. Open n8n
 * 2. Go to Workflows > Import from File
 * 3. Paste this JSON
 */

export const workflowExport = {
  nodes: [
    {
      parameters: {
        respondWith: "text",
        responseBody: "={{ $json.merged }}",
        options: {}
      },
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.4,
      position: [608, 96],
      id: "709c8572-a836-4d79-bf49-731c3090a84b",
      name: "Respond to Webhook"
    },
    {
      parameters: {
        model: {
          __rl: true,
          mode: "list",
          value: "claude-sonnet-4-20250514",
          cachedResultName: "Claude 4 Sonnet"
        },
        options: {}
      },
      type: "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      typeVersion: 1.3,
      position: [-80, 288],
      id: "c5931a6a-5622-466b-84fa-2c6ba3e80086",
      name: "Anthropic Chat Model2",
      credentials: {
        anthropicApi: {
          id: "ceXChOrWNeMtjLn1",
          name: "TubeRisers Anthropic account"
        }
      }
    },
    {
      parameters: {
        model: {
          __rl: true,
          mode: "list",
          value: "claude-sonnet-4-20250514",
          cachedResultName: "Claude 4 Sonnet"
        },
        options: {}
      },
      type: "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      typeVersion: 1.3,
      position: [336, 288],
      id: "9962022b-8432-4e36-9278-69cec7ad08ec",
      name: "Anthropic Chat Model3",
      credentials: {
        anthropicApi: {
          id: "ceXChOrWNeMtjLn1",
          name: "TubeRisers Anthropic account"
        }
      }
    },
    {
      parameters: {
        promptType: "define",
        text: `You are a professional YouTube script writer who specializes in turning any topic — including global news, technology, politics, investigations, business, science, world events, culture, and historical stories — into highly engaging long-form video scripts. You adapt your style to any subject matter provided.

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
Return ONLY the script content.`,
        options: {}
      },
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 2.2,
      position: [192, 64],
      id: "e8e00e7d-9bb2-405b-93cf-d77df72f5cbb",
      name: "Transcript Part "
    },
    {
      parameters: {
        promptType: "define",
        text: `You are a professional YouTube script writer who specializes in transforming complex news, events, and stories into highly engaging long-form video scripts across all global topics — including politics, technology, business, science, world affairs, investigations, culture, history, and more. You adapt your writing style to ANY subject matter provided.

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
Return ONLY the script content.`,
        options: {}
      },
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 2.2,
      position: [-80, 64],
      id: "c6e8d255-c267-41f2-bb00-5480c18f7c29",
      name: "Transcript Part  "
    },
    {
      parameters: {
        method: "POST",
        url: "https://api.perplexity.ai/chat/completions",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "Authorization",
              value: "Bearer pplx-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" // Replace with actual API key
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
      "content": "You are an advanced news research assistant. Your job is to perform deep web searches and return a comprehensive factual outline that a YouTube scriptwriter can use. Do NOT write a script. Only collect verified facts, events, context, historical background, expert opinions, quotes, and the latest updates."
    },
    {
      "role": "user",
      "content": "Search the entire internet for the most relevant news, reports, and updates from the last 24 hours related to the transcript below.\\n\\nReturn a detailed **factual outline** that includes:\\n\\n- All recent developments and newsworthy updates\\n- Accurate stats: financials, shipments, sanctions, market data, political impacts\\n- Real quotes from officials, CEOs, analysts, or government statements\\n- Names of companies, countries, alliances, and institutions involved\\n- Chronological events or timelines\\n- Technical/regulatory details (laws, bans, technologies, policies)\\n- Expert analysis from reputable sources\\n- Short-term and long-term consequences\\n- Geopolitical, economic, or technological implications\\n\\nImportant rules:\\n- **Do NOT write a script.** Only return structured facts and context.\\n- **No opinions. No speculation. No analysis beyond what sources confirm.**\\n- Minimum length: **2000 words**, broken into clear paragraphs.\\n- Combine multiple sources. Do not rely on a single article.\\n- Make the outline exhaustive — as if preparing research for a 10-minute YouTube video.\\n\\nHere is the transcript for context:\\n\\n{{ $json.cleanedTranscript }}\\n\\nNow perform a full web search and return the complete factual outline."
    }
  ]
}`,
        options: {}
      },
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [-256, 144],
      id: "eb6828eb-8929-46a0-8c03-d0d4af36af29",
      name: "Perplexity Search"
    },
    {
      parameters: {
        httpMethod: "POST",
        path: "31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce",
        responseMode: "responseNode",
        options: {}
      },
      type: "n8n-nodes-base.webhook",
      typeVersion: 2.1,
      position: [-416, 80],
      id: "57be00e1-8fb7-4ebc-8f57-b51567891219",
      name: "Script or Article",
      webhookId: "31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce"
    }
  ],
  connections: {
    "Anthropic Chat Model2": {
      ai_languageModel: [
        [
          {
            node: "Transcript Part  ",
            type: "ai_languageModel",
            index: 0
          }
        ]
      ]
    },
    "Anthropic Chat Model3": {
      ai_languageModel: [
        [
          {
            node: "Transcript Part ",
            type: "ai_languageModel",
            index: 0
          }
        ]
      ]
    },
    "Transcript Part ": {
      main: [[]]
    },
    "Transcript Part  ": {
      main: [
        [
          {
            node: "Transcript Part ",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Perplexity Search": {
      main: [
        [
          {
            node: "Transcript Part  ",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Script or Article": {
      main: [
        [
          {
            node: "Perplexity Search",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  },
  pinData: {},
  meta: {
    templateCredsSetupCompleted: true,
    instanceId: "7c92caf66d0b9cf116e00cda22fb6c2a6eb2054c71772c728e1a4685b7debab2"
  }
};

/**
 * Workflow Summary
 * 
 * Flow: Webhook → Perplexity → Claude Part 1 → Claude Part 2 → Combine → Respond
 * 
 * Total estimated execution time: 30-90 seconds
 * - Perplexity Search: 5-15 seconds
 * - Claude Part 1: 10-30 seconds
 * - Claude Part 2: 10-30 seconds
 * - Combine & Respond: <1 second
 */
export const workflowSummary = {
  name: "YouTube Script Generator",
  description: "Transforms articles/transcripts into professional YouTube scripts",
  nodes: 7,
  estimatedExecutionTime: "30-90 seconds",
  outputWordCount: "1800-2200 words",
  aiModels: ["Perplexity sonar-pro", "Claude Sonnet 4 (x2)"]
};
