// components/layout/Footer.tsx
import Link from "next/link";

const NAV = {
  "News": ["World","Technology","Finance","Politics","Science","Climate","Health"],
  "Company": ["About Us","Careers","Advertise","Press","Contact","Investor Relations"],
  "Legal": ["Privacy Policy","Terms of Service","Cookie Policy","GDPR","Accessibility","DMCA"],
  "Tools": ["RSS Feeds","Newsletter","Sitemap","Developer API","Mobile App","Browser Extension"],
};

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-playfair text-2xl font-black text-primary">Nexus<span className="text-foreground font-medium">AI</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The world's most intelligent news platform. AI-curated stories, human-verified facts.
            </p>
            <div className="flex gap-3">
              {[
                { label:"X", href:"https://x.com/nexusainews" },
                { label:"LinkedIn", href:"#" },
                { label:"RSS", href:"/feed.xml" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                  {s.label[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(NAV).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-xs tracking-widest uppercase text-foreground mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link}>
                    <Link href={heading === "News" ? `/${link.toLowerCase()}` : `/${link.toLowerCase().replace(/\s+/g,"-")}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {year} NexusAI News, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            All systems operational
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js 15 · Prisma · OpenAI · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
