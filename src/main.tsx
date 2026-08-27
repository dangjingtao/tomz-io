import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import {registerSW} from "virtual:pwa-register";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import App from "./App";
import { HomepageFooter } from "./HomepageV1";
import LegacyHeaderCompat from "./components/LegacyHeaderCompat";
import { getBook, getBookEntry } from "./content/bookshelf";
import BookshelfHub from "./features/bookshelf/BookshelfHub";
import WorksExperience from "./features/works/WorksExperience";
import "./claude.theme.css";
import "./apple.theme.css";
import "./Supabase.theme.css";
import "./tailwind.css";
import "./styles.css";
import "./homepage-v1.css";
import "./blog-list.css";
import "./markdown.css";
import "./blog-detail.css";
import "./claude-visual.css";
import "./features/works/works-experience.css";
import "./features/works/works-sprite.css";
import "./features/works/works-route-fixes.css";

const themeKey = "mira-color-theme";
const defaultTheme = "claude";
const savedTheme =
  typeof window !== "undefined" ? window.localStorage.getItem(themeKey) : null;
const initialTheme =
  savedTheme === "claude" || savedTheme === "apple" || savedTheme === "supabase"
    ? savedTheme
    : defaultTheme;

// Keep the deployment root aligned with BrowserRouter's basename. GitHub Pages
// mounts the app at /tomz-io/; stripping that final slash makes the basename
// fail to match and React renders an empty shell.
const buildBase = import.meta.env.BASE_URL;
const normalizedBuildBase = buildBase === "/" ? "/" : buildBase.replace(/\/+$/, "");

if (normalizedBuildBase !== "/" && window.location.pathname === normalizedBuildBase) {
  window.history.replaceState(
    null,
    "",
    `${normalizedBuildBase}/${window.location.search}${window.location.hash}`,
  );
} else {
  const isDeploymentRoot =
    window.location.pathname === "/" ||
    (normalizedBuildBase !== "/" && window.location.pathname === `${normalizedBuildBase}/`);

  if (!isDeploymentRoot && window.location.pathname.endsWith("/")) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname.replace(/\/+$/, "")}${window.location.search}${window.location.hash}`,
    );
  }
}

document.documentElement.dataset.theme = initialTheme;

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new Event("mira:pwa-update-available"));
  },
});

window.addEventListener("mira:pwa-update-confirmed", () => {
  void updateSW();
});

function AppEntry() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments[0] === "books") {
    if (segments.length === 1) {
      return (
        <>
          <BookshelfHub />
          <HomepageFooter />
        </>
      );
    }

    const bookId = segments[1];
    const book = getBook(bookId);
    if (book && segments.length === 2) {
      return (
        <>
          <BookshelfHub bookId={bookId} />
          <HomepageFooter />
        </>
      );
    }

    const entrySlug = segments[2];
    if (book && entrySlug && segments.length === 3 && getBookEntry(bookId, entrySlug)) {
      return (
        <>
          <BookshelfHub bookId={bookId} entrySlug={entrySlug} />
          <HomepageFooter />
        </>
      );
    }
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={buildBase}>
      <AppEntry />
      <LegacyHeaderCompat />
      <WorksExperience />
    </BrowserRouter>
  </React.StrictMode>,
);
