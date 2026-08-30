import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";

const root = process.cwd();
const pagesRoot = resolve(root, "src/pages");
const distRoot = resolve(root, "dist");
const cachePath = resolve(root, ".mira-cache/content-times.json");

if (!existsSync(cachePath)) {
  throw new Error(
    "Missing .mira-cache/content-times.json. Run npm run generate:content-times before static post-processing.",
  );
}

const contentTimes = JSON.parse(readFileSync(cachePath, "utf8"));

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? markdownFiles(path)
      : entry.name.endsWith(".md") && !/^README\.md$/i.test(entry.name)
        ? [path]
        : [];
  });
}

function dataString(data, key) {
  const value = data[key];
  if (Array.isArray(value)) return value.length ? String(value[0]) : undefined;
  if (value == null || value === "") return undefined;
  return String(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatContentTime(value) {
  if (!value) return "";
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return `${year}年${Number(month)}月${Number(day)}日`;
  }
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return value;
  const [, year, month, day, hour, minute] = match;
  return `${year}年${Number(month)}月${Number(day)}日 ${hour}:${minute}`;
}

function latest(values) {
  return values
    .filter((value) => value && !Number.isNaN(Date.parse(value)))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];
}

function routeFile(route) {
  if (route === "/") return resolve(distRoot, "index.html");
  return resolve(distRoot, route.replace(/^\//, ""), "index.html");
}

const records = markdownFiles(pagesRoot).map((file) => {
  const sourcePath = relative(pagesRoot, file).replace(/\\/g, "/");
  const source = readFileSync(file, "utf8");
  const doc = parseMiraDoc(sourcePath, source);
  return {
    sourcePath,
    doc,
    merge: dataString(doc.data, "merge"),
    mergeIndex: dataString(doc.data, "mergeIndex") === "true",
    time: contentTimes[sourcePath] || {},
  };
});

const mergeGroups = new Map();
for (const record of records) {
  if (!record.merge) continue;
  const group = mergeGroups.get(record.merge) || [];
  group.push(record);
  mergeGroups.set(record.merge, group);
}

const routeTimes = new Map();
for (const record of records) {
  if (record.merge && !record.mergeIndex) continue;
  const modifiedAt = record.merge
    ? latest((mergeGroups.get(record.merge) || []).map((item) => item.time.modifiedAt))
    : record.time.modifiedAt;
  routeTimes.set(record.doc.path, {
    sourcePath: record.sourcePath,
    root: record.sourcePath.split("/")[0] || "docs",
    declaredDate: record.doc.date,
    publishedAt: record.time.publishedAt,
    modifiedAt,
  });
}

function updateArticleJsonLd(html, time) {
  return html.replace(
    /(<script[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
    (whole, open, raw, close) => {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return whole;
        const type = parsed["@type"];
        if (type !== "Article" && type !== "TechArticle") return whole;
        if (time.publishedAt) parsed.datePublished = time.publishedAt;
        if (time.modifiedAt) parsed.dateModified = time.modifiedAt;
        return `${open}${JSON.stringify(parsed).replace(/</g, "\\u003c")}${close}`;
      } catch {
        return whole;
      }
    },
  );
}

function visibleTimeMarkup(time, kind) {
  const published = formatContentTime(time.publishedAt);
  const modified = formatContentTime(time.modifiedAt);
  if (!published && !modified) return "";

  if (kind === "blog") {
    return [
      published ? `<span class="dot content-time-dot"></span><span data-content-time="published">发布于 ${escapeHtml(published)}</span>` : "",
      modified ? `<span class="dot content-time-dot"></span><span data-content-time="modified">更新于 ${escapeHtml(modified)}</span>` : "",
    ].join("");
  }

  const items = [
    published ? `<span data-content-time="published">发布于 ${escapeHtml(published)}</span>` : "",
    modified ? `<span data-content-time="modified">更新于 ${escapeHtml(modified)}</span>` : "",
  ].filter(Boolean);
  return `<div class="post-meta content-time-meta" data-content-time-meta>${items.join('<span class="dot"></span>')}</div>`;
}

function updateVisibleTime(html, time) {
  if (html.includes("data-content-time-meta") || html.includes('data-content-time="published"')) {
    return html;
  }

  if (time.root === "blogs") {
    if (time.declaredDate) {
      const legacy = `<span class="dot"></span><span>${escapeHtml(time.declaredDate)}</span>`;
      html = html.replace(legacy, "");
    }
    const markup = visibleTimeMarkup(time, "blog");
    if (!markup) return html;
    return html.replace(
      /(<div class="post-meta post-meta-article">[\s\S]*?)(<\/div>)/,
      `$1${markup}$2`,
    );
  }

  const markup = visibleTimeMarkup(time, "document");
  if (!markup) return html;
  return html.replace(
    /(<div class="doc-title-block">[\s\S]*?)(<\/div>)/,
    `$1${markup}$2`,
  );
}

let updatedHtml = 0;
for (const [route, time] of routeTimes) {
  const file = routeFile(route);
  if (!existsSync(file)) continue;
  const original = readFileSync(file, "utf8");
  const next = updateVisibleTime(updateArticleJsonLd(original, time), time);
  if (next !== original) {
    writeFileSync(file, next, "utf8");
    updatedHtml += 1;
  }
}

const sitemapPath = resolve(distRoot, "sitemap.xml");
let sitemapLastmods = 0;
if (existsSync(sitemapPath)) {
  let sitemap = readFileSync(sitemapPath, "utf8");
  const candidates = [...routeTimes.entries()]
    .filter(([, time]) => Boolean(time.modifiedAt))
    .sort(([left], [right]) => right.length - left.length);

  sitemap = sitemap.replace(/<url>([\s\S]*?)<\/url>/g, (block) => {
    if (/<lastmod>/.test(block)) return block;
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) return block;
    let pathname = "";
    try {
      pathname = new URL(loc).pathname.replace(/\/$/, "") || "/";
    } catch {
      return block;
    }
    const match = candidates.find(([route]) => {
      const normalizedRoute = route.replace(/\/$/, "") || "/";
      return pathname === normalizedRoute || pathname.endsWith(normalizedRoute);
    });
    if (!match) return block;
    sitemapLastmods += 1;
    return block.replace(
      /<\/url>$/,
      `<lastmod>${match[1].modifiedAt}</lastmod></url>`,
    );
  });
  writeFileSync(sitemapPath, sitemap, "utf8");
}

console.log(
  `Content times applied to static output: ${updatedHtml} HTML routes; ${sitemapLastmods} sitemap lastmod entries.`,
);
