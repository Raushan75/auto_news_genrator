// app/(site)/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleGrid } from "@/components/news/ArticleGrid";
import { Sidebar } from "@/components/news/Sidebar";
import { AdSlot } from "@/components/news/AdSlot";
import { getCategoryConfig } from "@/lib/utils";

const VALID = ["world","technology","finance","politics","science","climate","health","culture","sports"];
interface Props { params: { category: string }; }
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cfg = getCategoryConfig(params.category.toUpperCase());
  return {
    title: `${cfg.label} News — Latest Headlines`,
    description: `Latest ${cfg.label} news, breaking stories and in-depth analysis on NexusAI News.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  if (!VALID.includes(params.category.toLowerCase())) notFound();
  const cat = params.category.toUpperCase();
  const cfg = getCategoryConfig(cat);

  const mostRead = await prisma.article.findMany({
    where: { status: "PUBLISHED", category: cat as never },
    select: { id:true, title:true, slug:true, excerpt:true, imageUrl:true, imageAlt:true, author:true, sourceName:true, category:true, tags:true, isAiRewritten:true, isFeatured:true, isBreaking:true, viewCount:true, readTime:true, publishedAt:true },
    orderBy: { viewCount: "desc" },
    take: 5,
  });

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category header */}
      <div className="mb-8">
        <div className={`inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase mb-3 ${cfg.color}`}>
          <span>{cfg.emoji}</span><span>{cfg.label}</span>
        </div>
        <h1 className="font-playfair text-4xl font-bold">{cfg.label} News</h1>
        <p className="text-muted-foreground mt-2">Latest {cfg.label.toLowerCase()} stories, breaking news and analysis</p>
      </div>

      <AdSlot slot={`${params.category}-top`} size="leaderboard" className="mb-8 hidden sm:flex mx-auto"/>

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <ArticleGrid initialArticles={[]} category={cat} />
        </div>
        <aside className="hidden lg:block w-[300px] shrink-0">
          <div className="sticky top-20"><Sidebar mostRead={mostRead}/></div>
        </aside>
      </div>
    </div>
  );
}
