import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const publicDir = path.join(repoRoot, "public");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const siteUrl = "https://www.aisyndicate.com";
const dateFormatter = new Intl.DateTimeFormat("en", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

async function walkIndexFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkIndexFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name === "index.html") {
      files.push(fullPath);
    }
  }

  return files;
}

function formatDate(date) {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getCanonicalUrl(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return match?.[1] ?? null;
}

function normalizeCanonical(url) {
  if (url === siteUrl) {
    return `${siteUrl}/`;
  }

  return url;
}

async function getPages() {
  const pageFiles = [
    path.join(repoRoot, "index.html"),
    ...(await walkIndexFiles(publicDir)),
  ];

  const pages = [];

  for (const filePath of pageFiles) {
    const html = await fs.readFile(filePath, "utf8");
    const canonical = getCanonicalUrl(html);

    if (!canonical) continue;

    const stats = await fs.stat(filePath);
    pages.push({
      url: normalizeCanonical(canonical),
      lastmod: formatDate(stats.mtime),
    });
  }

  pages.sort((a, b) => {
    if (a.url === `${siteUrl}/`) return -1;
    if (b.url === `${siteUrl}/`) return 1;
    return a.url.localeCompare(b.url);
  });

  return pages;
}

function buildSitemap(pages) {
  const body = pages
    .map(
      ({ url, lastmod }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function main() {
  const pages = await getPages();
  const sitemap = buildSitemap(pages);
  await fs.writeFile(sitemapPath, sitemap, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
