// components/news/ArticleCard.tsx
import Link from "next/link";
import Image from "next/image";
import { formatTimeAgo, getCategoryConfig } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ArticleCard as ArticleCardType } from "@/types";

interface Props { article: ArticleCardType; priority?: boolean; compact?: boolean; }

export function ArticleCard({ article, priority = false, compact = false }: Props) {
  const href = `/${article.category.toLowerCase()}/${article.slug}`;
  const cat = getCategoryConfig(article.category);

  if (compact) {
    return (
      <Link
        href={href}
        className="group flex gap-3 py-3 border-b border-border last:border-0 hover:no-underline"
      >
        {article.imageUrl && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              fill
              unoptimized
              sizes="64px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-[10px] font-bold tracking-wider uppercase mb-1",
              cat.color,
            )}
          >
            {cat.label}
          </div>
          <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="text-[11px] text-muted-foreground mt-1">
            {formatTimeAgo(article.publishedAt)}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-border/60 hover:-translate-y-1 transition-all duration-200 hover:shadow-card-hover hover:no-underline">
      {/* Thumbnail */}
      <div className="relative w-full h-44 bg-muted overflow-hidden shrink-0">
        {article.imageUrl ? (
          <Image src={article.imageUrl} alt={article.imageAlt||article.title} fill priority={priority} className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
            <span className="text-4xl opacity-20">{cat.emoji}</span>
          </div>
        )}
        {article.isBreaking && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-blink" />Breaking
          </div>
        )}
        {article.isFeatured && !article.isBreaking && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded shadow-lg">★ Featured</div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-[10px] font-bold tracking-wider uppercase", cat.color)}>{cat.label}</span>
          {article.isAiRewritten && (
            <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5 flex items-center gap-1 shrink-0">
              <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse-dot" />AI
            </span>
          )}
        </div>

        <h2 className="font-playfair font-semibold text-[0.95rem] leading-snug line-clamp-3 text-foreground group-hover:text-primary transition-colors">
          {article.title}
        </h2>

        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {article.excerpt}
        </p>

        {article.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {article.tags.slice(0,2).map(tag => (
              <span key={tag} className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground truncate max-w-[55%]">
            {article.author ? `By ${article.author}` : article.sourceName || "NexusAI"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span>{article.readTime}m</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
