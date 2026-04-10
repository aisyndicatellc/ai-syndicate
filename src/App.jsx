import { useMemo, useState } from "react";

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
      `Your copy does not strongly reinforce ${scope} or local/state/national discovery layers.`
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
    `Build dedicated pages for local, state, and national ${industry.toLowerCase()} discovery.`
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
  const services = [
    {
      title: "Generative Engine Optimization",
      description:
        "We design your digital presence so AI platforms are more likely to cite, summarize, and recommend your company when buyers ask high-intent questions.",
      bullets: ["Citation strategy", "Entity positioning", "Answer-engine visibility"],
    },
    {
      title: "AI Visibility Audits",
      description:
        "We show exactly where your competitors are being surfaced, where your authority breaks down, and where the fastest visibility gains exist.",
      bullets: ["Market mapping", "Competitor intelligence", "Visibility gaps"],
    },
    {
      title: "Authority Content Systems",
      description:
        "We create high-trust service pages, comparison pages, and proof assets built to earn trust from both humans and answer engines.",
      bullets: ["Service architecture", "Comparison pages", "Proof layers"],
    },
    {
      title: "Conversion-Focused GEO",
      description:
        "We turn AI visibility into premium outcomes by structuring your site and offer so discovery becomes booked calls and revenue.",
      bullets: ["Offer strategy", "Lead flow", "Higher-value inquiries"],
    },
  ];

  const industries = [
    "Law Firms",
    "Private Equity",
    "Healthcare & Med Spas",
    "Oil & Gas Services",
    "Luxury Home Services",
    "High-Ticket B2B",
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
      text: "We map the brands, directories, publishers, and competitors currently controlling local, state, and national answer-engine visibility.",
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

  const proofCards = [
    {
      label: "Intent Coverage",
      value: "Local → State → National",
      text: "We build visibility across every layer of commercial search intent, not just generic traffic.",
    },
    {
      label: "Positioning",
      value: "Authority over noise",
      text: "Your brand should feel like the premium choice before the prospect ever lands on a sales call.",
    },
    {
      label: "Commercial Outcome",
      value: "Visibility that converts",
      text: "The objective is more trust, more qualified inquiries, and better clients—not vanity metrics.",
    },
  ];

  const faqs = [
    {
      q: "What makes this different from SEO?",
      a: "Traditional SEO chased rankings. AI GEO focuses on becoming the source answer engines summarize and recommend when buyers ask high-intent questions.",
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
  ];

  const testimonials = [
    {
      quote:
        "This feels less like a website and more like a category-defining product experience. It immediately signals premium authority.",
      name: "Growth Advisor",
      role: "B2B Services",
    },
    {
      quote:
        "The analyzer makes the value obvious. You can feel how this would close sophisticated clients faster than a normal agency site.",
      name: "Operator",
      role: "Investment Firm",
    },
    {
      quote:
        "The positioning is sharp, the design feels elite, and the offer is clear. It looks like a million-dollar firm, not a freelancer site.",
      name: "Founder",
      role: "Consulting Brand",
    },
  ];

  const logos = ["ChatGPT", "Google AI", "Perplexity", "Claude", "Gemini", "Answer Engines"];

  const trustedBy = [
    "Founders",
    "Law Firms",
    "Private Equity",
    "Med Spas",
    "Oil & Gas Services",
    "Luxury Service Brands",
  ];

  const trustStats = [
    { label: "Discovery Layers", value: "3" },
    { label: "Visibility Angles", value: "Local / State / National" },
    { label: "Core Focus", value: "Trust + Authority" },
  ];

  const industryOptions = [
    "Law Firm",
    "Med Spa",
    "Private Equity",
    "Oil & Gas Services",
    "Home Services",
    "B2B Services",
  ];

  const [toolDomain, setToolDomain] = useState("aisyndicate.com");
  const [toolCompanyName, setToolCompanyName] = useState("AI Syndicate");
  const [toolIndustry, setToolIndustry] = useState("B2B Services");
  const [toolScope, setToolScope] = useState("Miami");
  const [toolContent, setToolContent] = useState(
    "AI Syndicate helps premium brands win visibility in ChatGPT, Google AI Overviews, and Perplexity. We offer AI visibility audits, discovery strategy, authority content systems, and conversion-focused GEO for law firms, med spas, private equity firms, oil and gas services, and premium B2B brands. Book a discovery call to learn how to build trust, authority, and more qualified inbound leads."
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

      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050816]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a href="#top" className="text-sm font-semibold uppercase tracking-[0.28em] text-white/90">
            AI Syndicate
          </a>
          
          <GlowButton href="#contact">Book a Call</GlowButton>
        </div>
      </div>

      <section id="top" className="relative overflow-hidden border-b border-white/10 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.22),transparent_22%),radial-gradient(circle_at_60%_50%,rgba(124,58,237,0.18),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10 lg:pb-28 lg:pt-16">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full border border-cyan-300/15 bg-white/[0.06] px-4 py-2 text-sm text-cyan-100/90 backdrop-blur">
                AI GEO • DISCOVERY • POSITIONING • REVENUE
              </div>
              <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[5.15rem] xl:leading-[0.98]">
                The premium firm for brands that want to win inside <span className="bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-transparent">AI answers</span>.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
                AI Syndicate helps elite service businesses dominate answer-engine discovery, look like the obvious choice before the first call, and convert visibility into premium revenue.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <GlowButton href="#contact">Book a Discovery Call</GlowButton>
                <GlowButton href="#tool" variant="secondary">Run the Analyzer</GlowButton>
              </div>
              <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ["Local", "Own city-level discovery"],
                  ["State", "Dominate regional trust"],
                  ["National", "Become the category answer"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur">
                    <div className="text-xl font-semibold text-white">{title}</div>
                    <div className="mt-1 text-sm text-white/60">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-fuchsia-500/20 via-violet-500/10 to-cyan-400/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020]/85 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">AI Syndicate Assistant</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">Search visibility strategist</h3>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Live Demo
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="max-w-[82%] rounded-[1.5rem] rounded-tl-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-7 text-white/80 shadow-lg shadow-black/20">
                    Analyze why our brand is not showing up in AI answers for high-intent searches in Miami.
                  </div>

                  <div className="ml-auto max-w-[92%] rounded-[1.5rem] rounded-tr-md border border-cyan-300/10 bg-gradient-to-br from-cyan-400/10 via-violet-500/10 to-fuchsia-500/10 px-4 py-4 shadow-lg shadow-black/20">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-200/70">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
                      AI response
                    </div>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-white/80">
                      <p>
                        Your competitors are likely winning answer-engine visibility because they have stronger trust signals, clearer category positioning, and more citation-friendly pages.
                      </p>
                      <div className="rounded-2xl border border-white/10 bg-[#0b1124]/70 p-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-white/40">Top findings</div>
                        <ul className="mt-2 space-y-2 text-white/75">
                          <li>• Local intent queries are being captured by stronger regional brands</li>
                          <li>• Your proof and authority need to be easier for AI systems to interpret</li>
                          <li>• Comparison pages could unlock premium recommendation intent</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Visibility", `${aiReport.visibilityScore}%`],
                      ["Authority", `${aiReport.authorityScore}%`],
                      ["Conversion", `${aiReport.conversionScore}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{label}</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full rounded-[1.4rem] border border-white/10 bg-[#07101f]/90 p-3 text-left transition hover:border-cyan-300/25"
                  >
                    <div className="flex items-center gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/45">
                      <span className="text-white/30">Ask AI Syndicate about your market, competitors, or GEO strategy...</span>
                      <span className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-[0_0_20px_rgba(120,119,255,0.45)]">
                        →
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {logos.map((logo, index) => (
                <div
                  key={logo}
                  className={`rounded-2xl border px-4 py-3 text-center text-sm shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${
                    index % 3 === 0
                      ? "border-cyan-300/10 bg-cyan-400/5 text-cyan-100/70"
                      : index % 3 === 1
                      ? "border-violet-300/10 bg-violet-400/5 text-violet-100/70"
                      : "border-fuchsia-300/10 bg-fuchsia-400/5 text-fuchsia-100/70"
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
        <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="absolute -left-16 top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/[0.05] px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/85">
                Trusted By
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
              {trustStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`rounded-[1.7rem] border border-white/10 p-5 shadow-lg shadow-black/20 ${
                    index === 0
                      ? "bg-gradient-to-br from-cyan-400/12 to-white/[0.03]"
                      : index === 1
                      ? "bg-gradient-to-br from-violet-500/12 to-white/[0.03]"
                      : "bg-gradient-to-br from-fuchsia-500/12 to-white/[0.03]"
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">{stat.label}</div>
                  <div className="mt-3 text-xl font-semibold leading-7 text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="proof" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {proofCards.map((card, index) => (
            <div
              key={card.label}
              className={`rounded-[2rem] border border-white/10 p-8 shadow-lg shadow-black/25 ${
                index === 0
                  ? "bg-gradient-to-br from-cyan-400/10 to-white/[0.03]"
                  : index === 1
                  ? "bg-gradient-to-br from-violet-500/10 to-white/[0.03]"
                  : "bg-gradient-to-br from-fuchsia-500/10 to-white/[0.03]"
              }`}
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
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A category-defining growth system for answer-engine visibility.</h2>
          <p className="mt-5 text-lg leading-8 text-white/65">
            This is not generic SEO. It is a premium visibility engine built for brands that need trust, authority, and high-value conversions.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`rounded-[2rem] border border-white/10 p-8 shadow-lg shadow-black/20 ${
                index % 2 === 0
                  ? "bg-gradient-to-br from-white/[0.06] to-cyan-400/[0.05]"
                  : "bg-gradient-to-br from-white/[0.06] to-violet-500/[0.05]"
              }`}
            >
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
            </div>
          ))}
        </div>
      </section>

      <section id="tool" className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Interactive Tool</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A real analyzer, not a fake demo.</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">
              Paste real website copy and instantly evaluate authority, trust, conversion readiness, market signals, and answer-engine positioning.
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
              <GlowButton href="#contact">Get the Audit</GlowButton>
              <GlowButton href="#tool" variant="secondary">Try the Tool</GlowButton>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#0b1124]/80 p-8 shadow-2xl shadow-black/20">
            <div className="text-xs uppercase tracking-[0.28em] text-white/40">Discovery Audit Includes</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "AI query and intent mapping",
                "Competitor citation analysis",
                "Local, state, and national visibility review",
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

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Who This Is For</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Built for industries where perception changes revenue.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <div key={industry} className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5 text-white/80 shadow-lg shadow-black/20">
              {industry}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Social Proof</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              The positioning lands.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-lg shadow-black/20"
              >
                <div className="absolute right-5 top-5 text-5xl text-white/10">”</div>
                <div className="text-lg leading-8 text-white/78">“{item.quote}”</div>
                <div className="mt-8 text-sm font-semibold text-white">{item.name}</div>
                <div className="mt-1 text-sm text-white/45">{item.role}</div>
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
              Ready to see where AI is sending attention in your market?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
              If your competitors are already being cited and you are not, demand is already being shaped without you. Start with the audit, see the gaps, and build the authority layer that wins better clients.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <GlowButton href="mailto:hello@aisyndicate.com">hello@aisyndicate.com</GlowButton>
              <GlowButton href="tel:+10000000000" variant="secondary">Schedule a Call</GlowButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
