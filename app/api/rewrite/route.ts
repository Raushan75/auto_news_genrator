// app/api/rewrite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rewriteArticle, generateSeoMeta } from "@/lib/openai-rewriter";
import { z } from "zod";

const bodySchema = z.object({
  articleId: z.string().cuid(),
  withSeo: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || !["ADMIN", "EDITOR"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = bodySchema.parse(await req.json());

    const article = await prisma.article.findUnique({
      where: { id: body.articleId },
      select: {
        id: true,
        title: true,
        originalContent: true,
        content: true,
        isAiRewritten: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const originalContent = article.originalContent || article.content;
    const rewritten = await rewriteArticle(article.title, originalContent);

    const updateData: Record<string, unknown> = {
      title: rewritten.title,
      content: rewritten.content,
      excerpt: rewritten.excerpt,
      tags: rewritten.tags,
      readTime: rewritten.readTime,
      isAiRewritten: true,
      updatedAt: new Date(),
    };

    if (body.withSeo) {
      const seo = await generateSeoMeta(rewritten.title, rewritten.content);
      // Store SEO meta (could also update SeoMeta table)
      updateData.tags = [
        ...rewritten.tags,
        ...seo.keywords.slice(0, 3),
      ].slice(0, 8);
    }

    const updated = await prisma.article.update({
      where: { id: body.articleId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        excerpt: updated.excerpt,
        isAiRewritten: updated.isAiRewritten,
      },
    });
  } catch (err) {
    console.error("[POST /api/rewrite]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rewrite failed" },
      { status: 500 }
    );
  }
}
