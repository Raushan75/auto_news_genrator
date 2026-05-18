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

import { formatDate, getCategoryConfig } from "@/lib/utils";

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

      {/* Your existing JSX remains unchanged */}
    </>
  );
}
