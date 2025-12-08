
// const fetch = require('node-fetch'); // Or use native fetch if node version supports it

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
  "gemini-pro-latest",
  "gemini-2.5-pro",
  "gemini-2.0-pro-exp-02-05"
];

const systemPrompt = `You are a YouTube SEO expert specializing in maximizing video discoverability, click-through rates, and watch time. Based on the provided script, generate SEO-optimized content following YouTube's best practices:

TITLES (5 variations):
- Use power words, numbers, and emotional triggers
- Front-load primary keywords (first 3-5 words)
- Keep under 60 characters for mobile visibility
- Include curiosity gaps or clear value propositions
- Avoid clickbait; ensure titles match content
- Use title case capitalization
- NO asterisks, dashes, markdown, or special formatting
- Output ONLY the title text, nothing else

DESCRIPTION (1 comprehensive version):
- Start with a compelling hook in the first 2-3 lines (visible before "Show More")
- Include primary keyword in the first sentence
- Add 3-5 related keywords naturally throughout
- Structure: Hook → What viewers will learn → Timestamps (if applicable) → Call-to-action → Social links placeholder
- Keep under 250 words for optimal engagement
- Use natural paragraph breaks (double line breaks)
- NO asterisks, dashes, markdown, or bullet points
- NO phrases like "Here is the description" or introductory text
- Output ONLY the description content that users will see

TAGS (comma-separated list):
- Include 1-2 broad keywords (high volume)
- Include 3-4 specific long-tail keywords
- Add 2-3 branded/niche terms
- Mix single words and phrases
- Total 8-12 tags, prioritize relevance over quantity
- Use lowercase for consistency
- NO hashtags, NO asterisks, NO markdown
- Format: tag1, tag2, tag3, tag4

Return ONLY valid JSON with this exact structure:
{"titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"], "description": "Your description text here", "tags": "tag1, tag2, tag3, tag4, tag5"}

CRITICAL: Do not include ANY markdown formatting, asterisks (*), dashes (-), or explanatory text. Output pure, copy-ready content.`;

const script = "This is a test script about how to use AI for video generation. It covers tools like Sora, Veo, and others.";

async function testGemini() {
  const prompt = `${systemPrompt}\n\nSCRIPT:\n"""${script}"""`;

  for (const model of GEMINI_MODELS) {
    console.log(`Testing model: ${model}`);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        console.error(`Gemini request failed with ${model}: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(text);
        // Continue to next model
        continue;
      }

      const json = await response.json();
      console.log("Full JSON Response:", JSON.stringify(json, null, 2));
      
      const contentParts = (json?.candidates?.[0]?.content?.parts || []);
      const jsonText = contentParts
        .map((part) => part?.text || "")
        .join("\n")
        .trim();
        
      console.log("Extracted Text:", jsonText);
      console.log(`Success with model: ${model}`);
      return; // Exit on success

    } catch (error) {
      console.error(`Error with ${model}:`, error);
    }
  }
  console.error("All models failed.");
}

testGemini();
