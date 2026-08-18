import { Section } from "../components/Section";
import { blogPosts } from "../content";
import { groupDisplayName } from "../content/tomz-docs-adapter";
import { siteHref } from "../lib/site-path";
import { collaborations, currentThoughts, projects } from "../site";

export function HomePage() {
  const recentPosts = blogPosts.slice(0, 4);

  return (
    <div className="wrap home-page">
      <section className="author-hero">
        <div className="hero-copy">
          <span className="eyebrow">AUTHOR · BUILDER · NOTES</span>
          <h1>Tomz Dang</h1>
          <p className="hero-lede">写产品，也写技术；和 Mira 一起把一些想法做成东西，再把做过的判断留下来。</p>
          <p className="hero-note">这里是我的个人主站。项目会从这里经过，但这里首先住的是人、文章和还没想完的问题。</p>
        </div>
        <div className="orbit-mark" aria-hidden="true">
          <span className="orbit orbit-a" />
          <span className="orbit orbit-b" />
          <span className="orbit-core">T</span>
        </div>
      </section>

      <Section eyebrow="NOW" title="最近在想">
        <ol className="thought-list">
          {currentThoughts.map((thought) => <li key={thought}>{thought}</li>)}
        </ol>
      </Section>

      <Section eyebrow="WRITING" title="最近写下" intro="由迁入后的 MiraDocs 内容按日期排序。">
        {recentPosts.length ? (
          <div className="post-list">
            {recentPosts.map((post) => (
              <a className="post-row" href={siteHref(post.path)} key={post.path}>
                <span>{groupDisplayName(post.group)}</span>
                <div><h3>{post.title}</h3><p>{post.description}</p></div>
                <time>{post.date}</time>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>文章还没有搬进来。</strong>
            <p>历史文章会保持原有 /blogs/... URL 迁入。</p>
          </div>
        )}
      </Section>

      <Section eyebrow="TOGETHER" title="我和 Mira">
        <div className="card-grid three-up">
          {collaborations.map((item) => (
            <a className="quiet-card" href={siteHref(item.href)} key={item.title}>
              <h3>{item.title}</h3><p>{item.description}</p><span>进入 →</span>
            </a>
          ))}
        </div>
      </Section>

      <Section eyebrow="PROJECTS" title="正在做">
        <div className="project-list">
          {projects.map((project) => {
            const content = <><span className="project-meta">{project.meta}</span><h3>{project.name}</h3><p>{project.description}</p><span className="project-link">{project.href ? "查看 →" : "入口准备中"}</span></>;
            return project.href ? <a className="project-row" href={project.href} key={project.name} target="_blank" rel="noreferrer">{content}</a> : <div className="project-row" key={project.name}>{content}</div>;
          })}
        </div>
      </Section>
    </div>
  );
}
