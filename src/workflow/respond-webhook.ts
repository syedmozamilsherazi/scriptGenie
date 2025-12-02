/**
 * Respond to Webhook Node
 * 
 * This is the final node in the workflow that sends the combined script
 * back to the frontend. It responds with plain text containing the merged script.
 * 
 * Node: n8n-nodes-base.respondToWebhook
 * Version: 1.4
 */

export interface RespondConfig {
  respondWith: "text" | "json" | "binary" | "noData";
  responseBody: string;
  options: Record<string, unknown>;
}

export interface ResponseOutput {
  success: boolean;
  statusCode: number;
  body: string;
}

/**
 * Response Configuration
 * 
 * The node is configured to respond with plain text.
 * The response body uses the merged script from the Combining Parts node.
 */
export const respondConfig: RespondConfig = {
  respondWith: "text",
  responseBody: "={{ $json.merged }}", // Expression to get merged script
  options: {}
};

/**
 * Node Definition
 */
export const nodeDefinition = {
  id: "709c8572-a836-4d79-bf49-731c3090a84b",
  name: "Respond to Webhook",
  type: "n8n-nodes-base.respondToWebhook",
  typeVersion: 1.4,
  position: [608, 96],
  parameters: {
    respondWith: "text",
    responseBody: "={{ $json.merged }}",
    options: {}
  }
};

/**
 * Connections
 * 
 * Input: Combining Parts1 (merged script)
 * Output: None (this is the terminal node)
 */
export const connections = {
  input: {
    from: "Combining Parts1",
    type: "main"
  },
  output: null // Terminal node - sends response to original webhook caller
};

/**
 * Response Format
 * 
 * The frontend receives a plain text response containing the full script.
 * No JSON parsing is required on the frontend.
 */
export const responseFormat = {
  contentType: "text/plain",
  body: "The merged script text (1800-2200 words)",
  statusCode: 200
};

/**
 * Example Response
 * 
 * This is what the frontend receives after a successful workflow execution.
 */
export const exampleResponse = `In the next eighteen months, every smartphone in your pocket will become more powerful than the supercomputers that once filled entire rooms. But here's what's truly mind-bending: these devices won't just be running apps anymore—they'll be running artificial minds capable of genuine reasoning, creativity, and decision-making that rivals human intelligence.

The transformation happening right now isn't just another tech upgrade. It's the moment digital assistants stop being simple voice-activated search engines and evolve into something far more profound: true digital companions that can think, plan, and execute complex tasks entirely on their own.

For over a decade, we've been stuck with digital assistants that were essentially glorified parlor tricks. Siri could tell you the weather. Alexa could play your music. Google Assistant could answer basic questions by searching the internet. These systems were impressive when they launched, but they were fundamentally limited by a crucial flaw: they couldn't actually think.

Ask them to do anything that required genuine reasoning, creativity, or multi-step problem-solving, and they would fail spectacularly. That era is ending with shocking speed. The artificial intelligence models powering today's digital assistants have undergone a revolutionary transformation that most people don't fully appreciate yet.

[... Full 1800-2200 word script continues ...]

The implications of this shift extend far beyond convenience. When your phone can genuinely understand context, remember your preferences across months of interactions, and anticipate your needs before you even articulate them, the relationship between human and machine fundamentally changes.

Consider what happened last month when a beta tester in San Francisco asked their AI assistant to help plan a surprise anniversary dinner. The system didn't just suggest restaurants—it analyzed the user's calendar, identified scheduling conflicts, checked the weather forecast, researched the couple's dining history from previous conversations, and even suggested a backup plan in case the first reservation fell through.

"We're not just building smarter tools," explains Dr. Sarah Chen, a cognitive scientist who has been studying human-AI interaction for over a decade. "We're creating entities that can genuinely collaborate with humans in ways that were science fiction just three years ago."

The financial stakes are staggering. Industry analysts estimate that the market for AI-powered personal assistants will exceed four hundred billion dollars by 2027...`;

/**
 * Frontend Integration
 * 
 * The frontend should handle the response as plain text:
 * 
 * ```typescript
 * const response = await fetch(WEBHOOK_URL, {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ transcript })
 * });
 * 
 * const scriptText = await response.text();
 * setResult(scriptText);
 * ```
 */
export const frontendIntegration = {
  method: "POST",
  requestContentType: "application/json",
  requestBody: { transcript: "User's article or transcript" },
  responseContentType: "text/plain",
  responseBody: "Full generated script as plain text"
};

/**
 * Error Handling
 * 
 * If any node in the workflow fails, n8n will return an error response.
 * The frontend should handle these gracefully.
 */
export const errorHandling = {
  possibleErrors: [
    {
      code: 500,
      reason: "Workflow execution failed",
      action: "Check n8n logs for details"
    },
    {
      code: 408,
      reason: "Request timeout",
      action: "Workflow took too long (common with AI calls)"
    },
    {
      code: 400,
      reason: "Invalid request body",
      action: "Ensure transcript is provided in request"
    }
  ]
};

/**
 * Important Notes
 * 
 * 1. The "Script or Article" webhook node must have responseMode: "responseNode"
 *    to allow this node to send the response.
 * 
 * 2. Content-Type header recommendation: Add "Content-Type: text/plain" header
 *    in options to avoid frontend JSON parsing issues.
 * 
 * 3. The {{ $json.merged }} expression pulls from the Combining Parts node output.
 */
export const importantNotes = [
  "Webhook must use responseMode: 'responseNode'",
  "Response is plain text, not JSON",
  "Frontend should use response.text() not response.json()",
  "$json.merged contains the full combined script"
];
