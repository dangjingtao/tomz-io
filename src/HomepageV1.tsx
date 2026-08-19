import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { Link } from "react-router-dom";
import { allDocs, compareBlogDocs } from "./content/mira-docs-adapter";
import { homeRecentSnapshot, type HomeRecentItem } from "./content/home-recent.generated";

type ThemeName = "claude" | "apple" | "supabase";

const themeOptions: { name: ThemeName; label: string }[] = [
  { name: "claude", label: "Claude" },
  { name: "apple", label: "Apple" },
  { name: "supabase", label: "Supabase" },
];

const projects = [
  { label: "UIChat Mira", href: "https://docs.uichat.tomz.io/" },
  { label: "open-proxy-apis", href: "https://github.com/dangjingtao/open-proxy-apis" },
  { label: "local-rerank", href: "https://github.com/dangjingtao/local-rerank" },
  { label: "typora-r2", href: "https://github.com/dangjingtao/typora-r2" },
] as const;

const longTermQuestions = [
  "AI 如何真正进入人的日常生活。",
  "一个产品为什么会让人愿意留下。",
  "设计如何改变人与技术之间的关系。",
  "工作、创造和生活，怎样才能长期共存。",
] as const;

function useHomepageTheme() {
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
    document.documentElement.dataset.theme = themeName;
    window.localStorage.setItem("mira-color-theme", themeName);
  }, [themeName]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("mira-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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
          <span className="home-v1-brand-mark" aria-hidden="true">T</span>
          <span>Tomz Dang</span>
        </Link>

        <div className="home-v1-nav-links">
          <Link to="/blogs">博客</Link>
          <Link to="/works">作品</Link>
          <details className="home-v1-nav-menu">
            <summary>项目</summary>
            <div className="home-v1-nav-popover">
              {projects.map((project) => (
                <a key={project.href} href={project.href} target="_blank" rel="noreferrer">
                  <span>{project.label}</span>
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          </details>
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
          <div className="home-v1-mobile-group">
            <strong>项目</strong>
            {projects.map((project) => (
              <a key={project.href} href={project.href} target="_blank" rel="noreferrer">
                {project.label}
              </a>
            ))}
          </div>
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

export default function HomepageV1({ showHeader = true }: { showHeader?: boolean } = {}) {
  const { themeName, setThemeName, darkMode, setDarkMode } = useHomepageTheme();
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
          onToggleDark={() => setDarkMode((value) => !value)}
          themeName={themeName}
          onTheme={setThemeName}
        />
      ) : null}

      <main>
        <header className="home-v1-hero">
          <div className="wrap home-v1-hero-inner">
            <div className="home-v1-hero-copy">
              <span className="home-v1-kicker">INDEPENDENT DEVELOPER / PRODUCT DESIGNER</span>
              <h1>Tomz Dang</h1>
              <p>
                我是 Tomz，一名独立开发者和产品设计师。这里记录我正在做的产品，以及关于 AI、产品和人的一些思考。
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
            <div className="home-v1-hero-note" aria-label="关于这个网站">
              <span>tomz.io</span>
              <p>不是某一个项目的官网。它更像一个长期生长的个人入口：现在在做什么，过去留下什么，以及那些还没完全想明白的东西。</p>
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
              <p>从公开的项目、写作与生活记录里挑三件最能代表当下的事，由 AI 归纳；生成失败时继续使用最近一次可靠快照。</p>
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
              <p className="home-v1-about-note">这个网站只是我持续留下答案变化的地方。</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-v1-footer">
        <div className="wrap home-v1-footer-inner">
          <div>
            <strong>Tomz Dang</strong>
            <span>Independent Developer &amp; Product Designer</span>
          </div>
          <div className="home-v1-footer-links">
            <Link to="/blogs">Blog</Link>
            <a href="https://github.com/dangjingtao" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
