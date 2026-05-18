// components/news/NewsletterSection.tsx
"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) { setMsg("Please enter a valid email."); setStatus("error"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setStatus("success"); setMsg(data.message || "Check your inbox to confirm!"); setEmail(""); }
      else { setStatus("error"); setMsg(data.error || "Something went wrong."); }
    } catch {
      setStatus("error"); setMsg("Network error. Please try again.");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-muted/30 to-card p-8 md:p-12 text-center">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-primary mb-4">
          ✦ Daily Intelligence
        </div>
        <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-3">
          Stay Ahead of the Story
        </h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
          AI-curated briefings delivered to your inbox. Join <strong className="text-foreground">2.4M readers</strong> who never miss what matters.
        </p>

        {status === "success" ? (
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-6 py-4 text-sm font-semibold">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            {msg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe Free"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-destructive text-sm mt-3">{msg}</p>
        )}

        <p className="text-muted-foreground text-xs mt-4">
          No spam, ever. Unsubscribe in one click. 100% free.
        </p>

        <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-border text-sm text-muted-foreground">
          {[["2.4M+","Subscribers"],["Daily","AI Briefings"],["Zero","Spam"]].map(([n,l]) => (
            <div key={l} className="text-center">
              <div className="font-playfair text-xl font-bold text-foreground">{n}</div>
              <div className="text-xs">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
