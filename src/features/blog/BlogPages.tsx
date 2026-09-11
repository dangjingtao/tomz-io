import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthorSignature from "../../components/AuthorSignature";
import RenderedMarkdown from "../../components/RenderedMarkdown";
import ShareButton from "../../components/ShareButton";
import { authorProfiles } from "../../content/author-profiles";
import { compareBlogDocs, type Doc } from "../../content/mira-docs-adapter";
import { resolveCoverSource } from "../article/article-cover";
import type { SiteArea } from "../../types/site";
import { handleMiraAvatarError } from "../../utils/avatar";
import {
  getDocAuthorAvatars,
  getDocAuthorLabel,
  getDocAuthors,
  getDocSignature,
} from "../../utils/authors";
import { useActiveHeading } from "../../hooks/useActiveHeading";
import { renderMarkdown } from "../../utils/markdown";

function BlogHeaderVisual() {
  return (
    <div className="blog-header-visual" aria-hidden="true">
      <svg
        className="blog-header-orbit"
        viewBox="0 0 520 520"
        role="presentation"
      >
        <defs>
          <linearGradient
            id="blogOrbitWarm"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f4bb64" />
            <stop offset="55%" stopColor="#cc785c" />
            <stop offset="100%" stopColor="#cc785c" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="blogOrbitCool" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#8bd0bf" />
            <stop offset="100%" stopColor="#6b9edf" />
          </linearGradient>
        </defs>
        <circle
          className="orbit-track orbit-track-outer"
          cx="260"
          cy="260"
          r="202"
        />
        <circle
          className="orbit-track orbit-track-middle"
          cx="260"
          cy="260"
          r="165"
        />
        <circle
          className="orbit-track orbit-track-inner"
          cx="260"
          cy="260"
          r="132"
        />
        <circle
          className="orbit-segment orbit-segment-warm"
          cx="260"
          cy="260"
          r="176"
        />
        <circle
          className="orbit-segment orbit-segment-cool"
          cx="260"
          cy="260"
          r="208"
        />
        <circle
          className="orbit-segment orbit-segment-thin"
          cx="260"
          cy="260"
          r="147"
        />
        <g className="orbit-core-wrap">
          <circle className="orbit-core-glow" cx="260" cy="260" r="68" />
          <path
            className="orbit-atom orbit-atom-a"
            d="M260 190c25 0 46 31 46 70s-21 70-46 70-46-31-46-70 21-70 46-70Z"
          />
          <path
            className="orbit-atom orbit-atom-b"
            d="M194 240c18-18 55-10 83 17s35 65 17 83-55 10-83-17-35-65-17-83Z"
          />
          <path
            className="orbit-atom orbit-atom-c"
            d="M205 309c-9-24 12-55 47-70s71-8 80 16-12 55-47 70-71 8-80-16Z"
          />
          <circle className="orbit-dot" cx="260" cy="260" r="9" />
        </g>
      </svg>
      <span className="blog-header-noise blog-header-noise-a" />
      <span className="blog-header-noise blog-header-noise-b" />
    </div>
  );
}

export function BlogListPage({ area }: { area: SiteArea }) {
  const location = useLocation();
  const navigate = useNavigate();
  const blogCategories = [
    ...new Set(
      area.docs
        .map((doc) => doc.group.trim())
        .filter((group) => group && group !== "归档"),
    ),
  ];
  const tabs = ["全部", ...blogCategories];
  const requestedCategory =
    new URLSearchParams(location.search).get("category") || "全部";
  const activeCategory = tabs.includes(requestedCategory)
    ? requestedCategory
    : "全部";
  const filteredDocs = (
    activeCategory === "全部"
      ? area.docs
      : area.docs.filter((doc) => doc.group === activeCategory)
  ).sort(compareBlogDocs);
  const timelineDocs = filteredDocs;
  return (
    <>
      <div className="blog-list-page">
        <header className="blog-header">
          <div className="blog-header-copy">
            <h1>博客</h1>
            <p className="blog-lede">
              关于产品、工程，以及人与 AI 的一些记录。
            </p>
          </div>
          <BlogHeaderVisual />
        </header>
        <div className="blog-category-bar" aria-label="博客分类">
          <div className="tab-row-wrap">
            <div className="tab-row">
              {tabs.map((tab) => (
                <button
                  type="button"
                  className={`tab${activeCategory === tab ? " active" : ""}`}
                  key={tab}
                  onClick={() => {
                    const search =
                      tab === "全部"
                        ? ""
                        : `?category=${encodeURIComponent(tab)}`;
                    navigate(`/blogs${search}`, { replace: true });
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        <section className="blog-editorial-band">
            <div className="editorial-timeline">
              <div className="timeline-list">
                {timelineDocs.length ? (
                  timelineDocs.map((doc, index) => (
                    <article className="timeline-item" key={doc.path}>
                      <div className="timeline-content">
                        <div className="post-meta">
                          {doc.date ? <span>{doc.date}</span> : null}
                          {doc.date ? <span className="dot" /> : null}
                          <span>{doc.group}</span>
                        </div>
                        <h3>
                          <Link
                            to={{ pathname: doc.path, search: location.search }}
                          >
                            {doc.title}
                          </Link>
                        </h3>
                        <p className="post-excerpt">{doc.description}</p>
                      </div>
                      {index < timelineDocs.length - 1 ? (
                        <span className="timeline-divider" aria-hidden="true" />
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p className="timeline-empty">这个分类下还没有文章。</p>
                )}
              </div>
            </div>
        </section>
      </div>
    </>
  );
}
export function BlogPostPage({
  doc,
  previous,
  next,
}: {
  doc: Doc;
  previous?: Doc;
  next?: Doc;
}) {
  const location = useLocation();
  const html = useMemo(() => renderMarkdown(doc.source), [doc.source]);
  const activeHeading = useActiveHeading(doc.headings, {
    rootMargin: "-120px 0px -65% 0px",
  });
  const [articleHeaderCollapsed, setArticleHeaderCollapsed] = useState(false);
  const coverSrc = resolveCoverSource(doc);
  const authorAvatars = getDocAuthorAvatars(doc);
  const authorLabel = getDocAuthorLabel(doc);
  const signature = getDocSignature(doc);
  const isSubmissionPage = doc.root === "submissions";
  const submissionParts = doc.path.split("/").filter(Boolean);
  const submissionBackPath = !isSubmissionPage
    ? "/blogs"
    : submissionParts.length <= 1
      ? "/"
      : submissionParts.length == 2
        ? "/submissions"
        : `/${submissionParts.slice(0, 2).join("/")}`;
  const submissionBackLabel = !isSubmissionPage
    ? "← 返回博客列表"
    : submissionParts.length <= 1
      ? "← 返回首页"
      : submissionParts.length == 2
        ? "← 返回投稿"
        : `← 返回 ${submissionParts[1]}`;
  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    let previousY = window.scrollY;
    let accumulatedDelta = 0;
    let headerCollapsed = false;
    let frame = 0;
    let pendingY = previousY;
    let transitionTimer = 0;
    const lockTransition = () => {
      if (transitionTimer) window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        transitionTimer = 0;
        if (window.scrollY <= 12 && headerCollapsed) {
          headerCollapsed = false;
          accumulatedDelta = 0;
          setArticleHeaderCollapsed(false);
        }
      }, 320);
    };
    const handleScroll = () => {
      pendingY = window.scrollY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const currentY = pendingY;
        const delta = currentY - previousY;
        previousY = currentY;
        frame = 0;

        if (!mobileQuery.matches || currentY <= 12) {
          accumulatedDelta = 0;
          if (headerCollapsed && !transitionTimer) {
            headerCollapsed = false;
            setArticleHeaderCollapsed(false);
          }
          return;
        }

        if (transitionTimer) return;
        accumulatedDelta += delta;
        if (!headerCollapsed && accumulatedDelta >= 24) {
          headerCollapsed = true;
          accumulatedDelta = 0;
          setArticleHeaderCollapsed(true);
          lockTransition();
        } else if (headerCollapsed && accumulatedDelta <= -24) {
          headerCollapsed = false;
          accumulatedDelta = 0;
          setArticleHeaderCollapsed(false);
          lockTransition();
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (transitionTimer) window.clearTimeout(transitionTimer);
    };
  }, []);
  return (
    <>
      <div className="blog-post-page">
        <article
          className={`article-header${articleHeaderCollapsed ? " is-collapsed" : ""}`}
        >
          <div aria-hidden="true" className="article-header-visual">
            <img
              alt=""
              className="article-header-visual-image"
              src={coverSrc}
            />
          </div>
          <div className="article-header-topline">
            <Link
              className="back-link"
              to={
                isSubmissionPage
                  ? submissionBackPath
                  : { pathname: "/blogs", search: location.search }
              }
            >
              {submissionBackLabel}
            </Link>
            <ShareButton title={doc.title} text={doc.description} />
          </div>
          <h1>{doc.title}</h1>
          <div className="post-meta post-meta-article">
            <span
              className={`post-author-avatars post-author-avatars-${authorAvatars.length}`}
            >
              {authorAvatars.map((author) => (
                <img
                  alt=""
                  className="post-author-avatar"
                  key={author.name}
                  src={author.avatar}
                  onError={
                    author.name === "Mira" ? handleMiraAvatarError : undefined
                  }
                />
              ))}
            </span>
            <span>{authorLabel}</span>
            {doc.date ? <span className="dot" /> : null}
            {doc.date ? <span>{doc.date}</span> : null}
            {doc.readTime ? <span className="dot" /> : null}
            {doc.readTime ? <span>{doc.readTime}</span> : null}
            <span className="dot" />
            <span>{doc.group}</span>
          </div>
        </article>
        <div className="article-shell">
          <div className="article-body markdown blog-markdown">
            <RenderedMarkdown html={html} />
            <AuthorSignature
              authors={authorAvatars.map((author) => ({
                name: author.name,
                avatar: author.avatar,
                onAvatarError:
                  author.name === "Mira" ? handleMiraAvatarError : undefined,
              }))}
              title={signature.title}
              body={signature.body}
              kicker={
                authorAvatars.length === 1 && signature.showKicker
                  ? authorProfiles[getDocAuthors(doc)[0]].roleLabel
                  : undefined
              }
              links={signature.links}
              accentClassName={signature.accentClassName}
            />
            <div className="post-nav">
              {previous ? (
                <Link to={{ pathname: previous.path, search: location.search }}>
                  <span className="dir">← 上一篇</span>
                  <span className="to">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  className="next"
                  to={{ pathname: next.path, search: location.search }}
                >
                  <span className="dir">下一篇 →</span>
                  <span className="to">{next.title}</span>
                </Link>
              ) : null}
            </div>
          </div>
          {doc.headings.length ? (
            <aside className="article-toc">
              <h5>本文目录</h5>
              <ul>
                {doc.headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      className={activeHeading === heading.id ? "active" : ""}
                      href={`#${heading.id}`}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </div>
    </>
  );
}
