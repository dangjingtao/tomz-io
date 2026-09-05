import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { miraDocs } from "@uichat-mira/docs/vite";
import { miraDocsStaticBuild } from "./mira-docs-static";
import { parseBookManifest, type BookManifest } from "./src/content/book-manifest";
import {
  blogDirectoryByGroup,
  appName,
  homeIntro,
  seo as seoConfig,
  siteDescription,
  siteName,
  siteUrl,
} from "./src/site.config";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const pagesRoot = resolve(projectRoot, "src/pages");
const booksRoot = resolve(pagesRoot, "books");

function markdownFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? markdownFiles(path)
      : entry.name.endsWith(".md")
        ? [path]
        : [];
  });
}

function readBookManifests(): BookManifest[] {
  if (!existsSync(booksRoot)) return [];
  return readdirSync(booksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const path = resolve(booksRoot, entry.name, "_book.yml");
      return existsSync(path)
        ? parseBookManifest(readFileSync(path, "utf8"), path)
        : undefined;
    })
    .filter((book): book is BookManifest => Boolean(book))
    .filter((book) => book.status !== "archived" && book.status !== "draft")
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
}

function blogDirectoryCheck() {
  return {
    name: "blog-directory-check",
    buildStart(this: any) {
      const blogsRoot = resolve(pagesRoot, "blogs");
      for (const file of markdownFiles(blogsRoot)) {
        const relative = file.slice(blogsRoot.length + 1).replace(/\\/g, "/");
        const directory = relative.split("/")[0];
        const source = readFileSync(file, "utf8");
        const group = source.match(/^group:\s*(.+)$/m)?.[1]?.trim();
        const expected = group ? blogDirectoryByGroup[group] : undefined;
        if (expected && directory !== expected) {
          this.warn(
            `博客目录与分类不一致：${relative}，group 为“${group}”，建议放入 blogs/${expected}/。目录移动会改变文章 URL，请单独确认。`,
          );
        }
      }
    },
  };
}

function staticHtmlFilesUnder(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? staticHtmlFilesUnder(path) : [path];
  });
}

function normalizedStructuredDate(value: unknown): unknown {
  if (typeof value !== "string" || !value.trim()) return value;
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text) && !Number.isNaN(Date.parse(text))) {
    return text;
  }

  const match = text.match(/^(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})日?$/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? value : new Date(parsed).toISOString().slice(0, 10);
}

function normalizeStructuredData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeStructuredData);
  if (!value || typeof value !== "object") return value;

  const record = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(record)) {
    normalized[key] = key === "datePublished" || key === "dateModified"
      ? normalizedStructuredDate(item)
      : normalizeStructuredData(item);
  }
  return normalized;
}

function br003aStaticSeoGuard(): Plugin {
  return {
    name: "br003a-static-seo-guard",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const dist = resolve(process.cwd(), "dist");
      let changed = 0;
      for (const path of staticHtmlFilesUnder(dist).filter((file) => file.endsWith(".html"))) {
        const original = readFileSync(path, "utf8");
        const next = original.replace(
          /(<script[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
          (whole, open, raw, close) => {
            try {
              const parsed = JSON.parse(raw);
              const normalized = JSON.stringify(normalizeStructuredData(parsed)).replace(/</g, "\\u003c");
              return `${open}${normalized}${close}`;
            } catch {
              return whole;
            }
          },
        );
        if (next !== original) {
          writeFileSync(path, next);
          changed += 1;
        }
      }
      console.log(`BR003A static SEO guard normalized JSON-LD in ${changed} HTML files.`);
    },
  };
}

function bookshelfRedirects(): Plugin {
  return {
    name: "bookshelf-legacy-redirects",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const lines: string[] = [
        "/about/origin https://mira.tomz.io/about/origin/ 301",
        "/about/origin/ https://mira.tomz.io/about/origin/ 301",
        "/blogs/shared-thinking/why-mobile-agents-dont-allow-custom-api /submissions/t-zt/why-mobile-agents-dont-allow-custom-api 301",
        "/blogs/shared-thinking/why-mobile-agents-dont-allow-custom-api/ /submissions/t-zt/why-mobile-agents-dont-allow-custom-api 301",
        "/blogs/shared-thinking/why-agent-chat-sync-feels-laggy /submissions/t-zt/why-agent-chat-sync-feels-laggy 301",
        "/blogs/shared-thinking/why-agent-chat-sync-feels-laggy/ /submissions/t-zt/why-agent-chat-sync-feels-laggy 301",
      ];
      for (const book of readBookManifests()) {
        if (!book.legacyPrefix) continue;
        for (const file of markdownFiles(resolve(booksRoot, book.id))) {
          const slug = basename(file).replace(/\.md$/i, "");
          const legacy = `${book.legacyPrefix}/${slug}`;
          const canonical = `/books/${book.id}/${slug}`;
          lines.push(`${legacy} ${canonical} 301`);
          lines.push(`${legacy}/ ${canonical} 301`);
        }
      }

      if (!lines.length) return;
      const output = resolve(process.cwd(), "dist/_redirects");
      const existing = existsSync(output) ? readFileSync(output, "utf8").trim() : "";
      const next = [existing, ...lines].filter(Boolean).join("\n") + "\n";
      writeFileSync(output, next);
      console.log(`Bookshelf redirects generated: ${lines.length} rules.`);
    },
  };
}

function basePath(base: string): string {
  return base === "/" ? "" : base.replace(/\/$/, "");
}

function hrefFor(base: string, path: string): string {
  return `${basePath(base)}${path}`;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bookshelfStaticNav(base: string): string {
  const links = [
    ["首页", "/"],
    ["博客", "/blogs"],
    ["作品", "/works"],
    ["项目", "/projects"],
    ["书架", "/books"],
    ["关于", "/#about"],
  ];
  return `<nav class="top-nav docs-header seo-static-header"><div class="wrap"><a class="brand" href="${hrefFor(base, "/")}">${siteName}</a><ul class="menu">${links.map(([label, path]) => `<li><a href="${hrefFor(base, path)}">${escapeHtml(label)}</a></li>`).join("")}</ul></div></nav>`;
}

function staticHomeBody(base: string) {
  const href = (path: string) => hrefFor(base, path);
  return `<nav class="top-nav seo-static-header"><div class="wrap"><a class="brand" href="${href("/")}">${siteName}</a><ul class="menu"><li><a href="${href("/blogs")}">博客</a></li><li><a href="${href("/works")}">作品</a></li><li><a href="${href("/projects")}">项目</a></li><li><a href="${href("/books")}">书架</a></li><li><a href="#about">关于</a></li></ul></div></nav><main class="seo-static-content home-v1-static"><header class="wrap"><span>INDEPENDENT DEVELOPER / PRODUCT DESIGNER</span><h1>${siteName}</h1><p>${homeIntro}</p></header><section class="wrap"><h2>最近发生的事</h2><p>从公开的项目、写作与生活记录里挑选最能代表当下的近况。</p></section><section class="wrap"><h2>最近写了</h2><p><a href="${href("/blogs")}">查看最近文章 →</a></p></section><section id="about" class="wrap"><h2>关于</h2><p>我关注独立开发、产品设计，以及 AI 如何进入真实的工作与生活。</p></section></main>`;
}

function docsForBook(context: any, bookId: string): any[] {
  return (context.docs || [])
    .filter((doc: any) => doc.path.startsWith(`/books/${bookId}/`))
    .sort((left: any, right: any) => left.order - right.order || left.path.localeCompare(right.path));
}

function bookshelfStaticBody(context: any, books: BookManifest[]): string {
  const cards = books.map((book) => {
    const entries = docsForBook(context, book.id);
    const latest = [...entries].sort((left: any, right: any) => right.order - left.order)[0];
    return `<article class="area-overview-card"><span class="doc-eyebrow">${escapeHtml(book.category || "BOOK")}</span><h2><a href="${hrefFor(context.base, `/books/${book.id}`)}">${escapeHtml(book.title)}</a></h2><p>${escapeHtml(book.description)}</p><p>${entries.length} 篇${latest ? ` · 最近：${escapeHtml(latest.title)}` : ""}</p></article>`;
  }).join("");
  const main = `<main class="doc-main seo-static-content"><div class="doc-title-block"><h1>书架</h1><p class="doc-lede">专题、阅读札记与未来的小说，以一本本书的方式放在这里。</p></div><section class="docs-sitemap-grid">${cards}</section></main>`;
  return `${bookshelfStaticNav(context.base)}${main}`;
}

function bookStaticBody(context: any, book: BookManifest): string {
  const entries = docsForBook(context, book.id);
  const list = entries.map((doc: any) => `<li><a href="${hrefFor(context.base, doc.path)}"><span>${String(doc.order).padStart(2, "0")}</span> ${escapeHtml(doc.title)}</a>${doc.description ? `<p>${escapeHtml(doc.description)}</p>` : ""}</li>`).join("");
  const main = `<main class="doc-main seo-static-content"><div class="doc-eyebrow">${escapeHtml(book.category || "BOOK")}</div><div class="doc-title-block"><h1>${escapeHtml(book.title)}</h1><p class="doc-lede">${escapeHtml(book.description)}</p></div><section class="area-overview-card"><ol>${list}</ol></section></main>`;
  return `${bookshelfStaticNav(context.base)}${main}`;
}

function collectionJsonLd(context: any, book: BookManifest, entries: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: book.title,
    description: book.description,
    url: `${siteUrl}/books/${book.id}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: entries.map((entry: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        name: entry.title,
        url: `${siteUrl}${entry.path}`,
      })),
    },
  };
}

function br003bStaticBuild() {
  const sourceRoutes = miraDocsStaticBuild.routes;
  return {
    ...miraDocsStaticBuild,
    siteName,
    routes: (context: any) => {
      const books = readBookManifests();
      const routes = typeof sourceRoutes === "function"
        ? sourceRoutes(context)
        : sourceRoutes;
      const transformed = routes.map((route: any) => {
          if (route.path === "/") {
            return {
              ...route,
              title: "独立开发与产品设计",
              description: siteDescription,
              body: staticHomeBody(context.base),
              jsonLd: {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: siteName,
                url: siteUrl,
              },
            };
          }

          if (route.path === "/books") {
            return {
              ...route,
              title: "书架",
              description: "Tomz.io 的书架：专题、阅读札记与未来的小说。",
              body: bookshelfStaticBody(context, books),
              jsonLd: {
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: "书架",
                url: `${siteUrl}/books`,
              },
            };
          }

          if (route.path.startsWith("/books/") && route.doc) {
            return {
              ...route,
              jsonLd: route.jsonLd
                ? { ...route.jsonLd, "@type": "Article" }
                : route.jsonLd,
            };
          }

          return route;
        });

      for (const book of books) {
        const path = `/books/${book.id}`;
        if (transformed.some((route: any) => route.path === path)) continue;
        const entries = docsForBook(context, book.id);
        transformed.push({
          path,
          title: book.title,
          description: book.description,
          body: bookStaticBody(context, book),
          type: "website",
          jsonLd: collectionJsonLd(context, book, entries),
        });
      }

      return transformed;
    },
  };
}

export default defineConfig(({ mode }) => {
  // Cloudflare Pages injects CF_PAGES=1. Treat it as a root deployment even if
  // an external build setting accidentally invokes the github-pages mode.
  // GitHub Actions does not set CF_PAGES, so the repository base remains intact.
  const isCloudflarePages = process.env.CF_PAGES === "1";
  const isGitHubPagesBuild = mode === "github-pages" && !isCloudflarePages;
  const base = isGitHubPagesBuild ? "/tomz-io/" : "/";

  return {
    server: {
      port: 5174,
    },
    plugins: [
      miraDocs({
        contentDir: "src/pages",
        config: {
          title: siteName,
          description: siteDescription,
          siteUrl,
        },
        staticRoutes: seoConfig.enabled ? br003bStaticBuild() : false,
        exclude: (sourcePath) => /(^|\/)README\.md$/i.test(sourcePath),
      }),
      blogDirectoryCheck(),
      react(),
      tailwindcss(),
      VitePWA({
        // Auto-update prevents a stale service worker from keeping an old HTML
        // shell that points at hashed assets removed by a newer deployment.
        registerType: "autoUpdate",
        includeAssets: [
          "favicon-32x32.png",
          "apple-touch-icon.png",
          "pwa-icon-192.png",
          "pwa-icon-512.png",
          "pwa-maskable-512.png",
        ],
        manifest: {
          id: "./",
          name: appName,
          short_name: appName,
          description: siteDescription,
          lang: "zh-CN",
          start_url: "./",
          scope: "./",
          display: "standalone",
          theme_color: "#cc785c",
          background_color: "#faf9f5",
          icons: [
            {
              src: "pwa-icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true,
        },
      }),
      br003aStaticSeoGuard(),
      bookshelfRedirects(),
    ],
    base,
  };
});
