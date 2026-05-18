// lib/seo.ts
import type { Metadata } from "next";
import type { SeoProps } from "@/types";

const SITE_NAME = "NexusAI News";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexusai.news";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export function generateMetadata(props: SeoProps): Metadata {
  const {
    title,
    description,
    keywords = [],
    imageUrl,
    canonical,
    publishedAt,
    author,
    category,
  } = props;

  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  const ogImage = imageUrl || DEFAULT_OG_IMAGE;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: author ? [{ name: author }] : undefined,
    alternates: {
      canonical: canonical || SITE_URL,
    },
    openGraph: {
      type: publishedAt ? "article" : "website",
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      url: canonical || SITE_URL,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedAt && {
        article: {
          publishedTime: publishedAt.toISOString(),
          authors: author ? [author] : [],
          section: category,
        },
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      site: "@nexusainews",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateArticleJsonLd(article: {
  title: string;
  description: string;
  content: string;
  imageUrl?: string | null;
  author?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  slug: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: article.imageUrl ? [article.imageUrl] : [],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author || "NexusAI Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${article.category.toLowerCase()}/${article.slug}`,
    },
    articleSection: article.category,
  };
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getSiteUrl() {
  return SITE_URL;
}
