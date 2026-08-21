import { useEffect, useMemo } from "react";
import { marked } from "marked";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import {
  bookEntries,
  books,
  getBook,
  getBookEntry,
  latestBookEntry,
} from "../../content/bookshelf";
import type { Doc } from "../../content/mira-docs-adapter";
import "./bookshelf.css";

const siteUrl = "https://tomz.io";

function authorLabel(doc: Doc): string {
  const authors = doc.author?.length ? doc.author : ["tomz"];
  return authors
    .map((author) => (author === "mira" ? "Mira" : "Tomz Dang"))
    .join(" × ");
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

function BookshelfNav() {
  return (
    <nav className="bookshelf-site-nav" aria-label="主导航">
      <div className="bookshelf-wrap bookshelf-site-nav-inner">
        <Link className="bookshelf-brand" to="/" aria-label="Tomz.io 首页">
          Tomz.io
        </Link>
        <div className="bookshelf-site-links">
          <Link to="/blogs">博客</Link>
          <Link to="/works">作品</Link>
          <Link to="/projects">项目</Link>
          <Link className="active" to="/books" aria-current="page">
            书架
          </Link>
          <Link to="/about">关于</Link>
        </div>
      </div>
    </nav>
  );
}

function BookshelfIndex() {
  useEffect(() => {
    syncHead(
      "书架",
      "Tomz.io 的书架：持续生长的专题、阅读札记与未来的小说，都以一本本书的方式放在这里。",
      "/books",
    );
  }, []);

  return (
    <>
      <BookshelfNav />
      <main className="bookshelf-wrap bookshelf-main">
        <header className="bookshelf-hero">
          <span className="bookshelf-eyebrow">BOOKS / 书架</span>
          <h1>一本本放在这里。</h1>
          <p>
            有些是持续学习的专题，有些是阅读留下的札记，以后也可能是一部小说。它们不需要属于同一种内容，只需要值得慢慢写下去。
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
  const entries = useMemo(() => bookEntries(bookId), [bookId]);

  useEffect(() => {
    if (!book) return;
    syncHead(book.title, book.description, `/books/${book.id}`);
  }, [book]);

  if (!book) return null;

  return (
    <>
      <BookshelfNav />
      <main className="bookshelf-wrap book-index-main">
        <Link className="bookshelf-back" to="/books">
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
  const html = useMemo(() => (entry ? String(marked.parse(entry.source)) : ""), [entry]);

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
      <BookshelfNav />
      <main className="book-reader">
        <article className="book-reader-header">
          <Link className="bookshelf-back" to={`/books/${book.id}`}>
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
