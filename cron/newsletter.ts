// cron/newsletter.ts — run daily: npx tsx cron/newsletter.ts
import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { sendDailyNewsletter } from "@/lib/newsletter";
import { generateDailyBriefing } from "@/lib/openai-rewriter";
import type { ArticleCard } from "@/types";

async function sendNewsletter() {
  console.log("[Newsletter] Starting daily send…");
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: new Date(Date.now() - 86400000) } },
    select: { id:true, title:true, slug:true, excerpt:true, imageUrl:true, imageAlt:true, author:true, sourceName:true, category:true, tags:true, isAiRewritten:true, isFeatured:true, isBreaking:true, viewCount:true, readTime:true, publishedAt:true },
    orderBy: { viewCount: "desc" },
    take: 10,
  });

  if (!articles.length) { console.log("[Newsletter] No articles to send."); return; }

  let briefing: string | undefined;
  try {
    briefing = await generateDailyBriefing(articles.map(a => ({ title:a.title, category:a.category, excerpt:a.excerpt })));
  } catch { /* optional */ }

  const result = await sendDailyNewsletter(articles as ArticleCard[], briefing);
  console.log(`[Newsletter] Done. Sent: ${result.sent}, Failed: ${result.failed}`);
}

sendNewsletter();
// Schedule daily at 7:00 AM UTC
cron.schedule("0 7 * * *", sendNewsletter, { timezone: "UTC" });
console.log("[Newsletter] Scheduler running — daily at 07:00 UTC");
process.on("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
