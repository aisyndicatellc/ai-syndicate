import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const publicDir = path.join(repoRoot, "public");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const siteUrl = "https://www.aisyndicate.com";

async function getPublicPageDirs() {
  const entries = await fs.readdir(publicDir, { withFileTypes: true });
  const urls = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const indexPath = path.join(publicDir, entry.name, "index.html");

    try {
      await fs.access(indexPath);
      urls.push(`/${entry.name}/`);
    } catch {
      // Ignore public directories that are asset-only.
    }
  }

  return urls.sort((a, b) => a.localeCompare(b));
}

function buildSitemap(urls, lastmod) {
  const body = urls
    .map(
      (url) => `  <url>
    <loc>${siteUrl}${url}</loc>
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
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = formatter.format(new Date());
  const urls = ["/", ...(await getPublicPageDirs())];
  const sitemap = buildSitemap(urls, today);
  await fs.writeFile(sitemapPath, sitemap, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
