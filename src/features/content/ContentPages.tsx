import { useMemo } from "react";
import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import RenderedMarkdown from "../../components/RenderedMarkdown";
import ShareButton from "../../components/ShareButton";
import { allDocs } from "../../content/mira-docs-adapter";
import { buildDocumentContext } from "../../content/document-context";
import type { SiteArea } from "../../types/site";
import { renderMarkdown } from "../../utils/markdown";
import { BlogListPage, BlogPostPage } from "../blog/BlogPages";
import { buildAreaDirectoryModel } from "../docs/area-directory-model";
import { directoryTitle } from "../docs/docs-utils";
import { WeeklyIssuePage, WeeklyListPage } from "../weekly/WeeklyPages";

export function AreaPage({ area }: { area: SiteArea }) {
  if (!area.docs.length)
    return (
      <div className="doc-not-found">
        <FileQuestion size={42} strokeWidth={1.5} aria-hidden="true" />
        <div className="doc-eyebrow">404 · EMPTY SECTION</div>
        <h1>页面不存在</h1>
        <p>这个目录已经创建，但还没有可展示的文档内容。</p>
        <Link className="btn btn-secondary" to="/">
          返回首页
        </Link>
      </div>
    );
  if (area.key === "blogs") return <BlogListPage area={area} />;
  if (area.key === "weekly") return <WeeklyListPage area={area} />;
  if (area.key === "submissions") {
    const landing = area.docs.find((doc) => doc.path === area.path) || area.docs[0];
    return <BlogPostPage doc={landing} />;
  }
  const directoryModel = buildAreaDirectoryModel(area);
  if (directoryModel.kind === "projects") {
    const projects = directoryModel.projects;
    return (
      <>
        <div className="doc-eyebrow">SECTION · PROJECTS</div>
        <div className="doc-title-block">
          <h1>{area.title}</h1>
          {area.description ? (
            <p className="doc-lede">{area.description}</p>
          ) : null}
        </div>
        <div className="area-directory-groups project-area-groups">
          {projects.map((project) => (
            <section className="area-directory-group" key={project.id}>
              <h4>
                <Link to={project.overview?.path || `/projects/${project.id}`}>
                  {project.title}
                </Link>
              </h4>
              {project.overview?.description ? (
                <p>{project.overview.description}</p>
              ) : null}
              {project.articles.length ? (
                <ol>
                  {project.articles.map((article) => (
                    <li key={article.path}>
                      <Link to={article.path}>
                        {article.title}
                        <span>→</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}
        </div>
      </>
    );
  }
  const directoryGroups = directoryModel.groups;
  return (
    <>
      <div className="doc-eyebrow">SECTION · {area.key.toUpperCase()}</div>
      <div className="doc-title-block">
        <h1>{area.title}</h1>
        {area.description ? (
          <p className="doc-lede">{area.description}</p>
        ) : null}
      </div>
      <div className="docs-sitemap-grid">
        <section className="area-overview-card">
          <div className="area-directory-groups">
            {directoryGroups.map((group) => {
              const firstDoc = group.docs[0];
              return (
                <div
                  className="area-directory-group"
                  key={group.directory || "root"}
                >
                  <h4>
                    {group.directory
                      ? directoryTitle(group.directory)
                      : area.title}
                  </h4>
                  <p>
                    {firstDoc?.description || `${group.docs.length} 篇文档`}
                  </p>
                  <ol>
                    {group.docs.map((doc) => (
                      <li key={doc.path}>
                        <Link to={doc.path}>
                          {doc.title}
                          <span>→</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

export function DocPage({ path }: { path: string }) {
  const doc = allDocs.find((item) => item.path === path) || allDocs[0];
  const { previous, next } = buildDocumentContext(doc, allDocs);
  const html = useMemo(() => renderMarkdown(doc.source), [doc.source]);
  if (doc.root === "weekly") {
    return (
      <WeeklyIssuePage
        doc={doc}
        html={html}
        previous={previous}
        next={next}
      />
    );
  }
  if (doc.root === "blogs" || doc.root === "submissions") {
    return <BlogPostPage doc={doc} previous={previous} next={next} />;
  }
  return (
    <>
      <div className="doc-eyebrow">
        {doc.group} · {String(doc.order).padStart(2, "0")}
      </div>
      <div className="doc-title-block">
        <h1>{doc.title}</h1>
        {doc.description ? <p className="doc-lede">{doc.description}</p> : null}
        <ShareButton title={doc.title} text={doc.description} />
      </div>
      <RenderedMarkdown html={html} />
      <div className="page-nav">
        {previous ? (
          <Link to={previous.path}>
            <span className="dir">上一篇</span>
            <span className="to">← {previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="next" to={next.path}>
            <span className="dir">下一篇</span>
            <span className="to">{next.title} →</span>
          </Link>
        ) : null}
      </div>
    </>
  );
}
