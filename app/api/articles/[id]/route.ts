// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { feed: { select: { name: true, url: true } } },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Increment view count
  prisma.article.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  return NextResponse.json({ success: true, data: article });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const article = await prisma.article.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ success: true, data: article });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.article.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
