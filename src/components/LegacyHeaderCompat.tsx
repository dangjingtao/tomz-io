import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ChevronDown, Menu, Share2, X } from "lucide-react";
import { useLocation } from "react-router-dom";

type ThemeName = "claude" | "apple" | "supabase";
type NavItem = { label: string; href: string };

const themeOptions: { name: ThemeName; label: string }[] = [
  { name: "claude", label: "Claude" },
  { name: "apple", label: "Apple" },
  { name: "supabase", label: "Supabase" },
];

const projectLinks: NavItem[] = [
  { label: "UIChat", href: "https://docs.uichat.tomz.io/" },
  { label: "open-proxy-apis", href: "https://github.com/dangjingtao/open-proxy-apis" },
  { label: "local-rerank", href: "https://github.com/dangjingtao/local-rerank" },
  { label: "typora-r2", href: "https://github.com/dangjingtao/typora-r2" },
];

function currentTheme(): ThemeName {
  const value = document.documentElement.dataset.theme;
  return value === "apple" || value === "supabase" ? value : "claude";
}

export default function LegacyHeaderCompat() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState<"projects" | "theme" | null>(null);
  const [navRight, setNavRight] = useState<HTMLElement | null>(null);
  const [navRoot, setNavRoot] = useState<HTMLElement | null>(null);
  const [menuRoot, setMenuRoot] = useState<HTMLElement | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [hasDocShare, setHasDocShare] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>(() =>
    typeof document === "undefined" ? "claude" : currentTheme(),
  );
  const [darkMode, setDarkMode] = useState(() =>
    typeof document === "undefined"
      ? false
      : document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".top-nav");
    const menu = nav?.querySelector<HTMLElement>(".menu") ?? null;
    setNavRoot(nav);
    setMenuRoot(menu);
    setNavRight(nav?.querySelector<HTMLElement>(".nav-right") ?? null);
    setNavItems(
      Array.from(menu?.querySelectorAll<HTMLAnchorElement>(":scope > li > a") ?? []).map(
        (anchor) => ({
          label: anchor.textContent?.trim() || "",
          href: anchor.getAttribute("href") || "/",
        }),
      ),
    );
    setHasDocShare(Boolean(document.querySelector(".doc-title-block > .share-button")));
    setMobileOpen(false);
    setDesktopOpen(null);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      setThemeName(currentTheme());
      setDarkMode(root.classList.contains("dark"));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  const openSearch = () => {
    document.querySelector<HTMLButtonElement>(".top-nav .site-search")?.click();
    setMobileOpen(false);
  };

  const toggleDarkMode = () => {
    document.querySelector<HTMLButtonElement>(".top-nav .theme-toggle")?.click();
  };

  const triggerShare = () => {
    document.querySelector<HTMLButtonElement>(".doc-title-block > .share-button")?.click();
  };

  const selectTheme = (theme: ThemeName) => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("mira-color-theme", theme);
    setThemeName(theme);
    setDesktopOpen(null);
  };

  const desktopMenus = menuRoot
    ? createPortal(
        <>
          <li
            className={`menu-dropdown${desktopOpen === "projects" ? " open" : ""}`}
            onMouseEnter={() => setDesktopOpen("projects")}
            onMouseLeave={() => setDesktopOpen(null)}
          >
            <button
              type="button"
              className="menu-dropdown-trigger"
              aria-expanded={desktopOpen === "projects"}
              onClick={() =>
                setDesktopOpen((value) => (value === "projects" ? null : "projects"))
              }
            >
              项目
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <div className="menu-dropdown-panel">
              {projectLinks.map((item) => (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                  {item.label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          </li>
          <li
            className={`menu-dropdown${desktopOpen === "theme" ? " open" : ""}`}
            onMouseEnter={() => setDesktopOpen("theme")}
            onMouseLeave={() => setDesktopOpen(null)}
          >
            <button
              type="button"
              className="menu-dropdown-trigger"
              aria-expanded={desktopOpen === "theme"}
              onClick={() =>
                setDesktopOpen((value) => (value === "theme" ? null : "theme"))
              }
            >
              主题
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <div className="menu-dropdown-panel theme-menu-panel">
              {themeOptions.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  className={`theme-menu-option${theme.name === themeName ? " active" : ""}`}
                  aria-pressed={theme.name === themeName}
                  onClick={() => selectTheme(theme.name)}
                >
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </li>
        </>,
        menuRoot,
      )
    : null;

  const mobileControls = navRight
    ? createPortal(
        <>
          {hasDocShare ? (
            <div className="mobile-doc-share">
              <button type="button" className="share-button" onClick={triggerShare} aria-label="分享页面">
                <Share2 size={16} aria-hidden="true" />
                <span>分享</span>
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={mobileOpen ? "关闭导航" : "打开导航"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </>,
        navRight,
      )
    : null;

  const mobilePanel = mobileOpen && navRoot
    ? createPortal(
        <div className="mobile-header-panel">
          <div className="mobile-header-links">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="mobile-header-group">
              <strong>项目</strong>
              {projectLinks.map((item) => (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                  {item.label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mobile-header-actions">
            <button type="button" onClick={openSearch}>搜索</button>
            <button type="button" onClick={toggleDarkMode}>
              {darkMode ? "浅色模式" : "暗黑模式"}
            </button>
          </div>
          <div className="mobile-theme-picker">
            <strong>主题</strong>
            <div>
              {themeOptions.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  className={theme.name === themeName ? "active" : ""}
                  aria-pressed={theme.name === themeName}
                  onClick={() => selectTheme(theme.name)}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>,
        navRoot,
      )
    : null;

  return <>{desktopMenus}{mobileControls}{mobilePanel}</>;
}
