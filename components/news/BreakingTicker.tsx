// components/news/BreakingTicker.tsx
"use client";
import { useEffect, useState } from "react";

interface TickerItem { id: string; title: string; slug: string; category: string; }

// Fallback headlines shown before DB data loads
const FALLBACK: TickerItem[] = [
  { id:"1", title:"Global AI Summit Reaches Landmark Safety Agreement", slug:"#", category:"WORLD" },
  { id:"2", title:"Federal Reserve Signals Rate Cut in Q3 2026", slug:"#", category:"FINANCE" },
  { id:"3", title:"Bitcoin Surpasses $125,000 as Institutional Adoption Accelerates", slug:"#", category:"FINANCE" },
  { id:"4", title:"SpaceX Successfully Deploys Next-Gen Starlink Constellation", slug:"#", category:"TECHNOLOGY" },
  { id:"5", title:"WHO Approves Revolutionary mRNA Cancer Vaccine Platform", slug:"#", category:"HEALTH" },
  { id:"6", title:"Solar Power Achieves Grid Parity in 147 Countries", slug:"#", category:"CLIMATE" },
];

export function BreakingTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK);

  useEffect(() => {
    fetch("/api/articles?isBreaking=true&pageSize=10")
      .then((r) => r.json())
      .then((d) => { if (d.data?.length) setItems(d.data); })
      .catch(() => {});
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden relative h-9 flex items-center">
      {/* Label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-2 bg-black/80 text-primary px-3 text-[11px] font-black tracking-[2px] uppercase whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-blink" />
        Breaking
      </div>

      {/* Scrolling track */}
      <div className="flex animate-ticker hover:[animation-play-state:paused] pl-28 gap-0">
        {doubled.map((item, i) => (
          <a
            key={`${item.id}-${i}`}
            href={`/${item.category.toLowerCase()}/${item.slug}`}
            className="text-[13px] font-medium whitespace-nowrap px-8 text-primary-foreground/90 hover:text-primary-foreground flex items-center gap-8"
          >
            {item.title}
            <span className="text-primary-foreground/30 text-xs">●</span>
          </a>
        ))}
      </div>
    </div>
  );
}
