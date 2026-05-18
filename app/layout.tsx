// app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BreakingTicker } from "@/components/news/BreakingTicker";
import { Toaster } from "@/components/ui/Toaster";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import "@/app/globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", weight: ["400","600","700","900"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-dm-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexusai.news"),
  title: { default: "NexusAI News — The World's Most Intelligent News Platform", template: "%s | NexusAI News" },
  description: "AI-powered global news. Breaking stories, in-depth analysis, and personalized briefings.",
  openGraph: { type: "website", siteName: "NexusAI News", images: [{ url: "/og-default.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", site: "@nexusainews" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`} crossOrigin="anonymous" />
        )}
      </head>
      <body className="font-dm-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <BreakingTicker />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
