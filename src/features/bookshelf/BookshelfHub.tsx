import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  List,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import RenderedMarkdown from "../../components/RenderedMarkdown";
import {
  bookEntries,
  books,
  getBook,
  getBookEntry,
  latestBookEntry,
} from "../../content/bookshelf";
import { formatContentTime } from "../../content/content-time";
import { type Doc } from "../../content/mira-docs-adapter";
import { siteName, siteUrl } from "../../site.config";
import { useActiveHeading } from "../../hooks/useActiveHeading";
import { renderMarkdown } from "../../utils/markdown";
import { PageToc, PageTocLinks } from "../docs/PageToc";
import {
  bookReaderHeadings,
  normalizeBookArticleSource,
} from "./book-reader-source";
import MobileBookToc from "./MobileBookToc";
import "./bookshelf.css";


function authorLabel(doc: Doc): string {
  const authors = doc.author?.length ? doc.author : ["tomz"];
  return authors
    .map((author) => (author === "mira" ? "Mira" : siteName))
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
  toc,
}: {
  to: string;
  label: string;
  share?: { title: string; text?: string };
  toc?: { open: boolean; onOpen: () => void };
}) {
  return (
    <div className="bookshelf-mobile-backbar">
      <div className="bookshelf-mobile-backbar-inner">
        <Link className="bookshelf-back" to={to} title={label}>
          <ArrowLeft size={15} aria-hidden="true" />
          <span className="bookshelf-back-label">{label}</span>
        </Link>
        <div className="bookshelf-mobile-actions">
          {toc ? (
            <button
              className="book-reader-toc-trigger"
              type="button"
              onClick={toc.onOpen}
              aria-expanded={toc.open}
              aria-controls="book-reader-mobile-toc-sheet"
              aria-label="文章目录"
              title="文章目录"
            >
              <List size={18} aria-hidden="true" />
            </button>
          ) : null}
          {share ? <BookShareButton title={share.title} text={share.text} /> : null}
        </div>
      </div>
    </div>
  );
}

function syncHead(title: string, description: string, path: string) {
  document.title = `${title} · ${siteName}`;
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
            const latestDate = latest
              ? formatContentTime(latest.publishedAt || latest.date)
              : undefined;
            return (
              <Link className={`bookshelf-book${book.cover ? " has-cover" : ""}`} to={`/books/${book.id}`} key={book.id}>
                <div className="bookshelf-book-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </div>
                {book.cover ? (
                  <div className="bookshelf-book-cover">
                    <img src={book.cover} alt={`《${book.title}》封面`} loading="lazy" />
                  </div>
                ) : null}
                <div className="bookshelf-book-copy">
                  <span className="bookshelf-book-category">
                    {book.category || "BOOK"}
                  </span>
                  <h2>{book.title}</h2>
                  <p>{book.description}</p>
                  <div className="bookshelf-book-meta">
                    <span>{entries.length} 篇</span>
                    {latestDate ? <span>最近更新 · {latestDate}</span> : null}
                    {latest ? (
                      <>
                        <span className="bookshelf-book-meta-latest-label">最近写下 ·</span>
                        <strong className="bookshelf-book-meta-latest-title">{latest.title}</strong>
                      </>
                    ) : null}
                  </div>
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
  const entries = useMemo(() => bookEntries(bookId), [bookId]);

  useEffect(() => {
    if (!book) return;
    syncHead(book.title, book.description, `/books/${book.id}`);
  }, [book]);

  if (!book) return null;

  return (
    <>
      <BookshelfMobileBackbar
        to="/books"
        label="返回书架"
        share={{ title: book.title, text: book.description }}
      />
      <main className="bookshelf-wrap book-index-main">
        <div className="book-index-desktop-backbar">
          <Link className="bookshelf-back book-index-desktop-back" to="/books">
            <ArrowLeft size={15} aria-hidden="true" />
            返回书架
          </Link>
        </div>
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
  const articleSource = useMemo(
    () => (entry ? normalizeBookArticleSource(entry.source, entry.title) : ""),
    [entry],
  );
  const headings = useMemo(
    () => (entry ? bookReaderHeadings(entry.source, entry.title) : []),
    [entry],
  );
  const hasToc = headings.length >= 4;
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const openMobileToc = useCallback(() => setMobileTocOpen(true), []);
  const closeMobileToc = useCallback(() => setMobileTocOpen(false), []);
  const activeHeading = useActiveHeading(headings, {
    enabled: hasToc,
    rootMargin: "-120px 0px -60% 0px",
  });
  const html = useMemo(
    () => (articleSource ? renderMarkdown(articleSource) : ""),
    [articleSource],
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
      <BookshelfMobileBackbar
        to={`/books/${book.id}`}
        label={`返回《${book.title}》`}
        share={{ title: entry.title, text: entry.description || book.description }}
        toc={
          hasToc
            ? {
                open: mobileTocOpen,
                onOpen: openMobileToc,
              }
            : undefined
        }
      />
      {hasToc ? (
        <MobileBookToc
          open={mobileTocOpen}
          headings={headings}
          activeHeading={activeHeading}
          onClose={closeMobileToc}
        />
      ) : null}
      <main className={`book-reader${hasToc ? " has-toc" : ""}`}>
        <div className="book-reader-desktop-backbar">
          <div className="book-reader-desktop-backbar-inner">
            <Link className="bookshelf-back book-reader-desktop-back" to={`/books/${book.id}`}>
              <ArrowLeft size={15} aria-hidden="true" />
              返回《{book.title}》
            </Link>
          </div>
        </div>
        <article className="book-reader-header">
          <span className="book-reader-category">{book.category || "BOOK"}</span>
          <h1>{entry.title}</h1>
          {entry.description ? <p>{entry.description}</p> : null}
          <div className="book-reader-meta">
            <span>{authorLabel(entry)}</span>
            {entry.date ? <span>{entry.date}</span> : null}
            {entry.readTime ? <span>{entry.readTime}</span> : null}
          </div>
        </article>

        <div className={`book-reader-reading-layout${hasToc ? " has-toc" : ""}`}>
          <RenderedMarkdown
            html={html}
            className="book-reader-body markdown blog-markdown"
          />
          {hasToc ? (
            <PageToc
              headings={headings}
              activeHeading={activeHeading}
              className="book-reader-toc"
              label="文章目录"
              numbered
              headingAs="span"
            />
          ) : null}
        </div>

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
