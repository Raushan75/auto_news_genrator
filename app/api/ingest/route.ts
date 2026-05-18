// app/api/ingest/route.ts
// Called by Vercel Cron: vercel.json → { "crons": [{ "path": "/api/ingest", "schedule": "*/15 * * * *" }] }
import { NextRequest, NextResponse } from "next/server";
import { ingestAllFeeds, ingestFeed } from "@/lib/rss-ingester";

// Protect with a shared secret
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // dev mode
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
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
    console.error("[POST /api/ingest]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Ingest failed",
      },
      { status: 500 }
    );
  }
}

export const maxDuration = 300; // 5 min for Vercel Pro
