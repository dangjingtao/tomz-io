import { useEffect, useMemo, useState } from "react";
import NotFoundPage from "./components/NotFoundPage";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";
import RenderedMarkdown from "./components/RenderedMarkdown";
import SearchOverlay from "./components/SearchOverlay";
import ShareButton from "./components/ShareButton";
import SiteHeader from "./components/SiteHeader";
import { allDocs, compareDocs } from "./content/mira-docs-adapter";
import {
  blogNavCategories,
  githubUrl,
  siteAreas,
  siteNav,
  siteTitle,
  tomzMarkSrc,
} from "./content/site-model";
import { bookEntries, books } from "./content/bookshelf";
import AboutPage from "./features/about/AboutPage";
import BookshelfHub from "./features/bookshelf/BookshelfHub";
import { BlogListPage, BlogPostPage } from "./features/blog/BlogPages";
import DocsLayout from "./features/docs/DocsLayout";
import {
  directoryTitle,
  docsByDirectory,
  docsByProjectDirectory,
  isProjectArea,
  projectIdFromPath,
} from "./features/docs/docs-utils";
import { WeeklyIssuePage, WeeklyListPage } from "./features/weekly/WeeklyPages";
import { weeklyIssueNumber } from "./features/weekly/weekly-utils";
import HomepageV1, { HomepageFooter } from "./HomepageV1";
import { FileQuestion } from "lucide-react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import type { SiteArea, ThemeName } from "./types/site";
import { renderMarkdown } from "./utils/markdown";
import { getPageTitle } from "./utils/page-title";
import { appBase } from "./utils/paths";

const themeOptions: { name: ThemeName; label: string }[] = [
  { name: "claude", label: "Claude" },
  { name: "apple", label: "Apple" },
  { name: "supabase", label: "Supabase" },
];
function RoutedApp() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [themeName] = useState<ThemeName>(() => {
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    document.title = `${getPageTitle(location.pathname, allDocs, siteAreas)} · ${siteTitle}`;
  }, [location.pathname]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const openSearch = () => {
    setQuery("");
    setSearchOpen(true);
  };
  const closeSearch = () => setSearchOpen(false);
  const toggleTheme = () => setDarkMode((value) => !value);
  const navIsWide = location.pathname !== "/";
  return (
    <>
      <SiteHeader
        nav={siteNav}
        blogNavCategories={blogNavCategories}
        githubUrl={githubUrl}
        tomzMarkSrc={tomzMarkSrc}
        appBase={appBase}
        onSearch={openSearch}
        onToggleTheme={toggleTheme}
        darkMode={darkMode}
        wide={navIsWide}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomepageV1 darkMode={darkMode} />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/books" element={<BookshelfHub />} />
        {books.map((book) => (
          <Route
            key={`book-${book.id}`}
            path={`/books/${book.id}`}
            element={<BookshelfHub bookId={book.id} />}
          />
        ))}
        {books.flatMap((book) =>
          bookEntries(book.id).map((entry) => {
            const entrySlug = entry.path.split("/").filter(Boolean)[2];
            return (
              <Route
                key={entry.path}
                path={entry.path}
                element={<BookshelfHub bookId={book.id} entrySlug={entrySlug} />}
              />
            );
          }),
        )}
        <Route element={<DocsLayout siteAreas={siteAreas} />}>
          {siteAreas.filter((area) => area.key !== "books").map((area) => (
            <Route
              key={area.key}
              path={`/${area.key}`}
              element={<AreaPage area={area} />}
            />
          ))}
          {allDocs.filter((doc) => doc.root !== "books").map((doc) => (
              <Route
                key={doc.path}
                path={doc.path}
                element={<DocPage path={doc.path} />}
              />
            ))}
        </Route>
        <Route path="*" element={<NotFoundPage onSearch={openSearch} />} />
      </Routes>
      <HomepageFooter />
      {searchOpen && (
        <SearchOverlay
          query={query}
          setQuery={setQuery}
          onClose={closeSearch}
        />
      )}
      <PwaUpdatePrompt />
    </>
  );
}

export default function App() {
  return <RoutedApp />;
}



function AreaPage({ area }: { area: SiteArea }) {
  if (!area.docs.length)
    return (
      <div className="doc-not-found">
        <FileQuestion size={42} strokeWidth={1.5} aria-hidden="true" />
        <div className="doc-eyebrow">404 · EMPTY SECTION</div>
        <h1>页面不存在</h1>
        <p>这个目录已经创建，但还没有可展示的文档内容。</p>
        <Link className="btn btn-secondary" to="/">
          返回首页
        </Link>
      </div>
    );
  if (area.key === "blogs") return <BlogListPage area={area} />;
  if (area.key === "weekly") return <WeeklyListPage area={area} />;
  if (area.key === "submissions") {
    const landing = area.docs.find((doc) => doc.path === area.path) || area.docs[0];
    return <BlogPostPage doc={landing} />;
  }
  if (isProjectArea(area)) {
    const projects = docsByProjectDirectory(area.docs);
    return (
      <>
        <div className="doc-eyebrow">SECTION · PROJECTS</div>
        <div className="doc-title-block">
          <h1>{area.title}</h1>
          {area.description ? (
            <p className="doc-lede">{area.description}</p>
          ) : null}
        </div>
        <div className="area-directory-groups project-area-groups">
          {projects.map((project) => (
            <section className="area-directory-group" key={project.id}>
              <h4>
                <Link to={project.overview?.path || `/projects/${project.id}`}>
                  {project.title}
                </Link>
              </h4>
              {project.overview?.description ? (
                <p>{project.overview.description}</p>
              ) : null}
              {project.articles.length ? (
                <ol>
                  {project.articles.map((article) => (
                    <li key={article.path}>
                      <Link to={article.path}>
                        {article.title}
                        <span>→</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}
        </div>
      </>
    );
  }
  const directoryGroups = docsByDirectory(area.docs);
  return (
    <>
      <div className="doc-eyebrow">SECTION · {area.key.toUpperCase()}</div>
      <div className="doc-title-block">
        <h1>{area.title}</h1>
        {area.description ? (
          <p className="doc-lede">{area.description}</p>
        ) : null}
      </div>
      <div className="docs-sitemap-grid">
        <section className="area-overview-card">
          <div className="area-directory-groups">
            {directoryGroups.map((group) => {
              const firstDoc = group.docs[0];
              return (
                <div
                  className="area-directory-group"
                  key={group.directory || "root"}
                >
                  <h4>
                    {group.directory
                      ? directoryTitle(group.directory)
                      : area.title}
                  </h4>
                  <p>
                    {firstDoc?.description || `${group.docs.length} 篇文档`}
                  </p>
                  <ol>
                    {group.docs.map((doc) => (
                      <li key={doc.path}>
                        <Link to={doc.path}>
                          {doc.title}
                          <span>→</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}



function DocPage({ path }: { path: string }) {
  const doc = allDocs.find((item) => item.path === path) || allDocs[0];
  const projectId = projectIdFromPath(doc.path);
  const scopedArticleDocs = allDocs
    .filter(
      (item) =>
        item.root === doc.root &&
        (!projectId || projectIdFromPath(item.path) === projectId),
    )
    .sort(compareDocs);
  const index = scopedArticleDocs.findIndex((item) => item.path === doc.path);
  const previous = index > 0 ? scopedArticleDocs[index - 1] : undefined;
  const next = index >= 0 ? scopedArticleDocs[index + 1] : undefined;
  const html = useMemo(() => renderMarkdown(doc.source), [doc.source]);
  if (doc.root === "weekly") {
    const weeklyDocs = allDocs
      .filter((item) => item.root === "weekly")
      .sort((left, right) => weeklyIssueNumber(left) - weeklyIssueNumber(right));
    const weeklyIndex = weeklyDocs.findIndex((item) => item.path === doc.path);
    const weeklyPrevious = weeklyIndex > 0 ? weeklyDocs[weeklyIndex - 1] : undefined;
    const weeklyNext =
      weeklyIndex >= 0 && weeklyIndex < weeklyDocs.length - 1
        ? weeklyDocs[weeklyIndex + 1]
        : undefined;
    return (
      <WeeklyIssuePage
        doc={doc}
        html={html}
        previous={weeklyPrevious}
        next={weeklyNext}
      />
    );
  }
  if (doc.root === "blogs" || doc.root === "submissions") {
    return <BlogPostPage doc={doc} previous={previous} next={next} />;
  }
  return (
    <>
      <div className="doc-eyebrow">
        {doc.group} · {String(doc.order).padStart(2, "0")}
      </div>
      <div className="doc-title-block">
        <h1>{doc.title}</h1>
        {doc.description ? <p className="doc-lede">{doc.description}</p> : null}
        <ShareButton title={doc.title} text={doc.description} />
      </div>
      <RenderedMarkdown html={html} />
      <div className="page-nav">
        {previous ? (
          <Link to={previous.path}>
            <span className="dir">上一篇</span>
            <span className="to">← {previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="next" to={next.path}>
            <span className="dir">下一篇</span>
            <span className="to">{next.title} →</span>
          </Link>
        ) : null}
      </div>
    </>
  );
}
