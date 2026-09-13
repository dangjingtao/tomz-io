import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const distRoot = resolve(process.cwd(), "dist");
const rssPath = resolve(distRoot, "rss.xml");

if (!existsSync(distRoot)) {
  throw new Error(`Missing build output: ${distRoot}`);
}

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function xml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function canonicalFromHtml(html) {
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i)?.[1];
}

function jsonLdObjects(html) {
  const objects = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) objects.push(...parsed);
      else if (parsed && Array.isArray(parsed["@graph"])) objects.push(...parsed["@graph"]);
      else objects.push(parsed);
    } catch {
      // Static-output verification owns malformed JSON-LD failures. RSS simply skips it.
    }
  }
  return objects.filter((value) => value && typeof value === "object");
}

function isArticle(value) {
  const type = value?.["@type"];
  return Array.isArray(type) ? type.includes("Article") : type === "Article";
}

function authorNames(author) {
  const values = Array.isArray(author) ? author : author ? [author] : [];
  return values
    .map((value) => typeof value === "string" ? value : value?.name)
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

function rssDate(value) {
  if (!value) return undefined;
  const timestamp = Date.parse(String(value));
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toUTCString();
}

const htmlFiles = filesUnder(distRoot).filter((file) => file.endsWith(".html"));
const entries = [];
let homeCanonical;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const canonical = canonicalFromHtml(html);
  if (!canonical) continue;
  if (file === resolve(distRoot, "index.html")) homeCanonical = canonical;

  const article = jsonLdObjects(html).find(isArticle);
  if (!article) continue;

  const url = String(article.url || canonical);
  if (!url) continue;
  entries.push({
    title: String(article.headline || article.name || "Untitled"),
    url,
    description: String(article.description || ""),
    publishedAt: article.datePublished ? String(article.datePublished) : undefined,
    modifiedAt: article.dateModified ? String(article.dateModified) : undefined,
    authors: authorNames(article.author),
  });
}

entries.sort((left, right) => {
  const leftTime = Date.parse(left.publishedAt || left.modifiedAt || "") || 0;
  const rightTime = Date.parse(right.publishedAt || right.modifiedAt || "") || 0;
  return rightTime - leftTime || left.url.localeCompare(right.url);
});

const siteUrl = homeCanonical || entries[0]?.url?.replace(/\/[^/]*\/?$/, "/");
if (!siteUrl) throw new Error("Unable to determine site URL from static canonical metadata.");
const feedUrl = new URL("rss.xml", siteUrl).toString();
const feedPath = new URL(feedUrl).pathname;
const alternateLink = `<link rel="alternate" type="application/rss+xml" title="Tomz.io RSS" href="${feedPath}">`;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (html.includes('type="application/rss+xml"') || !html.includes("</head>")) continue;
  writeFileSync(file, html.replace("</head>", `  ${alternateLink}\n</head>`));
}

const latestTime = entries
  .map((entry) => Date.parse(entry.modifiedAt || entry.publishedAt || "") || 0)
  .reduce((max, value) => Math.max(max, value), 0);

const items = entries.map((entry) => {
  const pubDate = rssDate(entry.publishedAt);
  const creators = entry.authors.map((name) => `      <dc:creator>${xml(name)}</dc:creator>`).join("\n");
  return [
    "    <item>",
    `      <title>${xml(entry.title)}</title>`,
    `      <link>${xml(entry.url)}</link>`,
    `      <guid isPermaLink="true">${xml(entry.url)}</guid>`,
    entry.description ? `      <description>${xml(entry.description)}</description>` : "",
    pubDate ? `      <pubDate>${pubDate}</pubDate>` : "",
    creators,
    "    </item>",
  ].filter(Boolean).join("\n");
}).join("\n");

const rss = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
  "  <channel>",
  "    <title>Tomz.io</title>",
  `    <link>${xml(siteUrl)}</link>`,
  "    <description>Tomz 的个人出版空间：独立开发、产品、AI、写作与持续思考。</description>",
  "    <language>zh-CN</language>",
  `    <atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml" />`,
  latestTime ? `    <lastBuildDate>${new Date(latestTime).toUTCString()}</lastBuildDate>` : "",
  items,
  "  </channel>",
  "</rss>",
  "",
].filter(Boolean).join("\n");

writeFileSync(rssPath, rss);
console.log(`RSS generated: ${entries.length} items -> ${rssPath}`);
