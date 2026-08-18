import { renderMiraMarkdown } from "@uichat-mira/docs";
import type { TomzDoc } from "../content/tomz-docs-adapter";
import { authorDisplayLine, groupDisplayName } from "../content/tomz-docs-adapter";

export function ArticlePage({ doc }: { doc: TomzDoc }) {
  const authors = authorDisplayLine(doc);
  const html = renderMiraMarkdown(doc.body, { removeH1: true });

  return (
    <div className="wrap page-frame reading-copy blog-post-page">
      <article className="article-header">
        <span className="eyebrow">{groupDisplayName(doc.group)}</span>
        <h1>{doc.title}</h1>
        {doc.description ? <p>{doc.description}</p> : null}
        <div className="post-meta post-meta-article">
          {[authors, doc.date, doc.readTime].filter(Boolean).map((item) => <span key={String(item)}>{item}</span>)}
        </div>
      </article>
      <article className="markdown blog-markdown" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
