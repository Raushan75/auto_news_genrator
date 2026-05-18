// cron/ingest.ts
// Run with: npx tsx cron/ingest.ts
// Or via Vercel Cron: schedule this as an API route
import cron from "node-cron";
import { ingestAllFeeds } from "@/lib/rss-ingester";
import { prisma } from "@/lib/prisma";

async function run() {
  console.log(`[Cron] Starting RSS ingestion at ${new Date().toISOString()}`);

  try {
    const results = await ingestAllFeeds();
    const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
    const totalFetched = results.reduce((sum, r) => sum + r.fetched, 0);

    console.log(
      `[Cron] Done. Feeds: ${results.length} | Fetched: ${totalFetched} | Created: ${totalCreated}`
    );
  } catch (err) {
    console.error("[Cron] Fatal error:", err);
  }
}

// Run immediately on start
run();

// Then schedule every 15 minutes
cron.schedule("*/15 * * * *", run, {
  scheduled: true,
  timezone: "UTC",
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[Cron] Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

console.log("[Cron] Ingest scheduler running — every 15 minutes");
