import { useEffect, useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { allDocs, compareBlogDocs } from "./content/mira-docs-adapter";
import { homeFocusSnapshot } from "./content/home-focus.generated";
import { homeRecentSnapshot, type HomeRecentItem } from "./content/home-recent.generated";
import { MobileHeroGalaxy } from "./components/MobileHeroGalaxy";
import { SitemapGalaxy, type SitemapGalaxyData } from "./components/SitemapGalaxy";
import { githubProfileUrl, homeIntro, siteName } from "./site.config";

const tomzWordmarkSrc = `${import.meta.env.BASE_URL}brand/tomz-wordmark.png`;

const blogGalaxyData: SitemapGalaxyData = (() => {
  const docs = allDocs
    .filter((doc) => doc.root === "blogs" && doc.group !== "归档")
    .sort(compareBlogDocs);
  const groups = new Map<string, typeof docs>();
  docs.forEach((doc) => {
    const group = doc.group || "Blog";
    const current = groups.get(group) || [];
    current.push(doc);
    groups.set(group, current);
  });
  return {
    root: "博客星图",
    sections: [...groups.entries()].map(([title, groupDocs]) => ({
      key: title,
      title,
      description: `${groupDocs.length} 篇文章`,
      path: groupDocs[0]?.path || "/blogs",
      docs: groupDocs.map((doc) => ({
        title: doc.title,
        path: doc.path,
        description: doc.description,
        date: doc.date,
      })),
    })),
  };
})();

export function HomepageFooter() {
  return (
    <footer className="home-v1-footer">
      <div className="wrap home-v1-footer-inner">
        <div className="home-v1-footer-primary">
          <img className="home-v1-footer-logo" src={tomzWordmarkSrc} alt="Tomz.io" />
          <p className="home-v1-footer-built">
            Built with <a href="https://dangjingtao.github.io/mira-docs/">@uichat-mira/docs</a>.
          </p>
        </div>
        <p className="home-v1-footer-copyright">Copyright © 2026 {siteName}</p>
      </div>
    </footer>
  );
}

function RecentItem({ item }: { item: HomeRecentItem }) {
  const content = (
    <>
      <span className="home-v1-recent-kind">{item.kind}</span>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      {item.href ? (
        <span className="home-v1-recent-arrow" aria-hidden="true">
          <ArrowUpRight size={16} strokeWidth={1.7} />
        </span>
      ) : null}
    </>
  );

  if (!item.href) return <article className="home-v1-recent-card">{content}</article>;
  if (/^https?:\/\//i.test(item.href)) {
    return (
      <a className="home-v1-recent-card" href={item.href} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link className="home-v1-recent-card" to={item.href}>
      {content}
    </Link>
  );
}

export default function HomepageV1({ darkMode }: { darkMode: boolean }) {
  const latestWriting = useMemo(
    () =>
      allDocs
        .filter((doc) => doc.root === "blogs" && doc.group !== "归档")
        .sort(compareBlogDocs)
        .slice(0, 4),
    [],
  );

  useEffect(() => {
    document.title = `${siteName} · 独立开发与产品设计`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute(
      "content",
      homeIntro,
    );
  }, []);

  return (
    <div className="home-v1-site">
      <main>
        <header className="home-v1-hero">
          <div className="home-v1-mobile-galaxy" aria-hidden="true">
            <MobileHeroGalaxy data={blogGalaxyData} theme={darkMode ? "dark" : "light"} />
          </div>
          <div className="wrap home-v1-hero-inner">
            <div className="home-v1-hero-copy">
              <span className="home-v1-kicker">TOMZ / NOW BUILDING</span>
              <h1>Tomz.io</h1>
              <p>
                Tomz 的个人母站。作品在这里被索引，思想在这里形成，生活在这里留下痕迹。
              </p>
              <div className="home-v1-hero-actions">
                <Link className="home-v1-primary-action" to="/blogs">
                  阅读最近文章
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <a
                  className="home-v1-secondary-action"
                  href={githubProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>
            <div className="home-v1-hero-galaxy">
              <SitemapGalaxy data={blogGalaxyData} theme={darkMode ? "dark" : "light"} />
            </div>
          </div>
        </header>

        <section className="home-v1-section home-v1-now" aria-labelledby="home-v1-now-title">
          <div className="wrap">
            <div className="home-v1-section-head">
              <div>
                <span className="home-v1-kicker">NOW / 最近</span>
                <h2 id="home-v1-now-title">最近发生的事</h2>
              </div>
            </div>
            <div className="home-v1-recent-grid">
              {homeRecentSnapshot.items.slice(0, 3).map((item) => (
                <RecentItem item={item} key={`${item.kind}-${item.title}`} />
              ))}
            </div>
            <p className="home-v1-generated-at">最近一次摘要 · {homeRecentSnapshot.generatedAt}</p>
          </div>
        </section>

        <section className="home-v1-section home-v1-writing" aria-labelledby="home-v1-writing-title">
          <div className="wrap">
            <div className="home-v1-section-head home-v1-section-head-inline">
              <div>
                <span className="home-v1-kicker">WRITING / 写作</span>
                <h2 id="home-v1-writing-title">最近写了</h2>
              </div>
              <Link className="home-v1-text-link" to="/blogs">查看全部文章 →</Link>
            </div>
            <div className="home-v1-writing-list">
              {latestWriting.map((doc) => (
                <Link className="home-v1-writing-item" to={doc.path} key={doc.path}>
                  <div>
                    <span className="home-v1-writing-meta">
                      {doc.group}{doc.date ? ` · ${doc.date}` : ""}
                    </span>
                    <h3>{doc.title}</h3>
                    {doc.description ? <p>{doc.description}</p> : null}
                  </div>
                  <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-v1-section home-v1-about" aria-labelledby="home-v1-focus-title">
          <div className="wrap home-v1-about-grid">
            <div>
              <span className="home-v1-kicker">FOCUS / 长期关注</span>
              <h2 id="home-v1-focus-title">长期关注</h2>
              <p>一些我会反复回到、并愿意长期追问的问题。</p>
            </div>
            <div className="home-v1-question-list">
              {homeFocusSnapshot.questions.map((question, index) => (
                <div className="home-v1-question" key={question}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{question}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
