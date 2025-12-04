/**
 * Script Combiner Service
 * 
 * Combines Part 1 and Part 2 of the YouTube script into a single
 * cohesive document with proper formatting and metadata.
 */

import type { CombineNodeOutput } from "./types";

/**
 * Combine two script parts into a single merged script
 */
export function combineScriptParts(part1: string, part2: string): CombineNodeOutput {
  // Clean up whitespace from both parts
  const cleanPart1 = part1.trim();
  const cleanPart2 = part2.trim();

  // Merge with double newline for natural paragraph separation
  const merged = `${cleanPart1}\n\n${cleanPart2}`;

  // Calculate word count
  const wordCount = countWords(merged);

  return {
    merged,
    part1: cleanPart1,
    part2: cleanPart2,
    wordCount,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
}

/**
 * Validate the combined script meets requirements
 */
export function validateCombinedScript(output: CombineNodeOutput): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum word count
  if (output.wordCount < 1800) {
    errors.push(`Script too short: ${output.wordCount} words (minimum 1800)`);
  }

  // Check maximum word count
  if (output.wordCount > 2500) {
    warnings.push(`Script may be too long: ${output.wordCount} words (recommended max 2200)`);
  }

  // Check for empty parts
  if (!output.part1 || output.part1.length === 0) {
    errors.push("Part 1 is empty");
  }

  if (!output.part2 || output.part2.length === 0) {
    errors.push("Part 2 is empty");
  }

  // Check for formatting issues
  if (output.merged.includes("**")) {
    warnings.push("Script contains markdown bold formatting (**)");
  }

  if (output.merged.includes("##") || output.merged.includes("# ")) {
    warnings.push("Script contains markdown headers");
  }

  if (output.merged.includes("- ") || output.merged.match(/^\d+\./m)) {
    warnings.push("Script may contain bullet points or numbered lists");
  }

  // Check for common AI artifacts
  const aiArtifacts = [
    "Part 1",
    "Part 2",
    "Script:",
    "Here is",
    "I'll write",
    "Let me",
    "In conclusion",
    "To summarize",
    "In summary"
  ];

  for (const artifact of aiArtifacts) {
    if (output.merged.toLowerCase().includes(artifact.toLowerCase())) {
      warnings.push(`Script contains potential AI artifact: "${artifact}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format the combined script for different outputs
 */
export function formatScript(merged: string, format: "plain" | "html" | "markdown"): string {
  switch (format) {
    case "html":
      // Convert paragraphs to HTML
      return merged
        .split("\n\n")
        .map(para => `<p>${para.trim()}</p>`)
        .join("\n");

    case "markdown":
      // Already plain text, just ensure proper paragraph spacing
      return merged
        .split("\n\n")
        .map(para => para.trim())
        .join("\n\n");

    case "plain":
    default:
      return merged;
  }
}

/**
 * n8n Code Node equivalent implementation
 * This is the exact JavaScript that would run in an n8n Code node
 */
export const n8nCodeNodeScript = `
// Access Part 1 output from the first Transcript Part node
const part1 = $('Transcript Part  ').first().json.output;

// Access Part 2 output from the second Transcript Part node  
const part2 = $('Transcript Part ').first().json.output;

// Combine both parts with proper spacing
const merged = part1.trim() + '\\n\\n' + part2.trim();

// Calculate word count
const wordCount = merged.split(/\\s+/).filter(w => w.length > 0).length;

// Return the combined script
return {
  merged: merged,
  part1: part1,
  part2: part2,
  wordCount: wordCount,
  generatedAt: new Date().toISOString()
};
`;

/**
 * Example usage
 */
export const exampleUsage = {
  input: {
    part1: "In the next eighteen months, every smartphone in your pocket...",
    part2: "The implications of this shift extend far beyond convenience..."
  },
  output: {
    merged: "In the next eighteen months, every smartphone in your pocket...\n\nThe implications of this shift extend far beyond convenience...",
    part1: "In the next eighteen months, every smartphone in your pocket...",
    part2: "The implications of this shift extend far beyond convenience...",
    wordCount: 2100,
    generatedAt: "2025-12-03T10:30:00.000Z"
  }
};

/**
 * n8n equivalent node configuration
 */
export const n8nNodeConfig = {
  name: "Combining Parts1",
  type: "n8n-nodes-base.code",
  parameters: {
    mode: "runOnceForEachItem",
    jsCode: n8nCodeNodeScript
  }
};
