
const systemPrompt = `...`; // (omitted for brevity)

function normalizeSeoResult(parsed, raw) {
  // Simplified version for testing
  return {
    titles: parsed.titles || [],
    description: parsed.description || "",
    tags: parsed.tags || "",
    raw
  };
}

function parseJsonFromText(text) {
  let cleaned = text.trim();
  
  console.log("Original text length:", text.length);
  console.log("First 20 chars:", text.substring(0, 20));
  console.log("Last 20 chars:", text.substring(text.length - 20));

  // Remove markdown code blocks if present (e.g. ```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  console.log("Cleaned text length:", cleaned.length);

  try {
    const parsed = JSON.parse(cleaned);
    console.log("JSON.parse(cleaned) success");
    return normalizeSeoResult(parsed, text);
  } catch (error) {
    console.log("JSON.parse(cleaned) failed:", error.message);
    
    // Try to extract the first JSON block if the model wrapped it in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log("Found JSON match via regex");
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("JSON.parse(match) success");
        return normalizeSeoResult(parsed, text);
      } catch (innerError) {
        console.log("JSON.parse(match) failed:", innerError.message);
      }
    } else {
        console.log("No JSON match found via regex");
    }
  }

  return null;
}

// Test case 1: Clean JSON
const test1 = `{"titles": ["T1", "T2"], "description": "Desc", "tags": "t1, t2"}`;
console.log("\n--- Test 1 ---");
parseJsonFromText(test1);

// Test case 2: Markdown wrapped
const test2 = "```json\n" + test1 + "\n```";
console.log("\n--- Test 2 ---");
parseJsonFromText(test2);

// Test case 3: Markdown with text
const test3 = "Here is the JSON:\n```json\n" + test1 + "\n```\nHope this helps.";
console.log("\n--- Test 3 ---");
parseJsonFromText(test3);

// Test case 4: The one from the screenshot (simulated)
const test4 = `{"titles": ["AI Models 2025: The Ultimate Guide", "Top AI Models 2025: See What's New", "2025's Best AI: GPT-4o, Gemini, Claude", "Unlock AI Potential: Best Models of 2025", "Future of AI: New Models You Need To Know"], "description": "Discover the most powerful AI models of 2025 and how they're changing everything! We're diving deep into the top AI advancements that are smarter, more creative, and far more capable than ever before.", "tags": "youtube, video content, tutorial, guide"}`;
console.log("\n--- Test 4 ---");
parseJsonFromText(test4);
