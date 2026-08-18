import { blogPosts } from "../content";
import { siteHref } from "../lib/site-path";

export function BlogsPage() {
  return (
    <div className="wrap page-frame">
      <header className="page-header"><span className="eyebrow">BLOGS</span><h1>博客</h1><p>完成度相对高一些的文章，会留在这里。</p></header>
      {blogPosts.length ? <div className="post-list">{blogPosts.map((post) => <a className="post-row" href={siteHref(post.path)} key={post.path}><span>{post.group}</span><div><h3>{post.title}</h3><p>{post.description}</p></div><time>{post.date}</time></a>)}</div> : <div className="empty-state"><strong>还没有迁入文章。</strong><p>BR002 只把新站站起来，13 篇历史博客会在后续任务保持原 URL 迁入。</p></div>}
    </div>
  );
}
