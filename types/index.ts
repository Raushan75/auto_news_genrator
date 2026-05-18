// types/index.ts
import type { Article, Category, ArticleStatus, User, Role } from "@prisma/client";

// ─── Article ──────────────────────────────────────────────────────────────────

export type ArticleWithFeed = Article & {
  feed?: { name: string; url: string } | null;
};

export type ArticleCard = Pick<
  Article,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "imageUrl"
  | "imageAlt"
  | "author"
  | "sourceName"
  | "category"
  | "tags"
  | "isAiRewritten"
  | "isFeatured"
  | "isBreaking"
  | "viewCount"
  | "readTime"
  | "publishedAt"
>;

export type ArticleFull = ArticleWithFeed & {
  relatedArticles?: ArticleCard[];
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ArticleFilters {
  category?: Category;
  status?: ArticleStatus;
  search?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type SessionUser = Pick<User, "id" | "name" | "email" | "image" | "role">;

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

// ─── RSS ──────────────────────────────────────────────────────────────────────

export interface RawRssItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  creator?: string;
  pubDate?: string;
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } };
}

export interface IngestResult {
  feedId: string;
  feedName: string;
  fetched: number;
  created: number;
  skipped: number;
  errors: string[];
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalArticles: number;
  publishedToday: number;
  totalSubscribers: number;
  activeFeeds: number;
  totalViews: number;
  aiRewritten: number;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export interface NewsletterPayload {
  email: string;
  name?: string;
  categories?: Category[];
  frequency?: "REALTIME" | "DAILY" | "WEEKLY";
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export interface SeoProps {
  title: string;
  description: string;
  keywords?: string[];
  imageUrl?: string;
  canonical?: string;
  publishedAt?: Date;
  author?: string;
  category?: string;
}

// ─── Enums (re-export for convenience) ───────────────────────────────────────

export { Category, ArticleStatus, Role };
