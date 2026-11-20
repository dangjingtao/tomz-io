import { readFileSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseMiraDoc } from "@uichat-mira/docs";
import { collectBookCatalog } from "./generate-book-catalog.mjs";
import {
  authorNames, canonicalFromHtml, filesUnder, isArticle, jsonLdObjects,
} from "./static-article-source.mjs";

const SITE = "https://tomz.io";
const SECTIONS = new Set(["blogs", "weekly", "books", "submissions"]);
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function canonical(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Published Article has no canonical URL");
  let url;
  try { url = new URL(value); } catch { throw new Error("Invalid published Article canonical: " + value); }
  if (url.origin !== SITE || url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("Invalid published Article canonical: " + value);
  }
  return url.toString();
}

function identity(value) {
  return canonical(value).replace(/\/$/, "");
}

function dateParts(value, field) {
  if (value == null || value === "") return {};
  if (typeof value !== "string") throw new Error("Invalid " + field + ": not a string");
  if (!DATE_ONLY.test(value) && !RFC3339.test(value)) {
    throw new Error("Invalid " + field + " precision: " + value);
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day ||
      (RFC3339.test(value) && !Number.isFinite(Date.parse(value)))) {
    throw new Error("Invalid " + field + " date: " + value);
  }
  if (DATE_ONLY.test(value)) return { date: value, precision: "date" };
  return { date: value, precision: "datetime" };
}

// Match a published route to its real source path; this is not a path-based
// guess about Issue membership. Issue linkage requires explicit frontmatter.
function sourceRoute(url, homepage) {
  const pathname = new URL(url).pathname.replace(/\/$/, "") || "/";
  const base = new URL(homepage).pathname.replace(/\/$/, "");
  return base && (pathname === base || pathname.startsWith(base + "/"))
    ? pathname.slice(base.length) || "/"
    : pathname;
}

function sourceMetadata(pagesRoot) {
  const byRoute = new Map();
  const issues = new Map();
  for (const file of filesUnder(pagesRoot).filter((p) => p.endsWith(".md") && !/\/README\.md$/i.test(p))) {
    const source = relative(pagesRoot, file).split(sep).join("/");
    const doc = parseMiraDoc(source, readFileSync(file, "utf8"));
    const meta = doc.data || {};
    if (meta.merge && String(meta.mergeIndex) !== "true") continue;
    const section = source.split("/")[0];
    const number = Number(Array.isArray(meta.issue) ? meta.issue[0] : meta.issue);
    const issue = Number.isInteger(number) && number > 0 ? number : undefined;
    const isIssueIndex = section === "weekly" && /^weekly\/[^/]+\/index\.md$/.test(source) && issue !== undefined;
    const record = { section, issue, isIssueIndex };
    byRoute.set(doc.path.replace(/\/$/, "") || "/", record);
    if (isIssueIndex) {
      if (issues.has(issue)) throw new Error("Duplicate source Issue metadata: " + issue);
      issues.set(issue, doc.path.replace(/\/$/, "") || "/");
    }
  }
  return { byRoute, issues };
}

function bookMembership(catalog, homepage) {
  const byRoute = new Map();
  for (const book of catalog.books) {
    for (const entry of book.entries) {
      const url = canonical(entry.url);
      const route = sourceRoute(url, homepage);
      const current = byRoute.get(route) || [];
      if (!current.some((relation) => relation.id === book.id)) {
        current.push({ id: book.id, position: entry.position });
      }
      byRoute.set(route, current);
    }
  }
  for (const relations of byRoute.values()) relations.sort((a, b) => a.id.localeCompare(b.id));
  return byRoute;
}

/**
 * All activity items come from built public Article JSON-LD. Source frontmatter
 * provides only confirmed Issue relationships, and CollectionPage provides
 * only confirmed Book membership. No independent publication list is stored.
 */
export function collectJsonFeed({ distRoot, pagesRoot, catalog = collectBookCatalog(distRoot), limit = 100 }) {
  const homepageHtml = readFileSync(resolve(distRoot, "index.html"), "utf8");
  const homepage = canonical(canonicalFromHtml(homepageHtml));
  if (!homepage.endsWith("/")) throw new Error("Homepage canonical must end in /");
  const { byRoute, issues } = sourceMetadata(pagesRoot);
  const booksByRoute = bookMembership(catalog, homepage);
  const records = new Map();

  for (const file of filesUnder(distRoot).filter((p) => p.endsWith(".html")).sort()) {
    const section = relative(distRoot, file).split(sep)[0];
    if (!SECTIONS.has(section)) continue;
    const html = readFileSync(file, "utf8");
    const article = jsonLdObjects(html, { strict: true }).find(isArticle);
    if (!article) continue;
    const url = canonical(canonicalFromHtml(html));
    if (article.url && identity(article.url) !== identity(url)) {
      throw new Error("Article JSON-LD URL differs from canonical: " + file);
    }
    const key = identity(url);
    const title = typeof article.headline === "string" && article.headline.trim()
      ? article.headline.trim()
      : typeof article.name === "string" && article.name.trim() ? article.name.trim() : "";
    if (!title) throw new Error("Published Article lacks a title: " + file);
    const description = typeof article.description === "string" ? article.description.trim() : "";
    const route = sourceRoute(url, homepage);
    const source = byRoute.get(route);
    const published = dateParts(article.datePublished, "datePublished");
    const modified = dateParts(article.dateModified, "dateModified");
    const names = authorNames(article.author);

    const item = {
      id: url,
      url,
      title,
      ...(description ? { summary: description } : {}),
      content_text: description || title,
      ...(published.precision === "datetime" ? { date_published: published.date } : {}),
      ...(modified.precision === "datetime" ? { date_modified: modified.date } : {}),
      ...(names.length ? { authors: names.map((name) => ({ name })) } : {}),
      _tomzio: {
        kind: source?.isIssueIndex ? "issue" : "article",
        section,
        ...(published.precision ? {
          publishedPrecision: published.precision,
          ...(published.precision === "date" ? { publishedDate: published.date } : {}),
        } : {}),
      },
    };
    // A legacy/alias output may declare an already-published canonical.
    // Prefer the file at that canonical route rather than arbitrary scan order.
    const preferred = file === resolve(distRoot, route.replace(/^\//, ""), "index.html");
    const previous = records.get(key);
    if (!previous || (preferred && !previous.preferred)) {
      records.set(key, { item, route, issue: source?.issue, modified: modified.date, published: published.date, preferred });
    }
  }

  // Resolve Issue references only after confirming the Issue index is itself
  // a published Article, never merely because an article has /weekly/N/ in its URL.
  const issueRefs = new Map();
  for (const [number, route] of issues) {
    const record = [...records.values()].find((value) => value.route === route && value.item._tomzio.kind === "issue");
    if (record) issueRefs.set(number, { number, url: record.item.url });
  }

  for (const record of records.values()) {
    if (record.issue && issueRefs.has(record.issue) && record.item._tomzio.section === "weekly") {
      record.item._tomzio.issue = issueRefs.get(record.issue);
    }
    const books = booksByRoute.get(record.route);
    if (books?.length) record.item._tomzio.books = books;
  }

  const items = [...records.values()]
    .sort((a, b) => {
      const modified = (Date.parse(b.modified || "") || 0) - (Date.parse(a.modified || "") || 0);
      const published = (Date.parse(b.published || "") || 0) - (Date.parse(a.published || "") || 0);
      return modified || published || a.item.id.localeCompare(b.item.id);
    })
    .slice(0, limit)
    .map(({ item }) => item);

  if (!items.length) throw new Error("No published Article metadata found for JSON Feed");
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: "Tomz.io · 出版更新",
    home_page_url: homepage,
    feed_url: new URL("feed.json", homepage).toString(),
    language: "zh-CN",
    _tomzio: { contractVersion: 1, semantics: "activity" },
    items,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const distRoot = resolve(process.cwd(), "dist");
  const feed = collectJsonFeed({ distRoot, pagesRoot: resolve(process.cwd(), "src/pages") });
  const target = resolve(distRoot, "feed.json");
  writeFileSync(target, JSON.stringify(feed, null, 2) + "\n");
  console.log(`JSON Feed generated: ${feed.items.length} items -> ${target}`);
}
