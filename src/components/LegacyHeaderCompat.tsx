import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, Share2, X } from "lucide-react";
import { useLocation } from "react-router-dom";

type NavItem = { label: string; href: string };

export default function LegacyHeaderCompat() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navRight, setNavRight] = useState<HTMLElement | null>(null);
  const [navRoot, setNavRoot] = useState<HTMLElement | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [hasDocShare, setHasDocShare] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    typeof document === "undefined"
      ? false
      : document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".top-nav");
    const menu = nav?.querySelector<HTMLElement>(".menu") ?? null;
    setNavRoot(nav);
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
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
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
          </div>
          <div className="mobile-header-actions">
            <button type="button" onClick={openSearch}>搜索</button>
            <button type="button" onClick={toggleDarkMode}>
              {darkMode ? "浅色模式" : "暗黑模式"}
            </button>
          </div>
        </div>,
        navRoot,
      )
    : null;

  return <>{mobileControls}{mobilePanel}</>;
}
