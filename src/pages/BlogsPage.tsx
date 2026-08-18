import { blogPosts } from "../content";
import { authorDisplayLine, groupDisplayName } from "../content/tomz-docs-adapter";
import { siteHref } from "../lib/site-path";

export function BlogsPage() {
  return (
    <div className="wrap page-frame">
      <header className="page-header"><span className="eyebrow">BLOGS</span><h1>博客</h1><p>完成度相对高一些的文章，会留在这里。</p></header>
      {blogPosts.length ? <div className="post-list">{blogPosts.map((post) => <a className="post-row" href={siteHref(post.path)} key={post.path}><span>{groupDisplayName(post.group)}</span><div><h3>{post.title}</h3><p>{post.description}</p><p>{[authorDisplayLine(post), post.readTime].filter(Boolean).join(" · ")}</p></div><time>{post.date}</time></a>)}</div> : <div className="empty-state"><strong>还没有迁入文章。</strong><p>历史文章会保持原有 /blogs/... URL 迁入。</p></div>}
    </div>
  );
}
