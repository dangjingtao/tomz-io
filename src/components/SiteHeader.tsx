import { useEffect, useRef, useState } from "react";
import {
  Archive,
  BookOpen,
  ChevronDown,
  Code2,
  Compass,
  Lightbulb,
  Menu,
  Moon,
  Network,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { LinkItem } from "../types/site";

export default function SiteHeader({
  nav,
  blogNavCategories,
  githubUrl,
  tomzMarkSrc,
  appBase,
  onSearch,
  onToggleTheme,
  darkMode,
  wide = false,
}: {
  nav: LinkItem[];
  blogNavCategories: { label: string; count: number }[];
  githubUrl: string;
  tomzMarkSrc: string;
  appBase: string;
  onSearch: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  wide?: boolean;
}) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!openMenu) return;
    const closeBlogMenu = (event: PointerEvent | globalThis.KeyboardEvent) => {
      if (event instanceof globalThis.KeyboardEvent && event.key !== "Escape")
        return;
      if (
        event instanceof PointerEvent &&
        navRef.current?.contains(event.target as Node)
      )
        return;
      setOpenMenu(null);
    };
    document.addEventListener("pointerdown", closeBlogMenu);
    document.addEventListener("keydown", closeBlogMenu);
    return () => {
      document.removeEventListener("pointerdown", closeBlogMenu);
      document.removeEventListener("keydown", closeBlogMenu);
    };
  }, [openMenu]);
  const navigationTarget = (href: string) => {
    if (appBase !== "/" && href.startsWith(appBase)) {
      const relative = href.slice(appBase.length).replace(/^\/+/, "");
      return `/${relative}`;
    }
    return href.startsWith("/") ? href : `/${href}`;
  };
  const isActive = (item: LinkItem) => {
    const target = navigationTarget(item.href);
    if (target === "/about") {
      return (
        location.pathname === "/about" ||
        location.pathname === "/submissions" ||
        location.pathname.startsWith("/submissions/")
      );
    }
    return (
      location.pathname === target || location.pathname.startsWith(`${target}/`)
    );
  };
  return (
    <nav ref={navRef} className={`top-nav${wide ? " docs-header" : ""}`}>
      <div className="wrap">
        <Link className="brand" to="/">
          <img className="brand-tomz-mark" src={tomzMarkSrc} alt="" />
        </Link>
        <ul className="menu">
          {nav.map((item) => {
            const active = isActive(item);
            const target = navigationTarget(item.href);
            if (target === "/about") {
              return (
                <li
                  className={`menu-dropdown blog-nav-dropdown${openMenu === "about" ? " open" : ""}`}
                  key={item.href}
                  onMouseEnter={() => setOpenMenu("about")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    className={`menu-dropdown-trigger blog-nav-trigger${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={openMenu === "about"}
                    aria-haspopup="menu"
                    to={target}
                    onClick={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      event.preventDefault();
                      setOpenMenu("about");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setOpenMenu(null);
                    }}
                  >
                    {item.label}
                    <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
                  </Link>
                  <div className="menu-dropdown-panel blog-nav-panel" role="menu">
                    <div className="blog-nav-panel-head">
                      <span>ABOUT TOMZ.IO</span>
                      <strong>关于与参与</strong>
                    </div>
                    <div className="blog-nav-panel-grid">
                      <Link role="menuitem" to="/about" onClick={() => setOpenMenu(null)}>
                        <Compass size={18} aria-hidden="true" />
                        <span>
                          <strong>关于 Tomz.io</strong>
                          <small>Tomz、Mira 与这个站点</small>
                        </span>
                      </Link>
                      <Link role="menuitem" to="/submissions" onClick={() => setOpenMenu(null)}>
                        <BookOpen size={18} aria-hidden="true" />
                        <span>
                          <strong>参与 Tomz.io</strong>
                          <small>投稿方式、署名与编辑规则</small>
                        </span>
                      </Link>
                      <Link
                        role="menuitem"
                        to="/submissions/contributors"
                        onClick={() => setOpenMenu(null)}
                      >
                        <Network size={18} aria-hidden="true" />
                        <span>
                          <strong>客座作者</strong>
                          <small>集中查看作者介绍与已发布文章</small>
                        </span>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            }
            if (target === "/blogs") {
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
                    to={target}
                    onClick={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      event.preventDefault();
                      setOpenMenu("blogs");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setOpenMenu(null);
                    }}
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </Link>
                  <div
                    className="menu-dropdown-panel blog-nav-panel"
                    role="menu"
                  >
                    <div className="blog-nav-panel-head">
                      <span>BLOG GARDEN</span>
                      <strong>
                        &#20174;&#27491;&#22312;&#24605;&#32771;&#30340;&#20027;&#39064;&#36827;&#20837;
                      </strong>
                    </div>
                    <div className="blog-nav-panel-grid">
                      <Link
                        role="menuitem"
                        to="/blogs"
                        onClick={() => setOpenMenu(null)}
                      >
                        <BookOpen size={18} aria-hidden="true" />
                        <span>
                          <strong>&#20840;&#37096;&#25991;&#31456;</strong>
                          <small>
                            {blogNavCategories.reduce(
                              (sum, category) => sum + category.count,
                              0,
                            )}{" "}
                            &#31687;
                          </small>
                        </span>
                      </Link>
                      {blogNavCategories.slice(0, 5).map((category, index) => {
                        const CategoryIcon = [
                          Lightbulb,
                          Sparkles,
                          Code2,
                          BookOpen,
                          Network,
                        ][index % 5];
                        return (
                          <Link
                            role="menuitem"
                            key={category.label}
                            to={{
                              pathname: "/blogs",
                              search: `?category=${encodeURIComponent(category.label)}`,
                            }}
                            onClick={() => setOpenMenu(null)}
                          >
                            <CategoryIcon size={18} aria-hidden="true" />
                            <span>
                              <strong>{category.label}</strong>
                              <small>{category.count} &#31687;</small>
                            </span>
                          </Link>
                        );
                      })}
                      <Link
                        role="menuitem"
                        to={{
                          pathname: "/blogs",
                          search: `?category=${encodeURIComponent("\u5f52\u6863")}`,
                        }}
                        onClick={() => setOpenMenu(null)}
                      >
                        <Archive size={18} aria-hidden="true" />
                        <span>
                          <strong>&#24402;&#26723;</strong>
                          <small>
                            &#25353;&#26102;&#38388;&#27983;&#35272;
                          </small>
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
                  to={target}
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
            onClick={onToggleTheme}
            aria-label={darkMode ? "切换到浅色模式" : "切换到暗黑模式"}
            title={darkMode ? "浅色模式" : "暗黑模式"}
          >
            {darkMode ? (
              <Sun size={17} aria-hidden="true" />
            ) : (
              <Moon size={17} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="site-search inline-flex items-center gap-2 rounded-md border border-hairline bg-canvas px-2.5 font-sans text-[13px] text-muted-soft"
            onClick={onSearch}
          >
            搜索{" "}
            <kbd className="rounded bg-surface-card px-1.5 py-px font-mono text-[10px]">
              Ctrl K
            </kbd>
          </button>
          <a
            className="text-link header-github"
            href={githubUrl}
            aria-label="GitHub"
            title="GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 2.807 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"></path>
            </svg>
          </a>
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={mobileOpen ? "关闭导航" : "打开导航"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div className="mobile-header-panel">
          <div className="mobile-header-links">
            {nav.map((item) => (
              <Link
                key={item.href}
                to={navigationTarget(item.href)}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mobile-header-group">
            <strong>关于 · 更多</strong>
            <Link to="/submissions" onClick={() => setMobileOpen(false)}>
              参与 Tomz.io
            </Link>
            <Link to="/submissions/contributors" onClick={() => setMobileOpen(false)}>
              客座作者
            </Link>
          </div>
          <div className="mobile-header-actions">
            <button
              type="button"
              onClick={() => {
                onSearch();
                setMobileOpen(false);
              }}
            >
              搜索
            </button>
            <button type="button" onClick={onToggleTheme}>
              {darkMode ? "浅色模式" : "暗黑模式"}
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
