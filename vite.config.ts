import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { miraDocs } from "@uichat-mira/docs/vite";
import { miraDocsStaticBuild } from "./mira-docs-static";
import { seo as seoConfig, siteUrl } from "./src/site.config";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const pagesRoot = resolve(projectRoot, "src/pages");

const blogDirectoryByGroup: Record<string, string> = {
  "共同思考": "shared-thinking",
  "Mira 来信": "mira-letters",
  "开发者生活": "developer-life",
  "一起学智能体": "agent-learning",
};

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

function staticHomeBody(base: string) {
  const prefix = base === "/" ? "" : base.replace(/\/$/, "");
  const href = (path: string) => `${prefix}${path}`;
  return `<nav class="top-nav seo-static-header"><div class="wrap"><a class="brand" href="${href("/")}">Tomz Dang</a><ul class="menu"><li><a href="${href("/blogs")}">博客</a></li><li><a href="${href("/works")}">作品</a></li><li><a href="#about">关于</a></li></ul></div></nav><main class="seo-static-content home-v1-static"><header class="wrap"><span>INDEPENDENT DEVELOPER / PRODUCT DESIGNER</span><h1>Tomz Dang</h1><p>我是 Tomz，一名独立开发者和产品设计师。这里记录我正在做的产品，以及关于 AI、产品和人的一些思考。</p></header><section class="wrap"><h2>最近发生的事</h2><p>从公开的项目、写作与生活记录里挑选最能代表当下的近况。</p></section><section class="wrap"><h2>最近写了</h2><p><a href="${href("/blogs")}">查看最近文章 →</a></p></section><section id="about" class="wrap"><h2>关于</h2><p>我关注独立开发、产品设计，以及 AI 如何进入真实的工作与生活。</p></section></main>`;
}

function br003bStaticBuild() {
  const sourceRoutes = miraDocsStaticBuild.routes;
  return {
    ...miraDocsStaticBuild,
    siteName: "Tomz Dang",
    routes: (context: any) => {
      const routes = typeof sourceRoutes === "function"
        ? sourceRoutes(context)
        : sourceRoutes;
      return routes
        .filter((route: any) => route.path !== "/design-md")
        .map((route: any) => {
          const cleanedBody = typeof route.body === "string"
            ? route.body.replace(
                /<li><a href="[^"]*\/(?:about\/origin|mira-docs-api)">(?:文档|MiraDocs)<\/a><\/li>/g,
                "",
              )
            : route.body;
          if (route.path !== "/") return { ...route, body: cleanedBody };
          return {
            ...route,
            title: "独立开发与产品设计",
            description: "Tomz Dang 的个人网站。记录独立开发、产品设计，以及关于 AI、产品和人的持续思考。",
            body: staticHomeBody(context.base),
            jsonLd: {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Tomz Dang",
              url: siteUrl,
            },
          };
        });
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
          title: "Tomz Dang",
          description: "独立开发、产品设计，以及关于 AI、产品和人的持续思考",
          siteUrl,
        },
        staticRoutes: seoConfig.enabled ? br003bStaticBuild() : false,
        exclude: (sourcePath) => /(^|\/)README\.md$/i.test(sourcePath),
        route: (_sourcePath, doc) => {
          const path = doc.path.replace(/^\/docs(?=\/|$)/, "");
          return path || "/";
        },
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
          name: "tomz.io",
          short_name: "tomz.io",
          description: "Tomz Dang 的个人网站",
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
    ],
    base,
  };
});
