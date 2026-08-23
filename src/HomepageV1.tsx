import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { Link } from "react-router-dom";
import { allDocs, compareBlogDocs } from "./content/mira-docs-adapter";
import { homeBookshelfItems, homeProjectItems } from "./content/home-catalog";
import { homeRecentSnapshot, type HomeRecentItem } from "./content/home-recent.generated";
import { SitemapGalaxy, type SitemapGalaxyData } from "./components/SitemapGalaxy";

const tomzMarkSrc = `${import.meta.env.BASE_URL}brand/tomz-mark.png`;
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

type ThemeName = "claude" | "apple" | "supabase";

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
        <p className="home-v1-footer-copyright">Copyright © 2026 Tomz Dang</p>
      </div>
    </footer>
  );
}

const themeOptions: { name: ThemeName; label: string }[] = [
  { name: "claude", label: "Claude" },
  { name: "apple", label: "Apple" },
  { name: "supabase", label: "Supabase" },
];

const longTermQuestions = [
  "AI 如何真正进入人的日常生活。",
  "一个产品为什么会让人愿意留下。",
  "设计如何改变人与技术之间的关系。",
  "工作、创造和生活，怎样才能长期共存。",
] as const;

function useHomepageTheme(syncWithDocument: boolean) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "claude";
    const saved = window.localStorage.getItem("mira-color-theme");
    return themeOptions.some((theme) => theme.name === saved)
      ? (saved as ThemeName)
      : "claude";
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("mira-theme");
    return saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (!syncWithDocument) return;
    document.documentElement.dataset.theme = themeName;
    window.localStorage.setItem("mira-color-theme", themeName);
  }, [syncWithDocument, themeName]);

  useEffect(() => {
    if (!syncWithDocument) return;
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("mira-theme", darkMode ? "dark" : "light");
  }, [darkMode, syncWithDocument]);

  return { themeName, setThemeName, darkMode, setDarkMode };
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

function HomepageHeader({
  darkMode,
  onToggleDark,
  themeName,
  onTheme,
}: {
  darkMode: boolean;
  onToggleDark: () => void;
  themeName: ThemeName;
  onTheme: (theme: ThemeName) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="home-v1-nav" aria-label="主导航">
      <div className="wrap home-v1-nav-inner">
        <Link className="home-v1-brand" to="/" aria-label="Tomz Dang 首页">
          <img className="home-v1-brand-mark" src={tomzMarkSrc} alt="" />
        </Link>

        <div className="home-v1-nav-links">
          <Link to="/blogs">博客</Link>
          <Link to="/works">作品</Link>
          <Link to="/projects">项目</Link>
          <Link to="/books">书架</Link>
          <Link to="/about">关于</Link>
          <details className="home-v1-nav-menu home-v1-theme-menu">
            <summary>主题</summary>
            <div className="home-v1-nav-popover">
              {themeOptions.map((theme) => (
                <button
                  type="button"
                  key={theme.name}
                  className={theme.name === themeName ? "active" : ""}
                  aria-pressed={theme.name === themeName}
                  onClick={() => onTheme(theme.name)}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </details>
        </div>

        <div className="home-v1-nav-actions">
          <button
            type="button"
            className="home-v1-theme-toggle"
            onClick={onToggleDark}
            aria-label={darkMode ? "切换到浅色模式" : "切换到暗黑模式"}
            title={darkMode ? "浅色模式" : "暗黑模式"}
          >
            {darkMode ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
          <a
            className="home-v1-github"
            href="https://github.com/dangjingtao"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="home-v1-mobile-toggle"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "关闭导航" : "打开导航"}
          >
            {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="home-v1-mobile-panel wrap">
          <Link to="/blogs" onClick={() => setMobileOpen(false)}>博客</Link>
          <Link to="/works" onClick={() => setMobileOpen(false)}>作品</Link>
          <Link to="/projects" onClick={() => setMobileOpen(false)}>项目</Link>
          <Link to="/books" onClick={() => setMobileOpen(false)}>书架</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)}>关于</Link>
          <div className="home-v1-mobile-group">
            <strong>主题</strong>
            <div className="home-v1-mobile-themes">
              {themeOptions.map((theme) => (
                <button
                  type="button"
                  key={theme.name}
                  className={theme.name === themeName ? "active" : ""}
                  onClick={() => onTheme(theme.name)}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

export default function HomepageV1({
  showHeader = true,
  darkMode: controlledDarkMode,
  themeName: controlledThemeName,
}: {
  showHeader?: boolean;
  darkMode?: boolean;
  themeName?: ThemeName;
} = {}) {
  const homepageTheme = useHomepageTheme(showHeader);
  const darkMode = controlledDarkMode ?? homepageTheme.darkMode;
  const themeName = controlledThemeName ?? homepageTheme.themeName;
  const latestWriting = useMemo(
    () =>
      allDocs
        .filter((doc) => doc.root === "blogs" && doc.group !== "归档")
        .sort(compareBlogDocs)
        .slice(0, 4),
    [],
  );

  useEffect(() => {
    document.title = "Tomz Dang · 独立开发与产品设计";
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute(
      "content",
      "Tomz Dang 的个人网站。记录独立开发、产品设计，以及关于 AI、产品和人的持续思考。",
    );
  }, []);

  return (
    <div className="home-v1-site">
      {showHeader ? (
        <HomepageHeader
          darkMode={darkMode}
          onToggleDark={() => homepageTheme.setDarkMode((value) => !value)}
          themeName={themeName}
          onTheme={homepageTheme.setThemeName}
        />
      ) : null}

      <main>
        <header className="home-v1-hero">
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
                  href="https://github.com/dangjingtao"
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

        <section className="home-v1-section home-v1-projects" aria-labelledby="home-v1-projects-title">
          <div className="wrap">
            <div className="home-v1-section-head home-v1-section-head-inline">
              <div>
                <span className="home-v1-kicker">PROJECTS / 项目</span>
                <h2 id="home-v1-projects-title">一些还在生长的东西。</h2>
              </div>
              <Link className="home-v1-text-link" to="/projects">查看全部项目 →</Link>
            </div>
            <div className="home-v1-recent-grid">
              {homeProjectItems.slice(0, 3).map((item) => (
                <Link className="home-v1-recent-card" to={item.path} key={item.id}>
                  <span className="home-v1-recent-kind">
                    {item.category} · {item.count > 0 ? `${item.count} 篇记录` : "项目主页"}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="home-v1-generated-at">
                    {item.latest ? `最近 · ${item.latest.title}` : "持续建设中"}
                  </span>
                  <span className="home-v1-recent-arrow" aria-hidden="true">
                    <ArrowUpRight size={16} strokeWidth={1.7} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-v1-section home-v1-bookshelf" aria-labelledby="home-v1-bookshelf-title">
          <div className="wrap">
            <div className="home-v1-section-head home-v1-section-head-inline">
              <div>
                <span className="home-v1-kicker">BOOKSHELF / 书架</span>
                <h2 id="home-v1-bookshelf-title">一些需要慢慢写、慢慢读的东西。</h2>
              </div>
              <Link className="home-v1-text-link" to="/books">进入书架 →</Link>
            </div>
            <div className="home-v1-recent-grid">
              {homeBookshelfItems.slice(0, 3).map((item) => (
                <Link className="home-v1-recent-card" to={item.path} key={item.id}>
                  <span className="home-v1-recent-kind">{item.category} · {item.status}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="home-v1-generated-at">{item.count} 篇</span>
                  <span className="home-v1-recent-arrow" aria-hidden="true">
                    <ArrowUpRight size={16} strokeWidth={1.7} />
                  </span>
                </Link>
              ))}
            </div>
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

        <section className="home-v1-section home-v1-about" aria-labelledby="home-v1-about-title">
          <div className="wrap home-v1-about-grid">
            <div>
              <span className="home-v1-kicker">ABOUT / 长期关注</span>
              <h2 id="home-v1-about-title">我长期关心一些没有标准答案的问题。</h2>
            </div>
            <div className="home-v1-question-list">
              {longTermQuestions.map((question, index) => (
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
