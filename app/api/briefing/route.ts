// app/api/briefing/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateDailyBriefing } from "@/lib/openai-rewriter";

export async function POST(req: NextRequest) {
  try {
    const { articles } = await req.json();
    const briefing = await generateDailyBriefing(articles ?? []);
    return NextResponse.json({ briefing });
  } catch (e) {
    return NextResponse.json({ briefing: "Unable to generate briefing at this time." }, { status: 500 });
  }
}
