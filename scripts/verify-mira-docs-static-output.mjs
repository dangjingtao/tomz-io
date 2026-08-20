import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";

const root = process.cwd();
const pagesRoot = resolve(root, "src/pages");
const distRoot = resolve(root, "dist");
const siteUrl = "https://tomz.io";
const configuredBase = (process.env.EXPECTED_BASE || "").replace(/^\/+|\/+$/g, "");
const expectedBase = configuredBase ? `/${configuredBase}` : "";
const removedRoots = ["docs", "mira-docs-api", "design-md"];
const removedBlogCategories = ["product-journal", "engineering"];

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
  const path = doc.path.replace(/^\/docs(?=\/|$)/, "");
  return path || "/";
}

function routeFile(route) {
  if (route === "/") return resolve(distRoot, "index.html");
  return resolve(distRoot, route.replace(/^\//, ""), "index.html");
}

function routeUrl(route) {
  return `${siteUrl}${expectedBase}${route === "/" ? "/" : `${route}/`}`;
}

const failures = [];
for (const removedRoot of removedRoots) {
  if (existsSync(resolve(pagesRoot, removedRoot))) failures.push(`已删除分类仍存在: ${removedRoot}`);
}
for (const category of removedBlogCategories) {
  if (existsSync(resolve(pagesRoot, "blogs", category))) failures.push(`已删除博客分类仍存在: ${category}`);
}

const visibleRoutes = new Set(["/"]);
const docsByRoute = new Map();
for (const file of markdownFiles(pagesRoot)) {
  const sourcePath = relative(pagesRoot, file).replace(/\\/g, "/");
  const doc = parseMiraDoc(sourcePath, readFileSync(file, "utf8"));
  const merge = dataString(doc.data, "merge");
  const mergeIndex = dataString(doc.data, "mergeIndex") === "true";
  if (merge && !mergeIndex) continue;
  const route = routeFor(sourcePath, doc);
  visibleRoutes.add(route);
  docsByRoute.set(route, doc);
}

for (const route of visibleRoutes) {
  const file = routeFile(route);
  if (!existsSync(file)) failures.push(`缺少静态页面: ${route} -> ${file}`);
}

const indexPath = resolve(distRoot, "index.html");
const notFoundPath = resolve(distRoot, "404.html");
const sitemapPath = resolve(distRoot, "sitemap.xml");
const robotsPath = resolve(distRoot, "robots.txt");
for (const file of [indexPath, notFoundPath, sitemapPath, robotsPath]) {
  if (!existsSync(file)) failures.push(`缺少构建产物: ${file}`);
}

if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, "utf8");
  if (!html.includes(`<link rel="canonical" href="${siteUrl}${expectedBase}/">`)) failures.push("首页 canonical 缺失或 base 不正确");
  if (!html.includes('property="og:site_name" content="Tomz Dang"')) failures.push("首页缺少个人站 Open Graph 站点信息");
  if (!html.includes('type="application/ld+json"')) failures.push("首页缺少 JSON-LD");
  if ((html.match(/name="description"/g) || []).length !== 1) failures.push("首页 description meta 不是唯一值");
  if (!html.includes("独立开发与产品设计")) failures.push("首页缺少个人站定位");
  if (!html.includes("我是 Tomz，一名独立开发者和产品设计师")) failures.push("首页缺少个人介绍");
  if (html.includes(">MiraDocs</a>") || html.includes('href="/mira-docs-api') || html.includes('href="/design-md')) failures.push("顶部导航仍残留 MiraDocs 分类");
}

if (existsSync(notFoundPath)) {
  const html = readFileSync(notFoundPath, "utf8");
  if (!html.includes('content="noindex,nofollow"')) failures.push("404 页面没有 noindex,nofollow");
}

const blogEntry = [...docsByRoute.entries()].find(([route]) => route.startsWith("/blogs/"));
if (blogEntry) {
  const [route, doc] = blogEntry;
  const file = routeFile(route);
  if (existsSync(file)) {
    const html = readFileSync(file, "utf8");
    if (!html.includes('class="article-header"')) failures.push(`博客静态页缺少文章头: ${route}`);
    if (!html.includes("post-meta post-meta-article")) failures.push(`博客静态页缺少作者、日期和分类信息: ${route}`);
    if (!html.includes("author-signature")) failures.push(`博客静态页缺少作者署名区: ${route}`);
    if (!html.includes('class="top-nav docs-header seo-static-header"')) failures.push(`博客静态页缺少站点导航: ${route}`);
    if (doc.date && !html.includes(String(doc.date))) failures.push(`博客静态页缺少发布日期: ${route}`);
    if (doc.group && !html.includes(String(doc.group))) failures.push(`博客静态页缺少文章分类: ${route}`);
  }
}

if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, "utf8");
  for (const route of visibleRoutes) {
    const url = routeUrl(route);
    if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`sitemap 缺少路由: ${route}`);
  }
  for (const fragment of [
    "/mira-docs-api/",
    "/design-md/",
    "/about/author/",
    "/blogs/product-journal/",
    "/blogs/engineering/",
  ]) {
    if (sitemap.includes(fragment)) failures.push(`sitemap 仍包含已删除内容: ${fragment}`);
  }
}

if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, "utf8");
  const expected = `Sitemap: ${siteUrl}${expectedBase}/sitemap.xml`;
  if (!robots.includes(expected)) failures.push("robots.txt sitemap 地址不正确");
}

for (const route of [
  "/about/author",
  "/mira-docs-api/guide/what-is-mira-docs",
  "/design-md/视觉/product-design-system",
  "/blogs/product-journal/2026-07-05-open-source-agent-ecosystem",
  "/blogs/engineering/insight-capture-pipeline",
]) {
  if (existsSync(routeFile(route))) failures.push(`已删除静态页面仍存在: ${route}`);
}

if (failures.length) {
  console.error("Homepage V1 静态产物检查失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Homepage V1 static output passed: ${visibleRoutes.size} routes; personal root plus previous BR003B removals verified.`);
