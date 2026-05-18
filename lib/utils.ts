// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Unknown date";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMMM d, yyyy");
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Recently";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "…";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function estimateReadTime(content: string): number {
  const text = stripHtml(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; emoji: string }
> = {
  WORLD: {
    label: "World",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    emoji: "🌍",
  },
  TECHNOLOGY: {
    label: "Technology",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    emoji: "💻",
  },
  FINANCE: {
    label: "Finance",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    emoji: "📈",
  },
  POLITICS: {
    label: "Politics",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    emoji: "🏛️",
  },
  SCIENCE: {
    label: "Science",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    emoji: "🔬",
  },
  CLIMATE: {
    label: "Climate",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    emoji: "🌱",
  },
  HEALTH: {
    label: "Health",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    emoji: "❤️",
  },
  CULTURE: {
    label: "Culture",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    emoji: "🎭",
  },
  SPORTS: {
    label: "Sports",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    emoji: "⚽",
  },
};

export function getCategoryConfig(category: string) {
  return (
    CATEGORY_CONFIG[category.toUpperCase()] ?? {
      label: category,
      color: "text-primary",
      bg: "bg-primary/10",
      emoji: "📰",
    }
  );
}

export function generateOgImageUrl(title: string, category?: string): string {
  const params = new URLSearchParams({ title: title.slice(0, 80) });
  if (category) params.set("category", category);
  return `/api/og?${params.toString()}`;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
