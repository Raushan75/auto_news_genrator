# NexusAI News 🗞️

A production-grade, full-stack AI-powered global news aggregation platform.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v5 |
| Styling | Tailwind CSS + ShadCN UI |
| AI | OpenAI GPT-4o-mini |
| Email | Resend |
| Ads | Google AdSense |
| Deploy | Vercel |

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-org/nexusai-news
cd nexusai-news
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, RESEND_API_KEY

# 3. Set up database
npm run db:generate
npm run db:push
npm run db:seed

# 4. Start development
npm run dev
```

## Project Structure

```
nexusai-news/
├── app/
│   ├── (auth)/                 # Login, Register pages
│   ├── (admin)/                # Admin dashboard
│   │   └── dashboard/          # Stats, articles, feed health
│   ├── (site)/
│   │   └── [category]/[slug]/  # Article detail pages
│   ├── api/
│   │   ├── articles/           # GET (paginated, filtered, infinite scroll)
│   │   ├── articles/[id]/      # GET, PATCH, DELETE single article
│   │   ├── auth/               # NextAuth handlers + register
│   │   ├── briefing/           # AI daily briefing generation
│   │   ├── ingest/             # RSS ingestion (Vercel Cron endpoint)
│   │   ├── newsletter/         # Subscribe, confirm, unsubscribe, send
│   │   └── rewrite/            # OpenAI article rewriter
│   ├── layout.tsx              # Root layout (fonts, theme, navbar)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Tailwind + CSS variables
│   └── sitemap.ts              # Dynamic XML sitemap (10,000 articles)
├── components/
│   ├── admin/                  # DashboardStats, RecentArticles, FeedHealth, IngestButton
│   ├── layout/                 # Navbar (sticky, search, theme toggle), Footer
│   ├── news/                   # HeroSection, ArticleCard, ArticleGrid (infinite scroll),
│   │   │                       # BreakingTicker, CategoryTabs, Sidebar, NewsletterSection, AdSlot
│   └── ui/                     # ScrollToTop, Toaster
├── cron/
│   ├── ingest.ts               # RSS ingestion scheduler (node-cron, every 15 min)
│   └── newsletter.ts           # Daily newsletter sender (07:00 UTC)
├── lib/
│   ├── auth.ts                 # NextAuth v5 config (Google, GitHub, Credentials)
│   ├── newsletter.ts           # Resend email service (confirmation, daily digest)
│   ├── openai-rewriter.ts      # GPT-4o-mini article rewriter + SEO meta + briefing
│   ├── prisma.ts               # Prisma client singleton
│   ├── rss-ingester.ts         # RSS parser with AI rewrite, dedup, batching
│   ├── seo.ts                  # generateMetadata, JSON-LD (Article, Breadcrumb)
│   └── utils.ts                # cn(), formatDate, formatNumber, getCategoryConfig
├── prisma/
│   ├── schema.prisma           # Full schema: User, Article, RssFeed, Subscriber, Comment…
│   └── seed.ts                 # 18 RSS feeds + 8 sample articles + admin user
├── types/
│   └── index.ts                # Shared TypeScript types
├── middleware.ts               # Route protection (auth + role guards)
├── next.config.ts              # Image domains, security headers
├── tailwind.config.ts          # Custom tokens, animations, typography
└── vercel.json                 # Cron job schedule
```

## Features

- **RSS Ingestion** — 18 pre-configured feeds (BBC, Reuters, TechCrunch, Bloomberg…), auto-fetched every 15 min
- **AI Rewriting** — GPT-4o-mini rewrites articles in Bloomberg/BBC editorial style
- **Infinite Scroll** — Client-side pagination using IntersectionObserver
- **Dark/Light Mode** — next-themes, system preference aware
- **Breaking Ticker** — Auto-scrolling live news bar
- **Full-text Search** — Real-time search with debounce
- **Newsletter** — Resend-powered with double opt-in confirmation
- **Google AdSense** — Placeholder slots (leaderboard, rectangle, skyscraper)
- **SEO** — generateMetadata, OpenGraph, Twitter Cards, JSON-LD, dynamic sitemap
- **Admin Dashboard** — Stats, article management, feed health, one-click ingest
- **Auth** — Google, GitHub OAuth + email/password via NextAuth v5

## Default Credentials

```
Admin:  admin@nexusai.news  /  Admin@NexusAI2026!
Editor: editor@nexusai.news /  Editor@NexusAI2026!
```

## Deployment (Vercel)

1. Push to GitHub
2. Connect to Vercel — it auto-detects Next.js
3. Add all environment variables from `.env.example`
4. Run `npm run db:migrate` against your production PostgreSQL
5. Vercel Cron runs `/api/ingest` every 15 min automatically

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random 32-byte secret |
| `OPENAI_API_KEY` | ✅ | For AI article rewriting |
| `RESEND_API_KEY` | ✅ | Newsletter emails |
| `GOOGLE_CLIENT_ID/SECRET` | ⚪ | Google OAuth |
| `GITHUB_CLIENT_ID/SECRET` | ⚪ | GitHub OAuth |
| `NEXT_PUBLIC_ADSENSE_ID` | ⚪ | Google AdSense publisher ID |
| `CRON_SECRET` | ⚪ | Protects `/api/ingest` endpoint |
| `AUTO_REWRITE` | ⚪ | `"true"` to auto-rewrite on ingest |

## License

MIT — built with ❤️ by NexusAI
