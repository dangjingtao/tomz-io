import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { collectJsonFeed } from "./generate-json-feed.mjs";

const distRoot = resolve(process.cwd(), "dist");
const feedPath = resolve(distRoot, "feed.json");
const rssPath = resolve(distRoot, "rss.xml");
const catalogPath = resolve(distRoot, "books/catalog.json");
for (const path of [feedPath, rssPath, catalogPath]) {
  assert.ok(existsSync(path), "Missing existing or new publication output: " + path);
}
const feed = JSON.parse(readFileSync(feedPath, "utf8"));
const allPublished = collectJsonFeed({
  distRoot, pagesRoot: resolve(process.cwd(), "src/pages"), limit: Number.MAX_SAFE_INTEGER,
});
assert.deepEqual(feed, { ...allPublished, items: allPublished.items.slice(0, 100) },
  "JSON Feed must be a deterministic, bounded projection of published static HTML");
const allCanonicalIds = new Set(allPublished.items.map((item) => item.id));

assert.equal(feed.version, "https://jsonfeed.org/version/1.1");
assert.equal(feed._tomzio.contractVersion, 1);
assert.equal(feed._tomzio.semantics, "activity");
assert.equal(feed.feed_url, new URL("feed.json", feed.home_page_url).toString());
assert.ok(feed.items.length > 0 && feed.items.length <= 100);

const ids = new Set();
const rss = readFileSync(rssPath, "utf8");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
for (const item of feed.items) {
  assert.equal(item.id, item.url, "Stable identity must be the published canonical");
  assert.ok(!ids.has(item.id), "Duplicate canonical in JSON Feed: " + item.id);
  ids.add(item.id);
  assert.ok(typeof item.content_text === "string" && item.content_text.trim(), "Missing JSON Feed required content");
  assert.ok(["article", "issue"].includes(item._tomzio.kind));
  assert.ok(["blogs", "weekly", "books", "submissions"].includes(item._tomzio.section));
  if (item._tomzio.publishedPrecision === "date") {
    assert.match(item._tomzio.publishedDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(item.date_published, undefined, "Must not invent midnight for date-only publication");
  }
  if (item.date_published) assert.match(item.date_published, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/);
  if (item.date_modified) assert.match(item.date_modified, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/);
  const escaped = item.url.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  assert.ok(rss.includes(`<guid isPermaLink="true">${escaped}</guid>`), "RSS missing published canonical: " + item.url);
  if (item._tomzio.kind === "issue") {
    assert.ok(typeof item.image === "string", "Published Issue must export the real cover image");
    const cover = new URL(item.image);
    assert.equal(cover.protocol, "https:", "Issue cover must be HTTPS");
    assert.ok(["https://tomz.io", "https://assets.tomz.io"].includes(cover.origin),
      "Issue cover must be a publisher-owned URL");
  } else {
    assert.equal(item.image, undefined, "Do not invent cover images for non-Issue articles");
  }
  if (item._tomzio.issue) {
    const issue = item._tomzio.issue;
    assert.ok(allCanonicalIds.has(issue.url), "Issue reference must point to a real published Issue");
  }
  for (const book of item._tomzio.books || []) {
    const entry = catalog.books.find((value) => value.id === book.id)?.entries
      .find((value) => value.position === book.position);
    assert.ok(entry, "Book relation must exist in the published catalog");
    assert.equal(new URL(entry.url).pathname.replace(/\/$/, "").split("/tomz-io").pop(),
      new URL(item.url).pathname.replace(/\/$/, "").split("/tomz-io").pop());
  }
}

console.log(`JSON Feed 1.1 verified: ${feed.items.length} canonical items; RSS and Book catalog unchanged.`);
