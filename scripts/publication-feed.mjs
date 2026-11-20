import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";

/**
 * Build-time projection from already published static output into JSON Feed 1.1.
 * This is not a second content registry: article identity, canonical URL, title,
 * description, authors and dates come from the final Article JSON-LD. Weekly
 * issue relationships come from published Markdown metadata; Book relationships
 * come from the generated Book catalog.
 */
export const JSON_FEED_VERSION = "https://jsonfeed.org/version/1.1";
export const FEED_FILE = "feed.json";
export const JSON_FEED_TITLE = "Tomz.io · 出版更新";
export const JSON_FEED_DESCRIPTION =
  "Tomz 的个人出版空间：独立开发、产品、AI、写作与持续思考。";

const SITE_TIME_OFFSET = "+08:00";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const RFC3339 =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;
const DEFAULT_IMAGE = /\/tomz-avatar\.png$/;
const WEEKLY_GROUP = "见π";

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith(".md") && !/^README\.md$/i.test(entry.name)
      ? [path]
      : [];
  });
}

export function canonicalFromHtml(html) {
  return (
    html.match(
      /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i,
    )?.[1] ||
    html.match(
      /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i,
    )?.[1]
  );
}

function jsonLdObjects(html) {
  const objects = [];
  for (const match of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) objects.push(...parsed);
      else if (parsed && Array.isArray(parsed["@graph"]))
        objects.push(...parsed["@graph"]);
      else objects.push(parsed);
    } catch {
      // Malformed JSON-LD is reported by the static-output verifier. The feed
      // projection skips the block instead of inventing metadata.
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
  return [...new Set(
    values
      .map((value) => (typeof value === "string" ? value : value?.name))
      .map((value) => String(value || "").trim())
      .filter(Boolean),
  )];
}

function siteOrigin(siteUrl) {
  const url = new URL(siteUrl);
  if (url.protocol !== "https:") {
    throw new Error(`Site URL must be HTTPS: ${siteUrl}`);
  }
  return url.origin;
}

function publicationUrl(value, origin, label) {
  const url = new URL(String(value), `${origin}/`);
  if (
    url.protocol !== "https:" ||
    url.origin !== origin ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${label} is not a public HTTPS canonical URL: ${value}`);
  }
  return url;
}

export function normalizeRoute(pathname) {
  const normalized = String(pathname || "").replace(/\/+$/, "");
  return normalized || "/";
}

/**
 * GitHub Pages builds place the public route under `/tomz-io/`, but published
 * identity must stay on the production canonical. The static homepage canonical
 * is the build's own statement of that base.
 */
export function detectBuildBase(distRoot, siteUrl) {
  const file = resolve(distRoot, "index.html");
  if (!existsSync(file)) {
    throw new Error(`Missing homepage for feed base detection: ${file}`);
  }
  const canonical = canonicalFromHtml(readFileSync(file, "utf8"));
  if (!canonical) {
    throw new Error("Homepage canonical is required for feed base detection");
  }
  const parsed = publicationUrl(
    canonical,
    siteOrigin(siteUrl),
    "Homepage canonical",
  );
  const base = normalizeRoute(parsed.pathname);
  return base === "/" ? "" : base;
}

export function productionCanonical(value, buildBase) {
  const url = new URL(String(value));
  if (!buildBase) return url.toString();
  if (url.pathname === buildBase || url.pathname === `${buildBase}/`) {
    url.pathname = "/";
  } else if (url.pathname.startsWith(`${buildBase}/`)) {
    url.pathname = url.pathname.slice(buildBase.length);
  }
  return url.toString();
}

export function identityKey(value) {
  const url = new URL(String(value));
  return `${url.origin}${normalizeRoute(url.pathname)}`;
}

function realDateOnly(text) {
  const parsed = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === text;
}

export function normalizePublicationDate(value) {
  if (value == null || value === "") return undefined;
  const text = String(value).trim();
  if (!text) return undefined;

  if (DATE_ONLY.test(text)) {
    return realDateOnly(text)
      ? { value: text, precision: "date" }
      : undefined;
  }
  if (RFC3339.test(text) && !Number.isNaN(Date.parse(text))) {
    return { value: text, precision: "datetime" };
  }

  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) {
    // A parsed value without an explicit RFC 3339 timezone cannot support a
    // time-of-day fact. Keep only the date part instead of fabricating midnight.
    return { value: new Date(parsed).toISOString().slice(0, 10), precision: "date" };
  }
  return undefined;
}

function issueNumber(value) {
  if (value == null || value === "") return undefined;
  const number = Number(String(value).trim());
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function expectedIssueRoute(number) {
  return `/weekly/${String(number).padStart(3, "0")}`;
}

function imageFromArticle(article) {
  const value = typeof article.image === "string" ? article.image.trim() : "";
  if (!value) return undefined;
  let url;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" || url.username || url.password) return undefined;
  if (DEFAULT_IMAGE.test(url.pathname)) return undefined;
  return url.toString();
}

function siteImage(image, buildBase, origin) {
  if (!image || !buildBase) return image;
  return new URL(image).origin === origin
    ? productionCanonical(image, buildBase)
    : image;
}

export function collectFeedArticles(distRoot, siteUrl) {
  const origin = siteOrigin(siteUrl);
  const buildBase = detectBuildBase(distRoot, siteUrl);
  const articles = [];

  for (const file of filesUnder(distRoot).filter((path) => path.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    const canonical = canonicalFromHtml(html);
    if (!canonical) continue;
    const article = jsonLdObjects(html).find(isArticle);
    if (!article) continue;

    const canonicalUrl = publicationUrl(canonical, origin, "Article canonical");
    const articleUrl = publicationUrl(
      article.url || canonical,
      origin,
      "Article JSON-LD url",
    );
    const productionUrl = productionCanonical(canonicalUrl, buildBase);
    if (productionCanonical(articleUrl, buildBase) !== productionUrl) {
      throw new Error(
        `Article JSON-LD url does not match canonical: ${articleUrl} != ${canonicalUrl}`,
      );
    }

    const title = String(article.headline || article.name || "").trim();
    if (!title) continue;

    articles.push({
      sourceFile: relative(distRoot, file).replace(/\\/g, "/"),
      canonical: productionUrl,
      title,
      description: String(article.description || "").trim(),
      datePublished: article.datePublished ? String(article.datePublished) : undefined,
      dateModified: article.dateModified ? String(article.dateModified) : undefined,
      authors: authorNames(article.author),
      image: siteImage(imageFromArticle(article), buildBase, origin),
      section:
        new URL(productionUrl).pathname.split("/").filter(Boolean)[0] || "",
    });
  }

  return articles;
}

export function collectWeeklyMetadata(pagesRoot) {
  const weeklyRoot = resolve(pagesRoot, "weekly");
  const metadata = new Map();

  for (const file of markdownFiles(weeklyRoot)) {
    const sourcePath = relative(pagesRoot, file).replace(/\\/g, "/");
    const doc = parseMiraDoc(sourcePath, readFileSync(file, "utf8"));
    metadata.set(normalizeRoute(doc.path), {
      issueNumber: issueNumber(doc.data.issue),
      group: String(doc.data.group || "").trim(),
    });
  }

  return metadata;
}

export function readBookCatalog(distRoot) {
  const path = resolve(distRoot, "books/catalog.json");
  if (!existsSync(path)) {
    throw new Error(`Missing generated Book catalog: ${path}`);
  }
  const catalog = JSON.parse(readFileSync(path, "utf8"));
  if (
    !catalog ||
    catalog.schemaVersion !== 1 ||
    !Array.isArray(catalog.books)
  ) {
    throw new Error("Book catalog does not match schemaVersion 1");
  }
  for (const book of catalog.books) {
    if (!book || typeof book.id !== "string" || !Array.isArray(book.entries)) {
      throw new Error("Book catalog contains an invalid book entry");
    }
    for (const entry of book.entries) {
      if (
        !entry ||
        typeof entry.url !== "string" ||
        !Number.isInteger(entry.position)
      ) {
        throw new Error(`Book catalog contains an invalid chapter in ${book.id}`);
      }
    }
  }
  return catalog;
}

export function resolveBookRelations(catalog) {
  const byCanonical = new Map();
  for (const book of catalog.books) {
    for (const entry of book.entries) {
      const key = identityKey(entry.url);
      const relations = byCanonical.get(key) || [];
      relations.push({ id: book.id, position: entry.position });
      byCanonical.set(key, relations);
    }
  }
  for (const relations of byCanonical.values()) {
    relations.sort(
      (left, right) =>
        left.id.localeCompare(right.id) || left.position - right.position,
    );
  }
  return byCanonical;
}

function publishedTime(item) {
  const value = item._tomzio?.publishedDate;
  if (!value) return 0;
  if (DATE_ONLY.test(value)) {
    return Date.parse(`${value}T00:00:00${SITE_TIME_OFFSET}`) || 0;
  }
  return Date.parse(value) || 0;
}

function sortTime(item) {
  if (item.date_modified) {
    return Date.parse(item.date_modified) || 0;
  }
  return publishedTime(item);
}

export function resolveIssueTargets(articles, weeklyMetadata) {
  const canonicalByRoute = new Map();
  for (const article of articles) {
    canonicalByRoute.set(
      normalizeRoute(new URL(article.canonical).pathname),
      article.canonical,
    );
  }

  const targets = new Map();
  for (const [route, metadata] of weeklyMetadata || []) {
    if (!metadata || metadata.group !== WEEKLY_GROUP || !metadata.issueNumber) {
      continue;
    }
    const expected = expectedIssueRoute(metadata.issueNumber);
    if (normalizeRoute(route) !== expected) continue;
    const canonical = canonicalByRoute.get(expected);
    // Only publish a relationship when the issue page itself is in the feed.
    if (canonical) targets.set(metadata.issueNumber, canonical);
  }
  return targets;
}

export function weeklyIssueState(canonical, weeklyMetadata, targets) {
  const route = normalizeRoute(new URL(canonical).pathname);
  const weekly = weeklyMetadata?.get(route);
  const number = weekly?.issueNumber;
  const issueUrl = number ? targets.get(number) : undefined;
  const isIssue =
    Boolean(number) &&
    weekly?.group === WEEKLY_GROUP &&
    route === expectedIssueRoute(number) &&
    issueUrl === canonical;
  return { number, issueUrl, isIssue };
}

function feedItem(article, { weeklyMetadata, targets, books }) {
  const { number, issueUrl, isIssue } = weeklyIssueState(
    article.canonical,
    weeklyMetadata,
    targets,
  );

  const published = normalizePublicationDate(article.datePublished);
  const modified = normalizePublicationDate(article.dateModified);
  const contentText =
    article.description || `${article.title}\n\n阅读全文：${article.canonical}`;

  const tomzio = {
    kind: isIssue ? "issue" : "article",
    section: article.section,
  };
  if (number && issueUrl) {
    tomzio.issue = { number, url: issueUrl };
  }
  const bookRelations = books.get(identityKey(article.canonical));
  if (bookRelations?.length) tomzio.books = bookRelations;
  if (published) {
    tomzio.publishedDate = published.value;
    tomzio.publishedPrecision = published.precision;
  }

  const image = imageFromArticle(article);

  return {
    id: article.canonical,
    url: article.canonical,
    title: article.title,
    ...(article.description ? { summary: article.description } : {}),
    content_text: contentText,
    ...(image ? { image } : {}),
    ...(published?.precision === "datetime"
      ? { date_published: published.value }
      : {}),
    ...(modified?.precision === "datetime"
      ? { date_modified: modified.value }
      : {}),
    ...(article.authors.length
      ? { authors: article.authors.map((name) => ({ name })) }
      : {}),
    _tomzio: tomzio,
  };
}

export function buildPublicationFeed({
  siteUrl,
  articles,
  weeklyMetadata,
  catalog,
}) {
  const origin = siteOrigin(siteUrl);
  if (!Array.isArray(articles)) {
    throw new Error("Publication feed requires the published Article projection");
  }
  if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.books)) {
    throw new Error("Publication feed requires the generated Book catalog");
  }

  for (const article of articles) {
    if (
      !article ||
      typeof article.canonical !== "string" ||
      typeof article.title !== "string" ||
      !article.title.trim()
    ) {
      throw new Error("Publication feed received an Article without canonical URL or title");
    }
    const canonical = publicationUrl(
      article.canonical,
      origin,
      "Article canonical",
    ).toString();
    if (canonical !== article.canonical) {
      throw new Error(`Article canonical is not normalized: ${article.canonical}`);
    }
  }

  const unique = new Map();
  for (const article of [...articles].sort(
    (left, right) =>
      left.canonical.localeCompare(right.canonical) ||
      String(left.sourceFile || "").localeCompare(String(right.sourceFile || "")),
  )) {
    if (!unique.has(article.canonical)) unique.set(article.canonical, article);
  }

  const targets = resolveIssueTargets([...unique.values()], weeklyMetadata);
  const books = resolveBookRelations(catalog);
  const items = [...unique.values()]
    .map((article) => feedItem(article, { weeklyMetadata, targets, books }))
    .sort(
      (left, right) =>
        sortTime(right) - sortTime(left) ||
        publishedTime(right) - publishedTime(left) ||
        left.id.localeCompare(right.id),
    );

  if (!items.length) {
    throw new Error("Publication feed has no published Article entries");
  }

  return {
    version: JSON_FEED_VERSION,
    title: JSON_FEED_TITLE,
    home_page_url: `${origin}/`,
    feed_url: `${origin}/${FEED_FILE}`,
    description: JSON_FEED_DESCRIPTION,
    language: "zh-CN",
    _tomzio: {
      contractVersion: 1,
      semantics: "activity",
    },
    items,
  };
}

export function collectPublicationFeed(distRoot, pagesRoot, siteUrl) {
  return buildPublicationFeed({
    siteUrl,
    articles: collectFeedArticles(distRoot, siteUrl),
    weeklyMetadata: collectWeeklyMetadata(pagesRoot),
    catalog: readBookCatalog(distRoot),
  });
}
