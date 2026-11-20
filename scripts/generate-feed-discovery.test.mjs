import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  discoverPublishedFeeds, generateFeedDiscovery, injectJsonFeedAlternate, jsonFeedAlternate,
} from "./generate-feed-discovery.mjs";

let root;
function write(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}
function fixture(home = "https://tomz.io/") {
  const rssLink = `<link rel="alternate" type="application/rss+xml" title="Tomz.io RSS" href="${new URL("rss.xml", home).pathname}">`;
  write(join(root, "index.html"), `<html><head><link rel="canonical" href="${home}">${rssLink}</head></html>`);
  write(join(root, "weekly/010/index.html"), `<html><head>${rssLink}</head><body>article</body></html>`);
  write(join(root, "rss.xml"), '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"></rss>');
  write(join(root, "feed.json"), JSON.stringify({
    version: "https://jsonfeed.org/version/1.1",
    home_page_url: home, feed_url: new URL("feed.json", home).toString(), items: [],
  }));
  write(join(root, "books/catalog.json"), JSON.stringify({ schemaVersion: 1, books: [] }));
}
beforeEach(() => { root = mkdtempSync(join(tmpdir(), "pub02-")); });
afterEach(() => { rmSync(root, { force: true, recursive: true }); });

describe("PUB-02 published resource discovery", () => {
  it.each(["https://tomz.io/", "https://tomz.io/tomz-io/"])(
    "discovers real endpoints and adds one alternate to every HTML page at %s", (home) => {
      fixture(home);
      const { manifest, changed } = generateFeedDiscovery(root);
      expect(changed).toBe(2);
      expect(manifest).toEqual({
        schemaVersion: 1,
        publisher: home,
        resources: [
          { id: "rss", href: new URL("rss.xml", home).toString(), format: "rss2", semantics: "activity" },
          { id: "json-feed", href: new URL("feed.json", home).toString(), format: "jsonfeed1.1", semantics: "activity" },
          { id: "books", href: new URL("books/catalog.json", home).toString(), format: "tomzio-book-catalog-v1", semantics: "state" },
        ],
      });
      expect(JSON.parse(readFileSync(join(root, "feeds.json"), "utf8"))).toEqual(manifest);
      const first = readFileSync(join(root, "index.html"), "utf8");
      expect(first.split(jsonFeedAlternate(home))).toHaveLength(2);
      expect(first).toContain('type="application/rss+xml"');
      expect(generateFeedDiscovery(root).changed).toBe(0);
      expect(readFileSync(join(root, "index.html"), "utf8")).toBe(first);
    },
  );

  it("does not advertise files that are missing or have incompatible schemas", () => {
    fixture();
    unlinkSync(join(root, "books/catalog.json"));
    expect(() => discoverPublishedFeeds(root)).toThrow();
    write(join(root, "books/catalog.json"), JSON.stringify({ schemaVersion: 2, books: [] }));
    expect(() => discoverPublishedFeeds(root)).toThrow("Book Catalog");
    write(join(root, "books/catalog.json"), JSON.stringify({ schemaVersion: 1, books: [] }));
    write(join(root, "feed.json"), JSON.stringify({
      version: "https://jsonfeed.org/version/1.1", home_page_url: "https://wrong.example/",
      feed_url: "https://tomz.io/feed.json", items: [],
    }));
    expect(() => generateFeedDiscovery(root)).toThrow("inconsistent");
    expect(() => readFileSync(join(root, "feeds.json"), "utf8")).toThrow();
  });

  it("rejects malformed JSON, missing RSS, and invalid homepage canonical", () => {
    fixture();
    write(join(root, "feed.json"), "{broken");
    expect(() => discoverPublishedFeeds(root)).toThrow();
    fixture();
    write(join(root, "rss.xml"), "not RSS");
    expect(() => discoverPublishedFeeds(root)).toThrow("RSS");
    fixture("https://untrusted.example/");
    expect(() => discoverPublishedFeeds(root)).toThrow("homepage canonical");
  });

  it("rejects a conflicting/duplicate alternate instead of silently adding another", () => {
    const correct = jsonFeedAlternate("https://tomz.io/");
    expect(injectJsonFeedAlternate(`<html><head>${correct}</head></html>`, correct)).toBe(
      `<html><head>${correct}</head></html>`,
    );
    expect(() => injectJsonFeedAlternate(
      '<html><head><link rel="alternate" type="application/feed+json" href="/wrong"></head></html>', correct,
    )).toThrow("Conflicting");
    expect(() => injectJsonFeedAlternate(`<html><head>${correct}${correct}</head></html>`, correct))
      .toThrow("duplicate");
    expect(injectJsonFeedAlternate("<html><body>redirect</body></html>", correct))
      .toBe("<html><body>redirect</body></html>");
  });
});
