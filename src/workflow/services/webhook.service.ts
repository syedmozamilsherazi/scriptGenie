/**
 * Webhook Handler Service
 * 
 * Handles incoming webhook requests and outgoing responses.
 * Matches the n8n webhook node behavior.
 */

import type { WebhookRequest, WebhookResponse, WebhookNodeOutput } from "./types";

/**
 * Parse and validate incoming webhook request
 */
export function parseWebhookRequest(body: unknown): WebhookRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body: expected an object");
  }

  const data = body as Record<string, unknown>;

  if (!data.transcript || typeof data.transcript !== "string") {
    throw new Error("Invalid request: 'transcript' field is required and must be a string");
  }

  if (data.transcript.trim().length === 0) {
    throw new Error("Invalid request: 'transcript' cannot be empty");
  }

  return {
    transcript: data.transcript.trim()
  };
}

/**
 * Clean and preprocess the transcript
 * Removes extra whitespace, normalizes line breaks, etc.
 */
export function preprocessTranscript(transcript: string): string {
  return transcript
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove excessive whitespace
    .replace(/[ \t]+/g, " ")
    // Remove excessive line breaks (more than 2 in a row)
    .replace(/\n{3,}/g, "\n\n")
    // Trim
    .trim();
}

/**
 * Build the webhook response
 */
export function buildWebhookResponse(mergedScript: string): WebhookResponse {
  return {
    merged: mergedScript
  };
}

/**
 * Format response for n8n "Respond to Webhook" node
 * The node is configured to respond with text using {{ $json.merged }}
 */
export function formatResponseForN8n(mergedScript: string): string {
  // n8n respondToWebhook node with respondWith: "text" returns plain text
  return mergedScript;
}

/**
 * Simulate the n8n webhook node output structure
 */
export function simulateWebhookNodeOutput(
  transcript: string,
  headers: Record<string, string> = {},
  params: Record<string, string> = {},
  query: Record<string, string> = {}
): WebhookNodeOutput {
  return {
    body: {
      transcript
    },
    headers,
    params,
    query
  };
}

/**
 * Webhook configuration matching n8n
 */
export const webhookConfig = {
  node: {
    id: "57be00e1-8fb7-4ebc-8f57-b51567891219",
    name: "Script or Article",
    type: "n8n-nodes-base.webhook",
    typeVersion: 2.1
  },
  parameters: {
    httpMethod: "POST",
    path: "31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce",
    responseMode: "responseNode", // Response sent by "Respond to Webhook" node
    options: {}
  },
  urls: {
    test: "https://n8n-14pv.onrender.com/webhook-test/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce",
    production: "https://n8n-14pv.onrender.com/webhook/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce"
  }
};

/**
 * Respond to Webhook configuration matching n8n
 */
export const respondConfig = {
  node: {
    id: "709c8572-a836-4d79-bf49-731c3090a84b",
    name: "Respond to Webhook",
    type: "n8n-nodes-base.respondToWebhook",
    typeVersion: 1.4
  },
  parameters: {
    respondWith: "text",
    responseBody: "={{ $json.merged }}",
    options: {}
  }
};

/**
 * Example request/response flow
 */
export const exampleFlow = {
  // 1. Incoming request
  request: {
    method: "POST",
    url: "https://n8n-14pv.onrender.com/webhook/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      transcript: "Apple just announced their revolutionary new AI features for iPhone. The company unveiled Apple Intelligence, a suite of AI-powered tools that will transform how users interact with their devices..."
    }
  },

  // 2. n8n webhook node receives and passes to Perplexity
  webhookOutput: {
    body: {
      transcript: "Apple just announced their revolutionary new AI features..."
    },
    headers: { "Content-Type": "application/json" },
    params: {},
    query: {}
  },

  // 3. After full workflow execution, response is sent
  response: {
    status: 200,
    contentType: "text/plain",
    body: "In the next eighteen months, every smartphone in your pocket will become more powerful than the supercomputers that once filled entire rooms..."
  }
};

/**
 * Error response builder
 */
export function buildErrorResponse(error: Error): { status: number; message: string } {
  return {
    status: 500,
    message: error.message
  };
}
