import { Outlet, useLocation } from "react-router-dom";
import { siteHref } from "../lib/site-path";
import { navigation } from "../site";

export function SiteLayout() {
  const { pathname } = useLocation();

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="wrap header-inner">
          <a className="wordmark" href={siteHref("/")} aria-label="Tomz Dang 首页">
            <span className="wordmark-dot" aria-hidden="true" />
            Tomz Dang
          </a>
          <nav className="primary-nav" aria-label="一级导航">
            {navigation.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <a key={item.href} href={siteHref(item.href)} className={isActive ? "nav-link is-active" : "nav-link"}>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>Tomz Dang · 写作、思考，以及正在做的事。</p>
          <p>© 2026 Tomz Dang</p>
        </div>
      </footer>
    </div>
  );
}
