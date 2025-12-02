/**
 * Webhook Trigger Node
 * 
 * This is the entry point for the YouTube script generation workflow.
 * It receives POST requests from the frontend containing the article or transcript.
 * 
 * Node: n8n-nodes-base.webhook
 * Version: 2.1
 */

export interface WebhookConfig {
  httpMethod: "POST";
  path: string;
  responseMode: "responseNode";
  webhookId: string;
}

export interface WebhookRequestBody {
  transcript: string;
}

export interface WebhookOutput {
  body: {
    transcript: string;
  };
  headers: Record<string, string>;
  params: Record<string, string>;
  query: Record<string, string>;
}

/**
 * Webhook Configuration
 */
export const webhookConfig: WebhookConfig = {
  httpMethod: "POST",
  path: "31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce",
  responseMode: "responseNode", // Response will be sent by "Respond to Webhook" node
  webhookId: "31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce"
};

/**
 * Node Name: "Script or Article"
 * 
 * This node triggers when a POST request is received at:
 * - Test URL: https://n8n-14pv.onrender.com/webhook-test/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce
 * - Production URL: https://n8n-14pv.onrender.com/webhook/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce
 * 
 * Expected Input:
 * {
 *   "transcript": "Your article or transcript content here..."
 * }
 * 
 * Output:
 * The webhook passes the entire request body to the next node (Perplexity Search).
 * The transcript is accessible via: $json.body.transcript
 */

export const nodeDefinition = {
  id: "57be00e1-8fb7-4ebc-8f57-b51567891219",
  name: "Script or Article",
  type: "n8n-nodes-base.webhook",
  typeVersion: 2.1,
  position: [-416, 80],
  parameters: {
    httpMethod: "POST",
    path: "31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce",
    responseMode: "responseNode",
    options: {}
  }
};

/**
 * Connection:
 * Script or Article → Perplexity Search
 * 
 * The webhook output flows to the Perplexity Search node for web research.
 */
export const connections = {
  output: {
    main: [
      {
        node: "Perplexity Search",
        type: "main",
        index: 0
      }
    ]
  }
};
