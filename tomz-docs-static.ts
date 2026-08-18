import { renderMiraMarkdown, type MiraDoc, type MiraDocsConfig } from "@uichat-mira/docs";
import {
  miraDocsAbsoluteRouteUrl,
  miraDocsEscapeHtml,
  type MiraDocsStaticBuildContext,
  type MiraDocsStaticBuildOptions,
  type MiraDocsStaticRoute,
} from "@uichat-mira/docs/vite";
import {
  adaptTomzDocs,
  authorDisplayName,
  compareBlogDocs,
  type TomzDoc,
} from "./src/content/tomz-docs-adapter";
import { collaborations, currentThoughts, navigation, projects } from "./src/site";

function basePath(base: string): string {
  return base === "/" ? "" : base.replace(/\/$/, "");
}

function href(context: MiraDocsStaticBuildContext, path: string): string {
  const normalized = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return `${basePath(context.base)}${normalized}`;
}

function header(context: MiraDocsStaticBuildContext): string {
  const links = navigation
    .map((item) => `<a href="${href(context, item.href)}">${miraDocsEscapeHtml(item.label)}</a>`)
    .join("");
  return `<header class="site-header seo-static-header"><div class="wrap header-inner"><a class="wordmark" href="${href(context, "/")}">Tomz Dang</a><nav class="primary-nav" aria-label="一级导航">${links}</nav></div></header>`;
}

function shell(context: MiraDocsStaticBuildContext, body: string): string {
  return `${header(context)}<main>${body}</main><footer class="site-footer"><div class="wrap footer-inner"><p>Tomz Dang · 写作、思考，以及正在做的事。</p><p>© 2026 Tomz Dang</p></div></footer>`;
}

function pageHeader(eyebrow: string, title: string, description: string): string {
  return `<header class="page-header"><span class="eyebrow">${miraDocsEscapeHtml(eyebrow)}</span><h1>${miraDocsEscapeHtml(title)}</h1><p>${miraDocsEscapeHtml(description)}</p></header>`;
}

function homeBody(context: MiraDocsStaticBuildContext, docs: TomzDoc[]): string {
  const recent = docs.filter((doc) => doc.root === "blogs").sort(compareBlogDocs).slice(0, 4);
  const thoughts = currentThoughts.map((thought) => `<li>${miraDocsEscapeHtml(thought)}</li>`).join("");
  const posts = recent.length
    ? `<div class="post-list">${recent.map((doc) => `<a class="post-row" href="${href(context, doc.path)}"><span>${miraDocsEscapeHtml(doc.group)}</span><div><h3>${miraDocsEscapeHtml(doc.title)}</h3><p>${miraDocsEscapeHtml(doc.description || "")}</p></div><time>${miraDocsEscapeHtml(doc.date || "")}</time></a>`).join("")}</div>`
    : `<div class="empty-state"><strong>文章还没有搬进来。</strong><p>旧文章仍留在原站与原 URL；迁移会在后续任务单独完成。</p></div>`;
  const together = collaborations.map((item) => `<a class="quiet-card" href="${href(context, item.href)}"><h3>${miraDocsEscapeHtml(item.title)}</h3><p>${miraDocsEscapeHtml(item.description)}</p><span>进入 →</span></a>`).join("");
  const projectList = projects.map((project) => {
    const content = `<span class="project-meta">${miraDocsEscapeHtml(project.meta)}</span><h3>${miraDocsEscapeHtml(project.name)}</h3><p>${miraDocsEscapeHtml(project.description)}</p>`;
    return project.href
      ? `<a class="project-row" href="${miraDocsEscapeHtml(project.href)}">${content}</a>`
      : `<div class="project-row">${content}</div>`;
  }).join("");

  return shell(context, `<div class="wrap home-page"><section class="author-hero"><div class="hero-copy"><span class="eyebrow">AUTHOR · BUILDER · NOTES</span><h1>Tomz Dang</h1><p class="hero-lede">写产品，也写技术；和 Mira 一起把一些想法做成东西，再把做过的判断留下来。</p><p class="hero-note">这里是我的个人主站。项目会从这里经过，但这里首先住的是人、文章和还没想完的问题。</p></div></section><section class="home-section"><div class="section-heading"><span class="eyebrow">NOW</span><h2>最近在想</h2></div><ol class="thought-list">${thoughts}</ol></section><section class="home-section"><div class="section-heading"><span class="eyebrow">WRITING</span><h2>最近写下</h2></div>${posts}</section><section class="home-section"><div class="section-heading"><span class="eyebrow">TOGETHER</span><h2>我和 Mira</h2></div><div class="card-grid three-up">${together}</div></section><section class="home-section"><div class="section-heading"><span class="eyebrow">PROJECTS</span><h2>正在做</h2></div><div class="project-list">${projectList}</div></section></div>`);
}

function blogsBody(context: MiraDocsStaticBuildContext, docs: TomzDoc[]): string {
  const posts = docs.filter((doc) => doc.root === "blogs").sort(compareBlogDocs);
  const list = posts.length
    ? `<div class="post-list">${posts.map((doc) => `<a class="post-row" href="${href(context, doc.path)}"><span>${miraDocsEscapeHtml(doc.group)}</span><div><h3>${miraDocsEscapeHtml(doc.title)}</h3><p>${miraDocsEscapeHtml(doc.description || "")}</p></div><time>${miraDocsEscapeHtml(doc.date || "")}</time></a>`).join("")}</div>`
    : `<div class="empty-state"><strong>还没有迁入文章。</strong><p>BR002 只把新站站起来，历史博客会在后续任务保持原 URL 迁入。</p></div>`;
  return shell(context, `<div class="wrap page-frame">${pageHeader("BLOGS", "博客", "完成度相对高一些的文章，会留在这里。")}${list}</div>`);
}

function thoughtsBody(context: MiraDocsStaticBuildContext, docs: TomzDoc[]): string {
  const thoughts = docs.filter((doc) => doc.group === "共同思考").sort(compareBlogDocs);
  const list = thoughts.length
    ? `<div class="post-list">${thoughts.map((doc) => `<a class="post-row" href="${href(context, doc.path)}"><span>共用的床</span><div><h3>${miraDocsEscapeHtml(doc.title)}</h3><p>${miraDocsEscapeHtml(doc.description || "")}</p></div><time>${miraDocsEscapeHtml(doc.date || "")}</time></a>`).join("")}</div>`
    : `<div class="empty-state"><strong>入口已经留好。</strong><p>历史文章仍保留原有 /blogs/shared-thinking/... 正文地址。</p></div>`;
  return shell(context, `<div class="wrap page-frame">${pageHeader("THOUGHTS", "共用的床", "还没有定型的想法，以及 Tomz 与 Mira 继续共同思考的地方。")}${list}</div>`);
}

function readingBody(context: MiraDocsStaticBuildContext): string {
  return shell(context, `<div class="wrap page-frame">${pageHeader("READING", "阅读", "一起读书、看纪录片，也把没有读懂的地方慢慢谈开。")}<div class="empty-state"><strong>入口已经留好。</strong><p>阅读系统会在后续任务继续施工。</p></div></div>`);
}

function projectsBody(context: MiraDocsStaticBuildContext): string {
  const list = projects.map((project) => {
    const content = `<span class="project-meta">${miraDocsEscapeHtml(project.meta)}</span><h3>${miraDocsEscapeHtml(project.name)}</h3><p>${miraDocsEscapeHtml(project.description)}</p>`;
    return project.href
      ? `<a class="project-row" href="${miraDocsEscapeHtml(project.href)}">${content}</a>`
      : `<div class="project-row">${content}</div>`;
  }).join("");
  return shell(context, `<div class="wrap page-frame">${pageHeader("PROJECTS", "项目", "这里只做索引：它是什么，以及从哪里继续看。")}<div class="project-list">${list}</div></div>`);
}

function aboutBody(context: MiraDocsStaticBuildContext): string {
  return shell(context, `<div class="wrap page-frame reading-copy">${pageHeader("ABOUT", "关于", "这是 Tomz Dang 的个人主站，不是某一个项目的产品官网。")}<section><h2>Tomz</h2><p>我做产品、写代码，也越来越多地负责判断什么值得做、什么应该留下。</p></section><section><h2>Tomz × Mira</h2><p>Mira 是长期项目，也是共同写作中明确署名的 AI 协作者。</p></section></div>`);
}

function articleBody(context: MiraDocsStaticBuildContext, doc: TomzDoc): string {
  const body = renderMiraMarkdown(doc.body, { removeH1: true });
  const authors = doc.author.map(authorDisplayName).join(" × ");
  return shell(context, `<div class="wrap page-frame"><article class="article-header"><span class="eyebrow">${miraDocsEscapeHtml(doc.group)}</span><h1>${miraDocsEscapeHtml(doc.title)}</h1>${doc.description ? `<p class="hero-note">${miraDocsEscapeHtml(doc.description)}</p>` : ""}<p>${miraDocsEscapeHtml([authors, doc.date, doc.readTime].filter(Boolean).join(" · "))}</p></article><article class="markdown">${body}</article></div>`);
}

function notFoundBody(context: MiraDocsStaticBuildContext): string {
  return shell(context, `<div class="wrap page-frame">${pageHeader("404", "这条路径没有内容", "页面可能已经移动、被删除，或者地址输入有误。")}</div>`);
}

function websiteJsonLd(context: MiraDocsStaticBuildContext, path: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tomz Dang",
    url: miraDocsAbsoluteRouteUrl(context.config.siteUrl || "", context.base, path),
  };
}

function articleJsonLd(context: MiraDocsStaticBuildContext, doc: TomzDoc): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: doc.title,
    description: doc.description,
    url: miraDocsAbsoluteRouteUrl(context.config.siteUrl || "", context.base, doc.path),
    datePublished: doc.date,
    author: doc.author.map((author) => ({ "@type": "Person", name: authorDisplayName(author) })),
    publisher: { "@type": "Person", name: "Tomz Dang" },
  };
}

function routes(context: MiraDocsStaticBuildContext): MiraDocsStaticRoute[] {
  const docs = adaptTomzDocs(context.docs as MiraDoc[]);
  const result: MiraDocsStaticRoute[] = [
    { path: "/", title: "Tomz Dang", description: context.config.description, body: homeBody(context, docs), type: "website", jsonLd: websiteJsonLd(context, "/") },
    { path: "/blogs", title: "博客", description: "Tomz 与 Mira 的产品手记、工程现场、共同思考与来信。", body: blogsBody(context, docs), type: "website", jsonLd: websiteJsonLd(context, "/blogs") },
    { path: "/thoughts", title: "共用的床", description: "还没有定型的想法，以及 Tomz 与 Mira 继续共同思考的地方。", body: thoughtsBody(context, docs), type: "website", jsonLd: websiteJsonLd(context, "/thoughts") },
    { path: "/reading", title: "阅读", description: "一起读书、看纪录片，也把没有读懂的地方慢慢谈开。", body: readingBody(context), type: "website", jsonLd: websiteJsonLd(context, "/reading") },
    { path: "/projects", title: "项目", description: "Tomz 正在持续做的公开项目与实验。", body: projectsBody(context), type: "website", jsonLd: websiteJsonLd(context, "/projects") },
    { path: "/about", title: "关于", description: "关于 Tomz、这个网站，以及 Tomz 与 Mira 的共同写作关系。", body: aboutBody(context), type: "website", jsonLd: websiteJsonLd(context, "/about") },
  ];

  for (const doc of docs) {
    result.push({
      path: doc.path,
      title: doc.title,
      description: doc.description || context.config.description,
      body: articleBody(context, doc),
      type: "article",
      image: doc.cover,
      jsonLd: articleJsonLd(context, doc),
      doc,
    });
  }

  return result;
}

export const tomzDocsStaticBuild: MiraDocsStaticBuildOptions = {
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
  siteName: "Tomz Dang",
  twitterCard: "summary",
  title: (route: MiraDocsStaticRoute, config: MiraDocsConfig): string =>
    route.path === "/" ? config.title : `${route.title} · ${config.title}`,
  sitemap: true,
  robots: true,
};
