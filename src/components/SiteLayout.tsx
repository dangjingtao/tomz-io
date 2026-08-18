import { NavLink, Outlet } from "react-router-dom";
import { navigation } from "../site";

export function SiteLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="wrap header-inner">
          <NavLink className="wordmark" to="/" aria-label="Tomz Dang 首页">
            <span className="wordmark-dot" aria-hidden="true" />
            Tomz Dang
          </NavLink>
          <nav className="primary-nav" aria-label="一级导航">
            {navigation.map((item) => (
              <NavLink key={item.href} to={item.href} end={item.href === "/"} className={({ isActive }) => isActive ? "nav-link is-active" : "nav-link"}>
                {item.label}
              </NavLink>
            ))}
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
