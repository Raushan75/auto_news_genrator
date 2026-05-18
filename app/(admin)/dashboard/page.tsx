// app/(admin)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RecentArticles } from "@/components/admin/RecentArticles";
import { FeedHealth } from "@/components/admin/FeedHealth";
import { IngestButton } from "@/components/admin/IngestButton";
import type { DashboardStats as Stats } from "@/types";
import { startOfDay } from "date-fns";

export const dynamic = "force-dynamic";

async function getStats(): Promise<Stats> {
  const today = startOfDay(new Date());

  const [
    totalArticles,
    publishedToday,
    totalSubscribers,
    activeFeeds,
    viewsAgg,
    aiRewritten,
  ] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({
      where: { status: "PUBLISHED", publishedAt: { gte: today } },
    }),
    prisma.subscriber.count({ where: { status: "ACTIVE" } }),
    prisma.rssFeed.count({ where: { isActive: true } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.count({
      where: { status: "PUBLISHED", isAiRewritten: true },
    }),
  ]);

  return {
    totalArticles,
    publishedToday,
    totalSubscribers,
    activeFeeds,
    totalViews: viewsAgg._sum.viewCount || 0,
    aiRewritten,
  };
}

async function getRecentArticles() {
  return prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      isAiRewritten: true,
      viewCount: true,
      publishedAt: true,
      createdAt: true,
      sourceName: true,
    },
  });
}

async function getFeedHealth() {
  return prisma.rssFeed.findMany({
    orderBy: { lastFetched: "desc" },
    select: {
      id: true,
      name: true,
      url: true,
      category: true,
      isActive: true,
      lastFetched: true,
      fetchCount: true,
      errorCount: true,
      lastError: true,
      _count: { select: { articles: true } },
    },
  });
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const [stats, recentArticles, feeds] = await Promise.all([
    getStats(),
    getRecentArticles(),
    getFeedHealth(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-2xl font-bold">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back, {session.user?.name} · Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-3">
            <IngestButton />
            <a
              href="/dashboard/articles/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold"
            >
              + New Article
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <DashboardStats stats={stats} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Articles — takes 2 cols */}
          <div className="lg:col-span-2">
            <RecentArticles articles={recentArticles} />
          </div>

          {/* Feed Health */}
          <div>
            <FeedHealth feeds={feeds} />
          </div>
        </div>
      </div>
    </div>
  );
}
