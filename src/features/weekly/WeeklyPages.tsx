import { useEffect, useId, useState } from "react";
import { ChevronDown, List, X } from "lucide-react";
import { Link } from "react-router-dom";
import RenderedMarkdown from "../../components/RenderedMarkdown";
import { useActiveHeading } from "../../hooks/useActiveHeading";
import ShareButton from "../../components/ShareButton";
import { allDocs, compareWeeklyDocs, type Doc } from "../../content/mira-docs-adapter";
import type { SiteArea } from "../../types/site";
import { getDocAuthorLabel } from "../../utils/authors";
import { appBase } from "../../utils/paths";
import { resolveCoverSource } from "../article/article-cover";
import {
  isWeeklyIssueIndexDoc,
  weeklyDateLabel,
  weeklyDisplayTitle,
  weeklyIssueIndexDocs,
  weeklyIssueNumber,
  weeklyIssuePath,
  groupWeeklyToc,
  type WeeklyTocHeading,
} from "./weekly-utils";
import { weeklyMastheadDescription, weeklyMastheadStatement, weeklyWatchTopics } from "./weekly-copy";

function resolveWeeklyMarkdownUrls(html: string) {
  return html.replace(/\b(href|src)="\/(?!\/)/g, `$1="${appBase}`);
}

function issueNeighbors(doc: Doc) {
  const issues = weeklyIssueIndexDocs(allDocs).sort(
    (a, b) => weeklyIssueNumber(a) - weeklyIssueNumber(b),
  );
  const currentIssueNumber = weeklyIssueNumber(doc);
  const index = issues.findIndex(
    (item) => weeklyIssueNumber(item) === currentIssueNumber,
  );
  return {
    issueIndex: index >= 0 ? issues[index] : undefined,
    previousIssue: index > 0 ? issues[index - 1] : undefined,
    nextIssue: index >= 0 && index < issues.length - 1 ? issues[index + 1] : undefined,
  };
}

export function WeeklyListPage({ area }: { area: SiteArea }) {
  const issues = weeklyIssueIndexDocs(area.docs).sort(compareWeeklyDocs);
  const latest = issues[0];
  if (!latest) return null;

  const latestCover = latest.cover?.trim() ? resolveCoverSource(latest) : "";

  return (
    <div className="weekly-index-page">
      <header className="weekly-masthead weekly-frame">
        <p className="weekly-eyebrow">TOMZ.IO 一级内容产品 · 每周一出刊</p>
        <h1>见π</h1>
        <p className="weekly-masthead-statement">{weeklyMastheadStatement}</p>
        <p className="weekly-masthead-desc">{weeklyMastheadDescription}</p>
        <div className="weekly-masthead-meta">
          <span>永久期号</span><i aria-hidden="true" />
          <span>一期一次编辑</span><i aria-hidden="true" />
          <span>Tomz × Mira</span>
        </div>
        <div className="weekly-scope" aria-label="见π长期观察范围">
          {weeklyWatchTopics.map((topic) => <span key={topic}>{topic}</span>)}
        </div>
      </header>

      <section className="weekly-latest-section">
        <div className="weekly-frame weekly-latest-grid">
          <aside
            className={`weekly-issue-cover${latestCover ? " has-cover" : ""}`}
            style={latestCover ? { backgroundImage: `url("${latestCover}")` } : undefined}
          >
            <p>永久期号 · PERMANENT NO.</p>
            <strong>{String(weeklyIssueNumber(latest)).padStart(3, "0")}</strong>
            <span>期号只增不复用。每一期都是一次完整的编辑，而不是一篇被拉长的文章。</span>
          </aside>

          <article className="weekly-latest-main">
            <p className="weekly-eyebrow weekly-accent">LATEST / 最新一期</p>
            <h2><Link to={latest.path}>{weeklyDisplayTitle(latest)}</Link></h2>
            <p className="weekly-latest-lead">{latest.lead || latest.description}</p>
            <div className="weekly-issue-meta">
              <span>{weeklyDateLabel(latest.date)} 出刊</span><i aria-hidden="true" />
              {latest.readTime ? <><span>{latest.readTime}</span><i aria-hidden="true" /></> : null}
              <span>{getDocAuthorLabel(latest)}</span>
            </div>
            {latest.tags?.length ? (
              <div className="weekly-tags" aria-label="本期主题">
                {latest.tags.slice(0, 6).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            ) : null}
            <Link className="weekly-enter" to={latest.path}>进入本期 <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>

      <section className="weekly-archive-section weekly-frame" aria-labelledby="weekly-archive-title">
        <div className="weekly-section-head">
          <h2 id="weekly-archive-title">历期索引</h2>
          <span>{issues.length} ISSUE{issues.length === 1 ? "" : "S"} · 自动从每期 INDEX.MD 生成</span>
        </div>
        <p className="weekly-archive-year">2026</p>
        <div className="weekly-archive">
          {issues.map((doc) => (
            <Link className="weekly-archive-row" to={doc.path} key={doc.path}>
              <span className="weekly-archive-no">NO.{String(weeklyIssueNumber(doc)).padStart(3, "0")}</span>
              <span className="weekly-archive-copy">
                <strong>{weeklyDisplayTitle(doc)}</strong>
                <small>{doc.lead || doc.description}</small>
              </span>
              <span className="weekly-archive-aside">
                <time>{weeklyDateLabel(doc.date).slice(5)}</time>
                {doc.tags?.length ? <small>{doc.tags.slice(0, 3).join(" · ")}</small> : null}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="weekly-about-strip">
        <div className="weekly-frame weekly-about-grid">
          <h2>关于见π</h2>
          <div>
            <p>
              见π是 Tomz.io 的一级内容产品。博客承载独立文章；见π承载的是“一期”：有永久期号、有当期编辑判断，也允许封面文章、编辑文章、短讯、鬼集与已经发表的延伸阅读同时存在。
            </p>
            <p>
              周更只是当前发布节奏，不是产品名称。Radar 负责找，正式出版仍然经过编辑判断；一条素材被选中，也不意味着它必须被硬写成一篇文章。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function WeeklyTocLinks({
  headings,
  activeId,
}: {
  headings: readonly WeeklyTocHeading[];
  activeId: string;
}) {
  const groups = groupWeeklyToc(headings);
  const activeGroup = groups.find((group) =>
    group.heading.id === activeId || group.children.some((item) => item.id === activeId),
  )?.heading.id;

  return (
    <ol className="weekly-toc-sections">
      {groups.map((group, index) => (
        <li className="weekly-toc-section" key={group.heading.id}>
          <a
            className={`weekly-toc-chapter${activeGroup === group.heading.id ? " is-active" : ""}`}
            href={`#${group.heading.id}`}
            aria-current={activeId === group.heading.id ? "location" : undefined}
          >
            <span className="weekly-toc-number">{String(index + 1).padStart(2, "0")}</span>
            <span>{group.heading.text}</span>
          </a>
          {group.children.length ? (
            <ol className="weekly-toc-subsections">
              {group.children.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={activeId === item.id ? "is-active" : ""}
                    aria-current={activeId === item.id ? "location" : undefined}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          ) : null}
        </li>
      ))}
    </ol>
  );
}


/**
 * Mobile-only navigation: shares heading data with desktop, not desktop TOC
 * markup or styles. Its links remain usable when chapters wrap on small screens.
 */
function WeeklyMobileToc({
  headings,
  activeId,
  onNavigate,
}: {
  headings: readonly WeeklyTocHeading[];
  activeId: string;
  onNavigate: () => void;
}) {
  const groups = groupWeeklyToc(headings);
  const activeGroup = groups.find((group) =>
    group.heading.id === activeId || group.children.some((item) => item.id === activeId),
  )?.heading.id;
  return (
    <ol className="weekly-mobile-toc-list">
      {groups.map((group, index) => (
        <li className="weekly-mobile-toc-group" key={group.heading.id}>
          <a
            className={`weekly-mobile-toc-heading${activeGroup === group.heading.id ? " is-active" : ""}`}
            href={`#${group.heading.id}`}
            onClick={onNavigate}
            aria-current={activeId === group.heading.id ? "location" : undefined}
          >
            <span className="weekly-mobile-toc-count">{String(index + 1).padStart(2, "0")}</span>
            <span>{group.heading.text}</span>
          </a>
          {group.children.length > 0 ? (
            <ol className="weekly-mobile-toc-children">
              {group.children.map((item) => (
                <li key={item.id}>
                  <a
                    className={activeId === item.id ? "is-active" : ""}
                    href={`#${item.id}`}
                    onClick={onNavigate}
                    aria-current={activeId === item.id ? "location" : undefined}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function WeeklyIssuePage({
  doc,
  html,
}: {
  doc: Doc;
  html: string;
  previous?: Doc;
  next?: Doc;
}) {
  const issue = String(weeklyIssueNumber(doc)).padStart(3, "0");
  const isIssueIndex = isWeeklyIssueIndexDoc(doc);
  const { issueIndex, previousIssue, nextIssue } = issueNeighbors(doc);
  const issuePath = issueIndex?.path || weeklyIssuePath(doc);
  const resolvedHtml = resolveWeeklyMarkdownUrls(html);
  const mobileIssueCover = isIssueIndex && doc.cover?.trim() ? resolveCoverSource(doc) : "";
  const firstInlineImage = doc.source.trimStart().match(/^!\[[^\]]*\]\(([^)\s]+)\)/)?.[1];
  const duplicatesMobileCover = Boolean(mobileIssueCover && firstInlineImage === doc.cover?.trim());
  const activeHeading = useActiveHeading(doc.headings, {
    enabled: doc.headings.length > 0,
    rootMargin: "-125px 0px -65% 0px",
  });
  const [tocOpen, setTocOpen] = useState(false);
  const tocId = useId();

  useEffect(() => setTocOpen(false), [doc.path]);
  useEffect(() => {
    if (!tocOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTocOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [tocOpen]);

  return (
    <article className={`weekly-issue-page${isIssueIndex ? " is-index" : " is-detail"}${duplicatesMobileCover ? " has-mobile-inline-cover" : ""}`}>
      <div className="weekly-mobile-subnav" role="navigation" aria-label="见π阅读工具">
        <div className="weekly-mobile-subnav-inner">
          {doc.headings.length ? (
            <button
              className="weekly-mobile-subnav-toc"
              type="button"
              aria-expanded={tocOpen}
              aria-controls={tocId}
              onClick={() => setTocOpen((open) => !open)}
            >
              {tocOpen ? <X size={17} aria-hidden="true" /> : <List size={17} aria-hidden="true" />}
              <span>{isIssueIndex ? "本期目录" : "文章目录"}</span>
              <ChevronDown className={tocOpen ? "is-open" : ""} size={14} aria-hidden="true" />
            </button>
          ) : <span className="weekly-mobile-subnav-label">见π · NO.{issue}</span>}
          <div className="weekly-mobile-subnav-share">
            <ShareButton title={doc.title} text={doc.description} variant="weekly-mobile" />
          </div>
        </div>
        {tocOpen && doc.headings.length ? (
          <button
            type="button"
            className="weekly-mobile-subnav-backdrop"
            aria-label="关闭目录"
            onClick={() => setTocOpen(false)}
          />
        ) : null}
        {doc.headings.length ? (
          <nav
            className="weekly-mobile-subnav-panel"
            id={tocId}
            hidden={!tocOpen}
            aria-label={isIssueIndex ? "本期栏目目录" : "文章章节目录"}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a[href^="#"]')) setTocOpen(false);
            }}
          >
            <p className="weekly-mobile-subnav-panel-label">
              {isIssueIndex ? "本期栏目" : "阅读章节"} · {groupWeeklyToc(doc.headings).length}
            </p>
            <WeeklyMobileToc
              headings={doc.headings}
              activeId={activeHeading}
              onNavigate={() => setTocOpen(false)}
            />
          </nav>
        ) : null}
      </div>
      {mobileIssueCover ? (
        <div className="weekly-mobile-cover">
          <img
            src={mobileIssueCover}
            alt={`《见π》NO.${issue} 封面`}
          />
        </div>
      ) : null}
      <header className="weekly-issue-head weekly-frame">
        <nav className="weekly-crumbs" aria-label="面包屑">
          <Link to="/weekly">见π</Link><span>/</span>
          {isIssueIndex ? (
            <b>NO.{issue}</b>
          ) : (
            <><Link to={issuePath}>NO.{issue}</Link><span>/</span><b>文章</b></>
          )}
        </nav>
        <div className="weekly-issue-series">
          <strong>NO.{issue}</strong>
          <span>{weeklyDateLabel(doc.date)} · {isIssueIndex ? "本期编辑索引" : "见π文章"}</span>
        </div>
        <h1>{weeklyDisplayTitle(doc)}</h1>
        <div className="weekly-issue-meta">
          <span>{weeklyDateLabel(doc.date)} {isIssueIndex ? "出刊" : "发布"}</span><i aria-hidden="true" />
          {doc.readTime ? <><span>{doc.readTime}</span><i aria-hidden="true" /></> : null}
          <span>{getDocAuthorLabel(doc)}</span>
        </div>
        <p className="weekly-issue-lead">{doc.lead || doc.description}</p>
        <div className="weekly-issue-head-foot">
          {doc.tags?.length ? (
            <div className="weekly-tags" aria-label={isIssueIndex ? "本期主题" : "文章主题"}>
              {doc.tags.slice(0, 6).map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : <span />}
          <ShareButton title={doc.title} text={doc.description} />
        </div>
      </header>

      <div className={`weekly-frame weekly-issue-layout${isIssueIndex ? " weekly-issue-index-layout" : ""}`}>
        <div className="weekly-article">
          <RenderedMarkdown
            html={resolvedHtml}
            className={`markdown blog-markdown ${isIssueIndex ? "weekly-index-markdown" : "weekly-markdown"}`}
          />

          {isIssueIndex ? (
            <nav className="weekly-issue-nav" aria-label="见π期数导航">
              {previousIssue ? (
                <Link to={previousIssue.path}>
                  <span className="dir">← 上一期</span>
                  <span className="to">NO.{String(weeklyIssueNumber(previousIssue)).padStart(3, "0")} · {weeklyDisplayTitle(previousIssue)}</span>
                </Link>
              ) : (
                <span className="disabled">
                  <span className="dir">上一期</span>
                  <span className="to">这是目前的第一期</span>
                </span>
              )}
              {nextIssue ? (
                <Link className="next" to={nextIssue.path}>
                  <span className="dir">下一期 →</span>
                  <span className="to">NO.{String(weeklyIssueNumber(nextIssue)).padStart(3, "0")} · {weeklyDisplayTitle(nextIssue)}</span>
                </Link>
              ) : (
                <Link className="next" to="/weekly">
                  <span className="dir">索引 →</span>
                  <span className="to">返回全部期数</span>
                </Link>
              )}
            </nav>
          ) : (
            <nav className="weekly-detail-nav" aria-label="见π文章导航">
              <Link to={issuePath}>
                <span className="dir">← 返回本期</span>
                <span className="to">NO.{issue} · {issueIndex ? weeklyDisplayTitle(issueIndex) : "见π"}</span>
              </Link>
              <Link className="next" to="/weekly">
                <span className="dir">历期索引 →</span>
                <span className="to">查看全部见π</span>
              </Link>
            </nav>
          )}
        </div>

        {doc.headings.length ? (
          <aside className="weekly-aside" aria-label={isIssueIndex ? "本期目录" : "文章目录"}>
            <span className="weekly-toc-label">{isIssueIndex ? "本期目录" : "文章目录"}</span>
            <nav aria-label={isIssueIndex ? "本期栏目" : "文章章节"}>
              <WeeklyTocLinks headings={doc.headings} activeId={activeHeading} />
            </nav>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
