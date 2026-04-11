import { lookup } from "node:dns/promises";
import net from "node:net";

const MAX_CONTENT_CHARS = 12000;
const REQUEST_TIMEOUT_MS = 12000;
const HTML_ACCEPT_HEADER = "text/html,application/xhtml+xml;q=0.9,text/plain;q=0.5,*/*;q=0.1";
const FETCH_HEADERS = {
  "user-agent": "AI-Syndicate-Analyzer/1.0 (+https://www.aisyndicate.com)",
  accept: HTML_ACCEPT_HEADER,
};

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeUserUrl(input) {
  const raw = String(input || "").trim();

  if (!raw) {
    throw createError("Enter a website URL to analyze.", 400);
  }

  if (/^https?:\/\//i.test(raw)) {
    return [raw];
  }

  return [`https://${raw}`, `http://${raw}`];
}

function isBlockedHostname(hostname) {
  const lower = hostname.toLowerCase();

  return (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  );
}

function isPrivateIpv4(ip) {
  const [a, b] = ip.split(".").map(Number);

  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function isPrivateIpv6(ip) {
  const lower = ip.toLowerCase();

  return (
    lower === "::1" ||
    lower === "::" ||
    lower.startsWith("fe80:") ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("::ffff:127.") ||
    lower.startsWith("::ffff:10.") ||
    lower.startsWith("::ffff:192.168.") ||
    /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./.test(lower)
  );
}

function isPrivateIp(ip) {
  const version = net.isIP(ip);

  if (version === 4) {
    return isPrivateIpv4(ip);
  }

  if (version === 6) {
    return isPrivateIpv6(ip);
  }

  return false;
}

async function assertPublicUrl(urlString) {
  let url;

  try {
    url = new URL(urlString);
  } catch {
    throw createError("Enter a valid website URL.", 400);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw createError("Only http and https URLs are supported.", 400);
  }

  if (!url.hostname) {
    throw createError("The website URL is missing a hostname.", 400);
  }

  if (isBlockedHostname(url.hostname)) {
    throw createError("Local, internal, and localhost URLs are not allowed.", 400);
  }

  if (net.isIP(url.hostname)) {
    if (isPrivateIp(url.hostname)) {
      throw createError("Private network URLs are not allowed.", 400);
    }

    return url;
  }

  let addresses;

  try {
    addresses = await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw createError("We could not resolve that website hostname.", 400);
  }

  if (!addresses.length) {
    throw createError("We could not resolve that website hostname.", 400);
  }

  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw createError("Private network URLs are not allowed.", 400);
  }

  return url;
}

function decodeHtmlEntities(input) {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
}

function extractMetaContent(html, attribute, value) {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attribute}=["']${value}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i"
  );

  const reversedPattern = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attribute}=["']${value}["'][^>]*>`,
    "i"
  );

  return decodeHtmlEntities(
    html.match(pattern)?.[1] ||
      html.match(reversedPattern)?.[1] ||
      ""
  ).trim();
}

function extractTitle(html) {
  return decodeHtmlEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
}

function extractHeadings(html) {
  return Array.from(
    html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi),
    (match) => stripHtmlToText(match[1])
  ).filter(Boolean);
}

function stripHtmlToText(html) {
  return decodeHtmlEntities(
    html
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<(script|style|noscript|svg|canvas|iframe|template)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<(br|hr)\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|main|aside|header|footer|li|ul|ol|table|tr|td|th|h1|h2|h3|h4|h5|h6)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractPrimaryHtml(html) {
  const candidates = [
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1],
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1],
    html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1],
    html,
  ];

  return candidates.find(Boolean) || html;
}

function buildAnalyzerContent({ title, description, headings, bodyText }) {
  const sections = [
    title,
    description,
    headings.length ? headings.join("\n") : "",
    bodyText,
  ].filter(Boolean);

  return sections.join("\n\n").slice(0, MAX_CONTENT_CHARS).trim();
}

function guessCompanyName(title, url) {
  if (!title) {
    return url.hostname.replace(/^www\./i, "");
  }

  const firstSegment = title.split(/\s+[|:-]\s+/)[0]?.trim();
  return firstSegment || title.trim();
}

async function fetchHtml(candidateUrl) {
  const validatedUrl = await assertPublicUrl(candidateUrl);
  const response = await fetch(validatedUrl, {
    headers: FETCH_HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw createError(`The website responded with ${response.status}.`, 502);
  }

  const finalUrl = response.url || validatedUrl.toString();
  await assertPublicUrl(finalUrl);

  const contentType = response.headers.get("content-type") || "";
  const html = await response.text();

  if (!contentType.includes("html") && !/<(html|body|main|article)\b/i.test(html)) {
    throw createError("That URL did not return a readable HTML page.", 422);
  }

  return { finalUrl, html };
}

export async function analyzeWebsiteFromUrl(inputUrl) {
  const candidates = normalizeUserUrl(inputUrl);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const { finalUrl, html } = await fetchHtml(candidate);
      const parsedUrl = new URL(finalUrl);
      const title = extractTitle(html);
      const description =
        extractMetaContent(html, "name", "description") ||
        extractMetaContent(html, "property", "og:description");
      const headings = extractHeadings(html).slice(0, 12);
      const bodyText = stripHtmlToText(extractPrimaryHtml(html));
      const content = buildAnalyzerContent({ title, description, headings, bodyText });

      if (!content) {
        throw createError("We fetched the page, but could not extract usable copy from it.", 422);
      }

      return {
        url: finalUrl,
        hostname: parsedUrl.hostname.replace(/^www\./i, ""),
        title: title || guessCompanyName(title, parsedUrl),
        siteName: guessCompanyName(title, parsedUrl),
        description,
        headings,
        content,
        wordCount: content.split(/\s+/).filter(Boolean).length,
      };
    } catch (error) {
      lastError = error;

      if (candidates.length === 1 || error.statusCode) {
        break;
      }
    }
  }

  throw lastError || createError("We could not analyze that website.", 500);
}
