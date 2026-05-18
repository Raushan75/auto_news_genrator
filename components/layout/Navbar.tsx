// components/layout/Navbar.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const CATEGORIES = ["World","Technology","Finance","Politics","Science","Climate","Health"/* ,"Culture","Sports" */];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{id:string;title:string;slug:string;category:string}>>([]);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/articles?search=${encodeURIComponent(searchQ)}&pageSize=5`)
        .then(r => r.json())
        .then(d => setSearchResults(d.data ?? []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);

  return (
    <>
      <header className={cn("sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-shadow duration-200", scrolled && "shadow-lg shadow-black/10")}>
        {/* Top bar */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="font-playfair text-xl font-black text-primary tracking-tight group-hover:opacity-80 transition-opacity">Nexus<span className="text-foreground font-medium">AI</span></span>
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />Live
            </span>
          </Link>

          {/* Desktop search */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-sm relative">
            <input
              type="search"
              placeholder="Search news… (⌘K)"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="w-full bg-muted/60 border border-border rounded-lg px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                {searchResults.map(r => (
                  <Link key={r.id} href={`/${r.category.toLowerCase()}/${r.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0" onClick={() => { setSearchOpen(false); setSearchQ(""); }}>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 rounded px-1.5 py-0.5">{r.category}</span>
                    <span className="text-sm font-medium text-foreground line-clamp-1">{r.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile search */}
            <button className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>

            {/* Theme toggle */}
            {mounted && (
              <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" aria-label="Toggle theme">
                {resolvedTheme === "dark"
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                }
              </button>
            )}

            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign in</Link>
            <Link href="/register" className="inline-flex text-sm font-bold bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">Subscribe</Link>

            {/* Hamburger */}
            <button className="lg:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <span className={cn("block w-5 h-0.5 bg-foreground transition-all", mobileOpen && "rotate-45 translate-y-1.5")} />
              <span className={cn("block w-5 h-0.5 bg-foreground transition-all", mobileOpen && "opacity-0")} />
              <span className={cn("block w-3 h-0.5 bg-foreground transition-all", mobileOpen && "-rotate-45 -translate-y-1.5 w-5")} />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <nav className="border-t border-border">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none">
            <div className="flex items-center min-w-max">
              {CATEGORIES.map(cat => {
                const active = pathname === `/${cat.toLowerCase()}`;
                return (
                  <Link key={cat} href={`/${cat.toLowerCase()}`}
                    className={cn("px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap", active ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground hover:border-border")}>
                    {cat}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 pt-2 border-t border-border">
            <input autoFocus type="search" placeholder="Search articles…" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-card border border-border rounded-xl overflow-hidden">
                {searchResults.map(r => (
                  <Link key={r.id} href={`/${r.category.toLowerCase()}/${r.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted border-b border-border last:border-0" onClick={() => { setSearchOpen(false); setSearchQ(""); }}>
                    <span className="text-[10px] font-bold uppercase text-primary">{r.category}</span>
                    <span className="text-sm font-medium line-clamp-1">{r.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile sidebar menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 h-full w-72 bg-background border-l border-border flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <span className="font-playfair text-xl font-black text-primary">NexusAI</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
              {CATEGORIES.map(cat => (
                <Link key={cat} href={`/${cat.toLowerCase()}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted hover:text-foreground text-muted-foreground transition-colors mb-1">
                  {cat}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-border space-y-2">
              <Link href="/login" className="block w-full text-center py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">Sign in</Link>
              <Link href="/register" className="block w-full text-center py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Subscribe Free</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
