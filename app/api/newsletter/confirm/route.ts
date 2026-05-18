// app/api/newsletter/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/?newsletter=error", req.url));
  const sub = await prisma.subscriber.findUnique({ where: { token } });
  if (!sub) return NextResponse.redirect(new URL("/?newsletter=invalid", req.url));
  if (sub.status !== "ACTIVE") {
    await prisma.subscriber.update({ where: { token }, data: { status: "ACTIVE", confirmedAt: new Date() } });
    sendWelcomeEmail(sub.email, sub.name ?? undefined).catch(() => {});
  }
  return NextResponse.redirect(new URL("/?newsletter=confirmed", req.url));
}
