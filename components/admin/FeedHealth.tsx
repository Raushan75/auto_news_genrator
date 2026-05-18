// components/admin/FeedHealth.tsx
"use client";
import { useState } from "react";
import { formatTimeAgo } from "@/lib/utils";

interface Feed { id:string; name:string; url:string; category:string; isActive:boolean; lastFetched:Date|null; fetchCount:number; errorCount:number; lastError:string|null; _count:{articles:number}; }
interface Props { feeds: Feed[]; }

export function FeedHealth({ feeds }: Props) {
  const [ingesting, setIngesting] = useState<string|null>(null);

  async function ingestFeed(id: string) {
    setIngesting(id);
    try {
      await fetch(`/api/ingest?feedId=${id}`, { headers:{ Authorization:`Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET||""}` }});
      window.location.reload();
    } finally { setIngesting(null); }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">RSS Feed Health</h2>
        <span className="text-xs text-muted-foreground">{feeds.filter(f=>f.isActive).length} active</span>
      </div>
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {feeds.map(feed => (
          <div key={feed.id} className="px-5 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${feed.isActive ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                  <span className="text-sm font-medium truncate">{feed.name}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 ml-4">
                  {feed._count.articles} articles · {feed.lastFetched ? formatTimeAgo(feed.lastFetched) : "Never fetched"}
                  {feed.errorCount > 0 && <span className="text-red-400 ml-2">⚠ {feed.errorCount} errors</span>}
                </div>
                {feed.lastError && <div className="text-[10px] text-red-400 ml-4 mt-0.5 line-clamp-1">{feed.lastError}</div>}
              </div>
              <button onClick={() => ingestFeed(feed.id)} disabled={ingesting===feed.id}
                className="text-[11px] text-primary hover:underline shrink-0 disabled:opacity-40">
                {ingesting===feed.id ? "…" : "Sync"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
