import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(process.cwd(), "dist");
const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
const base = baseArg ? baseArg.slice("--base=".length) : "/";
const basePath = base === "/" ? "" : `/${base.replace(/^\/+|\/+$/g, "")}`;
const failures = [];

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
  if (html.includes("UIChat Mira")) failures.push(`${path}: 仍包含 UIChat Mira SEO 身份`);
  if (!html.includes("Tomz Dang")) failures.push(`${path}: 缺少 Tomz Dang 站点身份`);
  if (!html.includes('rel="canonical"')) failures.push(`${path}: 缺少 canonical`);
  if (!html.includes(canonical(route))) failures.push(`${path}: canonical 未匹配 ${canonical(route)}`);
  if (!/property="og:site_name"[^>]*content="Tomz Dang"|content="Tomz Dang"[^>]*property="og:site_name"/.test(html)) {
    failures.push(`${path}: 缺少 Tomz Dang og:site_name`);
  }
  if (!html.includes('application/ld+json')) failures.push(`${path}: 缺少 JSON-LD`);
  if (basePath && !html.includes(`${basePath}/assets/`)) failures.push(`${path}: 构建资源未使用 Vite base ${basePath}/`);
}

const notFound = file("404.html");
if (notFound && !/noindex,nofollow/.test(notFound)) failures.push("404.html: 缺少 noindex,nofollow");

const sitemap = file("sitemap.xml");
if (sitemap) {
  if (!sitemap.includes(canonical("/"))) failures.push("sitemap.xml: 缺少首页 URL");
  if (!sitemap.includes(canonical("/blogs"))) failures.push("sitemap.xml: 缺少博客 URL");
}

const robots = file("robots.txt");
if (robots && !robots.includes("Sitemap:")) failures.push("robots.txt: 缺少 Sitemap 声明");

if (failures.length) {
  console.error("MiraDocs static output check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`MiraDocs static output passed for base ${base}.`);
