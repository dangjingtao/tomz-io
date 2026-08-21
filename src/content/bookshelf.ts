import { allDocs, compareDocs, type Doc } from "./mira-docs-adapter";
import { parseBookManifest, type BookManifest } from "./book-manifest";

const rawManifests = import.meta.glob("../pages/books/*/_book.yml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const books: BookManifest[] = Object.entries(rawManifests)
  .map(([path, source]) => parseBookManifest(source, path))
  .filter((book) => book.status !== "archived" && book.status !== "draft")
  .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));

export function getBook(bookId: string): BookManifest | undefined {
  return books.find((book) => book.id === bookId);
}

export function bookIdForDoc(doc: Doc): string | undefined {
  if (doc.root !== "books") return undefined;
  return doc.directory.split("/").filter(Boolean)[0];
}

export function bookEntries(bookId: string): Doc[] {
  return allDocs
    .filter((doc) => bookIdForDoc(doc) === bookId)
    .sort(compareDocs);
}

export function getBookEntry(bookId: string, entrySlug: string): Doc | undefined {
  const expectedPath = `/books/${bookId}/${entrySlug}`;
  return bookEntries(bookId).find((doc) => doc.path === expectedPath);
}

export function latestBookEntry(bookId: string): Doc | undefined {
  return [...bookEntries(bookId)].sort((left, right) => {
    const dateCompare = String(right.date || "").localeCompare(String(left.date || ""), "zh-CN");
    return dateCompare || right.order - left.order;
  })[0];
}
