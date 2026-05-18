// lib/openai-rewriter.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RewriteResult {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  readTime: number;
}

const REWRITE_SYSTEM_PROMPT = `You are a senior editor at a prestigious global news publication. 
Your role is to rewrite news articles to be:
- More engaging and readable for a general audience
- Factually accurate (never add or invent facts)
- Well-structured with clear paragraphs
- Written in a professional yet accessible tone (Bloomberg/BBC style)
- SEO-optimized with natural keyword inclusion

Always preserve: key facts, quotes, names, dates, numbers, and source attribution.
Never: add fictional details, change the core meaning, or insert opinion as fact.

Output valid JSON only, no markdown, no preamble.`;

export async function rewriteArticle(
  originalTitle: string,
  originalContent: string
): Promise<RewriteResult> {
  const truncatedContent = originalContent
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);

  const prompt = `Rewrite this news article. Return JSON with exactly these fields:
{
  "title": "improved SEO title (max 70 chars)",
  "content": "full rewritten article in HTML paragraphs using <p> tags only",
  "excerpt": "compelling 2-sentence summary (max 200 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": <estimated minutes as integer>
}

ORIGINAL TITLE: ${originalTitle}

ORIGINAL CONTENT:
${truncatedContent}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: REWRITE_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(raw) as RewriteResult;

  // Validate fields
  if (!parsed.title || !parsed.content || !parsed.excerpt) {
    throw new Error("Invalid rewrite response structure");
  }

  return {
    title: parsed.title.slice(0, 70),
    content: parsed.content,
    excerpt: parsed.excerpt.slice(0, 200),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    readTime: typeof parsed.readTime === "number" ? parsed.readTime : 3,
  };
}

export async function generateDailyBriefing(
  articles: Array<{ title: string; category: string; excerpt: string }>
): Promise<string> {
  const articleSummaries = articles
    .slice(0, 20)
    .map((a) => `[${a.category}] ${a.title}: ${a.excerpt}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert news curator. Write a concise daily briefing that highlights the most important themes and stories. Be authoritative, precise, and insightful. 3-4 sentences max.",
      },
      {
        role: "user",
        content: `Based on today's top stories, write an AI news briefing:\n\n${articleSummaries}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 300,
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "Today's top stories cover key developments across technology, finance, and global affairs."
  );
}

export async function generateSeoMeta(
  title: string,
  content: string
): Promise<{ metaTitle: string; metaDescription: string; keywords: string[] }> {
  const truncated = content.replace(/<[^>]+>/g, " ").slice(0, 1000);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Generate SEO metadata for this article. Return JSON only:
{
  "metaTitle": "SEO title max 60 chars",
  "metaDescription": "meta description 150-160 chars",
  "keywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"]
}

Title: ${title}
Content: ${truncated}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 400,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty SEO response");
  return JSON.parse(raw);
}
