import { Link } from "react-router-dom";
import RenderedMarkdown from "../../components/RenderedMarkdown";
import ShareButton from "../../components/ShareButton";
import { compareWeeklyDocs, type Doc } from "../../content/mira-docs-adapter";
import type { SiteArea } from "../../types/site";
import { getDocAuthorLabel } from "../../utils/authors";
import { weeklyDateLabel, weeklyDisplayTitle, weeklyIssueNumber } from "./weekly-utils";

export function WeeklyListPage({ area }: { area: SiteArea }) {
  const issues = [...area.docs].sort(compareWeeklyDocs);
  const latest = issues[0];
  const watchTopics = [
    "Agent / AI",
    "开源项目",
    "产品与工具",
    "中国开发者现场",
    "商业与分发",
    "研究与值得读",
    "异常信号",
    "鬼集",
  ];

  if (!latest) return null;

  return (
    <div className="weekly-index-page">
      <header className="weekly-masthead weekly-frame">
        <p className="weekly-eyebrow">TOMZ.IO 一级内容产品 · 每周一出刊</p>
        <h1>见π</h1>
        <p className="weekly-masthead-statement">
          不是把这一周发生的东西都搬进来，而是留下这一周值得继续看的东西。
        </p>
        <p className="weekly-masthead-desc">
          Tomz 与 Mira 持续观察外部世界，从技术、产品、开源、商业、研究与异常信息中筛选、聚类与判断，最终形成一期一期经过编辑的内容产品。
        </p>
        <div className="weekly-masthead-meta">
          <span>永久期号</span><i aria-hidden="true" />
          <span>一期一篇</span><i aria-hidden="true" />
          <span>Tomz × Mira</span>
        </div>
        <div className="weekly-scope" aria-label="见π长期观察范围">
          {watchTopics.map((topic) => <span key={topic}>{topic}</span>)}
        </div>
      </header>

      <section className="weekly-latest-section">
        <div className="weekly-frame weekly-latest-grid">
          <aside className="weekly-issue-cover">
            <p>永久期号 · PERMANENT NO.</p>
            <strong>{String(weeklyIssueNumber(latest)).padStart(3, "0")}</strong>
            <span>期号只增不复用。每一期都是一个完整的编辑单元。</span>
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
          <span>{issues.length} ISSUE{issues.length === 1 ? "" : "S"} · 自动从正式 Markdown 生成</span>
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
              见π是 Tomz.io 的一级内容产品。博客承载独立文章；见π承载的是“一期”：有永久期号、有这一期的整体判断，也有同一期内部权重不同的多条观察。
            </p>
            <p>
              周更只是当前发布节奏，不是产品名称。Radar 负责找，正式出版仍然经过编辑判断。
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
  previous,
  next,
}: {
  doc: Doc;
  html: string;
  previous?: Doc;
  next?: Doc;
}) {
  const issue = String(weeklyIssueNumber(doc)).padStart(3, "0");

  return (
    <article className="weekly-issue-page">
      <header className="weekly-issue-head weekly-frame">
        <nav className="weekly-crumbs" aria-label="面包屑">
          <Link to="/weekly">见π</Link><span>/</span><Link to="/weekly">历期索引</Link><span>/</span><b>NO.{issue}</b>
        </nav>
        <div className="weekly-issue-series">
          <strong>NO.{issue}</strong>
          <span>{weeklyDateLabel(doc.date)} · 见π</span>
        </div>
        <h1>{weeklyDisplayTitle(doc)}</h1>
        <div className="weekly-issue-meta">
          <span>{weeklyDateLabel(doc.date)} 出刊</span><i aria-hidden="true" />
          {doc.readTime ? <><span>{doc.readTime}</span><i aria-hidden="true" /></> : null}
          <span>{getDocAuthorLabel(doc)}</span>
        </div>
        <p className="weekly-issue-lead">{doc.lead || doc.description}</p>
        <div className="weekly-issue-head-foot">
          {doc.tags?.length ? (
            <div className="weekly-tags" aria-label="本期主题">
              {doc.tags.slice(0, 6).map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : <span />}
          <ShareButton title={doc.title} text={doc.description} />
        </div>
      </header>

      <div className="weekly-frame weekly-issue-layout">
        <div className="weekly-article">
          {doc.headings.length ? (
            <details className="weekly-mobile-toc">
              <summary>本期目录 · {doc.headings.length} 章</summary>
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
            html={html}
            className="markdown blog-markdown weekly-markdown"
          />

          <nav className="weekly-issue-nav" aria-label="见π期数导航">
            {previous ? (
              <Link to={previous.path}>
                <span className="dir">← 上一期</span>
                <span className="to">NO.{String(weeklyIssueNumber(previous)).padStart(3, "0")} · {weeklyDisplayTitle(previous)}</span>
              </Link>
            ) : (
              <span className="disabled">
                <span className="dir">上一期</span>
                <span className="to">这是目前的第一期</span>
              </span>
            )}
            {next ? (
              <Link className="next" to={next.path}>
                <span className="dir">下一期 →</span>
                <span className="to">NO.{String(weeklyIssueNumber(next)).padStart(3, "0")} · {weeklyDisplayTitle(next)}</span>
              </Link>
            ) : (
              <Link className="next" to="/weekly">
                <span className="dir">索引 →</span>
                <span className="to">返回全部期数</span>
              </Link>
            )}
          </nav>
        </div>

        {doc.headings.length ? (
          <aside className="weekly-aside">
            <span className="weekly-toc-label">本期目录</span>
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
