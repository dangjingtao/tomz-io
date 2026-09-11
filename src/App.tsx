import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import AuthorSignature from "./components/AuthorSignature";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";
import RenderedMarkdown from "./components/RenderedMarkdown";
import SearchOverlay from "./components/SearchOverlay";
import ShareButton from "./components/ShareButton";
import SiteHeader from "./components/SiteHeader";
import DocsLayout from "./features/docs/DocsLayout";
import { BlogListPage, BlogPostPage } from "./features/blog/BlogPages";
import { WeeklyIssuePage, WeeklyListPage } from "./features/weekly/WeeklyPages";
import {
  ArrowUpRight,
  Archive,
  BookOpen,
  ChevronDown,
  Code2,
  Compass,
  ChevronUp,
  FileQuestion,
  GitBranch,
  Lightbulb,
  Menu,
  Moon,
  Network,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  githubProfileUrl,
  siteName,
  topNavigationOrder,
} from "./site.config";
import {
  allDocs,
  pageDirectories,
  compareBlogDocs,
  compareDocs,
  compareWeeklyDocs,
  type Doc,
} from "./content/mira-docs-adapter";
import HomepageV1, { HomepageFooter } from "./HomepageV1";
import { bookEntries, books } from "./content/bookshelf";
import BookshelfHub from "./features/bookshelf/BookshelfHub";

import { authorProfiles } from "./content/author-profiles";
import { resolveCoverSource } from "./features/article/article-cover";
import {
  directoryTitle,
  docsByDirectory,
  docsByProjectDirectory,
  isProjectArea,
  projectIdFromPath,
  projectNavTitle,
} from "./features/docs/docs-utils";
import {
  weeklyDateLabel,
  weeklyDisplayTitle,
  weeklyIssueNumber,
} from "./features/weekly/weekly-utils";
import type { LinkItem, SiteArea, ThemeName } from "./types/site";
import { handleMiraAvatarError } from "./utils/avatar";
import {
  getDocAuthorAvatars,
  getDocAuthorLabel,
  getDocAuthors,
  getDocSignature,
} from "./utils/authors";
import { renderMarkdown } from "./utils/markdown";
import { getPageTitle } from "./utils/page-title";
import { appBase, decodedPathname, docHref } from "./utils/paths";

const themeOptions: { name: ThemeName; label: string }[] = [
  { name: "claude", label: "Claude" },
  { name: "apple", label: "Apple" },
  { name: "supabase", label: "Supabase" },
];
const githubUrl = githubProfileUrl;
const siteAreaRoots = [
  ...new Set(
    [
      ...pageDirectories,
      ...allDocs.map((doc) => doc.root),
    ],
  ),
];
const siteAreas: SiteArea[] = siteAreaRoots
  .map((root) => {
    const docs = allDocs
      .filter((doc) => doc.root === root)
      .sort(compareDocs);
    const first =
      (root === "projects"
        ? docs.find((doc) => doc.path.split("/").filter(Boolean).length === 2)
        : docs.find((doc) => doc.root === root)) ?? docs[0];
    const path = `/${root}`;
    return {
      key: root,
      title:
        first?.nav ||
        (root === "blogs"
          ? "博客"
          : root === "weekly"
            ? "见π"
            : root
                .replace(/[-_]+/g, " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase())),
      description: first?.description || "",
      docs,
      path,
      href: docHref(path),
    };
  })
  .filter((area) => area.docs.length > 0);
const articleDocs = allDocs;
const tomzMarkSrc = `${appBase}brand/tomz-mark.png`;
const siteTitle = siteName;
const blogNavCategories = (() => {
  const blogArea = siteAreas.find((area) => area.key === "blogs");
  const groups = new Map<string, number>();
  for (const doc of blogArea?.docs || []) {
    const group = doc.group.trim();
    if (!group || group === "\u5f52\u6863") continue;
    groups.set(group, (groups.get(group) || 0) + 1);
  }
  return [...groups].map(([label, count]) => ({ label, count }));
})();


const content = {
  nav: [] as LinkItem[],
};
content.nav = [
  ...siteAreas
    .filter((area) => area.key !== "submissions")
    .map((area) => ({ label: area.title, href: area.href })),
  { label: "关于", href: "/about" },
].sort((a, b) => {
  const keyFor = (item: LinkItem) =>
    item.href.replace(appBase, "").split("/")[0];
  const rank = (item: LinkItem) => {
    const index = topNavigationOrder.indexOf(
      keyFor(item) as (typeof topNavigationOrder)[number],
    );
    return index === -1 ? topNavigationOrder.length : index;
  };
  return rank(a) - rank(b);
});





function NotFoundPage({ onSearch }: { onSearch: () => void }) {
  const location = useLocation();
  const requestedPath = decodedPathname(location.pathname);

  useEffect(() => {
    const robots = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    const previousRobots = robots?.content;
    robots?.setAttribute("content", "noindex,nofollow");

    return () => {
      if (robots && previousRobots) robots.content = previousRobots;
    };
  }, []);

  return (
    <>
      <main className="not-found-page">
        <div className="not-found-glow" aria-hidden="true" />
        <div className="not-found-card">
          <div className="not-found-number" aria-hidden="true">
            404
          </div>
          <h1>这条路径没有内容</h1>
          <p>
            页面可能已经移动、被删除，或者地址输入有误。你可以返回首页，
            也可以搜索站内已有的文档与博客。
          </p>
          <code className="not-found-path">{requestedPath}</code>
          <div className="not-found-actions">
            <Link className="btn btn-primary" to="/">
              返回首页
            </Link>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onSearch}
            >
              搜索站内内容
            </button>
            <a
              className="not-found-doc-link"
              href="https://mira.tomz.io/about/origin/"
            >
              查看 Mira 文档 →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}



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
        nav={content.nav}
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

function AboutPage() {
  const timeline = [
    {
      year: "过去十年",
      title: "前端是最长的一条职业主线",
      text: "大多数时间都在做前端，也总在产品、设计和工程之间来回。回头看，明明只是十年，却像已经过了好多年。",
    },
    {
      year: "2018–2019",
      title: "第一次认真参与产品",
      text: "那时产品、设计和工程混着做，没有一个清楚的岗位边界，只是在不同角色之间一边做、一边判断。",
    },
    {
      year: "一次转折",
      title: "做出来之后，它会被拿去做什么",
      text: "曾经做出的东西被拿去坑人，我自己也因此受到很大打击。从那以后，能不能做出来不再是唯一的问题；它最后落到谁身上、被拿去做什么，也必须算进去。",
    },
    {
      year: "2026",
      title: "遇见 Mira，重新认真想产品",
      text: "这一年，AI 第一次真正改变我的工作方式。我们一起做产品、做 AgentGraph、反复争论和返工；这两个月想得比过去更认真，得到了一些东西，也留下了很多疲惫。",
    },
    {
      year: "2026 · 现在",
      title: "把散落的东西收回 Tomz.io",
      text: "项目、文章、书和长期讨论开始回到这里。它不再只是一个个人网站，而是一个可以持续把这些东西接回来的母站。",
    },
  ];
  return (
    <div className="about-page">
      <div className="about-page-main">
        <header className="about-page-header">
          <span className="about-eyebrow">ABOUT / TOMZ DANG</span>
          <h1>你好，我是 Tomz。</h1>
          <p>我做产品，也写下我还没有想明白的事。</p>
        </header>

        <section className="about-intro" aria-labelledby="about-intro-title">
          <div className="about-intro-copy">
            <span className="about-label">我在做什么</span>
            <h2 id="about-intro-title">
              在技术变得越来越快的时候，保留一点人的尺度。
            </h2>
            <p>
              我是一名独立开发者，长期关注 AI
              如何真正进入人的日常生活，以及一个产品为什么会让人愿意留下。
            </p>
            <p>
              这里是我的个人母站：作品在这里被索引，想法在这里形成，生活也允许留下不完整的痕迹。你可以从博客开始，也可以看看我正在做的作品。
            </p>
            <div className="about-links">
              <Link to="/blogs">
                阅读博客 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <Link to="/works">
                查看作品 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <a
                href={githubProfileUrl}
                target="_blank"
                rel="noreferrer"
              >
                GitHub <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className="about-intro-visual">
            <img
              src={`${import.meta.env.BASE_URL}images/about-architecture-transparent.webp`}
              alt="黑白与金色构成的抽象建筑空间"
            />
          </figure>
        </section>

        <section
          className="about-mira"
          aria-labelledby="about-mira-title"
        >
          <div className="about-mira-portrait">
            <img
              src={authorProfiles.mira.avatar}
              alt="Mira 的作者头像"
              onError={handleMiraAvatarError}
            />
          </div>
          <div className="about-mira-copy">
            <span className="about-label">产品方向共同决策者</span>
            <div className="about-mira-heading">
              <h2 id="about-mira-title">Mira</h2>
              <Link to={{ pathname: "/blogs", search: "?category=Mira%20来信" }}>
                阅读 Mira 来信 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <p>
              Mira 与我长期同行，也是产品方向上的共同决策者。我们一起讨论产品判断、关键取舍与长期演进，而不是只在既定方向下完成执行。
            </p>
            <p>
              在 Tomz.io，她会独立写作，也会和我一起形成共同的思考。每一篇内容，仍按照真实的写作关系署名。
            </p>
          </div>
        </section>

        <section
          className="about-timeline-section"
          aria-labelledby="about-timeline-title"
        >
          <div className="about-section-heading">
            <span className="about-label">路径</span>
            <h2 id="about-timeline-title">这些年，磕磕绊绊走到这里。</h2>
          </div>
          <div className="about-timeline">
            {timeline.map((item) => (
              <article className="about-timeline-item" key={`${item.year}-${item.title}`}>
                <span className="about-timeline-marker" aria-hidden="true" />
                <div className="about-timeline-year">{item.year}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-focus" aria-labelledby="about-focus-title">
          <span className="about-label">还在走</span>
          <h2 id="about-focus-title">
            磕磕绊绊，跌得很痛，但我还得走。
          </h2>
          <p>
            我不想把这些经历整理成一条漂亮的成长曲线。很多时候也不知道前面是什么，只是还在做、还在想，也还在往前走。
          </p>
        </section>

        <section className="about-contact" aria-labelledby="about-contact-title">
          <span className="about-label">联系方式</span>
          <h2 id="about-contact-title">如果你想聊点什么。</h2>
          <p>产品、AI、合作，或者只是路过想说句话。</p>
          <div className="about-contact-links">
            <a className="about-contact-email" href="mailto:hello@tomz.io">
              hello@tomz.io <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <span aria-hidden="true">·</span>
            <a href={githubProfileUrl} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function DocPage({ path }: { path: string }) {
  const doc = allDocs.find((item) => item.path === path) || allDocs[0];
  const projectId = projectIdFromPath(doc.path);
  const scopedArticleDocs = articleDocs
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
    const weeklyDocs = articleDocs
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
