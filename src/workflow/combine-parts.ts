/**
 * Combine Parts Node
 * 
 * This node merges Part 1 and Part 2 of the YouTube script into a single
 * cohesive document. In the n8n workflow, this is typically done with a
 * Code node or Set node that concatenates the outputs.
 * 
 * Node: Code Node or Set Node
 */

export interface Part1Output {
  output: string; // Part 1 script content
}

export interface Part2Output {
  output: string; // Part 2 script content
}

export interface CombinedOutput {
  merged: string; // Full combined script
  part1: string;  // Original Part 1 for reference
  part2: string;  // Original Part 2 for reference
  wordCount: number;
  timestamp: string;
}

/**
 * Combine Parts Function
 * 
 * Takes both script parts and merges them with proper spacing.
 * Preserves individual parts for debugging/reference.
 */
export function combineParts(part1: string, part2: string): CombinedOutput {
  // Clean up any extra whitespace
  const cleanPart1 = part1.trim();
  const cleanPart2 = part2.trim();
  
  // Merge with double newline for paragraph separation
  const merged = `${cleanPart1}\n\n${cleanPart2}`;
  
  // Calculate approximate word count
  const wordCount = merged.split(/\s+/).length;
  
  return {
    merged,
    part1: cleanPart1,
    part2: cleanPart2,
    wordCount,
    timestamp: new Date().toISOString()
  };
}

/**
 * n8n Code Node Implementation
 * 
 * This is the JavaScript code that would run in an n8n Code node.
 * It accesses the outputs from both Transcript Part nodes.
 */
export const n8nCodeNodeScript = `
// Access Part 1 output from the first Transcript Part node
const part1 = $('Transcript Part  ').first().json.output;

// Access Part 2 output from the second Transcript Part node  
const part2 = $('Transcript Part ').first().json.output;

// Combine both parts with proper spacing
const merged = part1.trim() + '\\n\\n' + part2.trim();

// Return the combined script
return {
  merged: merged,
  part1: part1,
  part2: part2,
  wordCount: merged.split(/\\s+/).length,
  generatedAt: new Date().toISOString()
};
`;

/**
 * Alternative: n8n Set Node Implementation
 * 
 * If using a Set node instead of Code node, the expression would be:
 */
export const n8nSetNodeExpression = {
  fieldName: "merged",
  expression: "={{ $('Transcript Part  ').first().json.output + '\\n\\n' + $('Transcript Part ').first().json.output }}"
};

/**
 * Node Definition
 */
export const nodeDefinition = {
  id: "combining-parts-1",
  name: "Combining Parts1",
  type: "n8n-nodes-base.code", // or n8n-nodes-base.set
  typeVersion: 2,
  position: [400, 64],
  parameters: {
    mode: "runOnceForEachItem",
    jsCode: n8nCodeNodeScript
  }
};

/**
 * Connections
 * 
 * Input: Transcript Part 2 (which has access to Part 1 via n8n expressions)
 * Output: Respond to Webhook
 */
export const connections = {
  input: {
    from: "Transcript Part ", // Part 2
    type: "main"
  },
  output: {
    main: [
      {
        node: "Respond to Webhook",
        type: "main",
        index: 0
      }
    ]
  }
};

/**
 * Example Combined Output
 */
export const exampleOutput: CombinedOutput = {
  merged: `In the next eighteen months, every smartphone in your pocket will become more powerful than the supercomputers that once filled entire rooms. But here's what's truly mind-bending: these devices won't just be running apps anymore—they'll be running artificial minds capable of genuine reasoning, creativity, and decision-making that rivals human intelligence.

The transformation happening right now isn't just another tech upgrade. It's the moment digital assistants stop being simple voice-activated search engines and evolve into something far more profound: true digital companions that can think, plan, and execute complex tasks entirely on their own.

For over a decade, we've been stuck with digital assistants that were essentially glorified parlor tricks. Siri could tell you the weather. Alexa could play your music. Google Assistant could answer basic questions by searching the internet. These systems were impressive when they launched, but they were fundamentally limited by a crucial flaw: they couldn't actually think.

[Part 1 continues...]

The implications of this shift extend far beyond convenience. When your phone can genuinely understand context, remember your preferences across months of interactions, and anticipate your needs before you even articulate them, the relationship between human and machine fundamentally changes.

Consider what happened last month when a beta tester in San Francisco asked their AI assistant to help plan a surprise anniversary dinner. The system didn't just suggest restaurants—it analyzed the user's calendar, identified scheduling conflicts, checked the weather forecast, researched the couple's dining history from previous conversations, and even suggested a backup plan in case the first reservation fell through.

"We're not just building smarter tools," explains Dr. Sarah Chen, a cognitive scientist who has been studying human-AI interaction for over a decade. "We're creating entities that can genuinely collaborate with humans in ways that were science fiction just three years ago."

[Part 2 continues...]`,
  part1: "[Part 1 content - 900-1100 words]",
  part2: "[Part 2 content - 900-1100 words]",
  wordCount: 2100,
  timestamp: "2025-12-02T10:30:00.000Z"
};

/**
 * Quality Checks
 * 
 * The combined script should:
 * - Be 1800-2200 words total (900-1100 per part)
 * - Flow seamlessly between parts
 * - Have no duplicate content
 * - Maintain consistent tone and style
 * - Be ready for YouTube video production
 */
export const qualityChecks = {
  minWordCount: 1800,
  maxWordCount: 2200,
  seamlessTransition: true,
  noDuplicates: true,
  consistentTone: true,
  productionReady: true
};
