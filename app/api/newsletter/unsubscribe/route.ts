// app/api/newsletter/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/", req.url));
  await prisma.subscriber.updateMany({ where: { token }, data: { status: "UNSUBSCRIBED" } });
  return NextResponse.redirect(new URL("/?newsletter=unsubscribed", req.url));
}
