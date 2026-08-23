import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Moon,
  Search,
  Share2,
  Sun,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  bookEntries,
  books,
  getBook,
  getBookEntry,
  latestBookEntry,
} from "../../content/bookshelf";
import { allDocs, type Doc } from "../../content/mira-docs-adapter";
import "./bookshelf.css";

const siteUrl = "https://tomz.io";
const tomzMarkSrc = `${import.meta.env.BASE_URL}brand/tomz-mark.png`;
const githubUrl = "https://github.com/dangjingtao/uichat-mira";

function authorLabel(doc: Doc): string {
  const authors = doc.author?.length ? doc.author : ["tomz"];
  return authors
    .map((author) => (author === "mira" ? "Mira" : "Tomz Dang"))
    .join(" × ");
}

function BookShareButton({ title, text }: { title: string; text?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const resetStatus = () => {
    window.setTimeout(() => setStatus("idle"), 1800);
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: text || title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    resetStatus();
  };

  const label =
    status === "copied"
      ? "链接已复制"
      : status === "failed"
        ? "复制失败"
        : `分享《${title}》`;

  return (
    <button
      className="book-reader-share"
      type="button"
      onClick={handleShare}
      aria-label={label}
      title={label}
    >
      {status === "copied" ? (
        <Check size={17} aria-hidden="true" />
      ) : (
        <Share2 size={17} aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </button>
  );
}

function BookshelfMobileBackbar({
  to,
  label,
  share,
}: {
  to: string;
  label: string;
  share?: { title: string; text?: string };
}) {
  return (
    <div className="bookshelf-mobile-backbar">
      <div className="bookshelf-mobile-backbar-inner">
        <Link className="bookshelf-back" to={to}>
          <ArrowLeft size={15} aria-hidden="true" />
          {label}
        </Link>
        {share ? <BookShareButton title={share.title} text={share.text} /> : null}
      </div>
    </div>
  );
}

function syncHead(title: string, description: string, path: string) {
  document.title = `${title} · Tomz Dang`;
  const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  descriptionMeta?.setAttribute("content", description);

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = `${siteUrl}${path}`;
}

function entriesNewestFirst(entries: Doc[]) {
  return [...entries].sort((left, right) => {
    const dateCompare = String(right.date || "").localeCompare(
      String(left.date || ""),
      "zh-CN",
    );
    return dateCompare || right.order - left.order;
  });
}

function normalizeBookArticleHeadings(source: string, title: string) {
  const lines = source.split(/\r?\n/);
  const firstContentIndex = lines.findIndex((line) => line.trim() !== "");
  let inFence = false;

  return lines
    .flatMap((line, index) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return [line];
      }
      if (inFence) return [line];

      const heading = line.match(/^#\s+(.+?)\s*#*\s*$/);
      if (!heading) return [line];
      if (index === firstContentIndex && heading[1].trim() === title.trim()) return [];
      return [`#${line}`];
    })
    .join("\n")
    .replace(/^\s*\n/, "");
}

function BookshelfSiteHeader() {
  const [darkMode, setDarkMode] = useState(() =>
    typeof document === "undefined"
      ? false
      : document.documentElement.classList.contains("dark"),
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const toggleTheme = () => {
    setDarkMode((value) => {
      const next = !value;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("mira-theme", next ? "dark" : "light");
      return next;
    });
  };

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const searchResults = normalizedQuery
    ? allDocs
        .filter((doc) =>
          [doc.title, doc.description, doc.group, doc.directory]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("zh-CN")
            .includes(normalizedQuery),
        )
        .slice(0, 12)
    : [];

  const navItems = [
    ["博客", "/blogs"],
    ["作品", "/works"],
    ["项目", "/projects"],
    ["书架", "/books"],
    ["关于", "/about"],
  ] as const;

  return (
    <>
      <nav className="top-nav docs-header" aria-label="主导航">
        <div className="wrap">
          <Link className="brand" to="/" aria-label="Tomz Dang 首页">
            <img className="brand-tomz-mark" src={tomzMarkSrc} alt="" />
          </Link>
          <ul className="menu">
            {navItems.map(([label, href]) => (
              <li key={href}>
                <Link
                  className={href === "/books" ? "active" : ""}
                  aria-current={href === "/books" ? "page" : undefined}
                  to={href}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={darkMode ? "切换到浅色模式" : "切换到暗黑模式"}
              title={darkMode ? "浅色模式" : "暗黑模式"}
            >
              {darkMode ? (
                <Sun size={17} aria-hidden="true" />
              ) : (
                <Moon size={17} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="site-search inline-flex items-center gap-2 rounded-md border border-hairline bg-canvas px-2.5 font-sans text-[13px] text-muted-soft"
              onClick={() => setSearchOpen(true)}
            >
              搜索{" "}
              <kbd className="rounded bg-surface-card px-1.5 py-px font-mono text-[10px]">
                Ctrl K
              </kbd>
            </button>
            <a
              className="text-link header-github"
              href={githubUrl}
              aria-label="GitHub"
              title="GitHub"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 2.807 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943" />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      {searchOpen ? (
        <div
          className="search-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSearchOpen(false);
          }}
        >
          <div className="search-dialog" role="dialog" aria-modal="true" aria-label="站内搜索">
            <div className="search-input-wrap">
              <Search size={20} aria-hidden="true" />
              <input
                autoFocus
                className="search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索 Tomz.io"
              />
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
                ESC
              </button>
            </div>
            <div className="search-results">
              {normalizedQuery && searchResults.length === 0 ? (
                <p className="search-empty">没有找到相关内容。</p>
              ) : null}
              {searchResults.map((doc) => (
                <Link
                  className="search-result"
                  to={doc.path}
                  key={doc.path}
                  onClick={() => setSearchOpen(false)}
                >
                  <strong className="search-result-title">{doc.title}</strong>
                  <span className="search-result-meta">
                    {[doc.root === "books" ? "书架" : doc.group || doc.root, doc.description]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              ))}
            </div>
            <div className="search-footer">
              <span>输入关键词搜索</span>
              <span>ESC 关闭</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function BookshelfIndex() {
  useEffect(() => {
    syncHead(
      "书架",
      "Tomz.io 的书架，收下那些值得长期写下去的问题、阅读与故事。",
      "/books",
    );
  }, []);

  return (
    <>
      <BookshelfSiteHeader />
      <main className="bookshelf-wrap bookshelf-main">
        <header className="bookshelf-hero">
          <span className="bookshelf-eyebrow">BOOKS / 书架</span>
          <p>
            一些问题会反复回来，一些阅读会留下痕迹，一些故事还没有写完。这里收下那些仍在生长的东西。
          </p>
        </header>

        <section className="bookshelf-grid" aria-label="书目">
          {books.map((book, index) => {
            const entries = bookEntries(book.id);
            const latest = latestBookEntry(book.id);
            return (
              <Link className="bookshelf-book" to={`/books/${book.id}`} key={book.id}>
                <div className="bookshelf-book-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="bookshelf-book-copy">
                  <span className="bookshelf-book-category">
                    {book.category || "BOOK"}
                  </span>
                  <h2>{book.title}</h2>
                  <p>{book.description}</p>
                  <div className="bookshelf-book-meta">
                    <span>{entries.length} 篇</span>
                    {latest?.date ? <span>最近更新 · {latest.date}</span> : null}
                  </div>
                  {latest ? (
                    <div className="bookshelf-book-latest">
                      <span>最近写下</span>
                      <strong>{latest.title}</strong>
                    </div>
                  ) : null}
                </div>
                <ArrowUpRight className="bookshelf-book-arrow" size={19} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            );
          })}
        </section>
      </main>
    </>
  );
}

function BookIndex({ bookId }: { bookId: string }) {
  const book = getBook(bookId);
  const entries = useMemo(
    () => entriesNewestFirst(bookEntries(bookId)),
    [bookId],
  );

  useEffect(() => {
    if (!book) return;
    syncHead(book.title, book.description, `/books/${book.id}`);
  }, [book]);

  if (!book) return null;

  return (
    <>
      <BookshelfSiteHeader />
      <BookshelfMobileBackbar
        to="/books"
        label="返回书架"
        share={{ title: book.title, text: book.description }}
      />
      <main className="bookshelf-wrap book-index-main">
        <Link className="bookshelf-back book-index-desktop-back" to="/books">
          <ArrowLeft size={15} aria-hidden="true" />
          返回书架
        </Link>
        <header className="book-index-header">
          <span>{book.category || "BOOK"}</span>
          <h1>{book.title}</h1>
          <p>{book.description}</p>
          <div className="book-index-meta">
            <BookOpen size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>{entries.length} 篇</span>
            <span aria-hidden="true">·</span>
            <span>{book.status === "completed" ? "已完成" : "持续更新"}</span>
          </div>
        </header>

        <ol className="book-entry-list">
          {entries.map((entry) => (
            <li key={entry.path}>
              <Link to={entry.path}>
                <span className="book-entry-order">{String(entry.order).padStart(2, "0")}</span>
                <span className="book-entry-copy">
                  <strong>{entry.title}</strong>
                  {entry.description ? <small>{entry.description}</small> : null}
                </span>
                <span className="book-entry-date">{entry.date || ""}</span>
                <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}

function BookEntry({ bookId, entrySlug }: { bookId: string; entrySlug: string }) {
  const book = getBook(bookId);
  const entry = getBookEntry(bookId, entrySlug);
  const entries = useMemo(() => bookEntries(bookId), [bookId]);
  const html = useMemo(
    () =>
      entry
        ? String(marked.parse(normalizeBookArticleHeadings(entry.source, entry.title)))
        : "",
    [entry],
  );

  useEffect(() => {
    if (!book || !entry) return;
    syncHead(entry.title, entry.description || book.description, entry.path);
  }, [book, entry]);

  if (!book || !entry) return null;

  const index = entries.findIndex((item) => item.path === entry.path);
  const previous = index > 0 ? entries[index - 1] : undefined;
  const next = index >= 0 ? entries[index + 1] : undefined;

  return (
    <>
      <BookshelfSiteHeader />
      <BookshelfMobileBackbar
        to={`/books/${book.id}`}
        label={`返回《${book.title}》`}
        share={{ title: entry.title, text: entry.description || book.description }}
      />
      <main className="book-reader">
        <article className="book-reader-header">
          <Link className="bookshelf-back book-reader-desktop-back" to={`/books/${book.id}`}>
            <ArrowLeft size={15} aria-hidden="true" />
            返回《{book.title}》
          </Link>
          <span className="book-reader-category">{book.category || "BOOK"}</span>
          <h1>{entry.title}</h1>
          {entry.description ? <p>{entry.description}</p> : null}
          <div className="book-reader-meta">
            <span>{authorLabel(entry)}</span>
            {entry.date ? <span>{entry.date}</span> : null}
            {entry.readTime ? <span>{entry.readTime}</span> : null}
          </div>
        </article>

        <article
          className="book-reader-body markdown blog-markdown"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <nav className="book-reader-pagination" aria-label="书内翻页">
          {previous ? (
            <Link to={previous.path}>
              <span>← 上一篇</span>
              <strong>{previous.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="next" to={next.path}>
              <span>下一篇 →</span>
              <strong>{next.title}</strong>
            </Link>
          ) : null}
        </nav>
      </main>
    </>
  );
}

export default function BookshelfHub({
  bookId,
  entrySlug,
}: {
  bookId?: string;
  entrySlug?: string;
}) {
  if (!bookId) return <BookshelfIndex />;
  if (!entrySlug) return <BookIndex bookId={bookId} />;
  return <BookEntry bookId={bookId} entrySlug={entrySlug} />;
}