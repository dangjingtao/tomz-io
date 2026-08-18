import type { ContentAuthor, ContentFrontmatter } from "./types";

type RawValue = string | string[];
type RawMeta = Record<string, RawValue>;

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function scalar(meta: RawMeta, key: string) {
  const value = meta[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function list(meta: RawMeta, key: string) {
  const value = meta[key];
  if (Array.isArray(value)) return value.map(stripQuotes).filter(Boolean);
  if (!value?.trim()) return [];
  return value.split(/[|,，]/).map(stripQuotes).map((item) => item.trim()).filter(Boolean);
}

export function normalizeAuthor(value: string): ContentAuthor {
  const normalized = stripQuotes(value).trim();
  const lowered = normalized.toLowerCase();
  if (lowered === "tomz" || lowered === "tomz dang") return "tomz";
  if (lowered === "mira") return "mira";
  return normalized;
}

export function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const header = match?.[1] ?? "";
  const body = match?.[2] ?? raw;
  const meta: RawMeta = {};
  let currentKey = "";

  for (const line of header.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && currentKey) {
      const previous = meta[currentKey];
      const values = Array.isArray(previous) ? previous : previous ? [previous] : [];
      meta[currentKey] = [...values, stripQuotes(item[1])];
      continue;
    }
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    currentKey = line.slice(0, separator).trim();
    meta[currentKey] = stripQuotes(line.slice(separator + 1));
  }

  const authors = list(meta, "author").map(normalizeAuthor);
  const writtenBy = scalar(meta, "writtenBy");
  const reviewedBy = scalar(meta, "reviewedBy");

  const frontmatter: ContentFrontmatter = {
    title: scalar(meta, "title"),
    description: scalar(meta, "description"),
    group: scalar(meta, "group"),
    order: Number(scalar(meta, "order") || 99),
    date: scalar(meta, "date") || undefined,
    readTime: scalar(meta, "readTime") || undefined,
    tags: list(meta, "tags"),
    cover: scalar(meta, "cover") || undefined,
    author: authors.length ? authors : ["tomz"],
    writingMode: scalar(meta, "writingMode") || undefined,
    writtenBy: writtenBy ? normalizeAuthor(writtenBy) : undefined,
    reviewedBy: reviewedBy ? normalizeAuthor(reviewedBy) : undefined,
    commitUrl: scalar(meta, "commitUrl") || undefined,
  };

  return { frontmatter, body };
}
