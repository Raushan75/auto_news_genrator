// components/news/ArticleGrid.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { ArticleCard } from "@/components/news/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types";

interface Props { initialArticles: ArticleCardType[]; category?: string; pageSize?: number; }

function Skeleton() {
  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="w-full h-44 bg-muted shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="space-y-1.5">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-4/5" />
          <div className="h-4 bg-muted rounded w-3/5" />
        </div>
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="flex justify-between pt-2">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function ArticleGrid({ initialArticles, category, pageSize = 12 }: Props) {
  const [articles, setArticles] = useState<ArticleCardType[]>(initialArticles);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const fetchingRef = useRef(false);

  const { ref, inView } = useInView({ threshold: 0, rootMargin: "300px" });

  const fetchPage = useCallback(async (pageNum: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pageNum), pageSize: String(pageSize) });
      if (category) params.set("category", category.toUpperCase());
      const res = await fetch(`/api/articles?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setArticles(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading articles");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [category, pageSize]);

  // Reload when category changes
  useEffect(() => {
    setArticles([]);
    setPage(0);
    setHasMore(true);
    fetchPage(1);
  }, [category, fetchPage]);

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasMore && !loading && page > 0) fetchPage(page + 1);
  }, [inView, hasMore, loading, page, fetchPage]);

  const skeletonCount = loading ? (articles.length === 0 ? pageSize : 3) : 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {articles.map((a, i) => <ArticleCard key={a.id} article={a} priority={i < 3} />)}
        {Array.from({ length: skeletonCount }).map((_, i) => <Skeleton key={`sk${i}`} />)}
      </div>

      {/* Sentinel */}
      {hasMore && !error && <div ref={ref} className="h-1 mt-8" />}

      {error && (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={() => fetchPage(page + 1)} className="text-sm text-primary hover:underline">Retry</button>
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">
          You've read it all — {articles.length} articles
        </p>
      )}

      {!loading && articles.length === 0 && !error && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">📰</p>
          <p className="font-semibold text-lg">No articles yet</p>
          <p className="text-sm mt-1">Check back soon or run the RSS ingest</p>
        </div>
      )}
    </div>
  );
}
