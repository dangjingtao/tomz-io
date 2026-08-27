import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";
import policy from "../site-policy.json" with { type: "json" };

const root = process.cwd();
const pagesRoot = resolve(root, "src/pages");
const distRoot = resolve(root, "dist");
const { siteUrl, removedRoots, removedBlogCategories } = policy;
const failures = [];

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith(".md") && !/^README\.md$/i.test(entry.name) ? [path] : [];
  });
}

function dataString(data, key) {
  const value = data[key];
  if (Array.isArray(value)) return value.length ? String(value[0]) : undefined;
  if (value == null || value === "") return undefined;
  return String(value);
}

function routeFor(sourcePath, doc) {
  const path = doc.path;
  return path || "/";
}

function routeFile(route) {
  return route === "/"
    ? resolve(distRoot, "index.html")
    : resolve(distRoot, route.replace(/^\//, ""), "index.html");
}

function routeUrl(route) {
  return `${siteUrl}${route === "/" ? "/" : `${route}/`}`;
}

for (const removedRoot of removedRoots) {
  if (existsSync(resolve(pagesRoot, removedRoot))) failures.push(`removed source category still exists: ${removedRoot}`);
}
for (const category of removedBlogCategories) {
  if (existsSync(resolve(pagesRoot, "blogs", category))) failures.push(`removed blog category still exists: ${category}`);
}

const visibleRoutes = new Set(["/"]);
for (const file of markdownFiles(pagesRoot)) {
  const sourcePath = relative(pagesRoot, file).replaceAll("\\", "/");
  const doc = parseMiraDoc(sourcePath, readFileSync(file, "utf8"));
  const merge = dataString(doc.data, "merge");
  const mergeIndex = dataString(doc.data, "mergeIndex") === "true";
  if (merge && !mergeIndex) continue;
  visibleRoutes.add(routeFor(sourcePath, doc));
}

for (const route of visibleRoutes) {
  const file = routeFile(route);
  if (!existsSync(file)) {
    failures.push(`missing static route: ${route}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const canonical = `<link rel="canonical" href="${routeUrl(route)}">`;
  if (!html.includes(canonical)) failures.push(`${route}: root canonical mismatch`);
  if (/\b(?:src|href)="\.\.?\/assets\//.test(html)) failures.push(`${route}: relative asset URL found`);
  if (html.includes('/tomz-io/assets/')) failures.push(`${route}: Pages asset base leaked into root build`);

  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(match[1]);
      for (const key of ["datePublished", "dateModified"]) {
        if (value?.[key] && Number.isNaN(Date.parse(String(value[key])))) failures.push(`${route}: invalid JSON-LD ${key}`);
      }
    } catch {
      failures.push(`${route}: invalid JSON-LD JSON`);
    }
  }
}

for (const file of ["index.html", "404.html", "sitemap.xml", "robots.txt"]) {
  if (!existsSync(resolve(distRoot, file))) failures.push(`missing root artifact: ${file}`);
}

const index = existsSync(resolve(distRoot, "index.html")) ? readFileSync(resolve(distRoot, "index.html"), "utf8") : "";
if (index && !index.includes('/assets/')) failures.push("root index does not reference /assets/");
if (index && !index.includes('property="og:site_name" content="Tomz Dang"')) failures.push("root index lost personal site identity");
if (index && !index.includes("独立开发与产品设计")) failures.push("root index does not expose the personal homepage positioning");
if (index && !index.includes("我是 Tomz，一名独立开发者和产品设计师")) failures.push("root index does not expose the personal homepage introduction");
if (index && (index.includes('>MiraDocs</a>') || index.includes('href="/mira-docs-api') || index.includes('href="/design-md'))) {
  failures.push("root navigation still exposes removed MiraDocs category");
}

const notFound = existsSync(resolve(distRoot, "404.html")) ? readFileSync(resolve(distRoot, "404.html"), "utf8") : "";
if (notFound && !notFound.includes('content="noindex,nofollow"')) failures.push("404 lacks noindex,nofollow");

const sitemap = existsSync(resolve(distRoot, "sitemap.xml")) ? readFileSync(resolve(distRoot, "sitemap.xml"), "utf8") : "";
for (const route of visibleRoutes) {
  if (sitemap && !sitemap.includes(`<loc>${routeUrl(route)}</loc>`)) failures.push(`sitemap missing ${route}`);
}
for (const fragment of [
  "/mira-docs-api/",
  "/design-md/",
  "/about/author/",
  "/blogs/product-journal/",
  "/blogs/engineering/",
]) {
  if (sitemap.includes(fragment)) failures.push(`sitemap still contains removed content: ${fragment}`);
}

for (const route of [
  "/blogs/shared-thinking/matter-awakens",
  "/blogs/mira-letters/a-seat-at-the-writing-table",
]) {
  if (!existsSync(routeFile(route))) failures.push(`representative blog route missing: ${route}`);
}

for (const route of [
  "/about/author",
  "/mira-docs-api/guide/what-is-mira-docs",
  "/design-md/视觉/product-design-system",
  "/blogs/product-journal/2026-07-05-open-source-agent-ecosystem",
  "/blogs/engineering/insight-capture-pipeline",
]) {
  if (existsSync(routeFile(route))) failures.push(`removed static route still exists: ${route}`);
}

if (failures.length) {
  console.error("Homepage V1 root static verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Homepage V1 root static verification passed: ${visibleRoutes.size} visible routes; personal root identity plus previous BR003B removals verified.`);
