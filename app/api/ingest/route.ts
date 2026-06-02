// app/api/ingest/route.ts
// Called by Vercel Cron: vercel.json → { "crons": [{ "path": "/api/ingest", "schedule": "*/15 * * * *" }] }
import { NextRequest, NextResponse } from "next/server";
import { ingestAllFeeds, ingestFeed } from "@/lib/rss-ingester";

// Protect with a shared secret
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || "";
  const cronSecret = process.env.CRON_SECRET;
  const publicCronSecret = process.env.NEXT_PUBLIC_CRON_SECRET;

  if (!cronSecret && !publicCronSecret) return true; // dev mode
  return token === cronSecret || token === publicCronSecret;
}

async function handleIngest(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const feedId = searchParams.get("feedId");

  try {
    if (feedId) {
      const result = await ingestFeed(feedId);
      return NextResponse.json({ success: true, data: [result] });
    }

    const results = await ingestAllFeeds();
    const summary = {
      feeds: results.length,
      totalFetched: results.reduce((s, r) => s + r.fetched, 0),
      totalCreated: results.reduce((s, r) => s + r.created, 0),
      totalSkipped: results.reduce((s, r) => s + r.skipped, 0),
      totalErrors: results.reduce((s, r) => s + r.errors.length, 0),
    };

    return NextResponse.json({ success: true, summary, data: results });
  } catch (err) {
    console.error("[INGEST /api/ingest]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Ingest failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handleIngest(req);
}

export async function POST(req: NextRequest) {
  return handleIngest(req);
}

export const maxDuration = 300; // 5 min for Vercel Pro
