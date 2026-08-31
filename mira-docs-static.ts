import {
  extractHeadings,
  renderMiraMarkdown,
  type MiraDoc,
  type MiraDocsConfig,
} from "@uichat-mira/docs";
import {
  miraDocsAbsoluteAssetUrl,
  miraDocsAbsoluteRouteUrl,
  miraDocsEscapeHtml,
  type MiraDocsStaticBuildContext,
  type MiraDocsStaticBuildOptions,
  type MiraDocsStaticRoute,
} from "@uichat-mira/docs/vite";
import {
  authorAvatarUrl,
  miraAvatarUrl,
  siteDescription,
  siteName,
  siteUrl,
} from "./src/site.config";

type StaticDoc = MiraDoc & {
  root: string;
  source: string;
  authors: string[];
  readTime?: string;
  image?: string;
  merge?: string;
  mergeIndex?: boolean;
};

const tztAvatarUrl = "https://avatars.githubusercontent.com/u/194352280?v=4";
const tztBio = "Mira Mobile 的主要维护人，十八年前计协老会长。";

function dataString(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  if (Array.isArray(value)) return value.length ? String(value[0]) : undefined;
  if (value == null || value === "") return undefined;
  return String(value);
}

function dataList(data: Record<string, unknown>, key: string): string[] {
  const value = data[key];
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(/[|,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function authorName(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "tomz") return siteName;
  if (normalized === "mira") return "Mira";
  if (normalized === "t-zt") return "t-zt";
  return value;
}

function authorAvatar(name: string): string {
  if (name === "Mira") return miraAvatarUrl;
  if (name.toLowerCase() === "t-zt") return tztAvatarUrl;
  return authorAvatarUrl;
}

function authorBio(name: string): string {
  return name.toLowerCase() === "t-zt" ? tztBio : "";
}

function staticDocs(docs: MiraDoc[]): StaticDoc[] {
  const parsed: StaticDoc[] = docs.map((doc: MiraDoc) => {
    const explicitAuthors = dataList(doc.data, "author").map(authorName);
    return {
      ...doc,
      root: doc.path.split("/")[1] || "docs",
      source: doc.body,
      authors: explicitAuthors.length ? explicitAuthors : [siteName],
      readTime:
        dataString(doc.data, "readTime") ||
        dataString(doc.data, "readtime") ||
        dataString(doc.data, "read_time"),
      image: doc.cover || dataString(doc.data, "image"),
      merge: dataString(doc.data, "merge"),
      mergeIndex: dataString(doc.data, "mergeIndex") === "true",
    };
  });

  return parsed
    .filter((doc: StaticDoc) => !doc.merge || doc.mergeIndex)
    .map((doc: StaticDoc) => {
      if (!doc.merge) return doc;
      const source = parsed
        .filter((section: StaticDoc) => section.merge === doc.merge)
        .sort((left: StaticDoc, right: StaticDoc) => left.order - right.order)
        .map((section: StaticDoc) => section.source)
        .join("\n\n");
      return {
        ...doc,
        source,
        body: source,
        headings: extractHeadings(source),
      };
    });
}

function basePath(base: string): string {
  return base === "/" ? "" : base.replace(/\/$/, "");
}

function docHref(path: string, context: MiraDocsStaticBuildContext): string {
  return `${basePath(context.base)}${path}`;
}

function pageNavigation(
  previous: StaticDoc | undefined,
  next: StaticDoc | undefined,
  context: MiraDocsStaticBuildContext,
): string {
  if (!previous && !next) return "";
  const previousLink = previous
    ? `<a href="${docHref(previous.path, context)}"><span class="dir">上一篇</span><span class="to">← ${miraDocsEscapeHtml(previous.title)}</span></a>`
    : "<span></span>";
  const nextLink = next
    ? `<a class="next" href="${docHref(next.path, context)}"><span class="dir">下一篇</span><span class="to">${miraDocsEscapeHtml(next.title)} →</span></a>`
    : "";
  return `<div class="page-nav">${previousLink}${nextLink}</div>`;
}

function staticSiteHeader(context: MiraDocsStaticBuildContext): string {
  const links = [
    ["首页", "/"],
    ["博客", "/blogs"],
    ["投稿", "/submissions"],
    ["作品", "/works"],
    ["项目", "/projects"],
    ["研习", "/learning"],
    ["关于", "/#about"],
  ] as const;
  const navigation = links
    .map(
      ([label, path]) =>
        `<li><a href="${docHref(path, context)}">${miraDocsEscapeHtml(label)}</a></li>`,
    )
    .join("");
  return `<nav class="top-nav docs-header seo-static-header"><div class="wrap"><a class="brand" href="${docHref("/", context)}">${siteName}</a><ul class="menu">${navigation}</ul></div></nav>`;
}

function staticDirectory(doc: StaticDoc): string {
  const parts = doc.path.split("/").filter(Boolean);
  return parts.slice(1, -1).join("/");
}

function staticProjectId(path: string): string | undefined {
  const [root, projectId] = path.split("/").filter(Boolean);
  return root === "projects" ? projectId : undefined;
}

function staticNavigationDirectory(doc: StaticDoc): string {
  return staticDirectory(doc);
}

function staticDirectoryTitle(directory: string): string {
  if (!directory) return "文档";
  return directory
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[-_]+/g, " "))
    .join(" / ");
}

function staticProjectDocNav(
  doc: StaticDoc,
  docs: StaticDoc[],
  context: MiraDocsStaticBuildContext,
): string {
  const groups = new Map<
    string,
    { title: string; order: number; overview?: StaticDoc; articles: StaticDoc[] }
  >();
  for (const candidate of docs.filter((item) => item.root === "projects")) {
    const id = staticProjectId(candidate.path);
    if (!id) continue;
    const group = groups.get(id) || {
      title: candidate.title,
      order: candidate.order,
      articles: [],
    };
    if (candidate.path === `/projects/${id}`) {
      group.overview = candidate;
      group.title = candidate.title;
      group.order = candidate.order;
    } else {
      group.articles.push(candidate);
    }
    groups.set(id, group);
  }

  const content = [...groups.entries()]
    .sort(([, left], [, right]) => left.order - right.order)
    .map(([id, group]) => {
      const overviewPath = group.overview?.path || `/projects/${id}`;
      const overview = `<a class="project-nav-overview${doc.path === overviewPath ? " active" : ""}" href="${docHref(overviewPath, context)}"><span class="project-nav-title">${miraDocsEscapeHtml(group.title)}</span></a>`;
      const articles = group.articles
        .sort((left, right) => left.order - right.order || left.path.localeCompare(right.path))
        .map(
          (article) =>
            `<li><a${article.path === doc.path ? ' class="active" aria-current="page"' : ""} href="${docHref(article.path, context)}">${miraDocsEscapeHtml(article.title)}</a></li>`,
        )
        .join("");
      return `<div class="project-nav-group">${overview}${articles ? `<ul class="project-nav-articles">${articles}</ul>` : ""}</div>`;
    })
    .join("");
  return `<nav class="docnav project-docnav"><h5>目录</h5><div class="project-nav-groups">${content}</div></nav>`;
}

function staticDocNav(
  doc: StaticDoc,
  docs: StaticDoc[],
  context: MiraDocsStaticBuildContext,
): string {
  const root = doc.root;
  if (root === "projects") {
    return staticProjectDocNav(doc, docs, context);
  }
  const scoped = docs
    .filter((candidate) => candidate.root === root)
    .sort(
      (left, right) =>
        left.order - right.order || left.path.localeCompare(right.path),
    );
  const groups = new Map<string, StaticDoc[]>();
  for (const candidate of scoped) {
    const directory = staticNavigationDirectory(candidate);
    const group = groups.get(directory) || [];
    group.push(candidate);
    groups.set(directory, group);
  }
  const rootPath = `/${root}`;
  const rootTitle =
    scoped
      .filter((candidate) => candidate.root === root)
      .map((candidate) => dataString(candidate.data, "nav"))
      .find(Boolean) ||
    doc.group ||
    root;
  const sections = [...groups.entries()]
    .map(([directory, items]) => {
      const links = items
        .map(
          (item) =>
            `<li><a${item.path === doc.path ? ' class="active" aria-current="page"' : ""} href="${docHref(item.path, context)}">${miraDocsEscapeHtml(item.title)}</a></li>`,
        )
        .join("");
      return `<div class="docnav-group"><h5>${miraDocsEscapeHtml(staticDirectoryTitle(directory))}</h5><ul>${links}</ul></div>`;
    })
    .join("");
  return `<nav class="docnav"><h5>目录</h5><div class="docnav-group"><h5><a href="${docHref(rootPath, context)}">${miraDocsEscapeHtml(rootTitle)}</a></h5></div>${sections}</nav>`;
}

function staticDocToc(doc: StaticDoc): string {
  if (!doc.headings.length) return "";
  const links = doc.headings
    .map(
      (heading) =>
        `<li class="toc-depth-${heading.depth}"><a href="#${miraDocsEscapeHtml(heading.id)}">${miraDocsEscapeHtml(heading.text)}</a></li>`,
    )
    .join("");
  return `<aside class="toc"><h5>本页目录</h5><ul>${links}</ul></aside>`;
}
function documentBody(
  doc: StaticDoc,
  previous: StaticDoc | undefined,
  next: StaticDoc | undefined,
  context: MiraDocsStaticBuildContext,
  docs: StaticDoc[],
): string {
  const body = renderMiraMarkdown(doc.source, { removeH1: true });
  const main = `<main class="doc-main seo-static-content"><div class="doc-eyebrow">${miraDocsEscapeHtml(doc.group)} · ${String(doc.order).padStart(2, "0")}</div><div class="doc-title-block"><h1>${miraDocsEscapeHtml(doc.title)}</h1>${doc.description ? `<p class="doc-lede">${miraDocsEscapeHtml(doc.description)}</p>` : ""}</div><article class="markdown">${body}</article>${pageNavigation(previous, next, context)}</main>`;
  return `${staticSiteHeader(context)}<div class="docs-app seo-static-docs-app"><div class="docs-shell">${staticDocNav(doc, docs, context)}${main}${staticDocToc(doc)}</div></div>`;
}

function articleToc(doc: StaticDoc): string {
  const headings = doc.headings.filter((heading) => heading.depth === 2);
  if (!headings.length) return "";
  const items = headings
    .map(
      (heading) =>
        `<li><a href="#${miraDocsEscapeHtml(heading.id)}">${miraDocsEscapeHtml(heading.text)}</a></li>`,
    )
    .join("");
  return `<aside class="article-toc"><h5>本文目录</h5><ul>${items}</ul></aside>`;
}

function articleBody(
  doc: StaticDoc,
  previous: StaticDoc | undefined,
  next: StaticDoc | undefined,
  context: MiraDocsStaticBuildContext,
): string {
  const body = renderMiraMarkdown(doc.source, { removeH1: true });
  const authors = doc.authors.join(" × ");
  const meta = [authors, doc.date, doc.readTime, doc.group]
    .filter(Boolean)
    .map((item) => `<span>${miraDocsEscapeHtml(String(item))}</span>`)
    .join('<span class="dot"></span>');
  const visual = doc.image
    ? `<div aria-hidden="true" class="article-header-visual"><img alt="" class="article-header-visual-image" src="${imageUrl(doc, context)}" /></div>`
    : "";
  const authorAvatars = doc.authors
    .map(
      (name) =>
        `<img alt="" class="author-signature-avatar" src="${authorAvatar(name)}" />`,
    )
    .join("");
  const authorCountClass = doc.authors.length > 1 ? "duo" : "solo";
  const bio = doc.authors.length === 1 ? authorBio(doc.authors[0]) : "";
  const main = `<main class="doc-main seo-static-content blog-post-page"><article class="article-header">${visual}<h1>${miraDocsEscapeHtml(doc.title)}</h1>${doc.description ? `<p class="doc-lede">${miraDocsEscapeHtml(doc.description)}</p>` : ""}<div class="post-meta post-meta-article">${meta}</div></article><div class="article-shell"><div class="article-body markdown blog-markdown">${body}<section class="author-signature author-signature-${authorCountClass}"><div class="author-signature-avatars author-signature-avatars-${doc.authors.length}">${authorAvatars}</div><div class="author-signature-copy"><h4>${miraDocsEscapeHtml(authors)}</h4>${bio ? `<p>${miraDocsEscapeHtml(bio)}</p>` : ""}</div></section>${pageNavigation(previous, next, context)}</div>${articleToc(doc)}</div></main>`;
  return `${staticSiteHeader(context)}<div class="docs-app blog-app seo-static-docs-app"><div class="docs-shell blog-shell">${main}</div></div>`;
}

function areaBody(
  root: string,
  docs: StaticDoc[],
  context: MiraDocsStaticBuildContext,
): string {
  const title =
    root === "blogs"
      ? "博客"
      : root === "projects"
        ? docs.map((doc) => dataString(doc.data, "nav")).find(Boolean) || "项目"
        : docs.find((doc: StaticDoc) => doc.root === root)?.title || root;
  if (root === "projects") {
    const groups = new Map<
      string,
      { title: string; order: number; overview?: StaticDoc; articles: StaticDoc[] }
    >();
    for (const doc of docs) {
      const id = staticProjectId(doc.path);
      if (!id) continue;
      const group = groups.get(id) || {
        title: doc.title,
        order: doc.order,
        articles: [],
      };
      if (doc.path === `/projects/${id}`) {
        group.overview = doc;
        group.title = doc.title;
        group.order = doc.order;
      } else {
        group.articles.push(doc);
      }
      groups.set(id, group);
    }
    const sections = [...groups.entries()]
      .sort(([, left], [, right]) => left.order - right.order)
      .map(([id, group]) => {
        const overviewPath = group.overview?.path || `/projects/${id}`;
        const articles = group.articles
          .sort((left, right) => left.order - right.order || left.path.localeCompare(right.path))
          .map(
            (article) =>
              `<li><a href="${docHref(article.path, context)}">${miraDocsEscapeHtml(article.title)}</a></li>`,
          )
          .join("");
        return `<section class="area-directory-group"><h3><a href="${docHref(overviewPath, context)}">${miraDocsEscapeHtml(group.title)}</a></h3>${group.overview?.description ? `<p>${miraDocsEscapeHtml(group.overview.description)}</p>` : ""}${articles ? `<ol>${articles}</ol>` : ""}</section>`;
      })
      .join("");
    const main = `<main class="doc-main seo-static-content"><div class="doc-title-block"><h1>${miraDocsEscapeHtml(title)}</h1></div><div class="area-directory-groups project-area-groups">${sections}</div></main>`;
    return `${staticSiteHeader(context)}<div class="docs-app seo-static-docs-app"><div class="docs-shell">${main}</div></div>`;
  }
  const links = docs
    .filter((doc: StaticDoc) => doc.root === root)
    .map(
      (doc: StaticDoc) =>
        `<li><a href="${docHref(doc.path, context)}">${miraDocsEscapeHtml(doc.title)}</a><p>${miraDocsEscapeHtml(doc.description)}</p></li>`,
    )
    .join("");
  const main = `<main class="doc-main seo-static-content"><div class="doc-title-block"><h1>${miraDocsEscapeHtml(title)}</h1></div><section class="docs-sitemap-grid"><section class="area-overview-card"><ol>${links}</ol></section></section></main>`;
  return `${staticSiteHeader(context)}<div class="docs-app seo-static-docs-app"><div class="docs-shell">${main}</div></div>`;
}

function homeBody(context: MiraDocsStaticBuildContext): string {
  const main = `<main class="doc-main seo-static-content"><div class="doc-title-block"><h1>独立开发与产品设计</h1><p class="doc-lede">${siteDescription}</p></div></main>`;
  return `${staticSiteHeader(context)}${main}`;
}

function notFoundBody(context: MiraDocsStaticBuildContext): string {
  const main = `<main class="doc-main seo-static-content"><div class="doc-not-found"><h1>这条路径没有内容</h1><p>页面可能已经移动、被删除，或者地址输入有误。</p><a class="btn btn-primary" href="${basePath(context.base)}/">返回首页</a></div></main>`;
  return `${staticSiteHeader(context)}${main}`;
}

function imageUrl(
  doc: StaticDoc | undefined,
  context: MiraDocsStaticBuildContext,
): string {
  const image = doc?.image?.trim() || "tomz-avatar.png";
  if (/^https?:\/\//i.test(image)) return image;
  return miraDocsAbsoluteAssetUrl(
    context.config.siteUrl || "",
    context.base,
    image,
  );
}

function websiteJsonLd(
  context: MiraDocsStaticBuildContext,
  path: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: miraDocsAbsoluteRouteUrl(
      context.config.siteUrl || "",
      context.base,
      path,
    ),
  };
}

function documentJsonLd(
  doc: StaticDoc,
  context: MiraDocsStaticBuildContext,
): Record<string, unknown> {
  const url = miraDocsAbsoluteRouteUrl(
    context.config.siteUrl || "",
    context.base,
    doc.path,
  );
  return {
    "@context": "https://schema.org",
    "@type":
      doc.root === "blogs" || doc.root === "submissions"
        ? "Article"
        : "TechArticle",
    headline: doc.title,
    description: doc.description,
    url,
    image: imageUrl(doc, context),
    datePublished: doc.date,
    author: doc.authors.map((name: string) => ({ "@type": "Person", name })),
    publisher: {
      "@type": "Person",
      name: siteName,
      url: context.config.siteUrl || undefined,
    },
  };
}

function siblingDocs(
  doc: StaticDoc,
  docs: StaticDoc[],
): { previous?: StaticDoc; next?: StaticDoc } {
  const project = staticProjectId(doc.path);
  const scoped = docs
    .filter(
      (candidate) =>
        candidate.root === doc.root &&
        (!project || staticProjectId(candidate.path) === project),
    )
    .sort(
      (left, right) =>
        left.order - right.order || left.path.localeCompare(right.path),
    );
  const index = scoped.findIndex((candidate) => candidate.path === doc.path);
  return {
    previous: index > 0 ? scoped[index - 1] : undefined,
    next: index >= 0 ? scoped[index + 1] : undefined,
  };
}

function routes(context: MiraDocsStaticBuildContext): MiraDocsStaticRoute[] {
  const docs = staticDocs(context.docs);
  const result: MiraDocsStaticRoute[] = [
    {
      path: "/",
      title: "独立开发与产品设计",
      description: siteDescription,
      body: homeBody(context),
      type: "website",
      jsonLd: websiteJsonLd(context, "/"),
    },
  ];

  const roots = [...new Set(docs.map((doc: StaticDoc) => doc.root))];
  for (const root of roots) {
    const rootDocs = docs.filter((doc: StaticDoc) => doc.root === root);
    if (root === "submissions") {
      const landing =
        rootDocs.find((doc: StaticDoc) => doc.path === "/submissions") ||
        rootDocs[0];
      if (landing) {
        result.push({
          path: "/submissions",
          title: landing.title,
          description: landing.description,
          body: articleBody(landing, undefined, undefined, context),
          type: "article",
          image: landing.image,
          jsonLd: documentJsonLd(landing, context),
          doc: landing,
        });
      }
      continue;
    }
    const title = root === "blogs" ? "博客" : rootDocs[0]?.title || root;
    result.push({
      path: `/${root}`,
      title,
      description: rootDocs[0]?.description || `${siteName} 的作品、文章与持续思考。`,
      body: areaBody(root, rootDocs, context),
      type: "website",
      jsonLd: websiteJsonLd(context, `/${root}`),
    });
  }

  for (const doc of docs) {
    if (doc.root === "submissions" && doc.path === "/submissions") continue;
    const { previous, next } = siblingDocs(doc, docs);
    result.push({
      path: doc.path,
      title: doc.title,
      description: doc.description || `${siteName} 的个人网站文章与项目记录。`,
      body:
        doc.root === "blogs" || doc.root === "submissions"
          ? articleBody(doc, previous, next, context)
          : documentBody(doc, previous, next, context, docs),
      type: "article",
      image: doc.image,
      jsonLd: documentJsonLd(doc, context),
      doc,
    });
  }

  return result;
}

export const miraDocsStaticBuild: MiraDocsStaticBuildOptions = {
  routes,
  notFound: (context: MiraDocsStaticBuildContext): MiraDocsStaticRoute => ({
    path: "/404",
    title: "页面不存在",
    description: "你访问的页面不存在，可能已经移动、被删除，或者地址输入有误。",
    body: notFoundBody(context),
    type: "website",
    robots: "noindex,nofollow",
    jsonLd: websiteJsonLd(context, "/404"),
  }),
  locale: "zh_CN",
  siteName,
  defaultImage: "tomz-avatar.png",
  image: {
    type: "image/png",
    width: 420,
    height: 420,
  },
  twitterCard: "summary_large_image",
  title: (route: MiraDocsStaticRoute, config: MiraDocsConfig): string =>
    `${route.title} · ${config.title}`,
  transformTemplate: (
    template: string,
    context: MiraDocsStaticBuildContext,
  ): string => {
    const assetBase = context.base === "/" ? "/" : context.base;
    return template.replace(
      /(href|src)="\/mira-logo\.png"/g,
      `$1="${assetBase}mira-logo.png"`,
    );
  },
  sitemap: true,
  robots: true,
};
