import { useEffect, useState } from "react";
import NotFoundPage from "./components/NotFoundPage";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";
import SearchOverlay from "./components/SearchOverlay";
import SiteHeader from "./components/SiteHeader";
import { allDocs } from "./content/mira-docs-adapter";
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
import { AreaPage, DocPage } from "./features/content/ContentPages";
import DocsLayout from "./features/docs/DocsLayout";
import HomepageV1, { HomepageFooter } from "./HomepageV1";
import { Route, Routes, useLocation } from "react-router-dom";
import type { ThemeName } from "./types/site";
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
        <Route path="/" element={<HomepageV1 darkMode={darkMode} />} />
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
          {siteAreas
            .filter((area) => area.key !== "books")
            .map((area) => (
              <Route
                key={area.key}
                path={`/${area.key}`}
                element={<AreaPage area={area} />}
              />
            ))}
          {allDocs
            .filter((doc) => doc.root !== "books")
            .map((doc) => (
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
