import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";

const root = process.cwd();
const pagesRoot = resolve(root, "src/pages");
const distRoot = resolve(root, "dist");
const cachePath = resolve(root, ".mira-cache/content-times.json");
const sitemapPath = resolve(distRoot, "sitemap.xml");

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

function routeFile(route) {
  if (route === "/") return resolve(distRoot, "index.html");
  return resolve(distRoot, route.replace(/^\//, ""), "index.html");
}

function sitemapBlockForRoute(sitemap, route) {
  return [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map((match) => match[0])
    .find((block) => {
      const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
      if (!loc) return false;
      try {
        const pathname = new URL(loc).pathname.replace(/\/$/, "") || "/";
        const normalizedRoute = route.replace(/\/$/, "") || "/";
        return pathname === normalizedRoute || pathname.endsWith(normalizedRoute);
      } catch {
        return false;
      }
    });
}

const failures = [];
if (!existsSync(cachePath)) failures.push("缺少构建期内容时间索引 .mira-cache/content-times.json");
if (!existsSync(sitemapPath)) failures.push("缺少 sitemap.xml，无法验证 lastmod");

const contentTimes = existsSync(cachePath)
  ? JSON.parse(readFileSync(cachePath, "utf8"))
  : {};
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : "";

const records = markdownFiles(pagesRoot).map((file) => {
  const sourcePath = relative(pagesRoot, file).replace(/\\/g, "/");
  const doc = parseMiraDoc(sourcePath, readFileSync(file, "utf8"));
  return {
    sourcePath,
    doc,
    merge: dataString(doc.data, "merge"),
    mergeIndex: dataString(doc.data, "mergeIndex") === "true",
  };
});

for (const record of records) {
  const time = contentTimes[record.sourcePath];
  if (!time?.publishedAt) failures.push(`缺少 resolved publishedAt: ${record.sourcePath}`);
  if (!time?.modifiedAt) failures.push(`缺少 Git modifiedAt: ${record.sourcePath}`);
  if (record.merge && !record.mergeIndex) continue;

  const file = routeFile(record.doc.path);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  if (!html.includes('data-content-time="published"')) {
    failures.push(`静态正文未展示发布时间: ${record.doc.path}`);
  }
  if (!html.includes('data-content-time="modified"')) {
    failures.push(`静态正文未展示修改时间: ${record.doc.path}`);
  }
  if (!html.includes('"datePublished"')) {
    failures.push(`JSON-LD 缺少 datePublished: ${record.doc.path}`);
  }
  if (!html.includes('"dateModified"')) {
    failures.push(`JSON-LD 缺少 dateModified: ${record.doc.path}`);
  }

  const sitemapBlock = sitemapBlockForRoute(sitemap, record.doc.path);
  if (!sitemapBlock) {
    failures.push(`sitemap 缺少内容路由: ${record.doc.path}`);
  } else if (!/<lastmod>[^<]+<\/lastmod>/.test(sitemapBlock)) {
    failures.push(`sitemap 缺少 lastmod: ${record.doc.path}`);
  }
}

if (failures.length) {
  console.error("Content time verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Content time verification passed: ${records.length} Markdown sources; publication, modification, JSON-LD and sitemap lastmod are present.`,
);
