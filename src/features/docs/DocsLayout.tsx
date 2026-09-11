import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { allDocs, type Doc } from "../../content/mira-docs-adapter";
import type { SiteArea } from "../../types/site";
import { decodedPathname } from "../../utils/paths";
import {
  directoryTitle,
  docsByDirectory,
  docsByProjectDirectory,
  isProjectArea,
  projectNavTitle,
} from "./docs-utils";

function AreaDocNav({ area, current }: { area: SiteArea; current: string }) {
  if (isProjectArea(area)) {
    const projects = docsByProjectDirectory(area.docs);
    return (
      <nav className="docnav project-docnav" aria-label="项目">
        <h5>目录</h5>
        <div className="project-nav-groups">
          {projects.map((project) => {
            const overviewPath = project.overview?.path || `/projects/${project.id}`;
            const navTitle = projectNavTitle(project.title);
            return (
              <div className="project-nav-group" key={project.id}>
                <Link
                  className={`project-nav-overview ${current === overviewPath ? "active" : ""}`}
                  to={overviewPath}
                >
                  {navTitle.category && (
                    <span className="project-nav-category">
                      {navTitle.category}
                    </span>
                  )}
                  <span className="project-nav-title">{navTitle.title}</span>
                </Link>
                {project.articles.length ? (
                  <ul className="project-nav-articles">
                    {project.articles.map((article) => (
                      <li key={article.path}>
                        <Link
                          className={current === article.path ? "active" : ""}
                          to={article.path}
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>
    );
  }
  const groups = docsByDirectory(area.docs);
  return (
    <nav className="docnav">
      <h5>目录</h5>
      <div className="docnav-group">
        <h5>
          <Link
            className={current === area.path ? "active" : ""}
            to={area.path}
          >
            {area.title}
          </Link>
        </h5>
      </div>
      {groups.map((group) => (
        <div className="docnav-group" key={group.directory || "root"}>
          <h5>{group.directory ? directoryTitle(group.directory) : "文档"}</h5>
          <ul>
            {group.docs.map((doc) => (
              <li key={doc.path}>
                <Link
                  className={current === doc.path ? "active" : ""}
                  to={doc.path}
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
function MobileDocsBar({
  currentDoc,
  tocOpen,
  onMenu,
  onToc,
}: {
  currentDoc?: Doc;
  tocOpen: boolean;
  onMenu: () => void;
  onToc: () => void;
}) {
  const hasToc = Boolean(currentDoc?.headings.length);
  return (
    <div className="docs-mobile-bar">
      <button type="button" onClick={onMenu} aria-label="打开文档菜单">
        <Menu size={15} aria-hidden="true" />
        菜单
      </button>
      <button
        type="button"
        onClick={onToc}
        disabled={!hasToc}
        aria-expanded={hasToc ? tocOpen : undefined}
        aria-controls={hasToc ? "mobile-page-toc" : undefined}
      >
        页面导航
        {tocOpen ? (
          <ChevronUp size={15} aria-hidden="true" />
        ) : (
          <ChevronDown size={15} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
function MobileDocsDrawer({
  area,
  current,
  onClose,
}: {
  area: SiteArea;
  current: string;
  onClose: () => void;
}) {
  return (
    <div
      className="mobile-docs-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside className="mobile-docs-drawer" aria-label="文档菜单">
        <div className="mobile-docs-drawer-head">
          <span>菜单</span>
          <button type="button" onClick={onClose} aria-label="关闭菜单">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <AreaDocNav area={area} current={current} />
      </aside>
    </div>
  );
}
function MobilePageToc({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  return (
    <div className="mobile-page-toc" id="mobile-page-toc">
      <div className="mobile-page-toc-head">
        <span>页面导航</span>
        <button type="button" onClick={onClose} aria-label="关闭页面导航">
          <X size={17} aria-hidden="true" />
        </button>
      </div>
      <ul>
        {doc.headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} onClick={onClose}>
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
function Toc({ doc, activeHeading }: { doc?: Doc; activeHeading: string }) {
  return doc && doc.headings.length > 0 ? (
    <aside className="toc">
      <h5>本页目录</h5>
      <ul>
        {doc.headings.map((heading) => (
          <li key={heading.id}>
            <a
              className={activeHeading === heading.id ? "active" : ""}
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  ) : null;
}
export default function DocsLayout({ siteAreas }: { siteAreas: SiteArea[] }) {
  const location = useLocation();
  const currentPath = decodedPathname(location.pathname);
  const currentDoc = allDocs.find((item) => item.path === currentPath);
  const currentArea = currentDoc
    ? siteAreas.find((area) => area.key === currentDoc.root)
    : siteAreas.find(
        (area) =>
          currentPath === area.path || currentPath.startsWith(`${area.path}/`),
      );
  const isBlogArea =
    currentArea?.key === "blogs" || currentArea?.key === "submissions";
  const isWeeklyArea = currentArea?.key === "weekly";
  const isEditorialArea = isBlogArea || isWeeklyArea;
  const [activeHeading, setActiveHeading] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileTocOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const nodes = currentDoc?.headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[] | undefined;
    if (!nodes?.length) {
      setActiveHeading("");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: [0, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [currentDoc?.path]);
  return (
    <div
      className={`docs-app${isBlogArea ? " blog-app" : ""}${isWeeklyArea ? " weekly-app" : ""}`}
    >
      {!isEditorialArea && (
        <MobileDocsBar
          currentDoc={currentDoc}
          tocOpen={mobileTocOpen}
          onMenu={() => setMobileMenuOpen(true)}
          onToc={() => setMobileTocOpen((value) => !value)}
        />
      )}
      {mobileMenuOpen && !isEditorialArea && currentArea ? (
        <MobileDocsDrawer
          area={currentArea}
          current={location.pathname}
          onClose={() => setMobileMenuOpen(false)}
        />
      ) : null}
      {mobileTocOpen && currentDoc && !isEditorialArea ? (
        <MobilePageToc
          doc={currentDoc}
          onClose={() => setMobileTocOpen(false)}
        />
      ) : null}
      <div
        className={`docs-shell${isBlogArea ? " blog-shell" : ""}${isWeeklyArea ? " weekly-shell" : ""}`}
      >
        {!isEditorialArea && currentArea ? (
          <AreaDocNav area={currentArea} current={location.pathname} />
        ) : null}
        <main
          className={`doc-main${isBlogArea ? " blog-main" : ""}${isWeeklyArea ? " weekly-main" : ""}`}
        >
          <Outlet />
        </main>
        {!isEditorialArea && <Toc doc={currentDoc} activeHeading={activeHeading} />}
      </div>
    </div>
  );
}
