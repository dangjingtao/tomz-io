import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const dist = resolve(process.cwd(), "dist");
const contentRoot = resolve(process.cwd(), "src/content/markdown");
const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
const base = baseArg ? baseArg.slice("--base=".length) : "/";
const basePath = base === "/" ? "" : `/${base.replace(/^\/+|\/+$/g, "")}`;
const failures = [];

const articleRoutes = [
  "/blogs/mira-letters/a-seat-at-the-writing-table",
  "/blogs/mira-letters/to-those-who-still-believe-in-their-work",
  "/blogs/shared-thinking/evolution-to-a-real-person",
  "/blogs/shared-thinking/future-after-humanity",
  "/blogs/shared-thinking/matter-awakens",
  "/blogs/product-journal/2026-07-05-open-source-agent-ecosystem",
  "/blogs/product-journal/codex-app-server-automation-notes",
  "/blogs/product-journal/mira-tts-provider-notes",
  "/blogs/product-journal/qingcheng-mcp-bridge-notes",
  "/blogs/engineering/insight-capture-pipeline",
  "/blogs/engineering/insight-rebuild-pipeline",
  "/blogs/engineering/mcp-marketplace-agent-integration",
  "/blogs/engineering/media-capability-packaging",
];

function file(path) {
  const target = resolve(dist, path);
  if (!existsSync(target)) {
    failures.push(`缺少静态输出: ${path}`);
    return "";
  }
  return readFileSync(target, "utf8");
}

function canonical(path) {
  const route = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return `https://tomz.io${basePath}${route}`;
}

function routeFile(route) {
  return `${route.replace(/^\/+|\/+$/g, "")}/index.html`;
}

function markdownFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const target = resolve(dir, name);
    return statSync(target).isDirectory() ? markdownFiles(target) : /\.md$/i.test(name) ? [target] : [];
  });
}

function jsonLd(html) {
  const objects = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      objects.push(JSON.parse(match[1]));
    } catch {
      failures.push("发现无法解析的 JSON-LD");
    }
  }
  return objects;
}

function articleData(html, route) {
  const article = jsonLd(html).find((item) => item?.["@type"] === "Article");
  if (!article) failures.push(`${route}: 缺少 Article JSON-LD`);
  return article;
}

const expectedMarkdown = articleRoutes.map((route) => `src/content/markdown${route}.md`).sort();
const actualMarkdown = markdownFiles(contentRoot).map((path) => relative(process.cwd(), path).replaceAll("\\", "/")).sort();
if (actualMarkdown.length !== 13) failures.push(`迁入 Markdown 数量应为 13，实际为 ${actualMarkdown.length}`);
if (JSON.stringify(actualMarkdown) !== JSON.stringify(expectedMarkdown)) failures.push("迁入 Markdown 路径集合与 BR001 的 13 篇清单不一致");

const pages = [
  ["index.html", "/"],
  ["blogs/index.html", "/blogs"],
  ["thoughts/index.html", "/thoughts"],
  ["reading/index.html", "/reading"],
  ["projects/index.html", "/projects"],
  ["about/index.html", "/about"],
];

for (const [path, route] of pages) {
  const html = file(path);
  if (!html) continue;
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
  if (head.includes("UIChat Mira")) failures.push(`${path}: <head> 仍包含 UIChat Mira 站点 SEO 身份`);
  if (!html.includes("Tomz Dang")) failures.push(`${path}: 缺少 Tomz Dang 站点身份`);
  if (!html.includes('rel="canonical"')) failures.push(`${path}: 缺少 canonical`);
  if (!html.includes(canonical(route))) failures.push(`${path}: canonical 未匹配 ${canonical(route)}`);
  if (!/property="og:site_name"[^>]*content="Tomz Dang"|content="Tomz Dang"[^>]*property="og:site_name"/.test(html)) {
    failures.push(`${path}: 缺少 Tomz Dang og:site_name`);
  }
  if (!html.includes('application/ld+json')) failures.push(`${path}: 缺少 JSON-LD`);
  if (basePath && !html.includes(`${basePath}/assets/`)) failures.push(`${path}: 构建资源未使用 Vite base ${basePath}/`);
}

const blogs = file("blogs/index.html");
for (const route of articleRoutes) {
  const html = file(routeFile(route));
  if (!html) continue;
  if (!html.includes(canonical(route))) failures.push(`${route}: canonical 未保持历史 /blogs/... 路径`);
  if (!/property="og:type"[^>]*content="article"|content="article"[^>]*property="og:type"/.test(html)) failures.push(`${route}: 缺少 og:type=article`);
  if (!html.includes('class="article-header"') || !html.includes('class="markdown"')) failures.push(`${route}: 静态正文结构不完整`);
  const article = articleData(html, route);
  if (article?.publisher?.name !== "Tomz Dang") failures.push(`${route}: Article publisher 不是 Tomz Dang`);
  if (blogs && !blogs.includes(`href="${basePath}${route}"`)) failures.push(`/blogs: 缺少真实文章入口 ${basePath}${route}`);
}

const thoughts = file("thoughts/index.html");
const sharedRoutes = articleRoutes.filter((route) => route.startsWith("/blogs/shared-thinking/"));
if (thoughts) {
  if (!thoughts.includes("共用的床")) failures.push("/thoughts: 缺少读者侧栏目名「共用的床」");
  if (!thoughts.includes("Tomz Dang × Mira")) failures.push("/thoughts: 缺少 Tomz × Mira 作者关系");
  for (const route of sharedRoutes) {
    if (!thoughts.includes(`href="${basePath}${route}"`)) failures.push(`/thoughts: 未链接历史正文 ${route}`);
  }
}

const miraArticle = articleData(file(routeFile("/blogs/mira-letters/a-seat-at-the-writing-table")), "Mira 来信");
if (miraArticle) {
  const names = (miraArticle.author || []).map((author) => author.name);
  if (JSON.stringify(names) !== JSON.stringify(["Mira"])) failures.push("Mira 来信: Article author 应为 Mira");
}

for (const route of ["/blogs/shared-thinking/matter-awakens", "/blogs/product-journal/2026-07-05-open-source-agent-ecosystem"]) {
  const article = articleData(file(routeFile(route)), route);
  if (article) {
    const names = (article.author || []).map((author) => author.name);
    if (JSON.stringify(names) !== JSON.stringify(["Tomz Dang", "Mira"])) failures.push(`${route}: 共同作者应为 Tomz Dang × Mira`);
  }
}

const fallbackArticle = articleData(file(routeFile("/blogs/engineering/media-capability-packaging")), "工程现场隐式作者");
if (fallbackArticle) {
  const names = (fallbackArticle.author || []).map((author) => author.name);
  if (JSON.stringify(names) !== JSON.stringify(["Tomz Dang"])) failures.push("工程现场隐式作者应回退为 Tomz Dang");
}

const notFound = file("404.html");
if (notFound && !/noindex,nofollow/.test(notFound)) failures.push("404.html: 缺少 noindex,nofollow");

const sitemap = file("sitemap.xml");
if (sitemap) {
  if (!sitemap.includes(canonical("/"))) failures.push("sitemap.xml: 缺少首页 URL");
  if (!sitemap.includes(canonical("/blogs"))) failures.push("sitemap.xml: 缺少博客 URL");
  for (const route of articleRoutes) {
    if (!sitemap.includes(canonical(route))) failures.push(`sitemap.xml: 缺少 ${route}`);
  }
  const thoughtUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).filter((url) => url.includes(`${basePath}/thoughts/`));
  if (thoughtUrls.some((url) => url !== canonical("/thoughts"))) failures.push("sitemap.xml: 不应生成 /thoughts/<slug> 第二套正文 URL");
}

const thoughtsDir = resolve(dist, "thoughts");
if (existsSync(thoughtsDir) && readdirSync(thoughtsDir).some((name) => statSync(resolve(thoughtsDir, name)).isDirectory())) {
  failures.push("静态输出不应生成 /thoughts/<slug> 目录");
}

const robots = file("robots.txt");
if (robots && !robots.includes("Sitemap:")) failures.push("robots.txt: 缺少 Sitemap 声明");

if (failures.length) {
  console.error("MiraDocs static output check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`BR003 static output passed for base ${base}: 13 historical blog routes, author semantics, canonical, sitemap, and thoughts aggregation verified.`);
