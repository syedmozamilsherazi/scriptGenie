# YouTube Script Generation Workflow

This folder contains the code documentation for the n8n workflow that powers the ScriptGenie application.

## Workflow Overview

The workflow transforms any article or transcript into a professional YouTube script through the following pipeline:

1. **Webhook Trigger** - Receives the transcript from the frontend
2. **Perplexity Search** - Performs deep web research on the topic
3. **Claude Part 1** - Generates the first part of the script (1200-1500 words)
4. **Claude Part 2** - Continues the script seamlessly (900-1100 words)
5. **Combine & Respond** - Merges both parts and returns to frontend

## Files

- `webhook.ts` - Webhook trigger configuration
- `perplexity-search.ts` - Perplexity AI web search integration
- `claude-part1.ts` - First script generation with Claude
- `claude-part2.ts` - Second script generation with Claude
- `combine-parts.ts` - Merges both script parts
- `respond-webhook.ts` - Returns the final script

## Architecture

```
[Frontend] 
    ↓ POST /webhook (transcript)
[Webhook Trigger]
    ↓
[Perplexity Search] - Web research for facts & context
    ↓
[Claude Part 1] - Generate opening (1200-1500 words)
    ↓
[Claude Part 2] - Continue story (900-1100 words)
    ↓
[Combine Parts] - Merge into final script
    ↓
[Respond to Webhook] - Return merged script
    ↓
[Frontend] - Display result
```
