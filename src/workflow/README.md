# YouTube Script Generation Workflow

This folder contains the **complete standalone implementation** of the n8n workflow that powers the ScriptGenie application. 

⚠️ **Note:** This code is NOT connected to the website functionality. It is a standalone reference implementation.

## Workflow Overview

The workflow transforms any article or transcript into a professional YouTube script through the following pipeline:

1. **Webhook Trigger** - Receives the transcript from the frontend
2. **Perplexity Search** - Performs deep web research on the topic (2000+ words of facts)
3. **Claude Part 1** - Generates the first part of the script (900-1100 words)
4. **Claude Part 2** - Continues the script seamlessly (900-1100 words)
5. **Combine & Respond** - Merges both parts and returns to frontend

## File Structure

```
src/workflow/
├── index.ts                    # Main entry point, exports all modules
├── config.ts                   # API keys and configuration
├── types.ts                    # TypeScript type definitions
├── prompts.ts                  # All prompts (Perplexity, Claude Part 1, Claude Part 2)
├── workflow.ts                 # Main orchestrator that runs the full pipeline
├── README.md                   # This file
│
├── services/
│   ├── index.ts                # Services barrel export
│   ├── perplexity.service.ts   # Perplexity AI web research
│   ├── claude.service.ts       # Claude script generation (Part 1 & 2)
│   ├── combiner.service.ts     # Combines script parts
│   └── webhook.service.ts      # Webhook request/response handling
│
└── (legacy documentation files)
    ├── webhook.ts
    ├── perplexity-search.ts
    ├── claude-part1.ts
    ├── claude-part2.ts
    ├── combine-parts.ts
    ├── respond-webhook.ts
    └── workflow-export.ts
```

## Usage

```typescript
import { generateYouTubeScript } from './workflow';

// Simple usage
const result = await generateYouTubeScript("Your article or transcript here...");

if (result.success) {
  console.log("Generated script:", result.mergedScript);
  console.log("Word count:", result.wordCount);
  console.log("Execution time:", result.executionTime, "ms");
} else {
  console.error("Error:", result.error);
}
```

```typescript
// Advanced usage with workflow class
import { ScriptGenerationWorkflow } from './workflow';

const workflow = new ScriptGenerationWorkflow();
const result = await workflow.execute("Your article here...");

// Access intermediate state
const state = workflow.getState();
console.log("Perplexity research:", state.perplexityResearch);
console.log("Part 1:", state.part1Script);
console.log("Part 2:", state.part2Script);
```

## Prompts

All prompts are defined in `prompts.ts` with exact matching to the n8n workflow:

### Perplexity System Prompt
```
You are an advanced news research assistant. Your job is to perform deep web 
searches and return a comprehensive factual outline that a YouTube scriptwriter 
can use. Do NOT write a script. Only collect verified facts, events, context, 
historical background, expert opinions, quotes, and the latest updates.
```

### Claude Part 1 Prompt
- Uses Perplexity research + original transcript
- Generates 900-1100 words
- Opens with shocking/urgent hook
- Documentary-style storytelling
- No headers, bullets, or formatting

### Claude Part 2 Prompt
- Uses Part 1 output
- Generates 900-1100 words
- Seamlessly continues narrative
- No conclusion or summary

## Architecture Diagram

```
[Frontend] 
    ↓ POST /webhook (transcript)
[Webhook Handler] ─────────────────────────────────┐
    ↓                                              │
[Perplexity Search]                                │
    │ Model: sonar-pro                             │
    │ Output: 2000+ words of research              │
    ↓                                              │
[Claude Part 1]                                    │
    │ Model: claude-sonnet-4-20250514              │
    │ Input: Research + Transcript                 │
    │ Output: 900-1100 words                       │
    ↓                                              │
[Claude Part 2]                                    │
    │ Model: claude-sonnet-4-20250514              │
    │ Input: Part 1 script                         │
    │ Output: 900-1100 words                       │
    ↓                                              │
[Combiner]                                         │
    │ Merges Part 1 + Part 2                       │
    │ Validates word count                         │
    ↓                                              │
[Response] ────────────────────────────────────────┘
    ↓
[Frontend] - Display 1800-2200 word script
```

## Configuration

Update `config.ts` with your API keys:

```typescript
export const config = {
  perplexity: {
    apiKey: "pplx-YOUR_KEY_HERE",
    model: "sonar-pro"
  },
  anthropic: {
    apiKey: "sk-ant-YOUR_KEY_HERE",
    model: "claude-sonnet-4-20250514"
  }
};
```

## n8n Workflow Mapping

| n8n Node | Service File | Description |
|----------|--------------|-------------|
| Script or Article | webhook.service.ts | Webhook trigger |
| Perplexity Search | perplexity.service.ts | Web research |
| Transcript Part (Part 1) | claude.service.ts | Opening script |
| Transcript Part (Part 2) | claude.service.ts | Continuation |
| Combining Parts1 | combiner.service.ts | Merge scripts |
| Respond to Webhook | webhook.service.ts | Return response |

## Execution Time

Estimated execution time: **30-90 seconds**
- Perplexity Search: 5-15 seconds
- Claude Part 1: 10-30 seconds
- Claude Part 2: 10-30 seconds
- Combine & Respond: <1 second
