
function normalizeSeoResult(parsed, raw) {
  return {
    titles: parsed.titles || [],
    description: parsed.description || "",
    tags: parsed.tags || "",
    raw
  };
}

function extractFromBrokenJson(text) {
  try {
    console.log("Attempting extractFromBrokenJson...");
    // Extract titles array
    // Match ["...", "..."]
    const titlesMatch = text.match(/"titles"\s*:\s*\[([\s\S]*?)\]/);
    let titles = [];
    if (titlesMatch && titlesMatch[1]) {
      // Regex for "string" elements
      const titleMatches = titlesMatch[1].match(/"((?:[^"\\]|\\.)*)"/g);
      if (titleMatches) {
        titles = titleMatches.map(t => {
            // Remove surrounding quotes and unescape
            return t.slice(1, -1).replace(/\\"/g, '"');
        });
      }
    }
    console.log("Extracted titles:", titles);

    // Extract description
    // Regex for "description": "string"
    const descMatch = text.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    let description = "";
    if (descMatch && descMatch[1]) {
      description = descMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
    console.log("Extracted description:", description.substring(0, 50) + "...");

    // Extract tags
    const tagsMatch = text.match(/"tags"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    let tags = "";
    if (tagsMatch && tagsMatch[1]) {
      tags = tagsMatch[1].replace(/\\"/g, '"');
    }
    console.log("Extracted tags:", tags);

    if (titles.length > 0 || description || tags) {
      return normalizeSeoResult({ titles, description, tags }, text);
    }
  } catch (e) {
    console.log("extractFromBrokenJson failed:", e.message);
  }
  return null;
}

const brokenJson = `
{
  "titles": [
    "Title 1",
    "Title \"2\""
  ],
  "description": "This is a description with
newlines and \"quotes\".",
  "tags": "tag1, tag2"
}
`;

console.log("--- Testing Broken JSON ---");
const result = extractFromBrokenJson(brokenJson);
console.log("Result:", JSON.stringify(result, null, 2));
