
// const fetch = require('node-fetch'); // Or use native fetch if node version supports it

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || "";

const systemPrompt = `You are a YouTube SEO expert specializing in creating viral, high-conversion content.

Your job is to generate the following for a YouTube video script:

1. YouTube Titles (5 variations - VS-style)
   - Must create contrast or tension between two people, groups, or ideas
   - Use curiosity, emotional pull, or "power moment" framing
   - Keep it under 90 characters
   - Examples: "Michael Jordan's Powerful Words Left Caitlin Clark SPEECHLESS"
   - NO asterisks, dashes, markdown, or special formatting
   - Output ONLY the title text

2. Educational-Style YouTube Description
   - Summarize the script in a clear, educational tone
   - Explain what the viewer will learn, discover, or understand
   - End with a call to action (subscribe, like, comment)
   - NO asterisks, dashes, markdown, or bullet points
   - NO phrases like "Here is the description"
   - Output ONLY the description content

3. Tags (15-25 tags, comma-separated)
   - Must be relevant to the video topic
   - Must be in simple comma style with no special characters
   - NO hashtags, NO asterisks, NO markdown
   - Format: tag1, tag2, tag3, tag4

Return ONLY valid JSON with this exact structure:
{"titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"], "description": "Your description text here", "tags": "tag1, tag2, tag3, tag4, tag5"}

CRITICAL: Do not include ANY markdown formatting, asterisks (*), dashes (-), or explanatory text. Output pure, copy-ready content.`;

const script = "This is a test script about how to use AI for video generation. It covers tools like Sora, Veo, and others.";

async function testOpenAI() {
  const prompt = `${systemPrompt}\n\nSCRIPT:\n"""${script}"""`;

  console.log("Testing OpenAI API...");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Please generate YouTube SEO content for this script:\n\n${script}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI request failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error("Error Details:", text);
      return;
    }

    const json = await response.json();
    console.log("Full JSON Response:", JSON.stringify(json, null, 2));
    
    const jsonText = json?.choices?.[0]?.message?.content || "";
    console.log("Extracted Text:", jsonText);
    console.log("Success!");

  } catch (error) {
    console.error("Error:", error);
  }
}

testOpenAI();
