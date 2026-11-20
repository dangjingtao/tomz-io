import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  canonicalFromHtml,
  collectFeedArticles,
  collectWeeklyMetadata,
  detectBuildBase,
  identityKey,
  normalizePublicationDate,
  productionCanonical,
  readBookCatalog,
  resolveBookRelations,
  resolveIssueTargets,
  weeklyIssueState,
} from "./publication-feed.mjs";
import policy from "../site-policy.json" with { type: "json" };

const distRoot = resolve(process.cwd(), "dist");
const feedPath = resolve(distRoot, "feed.json");
const rssPath = resolve(distRoot, "rss.xml");
const siteUrl = policy.siteUrl.replace(/\/+$/, "");
const failures = [];

function fail(message) {
  failures.push(message);
}

let staticArticles = [];
let weeklyMetadata = new Map();
let catalog;
let buildBase = "";
try {
  buildBase = detectBuildBase(distRoot, siteUrl);
  staticArticles = collectFeedArticles(distRoot, siteUrl);
  weeklyMetadata = collectWeeklyMetadata(resolve(process.cwd(), "src/pages"));
  catalog = readBookCatalog(distRoot);
} catch (error) {
  console.error(`JSON Feed verification failed: ${error.message}`);
  process.exit(1);
}

if (!existsSync(feedPath)) fail("Missing static JSON Feed: dist/feed.json");
if (!existsSync(rssPath)) fail("Missing backward-compatible RSS: dist/rss.xml");

let feed;
if (existsSync(feedPath)) {
  try {
    feed = JSON.parse(readFileSync(feedPath, "utf8"));
  } catch (error) {
    fail(`Static JSON Feed is not valid JSON: ${error.message}`);
  }
}

let issueCount = 0;
const articlesByCanonical = new Map(
  staticArticles.map((article) => [article.canonical, article]),
);

const issueTargets = resolveIssueTargets(staticArticles, weeklyMetadata);
const booksByCanonical = resolveBookRelations(catalog);

if (feed) {
  if (feed.version !== "https://jsonfeed.org/version/1.1") {
    fail(`JSON Feed version is not 1.1: ${feed.version}`);
  }
  if (typeof feed.title !== "string" || !feed.title.trim()) fail("JSON Feed title is missing");
  if (feed.home_page_url !== `${siteUrl}/`) {
    fail(`JSON Feed home_page_url is incorrect: ${feed.home_page_url}`);
  }
  if (feed.feed_url !== `${siteUrl}/feed.json`) {
    fail(`JSON Feed feed_url is incorrect: ${feed.feed_url}`);
  }
  if (feed.language !== "zh-CN") fail(`JSON Feed language is incorrect: ${feed.language}`);
  if (feed._tomzio?.contractVersion !== 1) fail("JSON Feed _tomzio.contractVersion is not 1");
  if (feed._tomzio?.semantics !== "activity") fail("JSON Feed _tomzio.semantics is not activity");
  if (feed._tomzio?.about) fail("JSON Feed advertises an unimplemented discovery endpoint");
  if (!Array.isArray(feed.items) || !feed.items.length) fail("JSON Feed contains no items");

  const ids = new Set();
  const publishedIssueIds = new Set(
    (Array.isArray(feed.items) ? feed.items : [])
      .filter((item) => item?._tomzio?.kind === "issue")
      .map((item) => item.id),
  );
  for (const item of Array.isArray(feed.items) ? feed.items : []) {
    const label = item?.id || "(missing id)";
    if (typeof item?.id !== "string" || typeof item?.url !== "string") {
      fail(`JSON Feed item lacks id/url: ${label}`);
      continue;
    }
    if (item.id !== item.url) fail(`JSON Feed item id and url differ: ${label}`);
    if (ids.has(item.id)) fail(`Duplicate JSON Feed item id: ${label}`);
    ids.add(item.id);

    let url;
    try {
      url = new URL(item.id);
    } catch {
      fail(`JSON Feed item id is not an absolute URL: ${label}`);
      continue;
    }
    if (url.protocol !== "https:" || url.origin !== siteUrl) {
      fail(`JSON Feed item id is outside ${siteUrl}: ${label}`);
    }

    const staticArticle = articlesByCanonical.get(item.id);
    if (!staticArticle) {
      fail(`JSON Feed item has no published static Article: ${label}`);
      continue;
    }
    if (item.title !== staticArticle.title) {
      fail(`JSON Feed title differs from static Article: ${label}`);
    }
    if (typeof item.content_text !== "string" || !item.content_text.trim()) {
      fail(`JSON Feed item lacks content_text: ${label}`);
    }

    const expectedAuthors = staticArticle.authors;
    const actualAuthors = Array.isArray(item.authors)
      ? item.authors.map((author) => author?.name).filter(Boolean)
      : [];
    if (JSON.stringify(actualAuthors) !== JSON.stringify(expectedAuthors)) {
      fail(`JSON Feed authors differ from static Article: ${label}`);
    }

    const published = normalizePublicationDate(staticArticle.datePublished);
    const modified = normalizePublicationDate(staticArticle.dateModified);
    if (published) {
      if (item._tomzio?.publishedDate !== published.value) {
        fail(`JSON Feed publishedDate differs from static Article: ${label}`);
      }
      if (item._tomzio?.publishedPrecision !== published.precision) {
        fail(`JSON Feed publishedPrecision differs from static Article: ${label}`);
      }
      if (published.precision === "date") {
        if ("date_published" in item) {
          fail(`Date-only publication fabricated date_published: ${label}`);
        }
      } else if (item.date_published !== published.value) {
        fail(`JSON Feed date_published differs from static Article: ${label}`);
      }
    } else if (item.date_published || item._tomzio?.publishedDate) {
      fail(`JSON Feed invented a publication date: ${label}`);
    }
    if (modified?.precision === "datetime") {
      if (item.date_modified !== modified.value) {
        fail(`JSON Feed date_modified differs from static Article: ${label}`);
      }
    } else if (item.date_modified) {
      fail(`JSON Feed indicates a modification without a precise source: ${label}`);
    }

    const expectedImage = /\/tomz-avatar\.png$/.test(staticArticle.image || "")
      ? undefined
      : staticArticle.image;
    if (expectedImage ? item.image !== expectedImage : item.image !== undefined) {
      fail(`JSON Feed image differs from static Article: ${label}`);
    }

    const section = url.pathname.split("/").filter(Boolean)[0] || "";
    if (item._tomzio?.section !== section) {
      fail(`JSON Feed section is incorrect: ${label}`);
    }

    const { number, issueUrl, isIssue } = weeklyIssueState(
      item.id,
      weeklyMetadata,
      issueTargets,
    );
    const kind = item._tomzio?.kind;
    if (kind !== (isIssue ? "issue" : "article")) {
      fail(`JSON Feed kind is incorrect: ${label}`);
    }
    if (isIssue) issueCount += 1;

    if (number && issueUrl) {
      if (
        item._tomzio?.issue?.number !== number ||
        item._tomzio?.issue?.url !== issueUrl
      ) {
        fail(`JSON Feed issue relationship is incorrect: ${label}`);
      }
      const target = articlesByCanonical.get(issueUrl);
      if (!target || !publishedIssueIds.has(issueUrl)) {
        fail(`JSON Feed issue target is not a published item: ${label}`);
      }
    } else if (item._tomzio?.issue) {
      fail(`JSON Feed invented an issue relationship: ${label}`);
    }

    const expectedBooks = booksByCanonical.get(identityKey(item.id));
    if (JSON.stringify(item._tomzio?.books || []) !== JSON.stringify(expectedBooks || [])) {
      fail(`JSON Feed Book relationship differs from catalog: ${label}`);
    }
  }

  const expectedIds = [...articlesByCanonical.keys()].sort();
  const actualIds = [...ids].sort();
  if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) {
    fail(
      `JSON Feed does not cover published Articles exactly: ${actualIds.length} items, ${expectedIds.length} static Articles`,
    );
  }

  const expectedIssues = [...issueTargets.values()];
  if (expectedIssues.length !== issueCount) {
    fail(`JSON Feed issue count is incorrect: ${issueCount} != ${expectedIssues.length}`);
  }

  const sorted = [...(feed.items || [])]
    .map((item) => ({
      item,
      modified: item.date_modified ? Date.parse(item.date_modified) || 0 : 0,
      time: (() => {
        const value = item._tomzio?.publishedDate;
        if (!value) return 0;
        return /^\d{4}-\d{2}-\d{2}$/.test(value)
          ? Date.parse(`${value}T00:00:00+08:00`)
          : Date.parse(value);
      })(),
    }))
    .sort(
      (left, right) =>
        right.modified - left.modified ||
        right.time - left.time ||
        left.item.id.localeCompare(right.item.id),
    )
    .map((entry) => entry.item.id);
  if (JSON.stringify(sorted) !== JSON.stringify((feed.items || []).map((item) => item.id))) {
    fail("JSON Feed item ordering is not deterministic");
  }

  if (existsSync(rssPath)) {
    const rss = readFileSync(rssPath, "utf8");
    const rssItemCount = (rss.match(/<item>/g) || []).length;
    if (feed.items.length !== rssItemCount) {
      fail(
        `JSON Feed and legacy RSS Article counts differ: ${feed.items.length} != ${rssItemCount}`,
      );
    }
    const rssIds = new Set(
      [...rss.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g)].map(
        (match) => productionCanonical(match[1], buildBase),
      ),
    );
    for (const id of ids) {
      if (!rssIds.has(id)) {
        fail(`Backward-compatible RSS is missing feed canonical: ${id}`);
      }
    }
  }
}

// Static Article pages must continue to advertise the legacy RSS feed.
for (const article of staticArticles) {
  const file = resolve(
    distRoot,
    new URL(article.canonical).pathname.replace(/^\/|\/$/g, ""),
    "index.html",
  );
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  const canonical = canonicalFromHtml(html);
  if (!canonical || productionCanonical(canonical, buildBase) !== article.canonical) {
    fail(`Static Article canonical changed during verification: ${article.canonical}`);
  }
  if (!html.includes('type="application/rss+xml"')) {
    fail(`Static Article page lost RSS discovery: ${article.canonical}`);
  }
}

if (failures.length) {
  console.error("JSON Feed verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `JSON Feed verified: ${feed.items.length} items (${issueCount} issues, ${booksByCanonical.size} Book-linked canonicals); RSS parity and date precision preserved.`,
);
