import { extractHeadings, type MiraHeading } from "@uichat-mira/docs";
import { slug } from "../../utils/slug";

export type BookReaderHeading = { id: string; text: string };

// Book Reader reserves the page-level H1 for the reader header. This preserves
// the existing behavior: a matching leading Markdown H1 is removed, while any
// later H1 becomes a rendered H2. The TOC intentionally lists rendered H2 only;
// H3+ remain article substructure rather than primary navigation.
export function normalizeBookArticleSource(source: string, title: string): string {
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

export function bookReaderHeadings(
  source: string,
  title: string,
): BookReaderHeading[] {
  const normalized = normalizeBookArticleSource(source, title);
  const seen = new Set<string>();

  return extractHeadings(normalized)
    .filter((heading: MiraHeading) => heading.depth === 2)
    .flatMap((heading: MiraHeading) => {
      const id = slug(heading.text);
      if (!id || seen.has(id)) return [];
      seen.add(id);
      return [{ id, text: heading.text }];
    });
}
