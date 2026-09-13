import { Link } from "react-router-dom";
import RenderedMarkdown from "../../components/RenderedMarkdown";
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
} from "./weekly-utils";

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
  const watchTopics = [
    "Agent / AI",
    "开源项目",
    "产品与工具",
    "中国开发者现场",
    "商业与分发",
    "研究与值得读",
    "历史 / 制度",
    "异常信号",
    "鬼集",
  ];

  if (!latest) return null;

  const latestCover = latest.cover?.trim() ? resolveCoverSource(latest) : "";

  return (
    <div className="weekly-index-page">
      <header className="weekly-masthead weekly-frame">
        <p className="weekly-eyebrow">TOMZ.IO 一级内容产品 · 每周一出刊</p>
        <h1>见π</h1>
        <p className="weekly-masthead-statement">
          不是把这一周发生的东西都搬进来，而是留下这一周值得继续看的东西。
        </p>
        <p className="weekly-masthead-desc">
          Tomz 与 Mira 持续观察外部世界，从技术、产品、开源、商业、研究、历史与异常信息中筛选、聚类与判断，最终形成一期一期经过编辑的内容产品。
        </p>
        <div className="weekly-masthead-meta">
          <span>永久期号</span><i aria-hidden="true" />
          <span>一期一次编辑</span><i aria-hidden="true" />
          <span>Tomz × Mira</span>
        </div>
        <div className="weekly-scope" aria-label="见π长期观察范围">
          {watchTopics.map((topic) => <span key={topic}>{topic}</span>)}
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

  return (
    <article className={`weekly-issue-page${isIssueIndex ? " is-index" : " is-detail"}`}>
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
          {!isIssueIndex && doc.headings.length ? (
            <details className="weekly-mobile-toc">
              <summary>文章目录 · {doc.headings.length} 节</summary>
              <nav>
                {doc.headings.map((heading, index) => (
                  <a href={`#${heading.id}`} key={heading.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>{heading.text}
                  </a>
                ))}
              </nav>
            </details>
          ) : null}

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

        {!isIssueIndex && doc.headings.length ? (
          <aside className="weekly-aside">
            <span className="weekly-toc-label">文章目录</span>
            <nav>
              {doc.headings.map((heading, index) => (
                <a href={`#${heading.id}`} key={heading.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{heading.text}
                </a>
              ))}
            </nav>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
