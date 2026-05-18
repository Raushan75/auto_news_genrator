// lib/rss-ingester.ts
import Parser from "rss-parser";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { rewriteArticle } from "@/lib/openai-rewriter";
import type { Category, ArticleStatus } from "@prisma/client";
import type { IngestResult, RawRssItem } from "@/types";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["dc:creator", "creator"],
    ],
  },
  timeout: 15000,
});

function extractImageUrl(item: RawRssItem): string | null {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.["$"]?.url) return item["media:content"]["$"].url;
  // Try extracting img from content
  const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) return imgMatch[1];
  return null;
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function generateSlug(title: string, feedId: string): string {
  const base = slugify(title, { lower: true, strict: true, trim: true });
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`.slice(0, 120);
}

export async function ingestFeed(feedId: string): Promise<IngestResult> {
  const feed = await prisma.rssFeed.findUnique({ where: { id: feedId } });
  if (!feed) throw new Error(`Feed ${feedId} not found`);

  const result: IngestResult = {
    feedId: feed.id,
    feedName: feed.name,
    fetched: 0,
    created: 0,
    skipped: 0,
    errors: [],
  };

  let parsedFeed;
  try {
    parsedFeed = await parser.parseURL(feed.url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.rssFeed.update({
      where: { id: feedId },
      data: { errorCount: { increment: 1 }, lastError: msg },
    });
    throw new Error(`Failed to parse feed ${feed.name}: ${msg}`);
  }

  result.fetched = parsedFeed.items.length;

  for (const item of parsedFeed.items.slice(0, 20)) {
    try {
      const sourceUrl = item.link;
      if (!sourceUrl) { result.skipped++; continue; }

      // Skip duplicates
      const exists = await prisma.article.findFirst({
        where: { sourceUrl },
        select: { id: true },
      });
      if (exists) { result.skipped++; continue; }

      const title = item.title?.trim();
      if (!title || title.length < 10) { result.skipped++; continue; }

      const rawContent = item.content || item.contentSnippet || "";
      const excerpt = (item.contentSnippet || rawContent.replace(/<[^>]+>/g, ""))
        .slice(0, 300)
        .trim();

      const imageUrl = extractImageUrl(item as RawRssItem);
      const slug = generateSlug(title, feedId);

      // Determine if we should auto-rewrite (only for English content > 100 chars)
      const shouldRewrite =
        process.env.OPENAI_API_KEY &&
        rawContent.length > 100 &&
        process.env.AUTO_REWRITE === "true";

      let content = rawContent;
      let isAiRewritten = false;

      if (shouldRewrite) {
        try {
          const rewritten = await rewriteArticle(title, rawContent);
          content = rewritten.content;
          isAiRewritten = true;
        } catch {
          // Fall back to original
        }
      }

      await prisma.article.create({
        data: {
          title,
          slug,
          originalTitle: title,
          excerpt: excerpt || title,
          content,
          originalContent: rawContent,
          imageUrl,
          author: item.creator || parsedFeed.title || feed.name,
          sourceUrl,
          sourceName: parsedFeed.title || feed.name,
          category: feed.category as Category,
          tags: [],
          status: "PUBLISHED" as ArticleStatus,
          isAiRewritten,
          readTime: estimateReadTime(rawContent),
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          feedId: feed.id,
        },
      });

      result.created++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Item "${item.title?.slice(0, 50)}": ${msg}`);
    }
  }

  await prisma.rssFeed.update({
    where: { id: feedId },
    data: {
      lastFetched: new Date(),
      fetchCount: { increment: 1 },
      errorCount: result.errors.length > 0 ? { increment: 1 } : undefined,
      lastError: result.errors.length > 0 ? result.errors[0] : null,
    },
  });

  console.log(
    `[RSS] ${feed.name}: fetched=${result.fetched} created=${result.created} skipped=${result.skipped} errors=${result.errors.length}`
  );

  return result;
}

export async function ingestAllFeeds(): Promise<IngestResult[]> {
  const feeds = await prisma.rssFeed.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const results: IngestResult[] = [];

  // Process feeds with concurrency limit of 3
  for (let i = 0; i < feeds.length; i += 3) {
    const batch = feeds.slice(i, i + 3);
    const batchResults = await Promise.allSettled(
      batch.map((f) => ingestFeed(f.id))
    );
    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }
  }

  return results;
}
