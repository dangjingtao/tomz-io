import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalFromHtml, filesUnder } from "./static-article-source.mjs";

// This is a directory of published endpoints, never an article or Book registry.
const ENDPOINTS = [
  { id: "rss", file: "rss.xml", format: "rss2", semantics: "activity" },
  { id: "json-feed", file: "feed.json", format: "jsonfeed1.1", semantics: "activity" },
  { id: "books", file: "books/catalog.json", format: "tomzio-book-catalog-v1", semantics: "state" },
];

export function discoverPublishedFeeds(distRoot) {
  const homepage = canonicalFromHtml(readFileSync(resolve(distRoot, "index.html"), "utf8"));
  if (!homepage || !/^https:\/\/tomz\.io\/(?:tomz-io\/)?$/.test(homepage)) {
    throw new Error("Invalid or missing published homepage canonical");
  }

  // An advertised resource must already be present and have its actual contract.
  const rss = readFileSync(resolve(distRoot, ENDPOINTS[0].file), "utf8");
  if (!rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>') || !rss.includes("<rss version=")) {
    throw new Error("Published RSS 2.0 is missing or invalid");
  }
  const jsonFeed = JSON.parse(readFileSync(resolve(distRoot, ENDPOINTS[1].file), "utf8"));
  if (jsonFeed.version !== "https://jsonfeed.org/version/1.1" ||
      jsonFeed.home_page_url !== homepage ||
      jsonFeed.feed_url !== new URL("feed.json", homepage).toString() ||
      !Array.isArray(jsonFeed.items)) {
    throw new Error("Published JSON Feed 1.1 is missing or inconsistent with canonical");
  }
  const bookCatalog = JSON.parse(readFileSync(resolve(distRoot, ENDPOINTS[2].file), "utf8"));
  if (bookCatalog.schemaVersion !== 1 || !Array.isArray(bookCatalog.books)) {
    throw new Error("Published Book Catalog v1 is missing or invalid");
  }

  return {
    schemaVersion: 1,
    publisher: homepage,
    resources: ENDPOINTS.map(({ id, file, format, semantics }) => ({
      id,
      href: new URL(file, homepage).toString(),
      format,
      semantics,
    })),
  };
}

export function jsonFeedAlternate(publisher) {
  const pathname = new URL("feed.json", publisher).pathname;
  return `<link rel="alternate" type="application/feed+json" title="Tomz.io JSON Feed" href="${pathname}">`;
}

export function injectJsonFeedAlternate(html, alternate) {
  if (!html.includes("</head>")) return html;
  const present = [...html.matchAll(/<link\b[^>]*type=["']application\/feed\+json["'][^>]*>/gi)];
  if (present.length > 1 || (present.length === 1 && present[0][0] !== alternate)) {
    throw new Error("Conflicting or duplicate JSON Feed alternate");
  }
  return present.length ? html : html.replace("</head>", `  ${alternate}\n</head>`);
}

export function generateFeedDiscovery(distRoot) {
  const manifest = discoverPublishedFeeds(distRoot);
  const alternate = jsonFeedAlternate(manifest.publisher);
  let changed = 0;
  for (const file of filesUnder(distRoot).filter((file) => file.endsWith(".html")).sort()) {
    const html = readFileSync(file, "utf8");
    const next = injectJsonFeedAlternate(html, alternate);
    if (html !== next) {
      writeFileSync(file, next);
      changed++;
    }
  }
  writeFileSync(resolve(distRoot, "feeds.json"), JSON.stringify(manifest, null, 2) + "\n");
  return { manifest, changed };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const distRoot = resolve(process.cwd(), "dist");
  const { manifest, changed } = generateFeedDiscovery(distRoot);
  console.log(`Publication discovery generated: ${manifest.resources.length} verified endpoints; ${changed} HTML pages updated.`);
}
