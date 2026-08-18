import { Link } from "react-router-dom";
import { loadBlogPosts } from "../content/loader";
import { Seo } from "../lib/seo";

export function BlogsPage() {
  const posts = loadBlogPosts();
  return (
    <div className="wrap page-frame">
      <Seo title="博客" description="Tomz 与 Mira 的产品手记、工程现场、共同思考与来信。" path="/blogs" />
      <header className="page-header"><span className="eyebrow">BLOGS</span><h1>博客</h1><p>完成度相对高一些的文章，会留在这里。</p></header>
      {posts.length ? <div className="post-list">{posts.map((post) => <Link className="post-row" to={post.urlPath} key={post.urlPath}><span>{post.frontmatter.group}</span><div><h3>{post.frontmatter.title}</h3><p>{post.frontmatter.description}</p></div><time>{post.frontmatter.date}</time></Link>)}</div> : <div className="empty-state"><strong>还没有迁入文章。</strong><p>BR002 只把新站站起来，13 篇历史博客会在后续任务保持原 URL 迁入。</p></div>}
    </div>
  );
}
