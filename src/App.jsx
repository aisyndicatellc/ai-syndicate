import { useEffect, useMemo, useState } from "react";

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "are",
  "our",
  "has",
  "have",
  "their",
  "they",
  "into",
  "inside",
  "more",
  "than",
  "will",
  "help",
  "helps",
  "best",
  "top",
  "near",
  "what",
  "when",
  "where",
  "who",
  "how",
  "why",
  "can",
  "not",
  "but",
  "all",
  "any",
  "get",
  "use",
  "using",
  "via",
  "per",
  "new",
  "now",
  "about",
  "high",
  "value",
  "premium",
  "company",
  "services",
  "service",
]);

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function extractKeywords(text) {
  return Array.from(
    new Set(
      (text.toLowerCase().match(/[a-z][a-z&-]{2,}/g) || []).filter(
        (word) => !STOPWORDS.has(word)
      )
    )
  ).slice(0, 18);
}

function scorePresence(text, phrases) {
  const lower = text.toLowerCase();
  return phrases.reduce(
    (count, phrase) => count + (lower.includes(phrase.toLowerCase()) ? 1 : 0),
    0
  );
}

function buildAnalyzerReport({ domain, companyName, industry, scope, content }) {
  const normalizedContent = content.trim();
  const lower = normalizedContent.toLowerCase();
  const wordCount = normalizedContent.split(/\s+/).filter(Boolean).length;

  const serviceSignals = scorePresence(lower, [
    "services",
    "solutions",
    "strategy",
    "audit",
    "consulting",
    "case study",
    "process",
    "results",
    "book a call",
    "contact",
  ]);

  const trustSignals = scorePresence(lower, [
    "clients",
    "results",
    "case study",
    "trusted",
    "founders",
    "years",
    "experience",
    "testimonials",
    "portfolio",
    "featured",
    "trusted by",
    "award",
    "proven",
  ]);

  const geoSignals = scorePresence(lower, [
    scope,
    "near me",
    "local",
    "statewide",
    "nationwide",
    "regional",
    "miami",
    "florida",
    "national",
  ]);

  const aiSignals = scorePresence(lower, [
    "ai",
    "chatgpt",
    "perplexity",
    "google ai",
    "generative",
    "authority",
    "visibility",
    "search",
    "discovery",
  ]);

  const ctaSignals = scorePresence(lower, [
    "book a call",
    "schedule",
    "contact",
    "get started",
    "request",
    "apply",
    "talk to us",
    "learn more",
    "book now",
  ]);

  const comparisonSignals = scorePresence(lower, [
    "vs",
    "compare",
    "why choose",
    "difference",
    "instead of",
    "better than",
  ]);

  const visibilityScore = clamp(
    Math.round(
      32 +
        wordCount / 18 +
        aiSignals * 4 +
        geoSignals * 3 +
        serviceSignals * 3 +
        comparisonSignals * 4
    ),
    18,
    96
  );

  const authorityScore = clamp(
    Math.round(28 + wordCount / 20 + trustSignals * 5 + serviceSignals * 2),
    16,
    97
  );

  const conversionScore = clamp(
    Math.round(
      30 + ctaSignals * 6 + serviceSignals * 3 + trustSignals * 2 + wordCount / 30
    ),
    20,
    95
  );

  const keywords = extractKeywords(
    `${companyName} ${industry} ${scope} ${normalizedContent}`
  );

  const competitorSources = {
    "Law Firm": [
      "legal directories",
      "large regional firms",
      "bar listings",
      "legal publishers",
    ],
    "Med Spa": [
      "local med spas",
      "review platforms",
      "beauty publishers",
      "map listings",
    ],
    "Private Equity": [
      "fund directories",
      "finance publications",
      "competitor firms",
      "investor databases",
    ],
    "Oil & Gas Services": [
      "major service providers",
      "industry vendors",
      "trade publications",
      "operator resources",
    ],
    "Real Estate": [
      "local brokerages",
      "listing platforms",
      "developer sites",
      "market publications",
    ],
    "Home Services": [
      "local competitors",
      "review sites",
      "map listings",
      "aggregators",
    ],
    "B2B Services": [
      "category competitors",
      "industry blogs",
      "software directories",
      "agency roundups",
    ],
  };

  const queries = [
    `best ${industry.toLowerCase()} in ${scope}`,
    `${companyName || domain} ${industry.toLowerCase()}`,
    `who does ai recommend for ${industry.toLowerCase()}`,
    `${industry.toLowerCase()} ${scope} case study`,
    ...keywords.slice(0, 2).map((word) => `${word} ${industry.toLowerCase()} ${scope}`),
  ].filter(Boolean);

  const strengths = [];
  const gaps = [];
  const nextMoves = [];

  if (wordCount >= 250) {
    strengths.push(
      "Your site has enough copy depth for AI systems to extract useful context."
    );
  } else {
    gaps.push("Your site copy is thin. AI systems have less context to summarize and cite.");
  }

  if (trustSignals >= 3) {
    strengths.push(
      "You mention trust-building signals like results, experience, or client proof."
    );
  } else {
    gaps.push(
      "You need stronger trust signals such as results, proof, case studies, or testimonials."
    );
  }

  if (geoSignals >= 2) {
    strengths.push(
      `Your copy contains location and market language that supports ${scope} discovery.`
    );
  } else {
    gaps.push(
      `Your copy does not strongly reinforce ${scope} or the supporting market-discovery layers around it.`
    );
  }

  if (ctaSignals >= 2) {
    strengths.push(
      "Your site has commercial intent signals that can help convert discovery into inquiries."
    );
  } else {
    gaps.push("Your calls to action are weak or sparse. Add stronger conversion paths.");
  }

  if (comparisonSignals >= 1) {
    strengths.push(
      "You already have language that can support comparison-style AI answers."
    );
  } else {
    gaps.push("Add comparison or why-choose-us style content to win answer-engine trust.");
  }

  nextMoves.push(
    `Build dedicated pages for local, regional, and category-level ${industry.toLowerCase()} discovery.`
  );
  nextMoves.push(
    "Create comparison pages and answer-style service pages designed for AI summarization."
  );
  nextMoves.push(
    "Add more proof, outcomes, and category language directly onto the homepage and core services."
  );

  return {
    visibilityScore,
    authorityScore,
    conversionScore,
    strengths: strengths.slice(0, 4),
    gaps: gaps.slice(0, 4),
    nextMoves: nextMoves.slice(0, 4),
    competitors: competitorSources[industry] || competitorSources["B2B Services"],
    queries: queries.slice(0, 6),
    keywords,
    wordCount,
  };
}

export default function AISyndicateWebsite() {
  const siteUrl = "https://www.aisyndicate.com";

  const services = [
    {
      title: "Generative Engine Optimization (GEO)",
      description:
        "We design your digital presence so AI platforms are more likely to cite, summarize, and recommend your company when buyers ask high-intent questions in ChatGPT, Perplexity, and Google AI search experiences.",
      bullets: ["Citation strategy", "Entity positioning", "AI answer visibility"],
      href: "/generative-engine-optimization/",
    },
    {
      title: "AI Visibility Audits",
      description:
        "We show where competitors are being surfaced across AI answers and traditional search, where your authority breaks down, and where the fastest visibility gains exist.",
      bullets: ["Market mapping", "Competitor intelligence", "SERP + answer-engine gaps"],
      href: "/ai-visibility-audit/",
    },
    {
      title: "GEO vs SEO Strategy",
      description:
        "We help brands align classic SEO with answer-engine visibility so rankings, citations, authority, and conversion architecture reinforce each other instead of competing.",
      bullets: ["Search + GEO alignment", "Commercial content systems", "Authority structure"],
      href: "/geo-vs-seo/",
    },
    {
      title: "Conversion-Focused GEO",
      description:
        "We turn AI visibility into pipeline by structuring your site and offer so discovery becomes booked calls, qualified leads, and premium revenue.",
      bullets: ["Offer strategy", "Lead flow", "Higher-value inquiries"],
      href: "#contact",
    },
  ];

  const industries = [
    { title: "Law Firms", href: "/geo-for-law-firms/" },
    { title: "Real Estate", href: "/geo-for-real-estate/" },
    { title: "Med Spas", href: "/geo-for-med-spas/" },
    { title: "Private Equity", href: "/geo-for-private-equity/" },
    { title: "Oil & Gas Services", href: "/geo-for-oil-gas-services/" },
  ];

  const process = [
    {
      step: "01",
      title: "Discovery",
      text: "We begin by identifying how AI platforms answer the questions your market is already asking and where your brand is being left out.",
    },
    {
      step: "02",
      title: "Competitive Mapping",
      text: "We map the brands, publishers, competitors, and citation patterns currently controlling recommendation visibility in your market.",
    },
    {
      step: "03",
      title: "Authority Buildout",
      text: "We rebuild the trust, structure, proof, and positioning layers your brand needs to look like the obvious answer.",
    },
    {
      step: "04",
      title: "Compounding Growth",
      text: "We keep expanding your footprint so your visibility compounds over time rather than resetting every month.",
    },
  ];

  const geoPillars = [
    {
      title: "Topical Coverage",
      text: "We build the service, comparison, location, and FAQ coverage needed to answer the exact questions buyers ask before they buy.",
    },
    {
      title: "Entity Clarity",
      text: "We make it obvious who you are, what you do, where you operate, and why your brand deserves to be cited.",
    },
    {
      title: "Proof Signals",
      text: "We strengthen testimonials, outcomes, experience, trust markers, and conversion cues so humans and AI systems see real authority.",
    },
    {
      title: "Commercial Intent",
      text: "We target the queries closest to revenue, not just traffic, so visibility compounds into better opportunities.",
    },
  ];

  const queryThemes = [
    "seo for law firms",
    "seo for real estate",
    "seo for med spas",
    "generative engine optimization agency",
    "how to rank in ChatGPT",
    "how to show up in Google AI Overviews",
    "GEO vs SEO for high-ticket brands",
  ];

  const proofCards = [
    {
      label: "Decision Architecture",
      value: "Service → Comparison → Proof",
      text: "We structure the pages buyers and answer engines need in order to understand the offer, compare you against alternatives, and trust the decision.",
    },
    {
      label: "Market Positioning",
      value: "Authority over noise",
      text: "Your brand should feel like the premium choice before the prospect ever lands on a sales call or asks AI who to trust.",
    },
    {
      label: "Commercial Outcome",
      value: "Visibility that converts",
      text: "The objective is more trust, more qualified inquiries, and better clients, not vanity metrics or empty traffic reports.",
    },
  ];

  const engagementFit = [
    "You sell a high-trust service where authority changes close rates",
    "Your buyers compare options and ask AI before they book calls",
    "You need better leads, not just more impressions",
    "Your current site does not clearly communicate why you are the premium choice",
  ];

  const founderPrinciples = [
    "Clear positioning beats generic agency language",
    "Proof beats promises every time",
    "Search visibility should compound into revenue",
  ];

  const founderExpertise = [
    {
      title: "Positioning and offer architecture",
      text: "Founder-led work focused on sharpening category language, premium positioning, and the way the offer is understood before a call ever happens.",
    },
    {
      title: "Technical SEO and schema execution",
      text: "Hands-on implementation across canonical tags, sitemap logic, internal links, crawl structure, and schema instead of strategy that stops at a deck.",
    },
    {
      title: "Answer-engine visibility systems",
      text: "Strategy built for how buyers now discover brands through ChatGPT, Perplexity, Google AI Overviews, and comparison-driven search journeys.",
    },
  ];

  const publicCaseStudies = [
    {
      label: "Public Case Study 01",
      title: "From one-page pitch to crawlable GEO architecture",
      challenge:
        "The original site framed the offer, but it did not yet have the page depth or technical structure needed to compete for multiple commercial GEO terms.",
      work:
        "We added canonical alignment, sitemap coverage, structured metadata, internal links, and a set of dedicated service pages that make the offer easier to crawl and compare.",
      outcome:
        "The site now has a stronger technical foundation and a clearer path for indexing homepage, service, comparison, and industry-specific demand.",
    },
    {
      label: "Public Case Study 02",
      title: "Industry page expansion for higher-intent discovery",
      challenge:
        "A single homepage cannot carry intent for legal, med spa, private equity, industrial, and real estate discovery on its own.",
      work:
        "We built dedicated industry pages, an industries hub, stronger footer navigation, and cleaner internal links so each vertical has a distinct role in the site architecture.",
      outcome:
        "The site can now compete on more specific commercial searches instead of relying on broad category language alone.",
    },
    {
      label: "Public Case Study 03",
      title: "Audit-led funnel with a live analyzer experience",
      challenge:
        "Most agency sites talk about insight but do not actually demonstrate the thinking behind their audits or recommendations in public.",
      work:
        "We turned the audit logic into a live analyzer on the homepage and connected it to service, GEO, and audit pages so the site demonstrates the method instead of just describing it.",
      outcome:
        "Visitors can now review the diagnostic framework directly, which creates a stronger evidence layer than generic promises or soft pitch copy.",
    },
  ];

  const testimonialReadiness = [
    {
      title: "Named testimonials only",
      text: "We only publish testimonials when the client approves attribution. That keeps the trust layer smaller, but much more defensible.",
    },
    {
      title: "References shared directly",
      text: "When a fit is serious, references can be shared privately instead of turning confidential client relationships into decorative homepage copy.",
    },
    {
      title: "Public proof stays visible",
      text: "Until approved testimonials are added, the site leans on public evidence: live tooling, crawlable service depth, clear methodology, and real implementation quality.",
    },
  ];

  const faqs = useMemo(
    () => [
      {
        q: "What is generative engine optimization (GEO)?",
        a: "Generative engine optimization is the practice of making your brand easier for AI systems to understand, cite, summarize, and recommend when buyers ask commercial questions in tools like ChatGPT, Google AI Overviews, Perplexity, and Gemini.",
      },
      {
        q: "What makes this different from SEO?",
        a: "SEO helps you earn visibility in search results. GEO helps you become the source that AI answer engines summarize and recommend. The strongest strategy does both together, so rankings, citations, authority, and conversions reinforce each other.",
      },
      {
        q: "Is the on-site analyzer real?",
        a: "Yes. It evaluates actual pasted website copy for authority, trust, content depth, conversion readiness, and answer-engine-friendly positioning.",
      },
      {
        q: "Who is this built for?",
        a: "AI Syndicate is best suited for high-trust, high-ticket service businesses where perception and authority materially affect revenue.",
      },
      {
        q: "What do most clients buy first?",
        a: "Most engagements begin with an AI visibility audit and then expand into authority content, comparison pages, landing pages, and ongoing growth systems.",
      },
    ],
    []
  );

  const proofAssets = [
    {
      title: "Live AI visibility analyzer",
      text: "Review a working analyzer on the site that scores copy for visibility, authority, and conversion readiness.",
    },
    {
      title: "Dedicated commercial service pages",
      text: "Review focused pages for generative engine optimization, AI visibility audits, and GEO vs SEO instead of relying on a single homepage.",
    },
    {
      title: "Crawl-ready technical SEO foundation",
      text: "Canonical tags, sitemap, robots directives, structured data, and internal links are live on the public site.",
    },
    {
      title: "Transparent methodology",
      text: "You can review the exact framework we talk about publicly: topical coverage, entity clarity, proof signals, and commercial intent.",
    },
  ];

  const proofPrinciples = [
    "No inflated traffic screenshots or anonymous vanity metrics",
    "No made-up client wins or invented enterprise logos",
    "A public site architecture built to rank for commercial GEO terms",
    "A live product-style experience that demonstrates the offer directly",
  ];

  const logos = ["ChatGPT", "Google AI", "Perplexity", "Claude", "Gemini", "Answer Engines"];

  const trustedBy = [
    "Founders",
    "Law Firms",
    "Private Equity",
    "Med Spas",
    "Oil & Gas Services",
    "Real Estate",
  ];

  const trustStats = [
    { label: "Discovery Layers", value: "3 layers" },
    { label: "Visibility Angles", value: "SEO / GEO / Conversion" },
    { label: "Core Focus", value: "Trust + Authority" },
  ];

  const industryOptions = [
    "Law Firm",
    "Med Spa",
    "Private Equity",
    "Oil & Gas Services",
    "Real Estate",
    "Home Services",
    "B2B Services",
  ];

  const [toolDomain, setToolDomain] = useState("www.aisyndicate.com");
  const [toolCompanyName, setToolCompanyName] = useState("AI Syndicate");
  const [toolIndustry, setToolIndustry] = useState("B2B Services");
  const [toolScope, setToolScope] = useState("Miami");
  const [toolContent, setToolContent] = useState(
    "AI Syndicate helps premium brands win visibility in ChatGPT, Google AI Overviews, and Perplexity. We offer AI visibility audits, discovery strategy, authority content systems, and conversion-focused GEO for law firms, med spas, private equity firms, oil and gas services, real estate brands, and premium B2B operators. Book a discovery call to learn how to build trust, authority, and more qualified inbound leads."
  );
  const [isFetchingSite, setIsFetchingSite] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const normalizedDomain = useMemo(() => {
    const trimmed = toolDomain.trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
    return trimmed || "yourwebsite.com";
  }, [toolDomain]);

  const aiReport = useMemo(() => {
    return buildAnalyzerReport({
      domain: normalizedDomain,
      companyName: toolCompanyName,
      industry: toolIndustry,
      scope: toolScope || "your market",
      content: toolContent,
    });
  }, [normalizedDomain, toolCompanyName, toolIndustry, toolScope, toolContent]);

  useEffect(() => {
    const existingSchema = document.getElementById("ai-syndicate-schema");
    if (existingSchema) existingSchema.remove();

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "FAQPage",
          "@id": `${siteUrl}/#faq`,
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        },
      ],
    };

    const schemaTag = document.createElement("script");
    schemaTag.id = "ai-syndicate-schema";
    schemaTag.type = "application/ld+json";
    schemaTag.textContent = JSON.stringify(schema);
    document.head.appendChild(schemaTag);

    return () => {
      const tag = document.getElementById("ai-syndicate-schema");
      if (tag) tag.remove();
    };
  }, [faqs, siteUrl]);

  async function fetchWebsiteContent() {
    try {
      setIsFetchingSite(true);
      setFetchError("");

      const response = await fetch(`/api/analyze?url=${encodeURIComponent(toolDomain)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze website");
      }

      setToolContent(data.content || "");
      if (data.title && !toolCompanyName.trim()) {
        setToolCompanyName(data.title);
      }
    } catch (error) {
      setFetchError(error.message || "Failed to analyze website");
    } finally {
      setIsFetchingSite(false);
    }
  }

  const GlowButton = ({ href, children, variant = "primary" }) => {
    const base =
      "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5";

    if (variant === "secondary") {
      return (
        <a
          href={href}
          className={`${base} border border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.1]`}
        >
          <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.16),transparent)] translate-x-[-120%] group-hover:translate-x-[120%] transition duration-1000" />
          <span className="relative">{children}</span>
        </a>
      );
    }

    return (
      <a
        href={href}
        className={`${base} bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_60px_rgba(117,86,255,0.35)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_26px_80px_rgba(77,114,255,0.5)]`}
      >
        <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.45),transparent)] translate-x-[-120%] group-hover:translate-x-[120%] transition duration-1000" />
        <span className="absolute inset-0 opacity-70 blur-xl bg-gradient-to-r from-fuchsia-500/30 via-violet-500/30 to-cyan-400/30" />
        <span className="relative">{children}</span>
      </a>
    );
  };

  const ScoreCard = ({ label, value, tone = "violet" }) => {
    const toneMap = {
      violet: "from-violet-500/25 to-fuchsia-500/10 border-violet-300/10",
      cyan: "from-cyan-400/25 to-sky-500/10 border-cyan-300/10",
      emerald: "from-emerald-400/25 to-teal-500/10 border-emerald-300/10",
    };

    return (
      <div className={`rounded-3xl border bg-gradient-to-br ${toneMap[tone]} p-5`}>
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">{label}</div>
        <div className="mt-3 text-4xl font-semibold tracking-tight">{value}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white selection:bg-cyan-400/30 selection:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#050816]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a href="#top" className="flex items-center gap-3 text-white/90 transition hover:text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <img
                src="/favicon.svg?v=4"
                alt="AI Syndicate mark"
                className="h-7 w-7"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-cyan-200/70">
                AI Search Visibility
              </div>
              <div className="mt-1 text-base font-semibold tracking-[0.06em] text-white">
                AI Syndicate
              </div>
            </div>
          </a>

          <div className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="/generative-engine-optimization/" className="transition hover:text-white">GEO Agency</a>
            <a href="/ai-visibility-audit/" className="transition hover:text-white">AI Visibility Audit</a>
            <a href="/industries/" className="transition hover:text-white">Industries</a>
            <a href="/#tool" className="transition hover:text-white">Run Analyzer</a>
            <a href="/about/" className="transition hover:text-white">About</a>
          </div>

          <GlowButton href="mailto:cj@aisyndicate.com?subject=AI%20Syndicate%20Inquiry">Contact Us</GlowButton>
        </div>
      </div>

      <main>
        <section id="top" className="relative overflow-hidden border-b border-white/10 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.14),transparent_22%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10 lg:pb-28 lg:pt-16">
          <div className="grid items-start gap-16 lg:grid-cols-[1.12fr_.88fr]">
            <div>
              <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-cyan-100/90">
                SEO + GEO • AI SEARCH VISIBILITY • PREMIUM POSITIONING
              </div>
              <div className="mb-8 flex items-center gap-5">
                <div className="flex h-18 w-18 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/[0.04]">
                  <img
                    src="/favicon.svg?v=4"
                    alt="AI Syndicate mark"
                    className="h-11 w-11"
                  />
                </div>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-[0.34em] text-cyan-200/70">
                    AI Search Visibility
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-[0.08em] text-white sm:text-4xl">
                    AI SYNDICATE
                  </div>
                </div>
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl xl:leading-[0.98]">
                The GEO agency for brands that need to look like the <span className="bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-transparent">obvious answer</span>.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70 sm:text-[1.15rem]">
                AI Syndicate helps premium service brands improve SEO, dominate answer-engine discovery, and convert AI visibility into qualified pipeline, stronger authority, and higher-value revenue.
              </p>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/55">
                {[
                  "Built for high-trust service brands",
                  "Focused on authority, not vanity traffic",
                  "Designed for search and AI answers",
                ].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <GlowButton href="/ai-visibility-audit/">Start with the Audit</GlowButton>
                <GlowButton href="#tool" variant="secondary">Run the Analyzer</GlowButton>
              </div>
              <div className="mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ["Clarify", "Make the offer easy to understand"],
                  ["Compare", "Own the questions buyers ask before they choose"],
                  ["Prove", "Back authority with trust signals that convert"],
                ].map(([title, text]) => (
                  <div key={title} className="border-l border-cyan-300/20 pl-4">
                    <div className="text-xl font-semibold text-white">{title}</div>
                    <div className="mt-1 text-sm text-white/60">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,36,0.94),rgba(7,12,25,0.92))] shadow-[0_30px_80px_rgba(0,0,0,0.38)]">
                <div className="border-b border-white/10 px-6 py-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Market Intelligence Snapshot</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">How AI systems decide who gets recommended.</h3>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-white/58">
                    The brands that win AI visibility usually have clearer service architecture, stronger trust signals, and pages that are easier to summarize than their competitors.
                  </p>
                </div>

                <div className="space-y-6 p-6">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">Core finding</div>
                    <p className="mt-3 text-base leading-8 text-white/78">
                      Most brands do not have a ranking problem first. They have a clarity problem. Search engines and answer engines cannot confidently interpret, compare, and recommend what is not structured clearly.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Visibility", `${aiReport.visibilityScore}%`],
                      ["Authority", `${aiReport.authorityScore}%`],
                      ["Conversion", `${aiReport.conversionScore}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{label}</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[
                      "Service pages make your offer easier to summarize",
                      "Comparison pages capture high-intent demand",
                      "Proof systems reinforce authority and conversion",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-[#0b1124]/60 p-4 text-sm leading-7 text-white/70 sm:min-h-full">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 border-y border-white/8 py-6">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {logos.map((logo, index) => (
                <div
                  key={logo}
                  className={`px-4 py-3 text-center text-sm ${
                    index % 3 === 0
                      ? "text-cyan-100/60"
                      : index % 3 === 1
                      ? "text-violet-100/60"
                      : "text-fuchsia-100/60"
                  }`}
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-8 lg:p-10">
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/[0.05] px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/85">
                Best Fit
              </div>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.8rem] lg:leading-tight">
                Built for brands where trust, perception, and premium positioning change the deal.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                AI Syndicate is designed for premium operators who need more than clicks. They need authority, recommendation visibility, and a site experience that feels expensive before the first conversation starts.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {trustedBy.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-full border px-4 py-2 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${
                      index % 3 === 0
                        ? "border-cyan-300/15 bg-cyan-400/10 text-cyan-100/85"
                        : index % 3 === 1
                        ? "border-violet-300/15 bg-violet-400/10 text-violet-100/85"
                        : "border-fuchsia-300/15 bg-fuchsia-400/10 text-fuchsia-100/85"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {trustStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.7rem] border border-white/10 bg-[#0b1124]/55 p-5"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">{stat.label}</div>
                  <div className="mt-3 text-xl font-semibold leading-7 text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-[2.2rem] border border-white/10 bg-white/[0.03] p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Why Clients Hire Us</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Premium brands do not need more marketing noise. They need clearer authority.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
                The market is already being shaped by what search engines rank and what AI systems summarize. We help brands close the gap between being excellent and being recognized as the obvious answer.
              </p>
            </div>

            <div className="rounded-[2.2rem] border border-white/10 bg-[#0b1124]/60 p-8">
              <div className="text-xs uppercase tracking-[0.28em] text-white/40">Best Fit</div>
              <div className="mt-6 grid gap-4">
                {engagementFit.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="proof" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {proofCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8"
            >
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">{card.label}</div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{card.value}</div>
              <p className="mt-4 text-base leading-7 text-white/65">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">What We Do</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A category-defining growth system for SEO, GEO, and answer-engine visibility.</h2>
          <p className="mt-5 text-lg leading-8 text-white/65">
            This is not generic SEO. It is a premium visibility engine built for brands that need stronger rankings, stronger citations, stronger authority, and higher-value conversions.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.title} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <h3 className="text-2xl font-semibold">{service.title}</h3>
              <p className="mt-4 text-base leading-7 text-white/65">{service.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {service.bullets.map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-white/10 bg-[#0b1124]/70 px-3 py-1 text-xs font-medium text-white/70"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
              <a
                href={service.href}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
              >
                Explore page
                <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Why We Rank</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              What the best GEO agencies actually do differently.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/65">
              The brands most likely to win AI search visibility are the ones with clearer entities, deeper topical coverage, stronger proof, and cleaner commercial intent. That is the system we build.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {geoPillars.map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7"
              >
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-white/65">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tool" className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Interactive Tool</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A real analyzer, not a fake demo.</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">
              Paste real website copy and instantly evaluate authority, trust, conversion readiness, market signals, SEO coverage, and answer-engine positioning.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#0b1124]/85 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="text-sm font-medium text-white/75">AI Visibility Input</div>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-white/55">Website</label>
                  <input
                    value={toolDomain}
                    onChange={(e) => setToolDomain(e.target.value)}
                    placeholder="yourwebsite.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                  />
                  <button
                    type="button"
                    onClick={fetchWebsiteContent}
                    disabled={isFetchingSite || !toolDomain.trim()}
                    className="mt-3 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(118,92,255,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFetchingSite ? "Fetching Website…" : "Analyze Website URL"}
                  </button>
                  {fetchError ? (
                    <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
                      {fetchError}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Company Name</label>
                  <input
                    value={toolCompanyName}
                    onChange={(e) => setToolCompanyName(e.target.value)}
                    placeholder="Company name"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Industry</label>
                  <select
                    value={toolIndustry}
                    onChange={(e) => setToolIndustry(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/[0.07]"
                  >
                    {industryOptions.map((option) => (
                      <option key={option} value={option} className="bg-slate-950 text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Primary Market</label>
                  <input
                    value={toolScope}
                    onChange={(e) => setToolScope(e.target.value)}
                    placeholder="Miami"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Paste Homepage or Service Page Copy</label>
                  <textarea
                    value={toolContent}
                    onChange={(e) => setToolContent(e.target.value)}
                    rows={10}
                    placeholder="Paste your homepage or service page copy here"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                  />
                </div>
                <div className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_18px_50px_rgba(118,92,255,0.35)]">
                  <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.4),transparent)] translate-x-[-120%] group-hover:translate-x-[120%] transition duration-1000" />
                  <span className="relative">Live AI Visibility Analysis</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/40">Visibility Summary</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{normalizedDomain}</h3>
                  <p className="mt-2 text-white/60">Analyzed for {toolIndustry} in {toolScope || "your primary market"}</p>
                </div>
                <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                  Real copy analyzer
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <ScoreCard label="Visibility" value={`${aiReport.visibilityScore}%`} tone="violet" />
                <ScoreCard label="Authority" value={`${aiReport.authorityScore}%`} tone="cyan" />
                <ScoreCard label="Conversion" value={`${aiReport.conversionScore}%`} tone="emerald" />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1124]/65 p-4 text-sm text-white/70">
                Word count analyzed: <span className="font-semibold text-white">{aiReport.wordCount}</span>
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-[#0b1124]/70 p-5">
                    <div className="text-sm font-semibold text-white">High-Intent AI Queries</div>
                    <div className="mt-4 space-y-3">
                      {aiReport.queries.map((query) => (
                        <div key={query} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                          {query}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0b1124]/70 p-5">
                    <div className="text-sm font-semibold text-white">Extracted Keywords</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {aiReport.keywords.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0b1124]/70 p-5">
                    <div className="text-sm font-semibold text-white">Likely Competitor Sources</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {aiReport.competitors.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-300/10 bg-emerald-400/10 p-5">
                    <div className="text-sm font-semibold text-white">Strengths</div>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                      {aiReport.strengths.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-amber-300/10 bg-amber-400/10 p-5">
                    <div className="text-sm font-semibold text-white">Visibility Gaps</div>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                      {aiReport.gaps.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-violet-300/10 bg-violet-400/10 p-5">
                    <div className="text-sm font-semibold text-white">Recommended Next Moves</div>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                      {aiReport.nextMoves.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.10] bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Why Now</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                AI is becoming the new front door to the internet.
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/70">
                Buyers no longer just search. They ask. They compare. They trust the answer that appears directly inside the interface.
              </p>
              <p className="mt-5 text-lg leading-8 text-white/70">
                The brands that become easy for AI systems to understand, summarize, and recommend gain a compounding advantage in attention, trust, and deal flow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Higher-quality inbound leads",
                "Greater brand authority",
                "Compounding AI citations",
                "Stronger conversion intent",
              ].map((item, index) => (
                <div
                  key={item}
                  className={`rounded-[1.5rem] border border-white/10 p-6 ${
                    index % 2 === 0 ? "bg-[#0b1124]/70" : "bg-white/[0.05]"
                  }`}
                >
                  <div className="text-lg font-medium">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">High-Intent Queries</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            The exact GEO and AI search questions we help brands win.
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/65">
            Great GEO pages do not hide from explicit search language. They answer commercial, comparison, and category-defining questions directly so search engines and answer engines have clean language to summarize.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {queryThemes.map((query) => (
            <div
              key={query}
              className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5 text-white/80 shadow-lg shadow-black/20"
            >
              {query}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Founder Standard</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                We build sites that look like the authority before the call ever happens.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/65">
                The standard is simple: if a sophisticated prospect lands on your site or asks AI about your category, your brand should sound focused, credible, and hard to ignore. That means clear positioning, explicit proof, and strong commercial language.
              </p>
            </div>
            <div className="grid gap-4">
              {founderPrinciples.map((item, index) => (
                <div
                  key={item}
                  className={`rounded-[1.8rem] border border-white/10 p-6 ${
                    index === 0
                      ? "bg-gradient-to-br from-cyan-400/10 to-white/[0.03]"
                      : index === 1
                      ? "bg-gradient-to-br from-violet-500/10 to-white/[0.03]"
                      : "bg-gradient-to-br from-fuchsia-500/10 to-white/[0.03]"
                  }`}
                >
                  <div className="text-lg font-semibold text-white">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Founder Expertise</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Founder-led strategy, technical implementation, and answer-engine architecture.
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/65">
            This work is designed to close the gap between high-level positioning and the technical details that actually change how a site is crawled, compared, and trusted.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {founderExpertise.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8"
            >
              <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-base leading-7 text-white/65">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">How It Works</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            The authority engine behind AI visibility.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {process.map((item) => (
            <div
              key={item.step}
              className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-lg shadow-black/20"
            >
              <div className="text-sm font-medium tracking-[0.25em] text-white/40">{item.step}</div>
              <h3 className="mt-4 text-2xl font-semibold">{item.title}</h3>
              <p className="mt-4 text-base leading-7 text-white/65">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[.95fr_1.05fr] lg:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">How Engagements Start</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Start with an audit that makes the opportunity obvious.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/65">
              We show where AI platforms are sending attention, who they are recommending instead of you, and exactly what your brand needs to become the premium answer.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <GlowButton href="/ai-visibility-audit/">Start with the Audit</GlowButton>
              <GlowButton href="#tool" variant="secondary">Run the Analyzer</GlowButton>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#0b1124]/80 p-8 shadow-2xl shadow-black/20">
            <div className="text-xs uppercase tracking-[0.28em] text-white/40">Discovery Audit Includes</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "AI query and intent mapping",
                "Competitor citation analysis",
                "Service, comparison, and authority gap review",
                "Homepage and service page gaps",
                "Authority signal recommendations",
                "Clear next-step roadmap",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="industries" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Who This Is For</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Built for industries where perception changes revenue.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <a
              key={industry.title}
              href={industry.href}
              className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5 text-white/80 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.07]"
            >
              <div className="text-lg font-medium text-white">{industry.title}</div>
              <div className="mt-3 text-sm uppercase tracking-[0.24em] text-cyan-200/70">
                Explore page
              </div>
            </a>
          ))}
        </div>
        <div className="mt-8">
          <GlowButton href="/industries/" variant="secondary">
            View the Industries Hub
          </GlowButton>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Proof</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Proof you can actually review right now.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/65">
              We are not going to invent client logos, inflate screenshots, or publish fake revenue numbers. Instead, we show the live assets, technical foundation, and content architecture you can verify yourself.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
            <div className="grid gap-6 md:grid-cols-2">
              {proofAssets.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8"
                >
                  <div className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">What you can review</div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-base leading-7 text-white/65">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-[#0b1124]/55 p-8">
              <div className="text-xs uppercase tracking-[0.28em] text-white/40">Trust Standard</div>
              <h3 className="mt-4 text-3xl font-semibold text-white">
                A stronger signal than soft testimonials is a site that can defend its claims.
              </h3>
              <div className="mt-6 space-y-4">
                {proofPrinciples.map((item) => (
                  <div key={item} className="border-l border-cyan-300/20 pl-4 text-sm leading-7 text-white/72">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <GlowButton href="/case-studies/">View Case Studies</GlowButton>
                <GlowButton href="/methodology/" variant="secondary">Review Methodology</GlowButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Case Studies</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Public build case studies you can review directly on the live site.
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/65">
            Rather than inventing client metrics, we document the public work itself: what changed, why it changed, and how the site now supports stronger GEO and SEO depth.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {publicCaseStudies.map((study) => (
            <div
              key={study.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8"
            >
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">{study.label}</div>
              <h3 className="mt-4 text-2xl font-semibold text-white">{study.title}</h3>
              <div className="mt-6 space-y-4 text-sm leading-7 text-white/65">
                <div>
                  <span className="text-white/90">Challenge</span>
                  <p className="mt-1">{study.challenge}</p>
                </div>
                <div>
                  <span className="text-white/90">Work</span>
                  <p className="mt-1">{study.work}</p>
                </div>
                <div>
                  <span className="text-white/90">Outcome</span>
                  <p className="mt-1">{study.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <GlowButton href="/case-studies/">Open the Case Studies Hub</GlowButton>
          <GlowButton href="/methodology/" variant="secondary">See the Methodology</GlowButton>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Testimonials & References</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              We only publish attributed testimonials, not anonymous praise.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/65">
              That means this section stays disciplined. Approved quotes get published. Until then, we keep references private and let the live work carry more of the proof burden.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonialReadiness.map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-white/10 bg-[#0b1124]/55 p-8"
              >
                <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-white/65">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">FAQ</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            What buyers ask before they reach out.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-lg shadow-black/20"
            >
              <h3 className="text-xl font-semibold">{item.q}</h3>
              <p className="mt-4 text-base leading-7 text-white/65">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

        <section className="mx-auto max-w-5xl px-6 pb-24 pt-6 text-center lg:px-10" id="contact">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-white/[0.11] via-violet-500/[0.08] to-cyan-400/[0.08] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.18),transparent_32%)]" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Let’s Build Your AI Moat</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Ready to see why your competitors are being recommended first?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
                If your competitors are already being cited and you are not, demand is already being shaped without you. Start with the audit, see the gaps, and build the authority layer that wins better clients.
              </p>
              <div className="mx-auto mt-8 max-w-3xl rounded-[1.8rem] border border-white/10 bg-[#0b1124]/55 p-6 text-left">
                <div className="text-xs uppercase tracking-[0.28em] text-white/40">What Happens Next</div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    "We review your market, offer, and current visibility",
                    "We identify the authority and citation gaps holding you back",
                    "We show you the fastest path to better SEO, GEO, and conversion performance",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/75"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <GlowButton href="mailto:cj@aisyndicate.com?subject=AI%20Syndicate%20Inquiry">
                  Contact Us
                </GlowButton>
                <GlowButton href="#tool" variant="secondary">
                  Run the Analyzer
                </GlowButton>
              </div>
              <p className="mt-4 text-sm text-white/55">Prefer email? Reach us at cj@aisyndicate.com.</p>
              <p className="mt-3 text-sm text-white/45">
                For founders, operators, and premium service brands that want better demand capture from search and AI answers.
              </p>
            </div>
          </div>
        </section>

        <footer className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
          <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-white/55 lg:grid-cols-[1.1fr_.7fr_.9fr_1fr] lg:p-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">AI Syndicate</p>
              <h3 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Premium SEO, GEO, and AI visibility strategy for brands that need to look like the obvious choice.
              </h3>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/62">
                Founder-led strategy for premium service brands that need stronger discoverability, sharper positioning, and better demand capture from search and AI answers. AI Syndicate is operated by AI Syndicate Collective LLC.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-white/62">
                <span>AI Syndicate Collective LLC</span>
                <span>United States</span>
                <a className="text-white/78 hover:text-white" href="https://www.aisyndicate.com">www.aisyndicate.com</a>
                <a className="text-white/78 hover:text-white" href="mailto:cj@aisyndicate.com">cj@aisyndicate.com</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Core Pages</p>
              <div className="mt-4 grid gap-3 text-sm text-white/68">
                <a className="transition hover:text-white" href="/">Home</a>
                <a className="transition hover:text-white" href="/generative-engine-optimization/">GEO Agency</a>
                <a className="transition hover:text-white" href="/ai-visibility-audit/">AI Visibility Audit</a>
                <a className="transition hover:text-white" href="/geo-vs-seo/">GEO vs SEO</a>
                <a className="transition hover:text-white" href="/industries/">Industries</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Trust & Resources</p>
              <div className="mt-4 grid gap-3 text-sm text-white/68">
                <a className="transition hover:text-white" href="/about/">About</a>
                <a className="transition hover:text-white" href="/case-studies/">Case Studies</a>
                <a className="transition hover:text-white" href="/methodology/">Methodology</a>
                <a className="transition hover:text-white" href="/how-to-rank-in-chatgpt/">How to Rank in ChatGPT</a>
                <a className="transition hover:text-white" href="/how-to-show-up-in-google-ai-overviews/">How to Show Up in Google AI Overviews</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Industry Pages</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {industries.map((industry) => (
                  <a
                    key={industry.title}
                    href={industry.href}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition hover:border-cyan-300/25 hover:text-white"
                  >
                    {industry.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-10 gap-y-4 border-t border-cyan-300/15 px-2 pt-6 text-[15px] text-white/90">
            <a className="transition hover:text-cyan-300" href="/privacy-policy/">Privacy Policy</a>
            <a className="transition hover:text-cyan-300" href="/terms-of-service/">Terms of Service</a>
            <a className="transition hover:text-cyan-300" href="/cookie-settings/">Cookie Settings</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
