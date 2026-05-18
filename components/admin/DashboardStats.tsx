// components/admin/DashboardStats.tsx
import { formatNumber } from "@/lib/utils";
import type { DashboardStats as Stats } from "@/types";

interface Props { stats: Stats; }
const CARDS = (s: Stats) => [
  { label:"Total Articles", value: formatNumber(s.totalArticles), icon:"📰", color:"bg-blue-500/10 text-blue-400" },
  { label:"Published Today", value: formatNumber(s.publishedToday), icon:"✅", color:"bg-emerald-500/10 text-emerald-400" },
  { label:"Subscribers", value: formatNumber(s.totalSubscribers), icon:"📧", color:"bg-violet-500/10 text-violet-400" },
  { label:"Active Feeds", value: String(s.activeFeeds), icon:"📡", color:"bg-orange-500/10 text-orange-400" },
  { label:"Total Views", value: formatNumber(s.totalViews), icon:"👁", color:"bg-cyan-500/10 text-cyan-400" },
  { label:"AI Rewritten", value: formatNumber(s.aiRewritten), icon:"✦", color:"bg-primary/10 text-primary" },
];
export function DashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {CARDS(stats).map(c => (
        <div key={c.label} className="bg-card border border-border rounded-xl p-4">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3 ${c.color}`}>{c.icon}</div>
          <div className="text-2xl font-bold font-mono">{c.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
