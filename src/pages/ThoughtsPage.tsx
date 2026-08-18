import { blogPosts } from "../content";
import { authorDisplayLine } from "../content/tomz-docs-adapter";
import { siteHref } from "../lib/site-path";

export function ThoughtsPage() {
  const thoughts = blogPosts.filter((post) => post.group === "共同思考");

  return (
    <div className="wrap page-frame">
      <header className="page-header"><span className="eyebrow">THOUGHTS</span><h1>共用的床</h1><p>还没有定型的想法，以及 Tomz 与 Mira 继续共同思考的地方。</p></header>
      {thoughts.length ? <div className="post-list">{thoughts.map((post) => <a className="post-row" href={siteHref(post.path)} key={post.path}><span>共用的床</span><div><h3>{post.title}</h3><p>{post.description}</p><p>{[authorDisplayLine(post), post.readTime].filter(Boolean).join(" · ")}</p></div><time>{post.date}</time></a>)}</div> : <div className="empty-state"><strong>入口已经留好。</strong><p>共同思考仍保留原有 /blogs/shared-thinking/... 正文地址。</p></div>}
    </div>
  );
}
