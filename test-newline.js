
function parseJsonFromText(text) {
    try {
        JSON.parse(text);
        console.log("Parsed successfully");
    } catch (e) {
        console.log("Parse failed:", e.message);
    }
}

const invalidJson = `{
  "description": "Line 1
Line 2"
}`;

console.log("Testing invalid JSON with literal newline:");
parseJsonFromText(invalidJson);
