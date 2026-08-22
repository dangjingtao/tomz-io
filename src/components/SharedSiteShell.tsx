import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Archive,
  BookOpen,
  ChevronDown,
  Code2,
  Lightbulb,
  Moon,
  Network,
  Sparkles,
  Sun,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { allDocs } from "../content/mira-docs-adapter";

const tomzMarkSrc = `${import.meta.env.BASE_URL}brand/tomz-mark.png`;
const githubUrl = "https://github.com/dangjingtao/uichat-mira";

const navItems = [
  { label: "博客", href: "/blogs" },
  { label: "作品", href: "/works" },
  { label: "项目", href: "/projects" },
  { label: "书架", href: "/books" },
  { label: "关于", href: "/about" },
] as const;

export default function SharedSiteShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const isBooks = location.pathname === "/books" || location.pathname.startsWith("/books/");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() =>
    typeof document === "undefined"
      ? false
      : document.documentElement.classList.contains("dark"),
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const blogCategories = useMemo(() => {
    const groups = new Map<string, number>();
    allDocs
      .filter((doc) => doc.root === "blogs")
      .forEach((doc) => {
        const group = doc.group.trim();
        if (!group || group === "归档") return;
        groups.set(group, (groups.get(group) || 0) + 1);
      });
    return [...groups].map(([label, count]) => ({ label, count }));
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDarkMode(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (openMenu !== "blogs") return;
    const close = (event: PointerEvent | globalThis.KeyboardEvent) => {
      if (event instanceof globalThis.KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof PointerEvent && navRef.current?.contains(event.target as Node)) return;
      setOpenMenu(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!isBooks) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuery("");
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBooks]);

  const openSearch = () => {
    if (!isBooks) {
      const appSearch = document.querySelector<HTMLButtonElement>(
        ".app-under-shared-shell > .top-nav .site-search",
      );
      if (appSearch) {
        appSearch.click();
        return;
      }
    }
    setQuery("");
    setSearchOpen(true);
  };

  const toggleTheme = () => {
    if (!isBooks) {
      const appToggle = document.querySelector<HTMLButtonElement>(
        ".app-under-shared-shell > .top-nav .theme-toggle",
      );
      if (appToggle) {
        appToggle.click();
        return;
      }
    }
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("mira-theme", next ? "dark" : "light");
    setDarkMode(next);
  };

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const searchResults = normalizedQuery
    ? allDocs
        .filter((doc) =>
          [doc.title, doc.description, doc.group, doc.source]
            .filter(Boolean)
            .join("\n")
            .toLocaleLowerCase("zh-CN")
            .includes(normalizedQuery),
        )
        .slice(0, 8)
    : allDocs.filter((doc) => doc.root === "books").slice(0, 8);

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <>
      <nav
        ref={navRef}
        className={`top-nav${location.pathname !== "/" ? " docs-header" : ""}`}
        aria-label="主导航"
      >
        <div className="wrap">
          <Link className="brand" to="/" aria-label="Tomz Dang 首页">
            <img className="brand-tomz-mark" src={tomzMarkSrc} alt="" />
          </Link>
          <ul className="menu">
            {navItems.map((item) => {
              const active = isActive(item.href);
              if (item.href === "/blogs") {
                return (
                  <li
                    className={`menu-dropdown blog-nav-dropdown${openMenu === "blogs" ? " open" : ""}`}
                    key={item.href}
                    onMouseEnter={() => setOpenMenu("blogs")}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <Link
                      className={`menu-dropdown-trigger blog-nav-trigger${active ? " active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      aria-expanded={openMenu === "blogs"}
                      aria-haspopup="menu"
                      to="/blogs"
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault();
                        setOpenMenu("blogs");
                      }}
                    >
                      博客
                      <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
                    </Link>
                    <div className="menu-dropdown-panel blog-nav-panel" role="menu">
                      <div className="blog-nav-panel-head">
                        <span>BLOG GARDEN</span>
                        <strong>从正在思考的主题进入</strong>
                      </div>
                      <div className="blog-nav-panel-grid">
                        <Link role="menuitem" to="/blogs" onClick={() => setOpenMenu(null)}>
                          <BookOpen size={18} aria-hidden="true" />
                          <span>
                            <strong>全部文章</strong>
                            <small>{blogCategories.reduce((sum, category) => sum + category.count, 0)} 篇</small>
                          </span>
                        </Link>
                        {blogCategories.slice(0, 5).map((category, index) => {
                          const CategoryIcon = [Lightbulb, Sparkles, Code2, BookOpen, Network][index % 5];
                          return (
                            <Link
                              role="menuitem"
                              key={category.label}
                              to={{ pathname: "/blogs", search: `?category=${encodeURIComponent(category.label)}` }}
                              onClick={() => setOpenMenu(null)}
                            >
                              <CategoryIcon size={18} aria-hidden="true" />
                              <span>
                                <strong>{category.label}</strong>
                                <small>{category.count} 篇</small>
                              </span>
                            </Link>
                          );
                        })}
                        <Link
                          role="menuitem"
                          to={{ pathname: "/blogs", search: `?category=${encodeURIComponent("归档")}` }}
                          onClick={() => setOpenMenu(null)}
                        >
                          <Archive size={18} aria-hidden="true" />
                          <span>
                            <strong>归档</strong>
                            <small>按时间浏览</small>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link
                    className={active ? "active" : ""}
                    aria-current={active ? "page" : undefined}
                    to={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="nav-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={darkMode ? "切换到浅色模式" : "切换到暗黑模式"}
              title={darkMode ? "浅色模式" : "暗黑模式"}
            >
              {darkMode ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="site-search inline-flex items-center gap-2 rounded-md border border-hairline bg-canvas px-2.5 font-sans text-[13px] text-muted-soft"
              onClick={openSearch}
            >
              搜索{" "}
              <kbd className="rounded bg-surface-card px-1.5 py-px font-mono text-[10px]">Ctrl K</kbd>
            </button>
            <a className="text-link header-github" href={githubUrl} aria-label="GitHub" title="GitHub">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 2.807 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943" />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      {children}

      {isBooks && searchOpen ? (
        <div
          className="search-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSearchOpen(false);
          }}
        >
          <div className="search-dialog" role="dialog" aria-modal="true" aria-label="站内搜索">
            <div className="search-input-wrap">
              <span aria-hidden="true">⌕</span>
              <input
                autoFocus
                className="search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索文档..."
                aria-label="搜索文档"
              />
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>Esc</button>
            </div>
            <div className="search-results" role="listbox" aria-label="搜索结果">
              {searchResults.length ? (
                searchResults.map((doc) => (
                  <Link
                    className="search-result"
                    key={doc.path}
                    to={doc.path}
                    onClick={() => setSearchOpen(false)}
                  >
                    <span className="search-result-title">{doc.title}</span>
                    <span className="search-result-meta">{doc.group} · {doc.description}</span>
                  </Link>
                ))
              ) : (
                <p className="search-empty">没有找到匹配的文档</p>
              )}
            </div>
            <div className="search-footer">
              <span>输入关键词搜索</span>
              <span>Esc 关闭</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
