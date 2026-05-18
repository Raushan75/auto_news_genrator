// app/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/news/HeroSection";
import { ArticleGrid } from "@/components/news/ArticleGrid";
import { CategoryTabs } from "@/components/news/CategoryTabs";
import { Sidebar } from "@/components/news/Sidebar";
import { NewsletterSection } from "@/components/news/NewsletterSection";
import { AdSlot } from "@/components/news/AdSlot";

export const metadata: Metadata = {
  title: "NexusAI News — The World's Most Intelligent News Platform",
  description: "AI-curated breaking news, in-depth analysis and personalized briefings.",
};

export const revalidate = 300;

async function getPageData() {
  const [featured, mostRead, initialArticles] = await Promise.all([
    prisma.article.findFirst({
      where: { status: "PUBLISHED", isFeatured: true },
      select: { id:true, title:true, slug:true, excerpt:true, imageUrl:true, imageAlt:true, author:true, sourceName:true, category:true, tags:true, isAiRewritten:true, isFeatured:true, isBreaking:true, viewCount:true, readTime:true, publishedAt:true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { id:true, title:true, slug:true, excerpt:true, imageUrl:true, imageAlt:true, author:true, sourceName:true, category:true, tags:true, isAiRewritten:true, isFeatured:true, isBreaking:true, viewCount:true, readTime:true, publishedAt:true },
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { id:true, title:true, slug:true, excerpt:true, imageUrl:true, imageAlt:true, author:true, sourceName:true, category:true, tags:true, isAiRewritten:true, isFeatured:true, isBreaking:true, viewCount:true, readTime:true, publishedAt:true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
  ]);
  return { featured, mostRead, initialArticles };
}

export default async function HomePage() {
  const { featured, mostRead, initialArticles } = await getPageData();
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <AdSlot slot="homepage-leaderboard" size="leaderboard" className="my-4 hidden sm:flex" />
      {featured && <HeroSection article={featured} />}
      <div className="flex gap-8 mt-8">
        <div className="flex-1 min-w-0 space-y-10">
          <section>
            <CategoryTabs />
            <div className="mt-6"><ArticleGrid initialArticles={initialArticles} /></div>
          </section>
          <AdSlot slot="homepage-mid" size="rectangle" className="mx-auto" />
          <NewsletterSection />
        </div>
        <aside className="hidden lg:block w-[300px] xl:w-[320px] shrink-0">
          <div className="sticky top-20 space-y-6"><Sidebar mostRead={mostRead} /></div>
        </aside>
      </div>
      <AdSlot slot="homepage-bottom" size="leaderboard" className="my-10 mx-auto hidden sm:flex" />
    </div>
  );
}
