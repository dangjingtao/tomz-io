import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { discoverPublishedFeeds, jsonFeedAlternate } from "./generate-feed-discovery.mjs";
import { filesUnder } from "./static-article-source.mjs";

const distRoot = resolve(process.cwd(), "dist");
const expected = discoverPublishedFeeds(distRoot);
const actual = JSON.parse(readFileSync(resolve(distRoot, "feeds.json"), "utf8"));
assert.deepEqual(actual, expected, "Discovery must match actual static publication endpoints");
assert.deepEqual(actual.resources.map((resource) => resource.id), ["rss", "json-feed", "books"]);
assert.deepEqual(actual.resources.map((resource) => resource.semantics), ["activity", "activity", "state"]);
const alternate = jsonFeedAlternate(actual.publisher);
let discoveredPages = 0;
for (const file of filesUnder(distRoot).filter((path) => path.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  if (!html.includes("</head>")) continue;
  assert.equal(html.split(alternate).length - 1, 1, "Missing/duplicate JSON Feed discovery on " + file);
  assert.equal((html.match(/type=["']application\/feed\+json["']/gi) || []).length, 1,
    "Unexpected additional JSON Feed alternate on " + file);
  assert.ok(html.includes('type="application/rss+xml"'), "Existing RSS discovery missing on " + file);
  discoveredPages++;
}
assert.ok(discoveredPages > 0, "No discoverable HTML pages");
const headers = readFileSync(resolve(distRoot, "_headers"), "utf8");
assert.match(headers, /\/feed\.json\n\s+Content-Type: application\/feed\+json; charset=utf-8/);
assert.match(headers, /\/feeds\.json\n\s+Content-Type: application\/json; charset=utf-8/);
console.log(`Publication discovery verified: ${actual.resources.length} published resources, ${discoveredPages} HTML pages.`);
