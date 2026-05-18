// components/news/Sidebar.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/news/ArticleCard";
import { AdSlot } from "@/components/news/AdSlot";
import { formatTimeAgo, getCategoryConfig, formatNumber } from "@/lib/utils";
import { generateDailyBriefing } from "@/lib/openai-rewriter";
import type { ArticleCard as ArticleCardType } from "@/types";

const MARKETS = [
  { ticker: "S&P 500", price: "5,847", change: "+1.24%", up: true },
  { ticker: "BTC/USD", price: "125,240", change: "+3.87%", up: true },
  { ticker: "EUR/USD", price: "1.0921", change: "-0.32%", up: false },
  { ticker: "GOLD", price: "3,124", change: "+0.91%", up: true },
  { ticker: "NASDAQ", price: "19,204", change: "+0.76%", up: true },
  { ticker: "OIL WTI", price: "72.40", change: "-1.15%", up: false },
];

const TOPICS = [
  "AI Policy", "Federal Reserve", "Climate Tech", "Crypto",
  "Space", "Healthcare AI", "2026 Elections", "Green Energy",
  "Semiconductors", "EVs", "mRNA", "Quantum",
];

interface Props { mostRead: ArticleCardType[]; }

export function Sidebar({ mostRead }: Props) {
  const [briefing, setBriefing] = useState("");
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  async function fetchBriefing() {
    setLoadingBriefing(true);
    try {
      const res = await fetch("/api/articles?pageSize=15&sort=latest");
      const data = await res.json();
      const articles = (data.data ?? []).map((a: ArticleCardType) => ({
        title: a.title, category: a.category, excerpt: a.excerpt,
      }));
      const res2 = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles }),
      });
      const d2 = await res2.json();
      setBriefing(d2.briefing ?? "");
    } catch {
      setBriefing("Unable to generate briefing. Please try again.");
    } finally {
      setLoadingBriefing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Markets widget */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Markets</h3>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />LIVE
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MARKETS.map((m) => (
            <div key={m.ticker} className="bg-muted rounded-lg p-2.5">
              <div className="text-[10px] text-muted-foreground font-mono mb-0.5">{m.ticker}</div>
              <div className="text-sm font-bold font-mono">{m.price}</div>
              <div className={`text-[11px] font-semibold ${m.up ? "text-emerald-400" : "text-red-400"}`}>
                {m.up ? "▲" : "▼"} {m.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Briefing */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-sm">✦</div>
          <div>
            <div className="text-sm font-semibold">AI Daily Briefing</div>
            <div className="text-[11px] text-blue-400">Powered by Claude</div>
          </div>
        </div>
        {briefing ? (
          <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-blue-500/30 pl-3 mb-3">{briefing}</p>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Today's headlines center on accelerating AI governance debates, central bank policy signals, and a new wave of clean energy milestones reaching historic scale across developing economies.
          </p>
        )}
        <button
          onClick={fetchBriefing}
          disabled={loadingBriefing}
          className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {loadingBriefing ? (
            <><span className="w-3 h-3 border border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />Generating…</>
          ) : (
            "✦ Regenerate Briefing"
          )}
        </button>
      </div>

      {/* Most Read */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full" />Most Read
        </h3>
        <div>
          {mostRead.map((article, i) => {
            const cat = getCategoryConfig(article.category);
            return (
              <Link key={article.id} href={`/${article.category.toLowerCase()}/${article.slug}`}
                className="group flex items-start gap-3 py-3 border-b border-border last:border-0 hover:no-underline">
                <span className="font-playfair text-2xl font-black text-border leading-none pt-0.5 min-w-[28px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${cat.color}`}>{cat.label}</div>
                  <h4 className="text-[13px] font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">{article.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span>{formatTimeAgo(article.publishedAt)}</span>
                    <span>·</span>
                    <span>{formatNumber(article.viewCount)} views</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sidebar Ad */}
      <AdSlot slot="sidebar-skyscraper" size="skyscraper" />

      {/* Trending Topics */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full" />Trending Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`}
              className="text-[11px] bg-muted hover:bg-primary hover:text-primary-foreground border border-border rounded-full px-3 py-1 font-medium text-muted-foreground transition-all">
              {topic}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
