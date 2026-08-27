import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";
import policy from "../site-policy.json" with { type: "json" };

const root = process.cwd();
const pagesRoot = resolve(root, "src/pages");
const booksRoot = resolve(pagesRoot, "books");
const distRoot = resolve(root, "dist");
const { siteUrl, removedRoots, removedBlogCategories } = policy;
const configuredBase = (process.env.EXPECTED_BASE || "").replace(/^\/+|\/+$/g, "");
const expectedBase = configuredBase ? `/${configuredBase}` : "";

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
  if (route === "/") return resolve(distRoot, "index.html");
  return resolve(distRoot, route.replace(/^\//, ""), "index.html");
}

function routeUrl(route) {
  return `${siteUrl}${expectedBase}${route === "/" ? "/" : `${route}/`}`;
}

function parseBookManifest(path) {
  const values = new Map();
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  return {
    id: values.get("id") || "",
    title: values.get("title") || "",
    legacyPrefix: values.get("legacyPrefix") || "",
  };
}

function bookManifests() {
  if (!existsSync(booksRoot)) return [];
  return readdirSync(booksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(booksRoot, entry.name, "_book.yml"))
    .filter(existsSync)
    .map(parseBookManifest)
    .filter((book) => book.id && book.title);
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
const redirectsPath = resolve(distRoot, "_redirects");
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
  if (!html.includes(">书架</a>")) failures.push("首页静态导航缺少书架");
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

const projectEntries = [...docsByRoute.entries()].filter(([route]) =>
  route.startsWith("/projects/"),
);
for (const [route, doc] of projectEntries) {
  const file = routeFile(route);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  if (!html.includes(`<link rel="canonical" href="${routeUrl(route)}">`)) {
    failures.push(`项目页 canonical 错误: ${route}`);
  }
  if (!html.includes(`<h1>${doc.title}</h1>`)) {
    failures.push(`项目页标题与元数据不一致: ${route}`);
  }
  if (!html.includes('"author":[{"@type":"Person","name":"Tomz Dang"}]')) {
    failures.push(`项目页 JSON-LD 作者不是 Tomz: ${route}`);
  }
  if (existsSync(routeFile(`${route}/index`))) {
    failures.push(`项目页生成了冗余 index 路由: ${route}/index`);
  }
}

const books = bookManifests();
if (!books.length) {
  failures.push("没有找到 Book Manifest");
} else {
  const shelfFile = routeFile("/books");
  if (!existsSync(shelfFile)) {
    failures.push("书架静态首页缺失: /books");
  } else {
    const html = readFileSync(shelfFile, "utf8");
    if (!html.includes(`<link rel="canonical" href="${routeUrl("/books")}">`)) failures.push("/books canonical 缺失或 base 不正确");
    if (!html.includes('"@type":"CollectionPage"')) failures.push("/books 缺少 CollectionPage JSON-LD");
    for (const book of books) {
      if (!html.includes(book.title)) failures.push(`/books 未展示书目: ${book.title}`);
    }
  }

  const redirects = existsSync(redirectsPath) ? readFileSync(redirectsPath, "utf8") : "";
  if (!existsSync(redirectsPath)) failures.push("缺少迁移重定向文件 dist/_redirects");

  for (const book of books) {
    const bookRoute = `/books/${book.id}`;
    const bookFile = routeFile(bookRoute);
    const entryFiles = markdownFiles(resolve(booksRoot, book.id));
    if (!existsSync(bookFile)) {
      failures.push(`缺少书首页: ${bookRoute}`);
    } else {
      const html = readFileSync(bookFile, "utf8");
      if (!html.includes(`<link rel="canonical" href="${routeUrl(bookRoute)}">`)) failures.push(`书首页 canonical 错误: ${bookRoute}`);
      if (!html.includes('"@type":"CollectionPage"')) failures.push(`书首页缺少 CollectionPage JSON-LD: ${bookRoute}`);
      if (!html.includes('"@type":"ItemList"')) failures.push(`书首页缺少 ItemList JSON-LD: ${bookRoute}`);
      for (const entryFile of entryFiles) {
        const slug = relative(resolve(booksRoot, book.id), entryFile).replace(/\\/g, "/").replace(/\.md$/i, "");
        const entryRoute = `${bookRoute}/${slug}`;
        const doc = docsByRoute.get(entryRoute);
        if (doc && !html.includes(doc.title)) failures.push(`书首页未列出条目: ${entryRoute}`);
      }
    }

    for (const entryFile of entryFiles) {
      const slug = relative(resolve(booksRoot, book.id), entryFile).replace(/\\/g, "/").replace(/\.md$/i, "");
      const entryRoute = `${bookRoute}/${slug}`;
      const entryStaticFile = routeFile(entryRoute);
      if (!existsSync(entryStaticFile)) continue;
      const html = readFileSync(entryStaticFile, "utf8");
      if (!html.includes(`<link rel="canonical" href="${routeUrl(entryRoute)}">`)) failures.push(`迁移条目 canonical 错误: ${entryRoute}`);
      if (!html.includes('"@type":"Article"')) failures.push(`迁移条目 JSON-LD 不是 Article: ${entryRoute}`);
      if (!html.includes('"author"')) failures.push(`迁移条目 JSON-LD 缺少 author: ${entryRoute}`);
      const doc = docsByRoute.get(entryRoute);
      if (doc?.date && !html.includes('"datePublished"')) failures.push(`迁移条目 JSON-LD 缺少 datePublished: ${entryRoute}`);

      if (book.legacyPrefix) {
        const legacyRoute = `${book.legacyPrefix}/${slug}`;
        if (existsSync(routeFile(legacyRoute))) failures.push(`旧 Blog 静态正文仍存在: ${legacyRoute}`);
        if (redirects && !redirects.includes(`${legacyRoute} ${entryRoute} 301`)) failures.push(`缺少永久重定向: ${legacyRoute} -> ${entryRoute}`);
      }
    }
  }
}

if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, "utf8");
  for (const route of visibleRoutes) {
    const url = routeUrl(route);
    if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`sitemap 缺少路由: ${route}`);
  }
  for (const book of books) {
    for (const route of ["/books", `/books/${book.id}`]) {
      const url = routeUrl(route);
      if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`sitemap 缺少书架 canonical: ${route}`);
    }
    if (book.legacyPrefix && sitemap.includes(`${book.legacyPrefix}/`)) failures.push(`sitemap 仍包含旧 Blog 内容: ${book.legacyPrefix}`);
  }
  for (const fragment of [
    "/mira-docs-api/",
    "/design-md/",
    "/about/author/",
    "/learning/",
    "/blogs/product-journal/",
    "/blogs/engineering/",
    "/blogs/agent-learning/",
    "/blogs/bible-notes/",
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
  "/learning/about",
  "/blogs/product-journal/2026-07-05-open-source-agent-ecosystem",
  "/blogs/engineering/insight-capture-pipeline",
  "/blogs/agent-learning/agent-is-an-old-dream",
  "/blogs/bible-notes/psalm-6-when-god-seems-silent",
]) {
  if (existsSync(routeFile(route))) failures.push(`已删除静态页面仍存在: ${route}`);
}

if (failures.length) {
  console.error("Homepage V1 / Bookshelf V2 静态产物检查失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Homepage V1 / Bookshelf V2 static output passed: ${visibleRoutes.size} content routes; ${books.length} books; migration SEO and redirects verified.`);
