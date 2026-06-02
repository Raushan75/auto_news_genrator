// prisma/seed.ts
import { PrismaClient, Category, ArticleStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

const RSS_FEEDS = [
  // World
  {
    name: "BBC News",
    url: "http://feeds.bbci.co.uk/news/rss.xml",
    category: "WORLD",
  },
  {
    name: "Reuters Top News",
    url: "https://feeds.reuters.com/reuters/topNews",
    category: "WORLD",
  },
  {
    name: "AP News",
    url: "https://rsshub.app/apnews/topics/apf-topnews",
    category: "WORLD",
  },

  // Technology
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "TECHNOLOGY",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "TECHNOLOGY",
  },
  {
    name: "Ars Technica",
    url: "http://feeds.arstechnica.com/arstechnica/index",
    category: "TECHNOLOGY",
  },
  {
    name: "Wired",
    url: "https://www.wired.com/feed/rss",
    category: "TECHNOLOGY",
  },

  // Finance
  {
    name: "Bloomberg Markets",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    category: "FINANCE",
  },
  {
    name: "Financial Times",
    url: "https://www.ft.com/rss/home/us",
    category: "FINANCE",
  },
  {
    name: "CNBC",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    category: "FINANCE",
  },

  // Science
  {
    name: "Nature",
    url: "https://www.nature.com/nature.rss",
    category: "SCIENCE",
  },
  {
    name: "Science Daily",
    url: "https://www.sciencedaily.com/rss/all.xml",
    category: "SCIENCE",
  },

  // Health
  {
    name: "Stat News",
    url: "https://www.statnews.com/feed/",
    category: "HEALTH",
  },
  {
    name: "MedPage Today",
    url: "https://www.medpagetoday.com/rss/headlines.xml",
    category: "HEALTH",
  },

  // Climate
  {
    name: "Climate Home News",
    url: "https://www.climatechangenews.com/feed/",
    category: "CLIMATE",
  },
  {
    name: "Carbon Brief",
    url: "https://www.carbonbrief.org/feed",
    category: "CLIMATE",
  },

  // Politics
  {
    name: "Politico",
    url: "https://www.politico.com/rss/politics08.xml",
    category: "POLITICS",
  },
  {
    name: "The Hill",
    url: "https://thehill.com/rss/syndicator/19110",
    category: "POLITICS",
  },
];

const SAMPLE_ARTICLES = [
  {
    title:
      "AI Governance Summit Reaches Historic Agreement on Safety Standards",
    excerpt:
      "World leaders and tech executives convene in Geneva to sign landmark AI safety framework covering model transparency, compute thresholds, and emergency shutdown protocols.",
    content: `<p>In a historic gathering at the Palais des Nations in Geneva, representatives from 47 nations and leading AI laboratories signed the Geneva Framework on Artificial Intelligence Safety — the most comprehensive international AI governance agreement to date.</p>
<p>The framework, years in the making, establishes binding transparency requirements for frontier AI models, mandatory safety evaluations before deployment, and an international AI Incident Response Protocol modeled after nuclear safeguards.</p>
<h2>Key Provisions</h2>
<p>Under the agreement, any AI system trained on more than 10^26 floating-point operations must undergo independent third-party safety evaluations before commercial deployment. Labs must also disclose training methodologies, datasets, and known capability limitations to a newly established International AI Safety Board.</p>
<p>The framework includes emergency provisions allowing member states to request temporary capability restrictions on specific AI systems if credible risks to critical infrastructure are identified.</p>
<h2>Industry Response</h2>
<p>Major AI laboratories, including OpenAI, Anthropic, Google DeepMind, and Meta AI, have signaled support for the framework's core provisions, though some expressed concerns about competitive disadvantages if non-signatory nations fail to adopt similar standards.</p>
<p>"This agreement represents a turning point," said the UN Secretary-General. "For the first time, the international community has agreed that AI safety is not a competitive issue — it is a collective responsibility."</p>`,
    category: "WORLD",
    tags: ["AI", "Governance", "Safety", "International", "UN"],
    author: "Alexandra Chen",
    isFeatured: true,
    isBreaking: true,
    isAiRewritten: true,
    readTime: 5,
    status: "PUBLISHED",
  },
  {
    title: "Federal Reserve Signals Rate Cut as Inflation Cools to 2.1%",
    excerpt:
      "Fed minutes reveal growing consensus among policymakers for a September rate reduction as core PCE falls below the central bank's target for the first time since 2021.",
    content: `<p>Federal Reserve officials are increasingly aligned on cutting interest rates at their September meeting after the latest Personal Consumption Expenditures price index showed inflation falling to 2.1% — just above the central bank's 2% target and the lowest reading since early 2021.</p>
<p>Minutes from the July Federal Open Market Committee meeting, released Wednesday, show that "a substantial majority" of participants believe easing conditions are approaching, with several officials noting that waiting too long risks unnecessary economic damage.</p>
<h2>Market Reaction</h2>
<p>Treasury yields fell sharply following the release, with the 10-year note dropping 12 basis points to 4.18%. The S&P 500 rose 1.4% to close above 5,800 for the first time, while the dollar weakened against major currencies.</p>
<p>Interest rate futures now price an 87% probability of a 25-basis-point cut in September, up from 72% before the minutes were released.</p>`,
    category: "FINANCE",
    tags: ["Federal Reserve", "Interest Rates", "Inflation", "Economy"],
    author: "Marcus Webb",
    isFeatured: false,
    isBreaking: false,
    isAiRewritten: true,
    readTime: 4,
    status: "PUBLISHED",
  },
  {
    title:
      "CRISPR Gene Therapy Achieves First Complete Cure for Hereditary Blindness",
    excerpt:
      "Clinical trial results show 94% success rate in restoring functional vision in patients with Leber congenital amaurosis, marking a watershed moment for genetic medicine.",
    content: `<p>Researchers at the Massachusetts Eye and Ear Institute have published landmark clinical trial results demonstrating that a single CRISPR-based gene editing treatment can permanently restore vision in patients with Leber congenital amaurosis type 10, a form of hereditary blindness caused by mutations in the CEP290 gene.</p>
<p>The Phase III trial, enrolling 127 patients across 14 countries, showed 94% of participants gained functional vision within six months of a single subretinal injection. Follow-up data at 24 months indicates the improvements are durable, with no significant decline observed.</p>
<h2>How It Works</h2>
<p>The treatment uses an adeno-associated virus to deliver CRISPR-Cas9 gene editing machinery directly to photoreceptor cells in the retina. Once inside, the system makes a precise edit to remove a pathogenic mutation in the CEP290 gene, allowing normal protein production to resume.</p>
<p>Unlike earlier RNA-based therapies that require repeated dosing, the DNA-level edit appears permanent. Researchers emphasize that the therapy is highly specific and has shown no off-target editing in extensive safety analyses.</p>`,
    category: "SCIENCE",
    tags: ["CRISPR", "Gene Therapy", "Medicine", "Blindness", "Genetics"],
    author: "Dr. Priya Nair",
    isFeatured: false,
    isBreaking: false,
    isAiRewritten: false,
    readTime: 6,
    status: "PUBLISHED",
  },
  {
    title: "OpenAI Releases GPT-5 With Native Multimodal Reasoning",
    excerpt:
      "The latest flagship model demonstrates unprecedented performance across scientific reasoning, code generation, and creative tasks while introducing real-time voice and vision capabilities.",
    content: `<p>OpenAI has unveiled GPT-5, its most capable artificial intelligence model to date, featuring native multimodal processing, real-time voice interaction, and performance improvements that the company claims represent the largest capability leap between consecutive model generations.</p>
<p>In benchmark evaluations, GPT-5 achieves top scores on graduate-level scientific reasoning tests, outperforming specialist systems in areas including mathematics, medicine, law, and software engineering. The model is also the first to pass the full Turing Test across a standardized suite of human evaluator assessments.</p>
<h2>Key Capabilities</h2>
<p>GPT-5 introduces a native voice mode that processes audio directly without speech-to-text conversion, enabling more natural emotional understanding and real-time language translation. The vision system can analyze video streams in addition to static images, opening applications in robotics, healthcare diagnostics, and autonomous systems.</p>
<p>The model is available to ChatGPT Plus subscribers immediately, with API access rolling out to developers over the coming weeks. Pricing has been reduced 60% compared to GPT-4 Turbo at equivalent capability levels, which OpenAI attributes to efficiency improvements in its inference stack.</p>`,
    category: "TECHNOLOGY",
    tags: ["OpenAI", "GPT-5", "AI", "Large Language Models", "ChatGPT"],
    author: "James Park",
    isFeatured: true,
    isBreaking: false,
    isAiRewritten: true,
    readTime: 5,
    status: "PUBLISHED",
  },
  {
    title: "Solar Power Achieves Grid Parity in 147 Countries, IEA Reports",
    excerpt:
      "A historic milestone in the global energy transition: solar is now the cheapest source of electricity generation in the majority of the world, the International Energy Agency says.",
    content: `<p>Solar photovoltaic power has achieved grid parity — meaning it is now the cheapest available source of new electricity generation — in 147 countries, representing over 90% of global electricity demand, according to the International Energy Agency's annual World Energy Outlook report.</p>
<p>The milestone, which analysts projected would take until 2030, has arrived nearly five years early, driven by an 89% collapse in solar module prices since 2010, rapidly improving battery storage economics, and aggressive manufacturing scale-up in Asia.</p>
<h2>Investment Surge</h2>
<p>Global clean energy investment surpassed $2 trillion for the first time in 2025, with solar receiving $740 billion — more than oil, gas, and coal investment combined for the third consecutive year. Developing nations accounted for 58% of new solar capacity additions, a record share driven by falling financing costs and multilateral climate funds.</p>
<p>The IEA now projects that solar alone will provide 40% of global electricity by 2035, up from its previous forecast of 28%. The agency has significantly revised its oil demand peak projections, now expecting consumption to plateau by 2027.</p>`,
    category: "CLIMATE",
    tags: ["Solar Energy", "Renewables", "IEA", "Energy Transition", "Climate"],
    author: "Maya Okonkwo",
    isFeatured: false,
    isBreaking: false,
    isAiRewritten: false,
    readTime: 5,
    status: "PUBLISHED",
  },
  {
    title: "WHO Approves Revolutionary mRNA Cancer Vaccine Platform",
    excerpt:
      "Personalized immunotherapy technology developed by BioNTech and Moderna receives regulatory green light following trials showing 67% reduction in tumor recurrence across multiple cancer types.",
    content: `<p>The World Health Organization has granted prequalification to a new class of personalized mRNA cancer vaccines, clearing the path for global deployment of a technology that has shown remarkable efficacy in reducing cancer recurrence across breast, lung, colorectal, and melanoma indications.</p>
<p>The vaccines work by sequencing a patient's tumor DNA, identifying unique mutations called neoantigens, and manufacturing a custom mRNA sequence that trains the immune system to recognize and destroy cancer cells bearing those specific markers. The entire manufacturing process, from biopsy to injection-ready vaccine, now takes approximately three weeks.</p>
<h2>Trial Results</h2>
<p>Phase III trials across 2,400 patients at 67 cancer centers showed a 67% reduction in tumor recurrence at three years compared to standard adjuvant chemotherapy. The effect was most pronounced in patients with high tumor mutational burden, where recurrence rates fell by 81%.</p>
<p>Importantly, the vaccines demonstrated no significant systemic toxicity in trial participants, a key advantage over cytotoxic chemotherapy regimens. Side effects were limited to mild injection-site reactions and transient fatigue in some patients.</p>`,
    category: "HEALTH",
    tags: ["Cancer", "mRNA", "Vaccine", "WHO", "BioNTech", "Medicine"],
    author: "Dr. Sofia Reyes",
    isFeatured: false,
    isBreaking: false,
    isAiRewritten: true,
    readTime: 6,
    status: "PUBLISHED",
  },
  {
    title: "Bitcoin Surpasses $125,000 as Institutional Adoption Accelerates",
    excerpt:
      "The world's largest cryptocurrency reaches a new all-time high amid record ETF inflows, corporate treasury adoption, and growing sovereign wealth fund interest.",
    content: `<p>Bitcoin surged past $125,000 for the first time, driven by a confluence of institutional demand that analysts say marks a qualitative shift in how traditional finance views the asset. The milestone came after a week of record inflows into U.S. spot Bitcoin ETFs, which collectively now hold over $180 billion in assets under management.</p>
<p>BlackRock's iShares Bitcoin Trust alone attracted $4.2 billion in a single trading session — the largest single-day ETF inflow in history across any asset class. The fund has become one of the fastest-growing ETFs ever launched, accumulating assets at a rate that surpassed gold ETF adoption in its first comparable period.</p>
<h2>Sovereign Adoption</h2>
<p>Three sovereign wealth funds disclosed Bitcoin holdings for the first time in recent regulatory filings: Norway's Government Pension Fund, Abu Dhabi Investment Authority, and Singapore's GIC each revealed positions ranging from $2 billion to $8 billion. The disclosures have significantly expanded the addressable investor base beyond retail and hedge fund participants.</p>`,
    category: "FINANCE",
    tags: ["Bitcoin", "Cryptocurrency", "ETF", "BlackRock", "Institutional"],
    author: "David Kim",
    isFeatured: false,
    isBreaking: true,
    isAiRewritten: true,
    readTime: 4,
    status: "PUBLISHED",
  },
  {
    title: "Quantum Computing Firm Achieves 1,000-Qubit Stable Processor",
    excerpt:
      "The breakthrough brings fault-tolerant quantum computing significantly closer to practical applications in drug discovery, materials science, and cryptography.",
    content: `<p>QuEra Computing has demonstrated a 1,000-qubit neutral atom quantum processor with error rates below the threshold required for fault-tolerant computation, a milestone that researchers say fundamentally changes the timeline for practical quantum advantage in commercial applications.</p>
<p>Unlike superconducting qubits that must operate near absolute zero and are sensitive to electromagnetic interference, neutral atom systems offer natural isolation from environmental noise. QuEra's approach uses optical tweezers — highly focused laser beams — to trap and manipulate individual rubidium atoms with exceptional precision.</p>
<h2>Practical Implications</h2>
<p>At 1,000 logical qubits with current error rates, the system can execute quantum circuits deep enough to simulate molecular systems relevant to drug discovery that are intractable on classical supercomputers. Early collaborators include Pfizer for protein folding simulations and BASF for catalyst design.</p>
<p>Cryptographic implications are still years away — breaking RSA-2048 would require approximately 4,000 error-corrected logical qubits — but the pace of progress has accelerated government investment in post-quantum cryptography standardization.</p>`,
    category: "TECHNOLOGY",
    tags: ["Quantum Computing", "QuEra", "Technology", "Physics"],
    author: "Wei Zhang",
    isFeatured: false,
    isBreaking: false,
    isAiRewritten: false,
    readTime: 5,
    status: "PUBLISHED",
  },
];

function makeSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true });
  return `${base}-${Date.now().toString(36)}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await hash("Admin@NexusAI2026!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexusai.news" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nexusai.news",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Editor user
  const editorPassword = await hash("Editor@NexusAI2026!", 12);
  const editor = await prisma.user.upsert({
    where: { email: "editor@nexusai.news" },
    update: {},
    create: {
      name: "Editor",
      email: "editor@nexusai.news",
      password: editorPassword,
      role: "EDITOR",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Editor user: ${editor.email}`);

  // RSS Feeds
  for (const feed of RSS_FEEDS) {
    await prisma.rssFeed.upsert({
      where: { url: feed.url },
      update: { name: feed.name, category: feed.category as Category },
      create: {
        name: feed.name,
        url: feed.url,
        category: feed.category as Category,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${RSS_FEEDS.length} RSS feeds seeded`);

  // Sample articles
  let articleCount = 0;
  for (const article of SAMPLE_ARTICLES) {
    const slug = makeSlug(article.title);
    const existing = await prisma.article.findFirst({
      where: { title: article.title },
    });
    if (!existing) {
      await prisma.article.create({
        data: {
          title: article.title,
          slug,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category as Category,
          tags: article.tags,
          author: article.author,
          status: article.status as ArticleStatus,
          isAiRewritten: article.isAiRewritten,
          isFeatured: article.isFeatured,
          isBreaking: article.isBreaking,
          readTime: article.readTime,
          imageUrl:
            (article as any).imageUrl ??
            "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80",
          imageAlt:
            ((article as any).imageAlt ?? article.excerpt.slice(0, 120)) ||
            article.title,
          publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3),
          viewCount: Math.floor(Math.random() * 50000),
        },
      });
      articleCount++;
    }
  }
  console.log(`✅ ${articleCount} sample articles seeded`);

  // Test subscriber
  await prisma.subscriber.upsert({
    where: { email: "test@nexusai.news" },
    update: {},
    create: {
      email: "test@nexusai.news",
      name: "Test Subscriber",
      status: "ACTIVE",
      frequency: "DAILY",
      confirmedAt: new Date(),
    },
  });
  console.log("✅ Test subscriber seeded");

  // Settings: skipped because the project does not define a `Setting` model.
  // If you add a `Setting` model to prisma/schema.prisma, re-enable seeding here.
  console.log("ℹ️ Default settings seeding skipped (no Setting model)");

  console.log("\n🎉 Seeding complete!");
  console.log("   Admin login: admin@nexusai.news / Admin@NexusAI2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
