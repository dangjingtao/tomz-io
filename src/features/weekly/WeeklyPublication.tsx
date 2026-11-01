import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { allDocs } from "../../content/mira-docs-adapter";
import type { SiteArea } from "../../types/site";
import { renderMarkdown } from "../../utils/markdown";
import { WeeklyIssuePage, WeeklyListPage } from "./WeeklyPages";
import { weeklyDisplayTitle } from "./weekly-utils";

/**
 * The only /weekly route entry point. Reuse the same magazine pages for
 * issue index, article, and archive rather than maintaining a second renderer.
 */
const weeklyArea: SiteArea = {
  key: "weekly",
  title: "见π",
  description: "每周一期的编辑精选",
  docs: allDocs.filter((doc) => doc.root === "weekly"),
  path: "/weekly",
  href: "/weekly",
};

export default function WeeklyPublication() {
  const location = useLocation();
  const doc = allDocs.find(
    (item) => item.root === "weekly" && item.path === location.pathname,
  );
  const html = useMemo(
    () => (doc ? renderMarkdown(doc.source) : ""),
    [doc?.source],
  );

  useEffect(() => {
    document.title = `${doc ? weeklyDisplayTitle(doc) : "见π"} · Tomz.io`;
  }, [doc?.path]);

  return (
    <div className="weekly-app">
      {location.pathname === "/weekly" ? (
        <WeeklyListPage area={weeklyArea} />
      ) : doc ? (
        <WeeklyIssuePage doc={doc} html={html} />
      ) : (
        <main className="weekly-frame weekly-empty">
          <p>这一页还没有出刊。</p>
          <Link to="/weekly">← 返回见π</Link>
        </main>
      )}
    </div>
  );
}
