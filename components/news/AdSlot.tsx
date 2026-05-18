// components/news/AdSlot.tsx
"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type AdSize = "leaderboard" | "rectangle" | "skyscraper" | "banner" | "square";

const SIZE_MAP: Record<AdSize, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90, label: "728×90 Leaderboard" },
  rectangle:   { w: 300, h: 250, label: "300×250 Medium Rectangle" },
  skyscraper:  { w: 160, h: 600, label: "160×600 Wide Skyscraper" },
  banner:      { w: 468, h: 60, label: "468×60 Banner" },
  square:      { w: 250, h: 250, label: "250×250 Square" },
};

interface Props {
  slot: string;
  size: AdSize;
  className?: string;
}

export function AdSlot({ slot, size, className }: Props) {
  const adRef = useRef<HTMLInsElement>(null);
  const { w, h, label } = SIZE_MAP[size];
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId || !adRef.current) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [adsenseId]);

  // Production: render real AdSense
  if (adsenseId) {
    return (
      <div className={cn("flex justify-center", className)}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: w, height: h }}
          data-ad-client={adsenseId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Development: placeholder
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground ad-slot-placeholder", className)}
      style={{ minHeight: h, maxWidth: w, width: "100%" }}
    >
      <span className="text-xs font-mono font-semibold tracking-widest uppercase opacity-50">Advertisement</span>
      <span className="text-[11px] opacity-40">{label}</span>
      <span className="text-[10px] opacity-30">Google AdSense · {slot}</span>
    </div>
  );
}
