// app/(site)/[category]/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import {
  generateMetadata as genMeta,
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";

import { cn, formatDate, getCategoryConfig } from "@/lib/utils";

import { ArticleCard } from "@/components/news/ArticleCard";
import { AdSlot } from "@/components/news/AdSlot";
import { NewsletterSection } from "@/components/news/NewsletterSection";

type Props = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export const revalidate = 3600;

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      feed: {
        select: {
          name: true,
          url: true,
        },
      },
    },
  });

  if (!article || article.status !== "PUBLISHED") {
    return null;
  }

  prisma.article
    .update({
      where: { id: article.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })
    .catch(() => {});

  return article;
}

async function getRelated(id: string, category: string) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      category: category as never,
      id: {
        not: id,
      },
    },
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
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;

  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article not found",
    };
  }

  return genMeta({
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    imageUrl: article.imageUrl ?? undefined,
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${category}/${slug}`,
    publishedAt: article.publishedAt ?? undefined,
    author: article.author ?? undefined,
    category: article.category,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;

  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const related = await getRelated(article.id, article.category);

  const cat = getCategoryConfig(article.category);

  const articleLd = generateArticleJsonLd({
    title: article.title,
    description: article.excerpt,
    content: article.content,
    imageUrl: article.imageUrl,
    author: article.author,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    slug: article.slug,
    category: article.category,
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    {
      name: "Home",
      url: process.env.NEXT_PUBLIC_SITE_URL!,
    },
    {
      name: cat.label,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${category}`,
    },
    {
      name: article.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${category}/${slug}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="space-y-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]",
                    cat.color,
                  )}
                >
                  {cat.emoji} {cat.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {article.author || article.sourceName || "NexusAI"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(article.publishedAt)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {article.readTime} min read
                </span>
              </div>

              <h1 className="font-playfair text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                {article.title}
              </h1>

              <p className="max-w-3xl text-lg text-muted-foreground">
                {article.excerpt}
              </p>
            </div>

            {article.imageUrl ? (
              <div className="relative h-[420px] overflow-hidden rounded-3xl bg-muted">
                <Image
                  src={article.imageUrl}
                  alt={article.imageAlt || article.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="rounded-3xl bg-muted p-16 text-center text-5xl text-muted-foreground">
                {cat.emoji}
              </div>
            )}

            <div className="prose prose-invert max-w-none text-foreground">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Related articles
              </h2>
              <div className="space-y-4">
                {related.length > 0 ? (
                  related.map((item) => (
                    <ArticleCard key={item.id} article={item} compact />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No related articles found.
                  </p>
                )}
              </div>
            </div>

            <NewsletterSection />
            <AdSlot
              slot="article-sidebar"
              size="rectangle"
              className="hidden xl:block"
            />
          </aside>
        </div>
      </main>
    </>
  );
}
