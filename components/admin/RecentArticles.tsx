// components/admin/RecentArticles.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { formatDateShort, getCategoryConfig } from "@/lib/utils";

interface Article { id:string; title:string; slug:string; category:string; status:string; isAiRewritten:boolean; viewCount:number; publishedAt:Date|null; createdAt:Date; sourceName:string|null; }
interface Props { articles: Article[]; }

const STATUS_STYLE: Record<string,string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-400",
  DRAFT: "bg-muted text-muted-foreground",
  REVIEW: "bg-yellow-500/10 text-yellow-400",
  ARCHIVED: "bg-red-500/10 text-red-400",
};

export function RecentArticles({ articles }: Props) {
  const [rewriting, setRewriting] = useState<string|null>(null);

  async function handleRewrite(id: string) {
    setRewriting(id);
    try {
      const res = await fetch("/api/rewrite", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ articleId: id }) });
      if (res.ok) window.location.reload();
    } finally { setRewriting(null); }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-semibold">Recent Articles</h2>
        <Link href="/dashboard/articles" className="text-xs text-primary hover:underline">View all →</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/40">
            {["Title","Category","Status","Views","Date","Actions"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {articles.map(a => {
              const cat = getCategoryConfig(a.category);
              return (
                <tr key={a.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 max-w-[280px]">
                    <div className="flex items-center gap-2">
                      {a.isAiRewritten && <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-1 py-0.5 shrink-0">✦ AI</span>}
                      <span className="font-medium line-clamp-1">{a.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase tracking-wider ${cat.color}`}>{cat.label}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 ${STATUS_STYLE[a.status]??""}`}>{a.status}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{a.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateShort(a.publishedAt || a.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/${a.category.toLowerCase()}/${a.slug}`} target="_blank" className="text-xs text-primary hover:underline">View</Link>
                      <button onClick={() => handleRewrite(a.id)} disabled={rewriting===a.id}
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40">
                        {rewriting===a.id ? "…" : "AI Rewrite"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
