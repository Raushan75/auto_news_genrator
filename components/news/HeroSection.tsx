// components/news/HeroSection.tsx
import Link from "next/link";
import Image from "next/image";
import { formatTimeAgo, getCategoryConfig } from "@/lib/utils";
import type { ArticleCard } from "@/types";

interface Props { article: ArticleCard; }

export function HeroSection({ article }: Props) {
  const href = `/${article.category.toLowerCase()}/${article.slug}`;
  const cat = getCategoryConfig(article.category);
  return (
    <section className="relative mt-6 rounded-2xl overflow-hidden group cursor-pointer border border-border">
      <Link href={href} className="block">
        {/* Background */}
        <div className="relative w-full h-[420px] md:h-[500px] bg-muted">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
              <span className="text-8xl opacity-20">📰</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            {article.isBreaking && (
              <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black tracking-[1.5px] uppercase px-2.5 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-blink" />
                Breaking
              </span>
            )}
            <span
              className={`text-[11px] font-bold tracking-widest uppercase ${cat.color} bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded`}
            >
              {cat.emoji} {cat.label}
            </span>
            {article.isAiRewritten && (
              <span className="text-[10px] font-semibold bg-blue-500/20 backdrop-blur-sm text-blue-300 border border-blue-400/30 rounded-full px-2.5 py-1 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                AI Enhanced
              </span>
            )}
          </div>
          <h1
            className="font-playfair text-white text-2xl md:text-4xl font-bold leading-tight max-w-3xl mb-4 group-hover:text-primary transition-colors duration-300"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            {article.title}
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mb-4 line-clamp-2 hidden sm:block">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            {article.author && (
              <span>
                By <strong className="text-white/80">{article.author}</strong>
              </span>
            )}
            {article.author && (
              <span className="w-1 h-1 rounded-full bg-white/30" />
            )}
            <span>{formatTimeAgo(article.publishedAt)}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{article.readTime} min read</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
