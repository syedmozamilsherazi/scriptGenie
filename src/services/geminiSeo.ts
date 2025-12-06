export interface SeoResult {
  titles: string[];
  description: string;
  tags: string;
  raw?: string;
}

const GEMINI_API_KEY = "AIzaSyCDxvrLvwCx-FgYPGr_F45KQDv4ZmWCaj4";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
  - Write a longer, SEO-rich description (aim for 200-250 words, but not too short)
  - Start with a compelling hook in the first 2-3 lines (visible before "Show More")
  - Include primary keyword in the first sentence
  - Add 3-5 related keywords naturally throughout
  - Structure: Hook → What viewers will learn → Timestamps (if applicable) → Real call-to-action (not a placeholder) → Social links (if provided)
  - NO placeholders of any kind (e.g. [Placeholder for Call to Action], [Insert CTA here], etc.)
  - Always write a natural, complete call-to-action (e.g. "Subscribe for more insights!"), never a placeholder
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

function cleanJsonText(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code blocks if present (e.g. ```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

function parseJsonFromText(text: string): SeoResult | null {
  const cleaned = cleanJsonText(text);

  try {
    const parsed = JSON.parse(cleaned);
    return normalizeSeoResult(parsed, text);
  } catch (error) {
    // Try to extract the first JSON block if the model wrapped it in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return normalizeSeoResult(parsed, text);
      } catch (innerError) {
        // fall through to heuristic parsing
      }
    }
    
    // Last resort: Regex extraction for broken JSON (e.g. unescaped newlines)
    return extractFromBrokenJson(text);
  }
}

function extractFromBrokenJson(text: string): SeoResult | null {
  try {
    // Extract titles array
    const titlesMatch = text.match(/"titles"\s*:\s*\[([\s\S]*?)\]/);
    let titles: string[] = [];
    if (titlesMatch && titlesMatch[1]) {
      // Regex for "string" elements, handling escaped quotes
      const titleMatches = titlesMatch[1].match(/"((?:[^"\\]|\\.)*)"/g);
      if (titleMatches) {
        titles = titleMatches.map(t => t.slice(1, -1).replace(/\\"/g, '"')); 
      }
    }

    // Extract description
    // Regex for "description": "string", handling escaped quotes
    // Use [\s\S] instead of . to match newlines inside the description string
    const descMatch = text.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    let description = "";
    if (descMatch && descMatch[1]) {
      description = descMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }

    // Extract tags
    const tagsMatch = text.match(/"tags"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    let tags = "";
    if (tagsMatch && tagsMatch[1]) {
      tags = tagsMatch[1].replace(/\\"/g, '"');
    }

    if (titles.length > 0 || description || tags) {
      return normalizeSeoResult({ titles, description, tags }, text);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function normalizeSeoResult(parsed: any, raw: string): SeoResult {
  // Clean titles: remove markdown, asterisks, dashes, numbering, quotes
  const titles = Array.isArray(parsed?.titles)
    ? parsed.titles
        .map((title: unknown) => {
          let cleaned = String(title)
            .replace(/^\d+[\.)]\s*/, '') // Remove leading numbers like "1. " or "1) "
            .replace(/^[-*•]\s*/, '') // Remove leading dashes, asterisks, bullets
            .replace(/\*\*/g, '') // Remove bold markdown
            .replace(/\*/g, '') // Remove asterisks
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .replace(/^Title\s*\d*:\s*/i, '') // Remove "Title 1:" prefix
            .trim();
          return cleaned;
        })
        .filter(Boolean)
        .slice(0, 5)
    : [];

  // Clean description: remove markdown, asterisks, AI preambles
  let description = parsed?.description ? String(parsed.description) : "";
  if (description) {
    description = description
      .replace(/^\s*(Here is the description|Description|Here's the|Here is a).*?[:]/i, '') // Remove preambles
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove asterisks
      .replace(/^[-•]\s*/gm, '') // Remove bullet points at line start
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert markdown links to plain text
      .trim();
  }

  // Clean tags: remove hashtags, asterisks, extra spaces
  let tags = parsed?.tags ? String(parsed.tags) : "";
  if (tags) {
    tags = tags
      .replace(/^(Tags|Here are the tags|Tag list).*?[:]/i, '') // Remove preambles
      .replace(/#/g, '') // Remove hashtags
      .replace(/\*/g, '') // Remove asterisks
      .replace(/\s+,/g, ',') // Fix spacing before commas
      .replace(/,\s+/g, ', ') // Normalize spacing after commas
      .trim();
  }

  return {
    titles,
    description,
    tags,
    raw,
  };
}

function buildFallback(text: string): SeoResult {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  
  // Extract and clean titles
  const titles = lines
    .filter((line) => /^title/i.test(line) || line.length < 120)
    .slice(0, 5)
    .map((line) => 
      line
        .replace(/^title\s*\d*[:.-]?\s*/i, '')
        .replace(/^\d+[\.)]\s*/, '')
        .replace(/^[-*•]\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^["']|["']$/g, '')
        .trim()
    )
    .filter(Boolean);

  const tagsLine = lines.find((line) => /tags?:/i.test(line));
  const tags = tagsLine 
    ? tagsLine
        .replace(/tags?:\s*/i, "")
        .replace(/#/g, '')
        .replace(/\*/g, '')
        .trim()
    : "youtube, video content, tutorial, guide";

  // Description fallback: use the longest remaining line or the raw text
  const descriptionCandidates = lines.filter((line) => !titles.includes(line) && line !== tagsLine);
  let description = descriptionCandidates.sort((a, b) => b.length - a.length)[0] || text;
  description = description
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^[-•]\s*/gm, '')
    .trim();

  return {
    titles: titles.length ? titles : ["Discover Amazing Content in This Video", "Watch This Must-See Video", "You Won't Believe What Happens Next", "The Ultimate Guide You Need to See", "Everything You Need to Know About This"],
    description: description || "Watch this video to discover valuable insights and information. Don't forget to like, subscribe, and hit the notification bell for more content!",
    tags: tags,
    raw: text,
  };
}

export async function generateYoutubeSeo(script: string): Promise<SeoResult> {
  const prompt = `${systemPrompt}\n\nSCRIPT:\n"""${script}"""`;

  const response = await fetch(GEMINI_ENDPOINT, {
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
    throw new Error(`Gemini request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const contentParts = (json?.candidates?.[0]?.content?.parts || []);
  const jsonText = contentParts
    .map((part: any) => part?.text || "")
    .join("\n")
    .trim();

  console.log("Gemini Raw Response:", jsonText);

  const cleanedJsonText = cleanJsonText(jsonText);

  // Prefer direct JSON parse (handles plain JSON or JSON string)
  const directParsed = parseJsonFromText(cleanedJsonText);
  if (directParsed) {
    return directParsed;
  }

  // Fallback to heuristic parsing if JSON parsing fails
  // Check if the text looks like JSON before falling back to line-based parsing
  if (cleanedJsonText.startsWith('{') && cleanedJsonText.endsWith('}')) {
      // If it looks like JSON but failed parsing, it's likely broken JSON.
      // We should NOT use buildFallback because it will treat the whole JSON string as description.
      // Instead, return a partial result or empty result to avoid showing raw JSON.
      console.warn("Failed to parse JSON response, and regex extraction also failed.");
      
      // Try one more time with extractFromBrokenJson on the raw text (in case cleaning removed something important?)
      // Actually, parseJsonFromText already calls extractFromBrokenJson.
      
      return {
          titles: [],
          description: "",
          tags: "",
          raw: jsonText
      };
  }

  return buildFallback(jsonText || JSON.stringify(json));
}

export function buildSeoHistoryItem(script: string, seo: SeoResult) {
  // Generate ID without relying on crypto to avoid storage context errors
  const randomId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
  };
  
  return {
    id: randomId(),
    script,
    titles: seo.titles,
    description: seo.description,
    tags: seo.tags,
    timestamp: Date.now(),
  };
}
