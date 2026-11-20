import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { collectJsonFeed } from "./generate-json-feed.mjs";

let root, distRoot, pagesRoot;
function write(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
}
function published(route, article, { canonical = `https://tomz.io${route}/`, rawJson } = {}) {
  const script = rawJson ?? JSON.stringify({ "@type": "Article", url: canonical, ...article });
  const html = `<html><head><link rel="canonical" href="${canonical}"><script type="application/ld+json">${script}</script></head><body></body></html>`;
  write(join(distRoot, route.replace(/^\//, ""), "index.html"), html);
}
function source(path, meta) {
  write(join(pagesRoot, path), `---\ntitle: "Test"\n${meta}\n---\n# Test\n`);
}
function catalog(entries = []) {
  return { books: entries.map(([id, url, position = 1]) => ({
    id, entries: [{ url, position }],
  })) };
}
function collect(bookEntries = []) {
  return collectJsonFeed({ distRoot, pagesRoot, catalog: catalog(bookEntries) });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "tomz-jsonfeed-"));
  distRoot = join(root, "dist");
  pagesRoot = join(root, "src/pages");
  write(join(distRoot, "index.html"), '<link rel="canonical" href="https://tomz.io/">');
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("JSON Feed 1.1 published-static projection", () => {
  it("distinguishes confirmed Issue from its article; preserves date-only and author order", () => {
    source("weekly/010/index.md", "issue: 10\ncover: https://assets.tomz.io/jianpi/010/cover.webp");
    source("weekly/010/story.md", "issue: 10");
    published("/weekly/010", {
      headline: "见π 010", description: "真实期号摘要", datePublished: "2026-11-15",
      image: "https://assets.tomz.io/jianpi/010/cover.webp",
      dateModified: "2026-11-16T07:18:27+08:00",
      author: [{ name: "Mira" }, { name: "Tomz Dang" }],
    });
    published("/weekly/010/story", {
      headline: "真实文章", datePublished: "2026-11-15",
      author: [{ name: "Mira" }],
    });

    const feed = collect();
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items).toHaveLength(2);
    const issue = feed.items.find((item) => item._tomzio.kind === "issue");
    const story = feed.items.find((item) => item._tomzio.kind === "article");
    expect(issue._tomzio.issue).toEqual({ number: 10, url: issue.url });
    expect(story._tomzio.issue).toEqual(issue._tomzio.issue);
    expect(issue.authors).toEqual([{ name: "Mira" }, { name: "Tomz Dang" }]);
    expect(story.authors).toEqual([{ name: "Mira" }]);
    expect(issue._tomzio.publishedDate).toBe("2026-11-15");
    expect(issue._tomzio.publishedPrecision).toBe("date");
    expect(issue).not.toHaveProperty("date_published");
    expect(issue.date_modified).toBe("2026-11-16T07:18:27+08:00");
    expect(issue.image).toBe("https://assets.tomz.io/jianpi/010/cover.webp");
    expect(story).not.toHaveProperty("image");
    expect(issue.content_text).toBe("真实期号摘要");
    expect(story.content_text).toBe("真实文章");
  });

  it("publishes only the verified Issue cover from its final Article JSON-LD", () => {
    source("weekly/008/index.md", "issue: 8\ncover: /images/weekly-008-cover.webp");
    published("/weekly/008", {
      headline: "见π 008", image: "https://assets.tomz.io/tomz-io/media/ab/hash.webp",
    });
    expect(collect().items[0].image).toBe("https://assets.tomz.io/tomz-io/media/ab/hash.webp");
    // A local Markdown path has been content-addressed during production media
    // publication. The feed must use the final public image, not the source path.
    published("/weekly/008", {
      headline: "见π 008", image: "https://untrusted.example/cover.webp",
    });
    expect(() => collect()).toThrow("Untrusted or placeholder published Issue image");
    published("/weekly/008", { headline: "见π 008" });
    expect(() => collect()).toThrow("Published Issue has no Article image");
    published("/weekly/008", { headline: "见π 008", image: "https://tomz.io/tomz-avatar.png" });
    expect(() => collect()).toThrow("placeholder published Issue image");
  });

  it("does not silently invent a weekly cover when the source has none", () => {
    source("weekly/011/index.md", "issue: 11");
    published("/weekly/011", {
      headline: "见π 011", image: "https://assets.tomz.io/jianpi/011/random.webp",
    });
    expect(() => collect()).toThrow("source has no declared cover");
  });

  it("keeps one canonical when a Blog is logically archived in multiple Books", () => {
    const url = "https://tomz.io/blogs/developer-life/one/";
    published("/blogs/developer-life/one", {
      headline: "原博客", description: "原文摘要", datePublished: "2026-11-12",
    });
    published("/blogs/developer-life/duplicate", {
      headline: "原博客", description: "原文摘要", datePublished: "2026-11-12",
    }, { canonical: url });
    const feed = collect([["book-a", url, 2], ["book-b", url, 1]]);
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].id).toBe(url);
    expect(feed.items[0]._tomzio.books).toEqual([
      { id: "book-a", position: 2 }, { id: "book-b", position: 1 },
    ]);
    expect(feed.items[0]._tomzio.kind).toBe("article");
  });

  it("does not infer Issue relationships or invent author/date/description", () => {
    published("/weekly/011/entry", { headline: "仅有标题" });
    const item = collect().items[0];
    expect(item.content_text).toBe("仅有标题");
    expect(item).not.toHaveProperty("summary");
    expect(item).not.toHaveProperty("authors");
    expect(item).not.toHaveProperty("date_published");
    expect(item._tomzio).not.toHaveProperty("publishedPrecision");
    expect(item._tomzio).not.toHaveProperty("issue");
  });

  it("preserves full timezone precision only when explicitly published", () => {
    published("/blogs/developer-life/precise", {
      headline: "精确发布", datePublished: "2026-11-15T09:07:05+08:00",
    });
    const item = collect().items[0];
    expect(item.date_published).toBe("2026-11-15T09:07:05+08:00");
    expect(item._tomzio.publishedPrecision).toBe("datetime");
    expect(item._tomzio).not.toHaveProperty("publishedDate");
  });

  it("rejects malformed JSON-LD, invalid dates and canonical mismatches", () => {
    published("/blogs/developer-life/broken", {}, { rawJson: "{unclosed" });
    expect(() => collect()).toThrow("Invalid published JSON-LD");
    published("/blogs/developer-life/broken", { headline: "Bad", datePublished: "2026-02-30" });
    expect(() => collect()).toThrow("Invalid datePublished date");
    published("/blogs/developer-life/broken", { headline: "Bad", datePublished: "2026-11-15T00:00:00" });
    expect(() => collect()).toThrow("Invalid datePublished precision");
    published("/blogs/developer-life/broken", {
      headline: "Bad", url: "https://tomz.io/blogs/wrong/",
    });
    expect(() => collect()).toThrow("differs from canonical");
  });

  it("requires real title and never creates a fake item for unverified metadata", () => {
    published("/blogs/developer-life/missing-title", { description: "摘要" });
    expect(() => collect()).toThrow("lacks a title");
  });

  it("has stable sorting, bounded output and never rewrites publication dates", () => {
    for (const [slug, modified] of [
      ["old", "2026-11-10T11:00:00Z"],
      ["new", "2026-11-18T11:00:00Z"],
      ["middle", "2026-11-13T11:00:00Z"],
    ]) {
      published(`/blogs/developer-life/${slug}`, {
        headline: slug, datePublished: "2026-01-01", dateModified: modified,
      });
    }
    const options = { distRoot, pagesRoot, catalog: catalog(), limit: 2 };
    const first = collectJsonFeed(options);
    expect(first.items.map((entry) => entry.title)).toEqual(["new", "middle"]);
    expect(first.items[0]._tomzio.publishedDate).toBe("2026-01-01");
    expect(collectJsonFeed(options)).toEqual(first);
  });
});
