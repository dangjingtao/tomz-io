import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const distRoot = resolve(process.cwd(), "dist");
const indexPath = resolve(distRoot, "index.html");
const rssPath = resolve(distRoot, "rss.xml");
const failures = [];

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function canonicalFromHtml(html) {
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i)?.[1];
}

function hasArticleJsonLd(html) {
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      const values = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed["@graph"])
          ? parsed["@graph"]
          : [parsed];
      if (values.some((value) => {
        const type = value?.["@type"];
        return Array.isArray(type) ? type.includes("Article") : type === "Article";
      })) return true;
    } catch {
      // The main static-output verifier owns malformed JSON-LD reporting.
    }
  }
  return false;
}

if (!existsSync(indexPath)) failures.push("RSS verification missing dist/index.html");
if (!existsSync(rssPath)) failures.push("RSS verification missing dist/rss.xml");

let rss = "";
let feedUrl = "";
if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, "utf8");
  const canonical = canonicalFromHtml(html);
  if (!canonical) {
    failures.push("Homepage canonical is required to verify RSS URL");
  } else {
    feedUrl = new URL("rss.xml", canonical).toString();
    const feedPath = new URL(feedUrl).pathname;
    const expectedLink = `<link rel="alternate" type="application/rss+xml" title="Tomz.io RSS" href="${feedPath}">`;
    if (!html.includes(expectedLink)) failures.push(`Homepage does not advertise RSS: ${expectedLink}`);
  }
}

if (existsSync(rssPath)) {
  rss = readFileSync(rssPath, "utf8");
  if (!rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) failures.push("RSS XML declaration is missing");
  if (!rss.includes('<rss version="2.0"')) failures.push("RSS 2.0 root is missing");
  if (!rss.includes("<channel>")) failures.push("RSS channel is missing");
  if (!rss.includes("<item>")) failures.push("RSS contains no items");
  if (feedUrl && !rss.includes(`<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`)) {
    failures.push(`RSS self link is incorrect: ${feedUrl}`);
  }
}

let articleCount = 0;
for (const file of filesUnder(distRoot).filter((path) => path.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  if (!hasArticleJsonLd(html)) continue;
  const canonical = canonicalFromHtml(html);
  if (!canonical) continue;
  articleCount += 1;
  if (rss && !rss.includes(`<guid isPermaLink="true">${canonical}</guid>`)) {
    failures.push(`RSS is missing Article canonical: ${canonical}`);
  }
  if (!html.includes('type="application/rss+xml"')) {
    failures.push(`Static Article page does not advertise RSS: ${canonical}`);
  }
}

if (!articleCount) failures.push("RSS verification found no static Article pages");

if (failures.length) {
  console.error("RSS verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`RSS static output verified: ${articleCount} Article pages.`);
