import { parseFrontmatter } from "./frontmatter";
import type { ContentDocument } from "./types";

const modules = import.meta.glob("./**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function toUrlPath(sourcePath: string) {
  const withoutExtension = sourcePath.replace(/\.md$/i, "");
  return `/${withoutExtension}`.replace(/\/index$/, "");
}

export function loadContent(): ContentDocument[] {
  return Object.entries(modules).map(([file, raw]) => {
    const sourcePath = file.replace(/^\.\//, "");
    const { frontmatter, body } = parseFrontmatter(raw);
    return {
      sourcePath,
      urlPath: toUrlPath(sourcePath),
      body,
      frontmatter,
    };
  });
}

function dateValue(value?: string) {
  if (!value) return 0;
  const chinese = value.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (chinese) return new Date(Number(chinese[1]), Number(chinese[2]) - 1, Number(chinese[3])).getTime();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function loadBlogPosts() {
  return loadContent()
    .filter((document) => document.sourcePath.startsWith("blogs/"))
    .sort((a, b) => dateValue(b.frontmatter.date) - dateValue(a.frontmatter.date) || b.frontmatter.order - a.frontmatter.order);
}
