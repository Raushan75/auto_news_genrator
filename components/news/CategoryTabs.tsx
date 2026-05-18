// components/news/CategoryTabs.tsx
"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "All", value: undefined },
  { label: "World", value: "WORLD" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Finance", value: "FINANCE" },
  { label: "Politics", value: "POLITICS" },
  { label: "Science", value: "SCIENCE" },
  { label: "Climate", value: "CLIMATE" },
  { label: "Health", value: "HEALTH" },
  { label: "Culture", value: "CULTURE" },
  { label: "Sports", value: "SPORTS" },
];

interface Props { onSelect?: (cat: string | undefined) => void; }

export function CategoryTabs({ onSelect }: Props) {
  const [active, setActive] = useState<string | undefined>(undefined);

  function handleSelect(val: string | undefined) {
    setActive(val);
    onSelect?.(val);
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
      {TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => handleSelect(tab.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            active === tab.value
              ? "bg-primary text-primary-foreground shadow"
              : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
