// app/api/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Category, ArticleStatus } from "@prisma/client";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  isBreaking: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sort: z.enum(["latest", "popular", "trending"]).default("latest"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const where = {
      status: (params.status as ArticleStatus) || "PUBLISHED",
      ...(params.category && {
        category: params.category.toUpperCase() as Category,
      }),
      ...(params.isBreaking !== undefined && {
        isBreaking: params.isBreaking,
      }),
      ...(params.isFeatured !== undefined && {
        isFeatured: params.isFeatured,
      }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: "insensitive" as const } },
          { excerpt: { contains: params.search, mode: "insensitive" as const } },
          { tags: { has: params.search } },
        ],
      }),
    };

    const orderBy =
      params.sort === "popular"
        ? { viewCount: "desc" as const }
        : params.sort === "trending"
          ? { viewCount: "desc" as const } // could add trending score
          : { publishedAt: "desc" as const };

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          imageAlt: true,
          author: true,
          sourceName: true,
          category: true,
          tags: true,
          isAiRewritten: true,
          isFeatured: true,
          isBreaking: true,
          viewCount: true,
          readTime: true,
          publishedAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: articles,
      total,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: params.page * params.pageSize < total,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors },
        { status: 400 }
      );
    }
    console.error("[GET /api/articles]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
