/**
 * Publish a machine-readable bookshelf from the exact Book CollectionPage
 * metadata already emitted by MiraDocs. This adds no parallel Book registry.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://tomz.io";

function fail(reason) {
  throw new Error(`Book catalog: ${reason}`);
}

function jsonLd(html) {
  const values = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let object;
    try {
      object = JSON.parse(match[1]);
    } catch {
      fail("invalid JSON-LD in published book page");
    }
    const entries = Array.isArray(object) ? object : Array.isArray(object?.["@graph"]) ? object["@graph"] : [object];
    values.push(...entries);
  }
  return values.filter((item) => item && typeof item === "object");
}

function siteUrl(value, label) {
  if (typeof value !== "string" || !value.trim()) fail(`missing ${label}`);
  const parsed = new URL(value, SITE);
  if (parsed.protocol !== "https:" || parsed.hostname !== "tomz.io" || parsed.username || parsed.password || parsed.search || parsed.hash) {
    fail(`invalid ${label}: ${value}`);
  }
  return parsed.href;
}

function bookFromHtml(html, id) {
  const doc = jsonLd(html).find((item) => item["@type"] === "CollectionPage" && item.mainEntity?.["@type"] === "ItemList");
  if (!doc) fail(`missing Book CollectionPage + ItemList for ${id}`);
  const url = siteUrl(doc.url, `${id}.url`);
  if (new URL(url).pathname.replace(/\/$/, "") !== `/books/${id}`) fail(`Book id/url mismatch: ${id}`);
  const cover = doc.image ? new URL(doc.image, SITE).href : null;
  if (cover && (new URL(cover).protocol !== "https:" || !["tomz.io", "assets.tomz.io"].includes(new URL(cover).hostname))) {
    fail(`untrusted book cover: ${id}`);
  }
  const elements = doc.mainEntity.itemListElement;
  if (!Array.isArray(elements)) fail(`missing chapters for ${id}`);
  const seen = new Set();
  const entries = elements.map((entry, index) => {
    const href = siteUrl(entry.url, `${id}.entries[${index}]`);
    if (!["/books/", "/blogs/"].some((prefix) => new URL(href).pathname.startsWith(prefix))) {
      fail(`non-content chapter link in ${id}: ${href}`);
    }
    if (seen.has(href)) fail(`duplicate chapter ${href}`);
    seen.add(href);
    const title = typeof entry.name === "string" ? entry.name.trim() : "";
    if (!title) fail(`missing chapter title in ${id}`);
    if (entry.position !== index + 1) fail(`out of order chapter ${href}`);
    return { title, url: href, position: entry.position };
  });
  const title = typeof doc.name === "string" ? doc.name.trim() : "";
  if (!title) fail(`missing book title for ${id}`);
  return {
    id, title, description: typeof doc.description === "string" ? doc.description : "",
    url, cover, entryCount: entries.length, entries,
  };
}

export function createCatalog(distRoot) {
  const booksDir = resolve(distRoot, "books");
  if (!existsSync(resolve(booksDir, "index.html"))) fail("missing published /books/ index");
  const ids = readdirSync(booksDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^[a-z0-9-]+$/.test(entry.name)
      && existsSync(resolve(booksDir, entry.name, "index.html")))
    .map((entry) => entry.name)
    .sort();
  if (!ids.length) fail("no publicly rendered books");
  const books = ids.map((id) => bookFromHtml(readFileSync(resolve(booksDir, id, "index.html"), "utf8"), id));
  return { schemaVersion: 1, source: SITE + "/books/", books };
}

function publish(distRoot) {
  const catalog = createCatalog(distRoot);
  const path = resolve(distRoot, "books", "catalog.json");
  mkdirSync(resolve(distRoot, "books"), { recursive: true });
  writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`Book catalog generated: ${catalog.books.length} books / ${catalog.books.reduce((sum, book) => sum + book.entryCount, 0)} entries -> ${path}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  publish(resolve(process.cwd(), "dist"));
}
