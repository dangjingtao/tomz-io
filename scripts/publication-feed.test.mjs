import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  JSON_FEED_VERSION,
  buildPublicationFeed,
  collectFeedArticles,
  collectWeeklyMetadata,
  normalizePublicationDate,
  productionCanonical,
} from "./publication-feed.mjs";

const SITE = "https://tomz.io";

function article(overrides = {}) {
  return {
    sourceFile: "blogs/shared-thinking/example/index.html",
    canonical: "https://tomz.io/blogs/shared-thinking/example/",
    title: "一篇已发布的文章",
    description: "公开摘要",
    datePublished: "2026-11-15",
    dateModified: "2026-11-16T07:18:27.000+08:00",
    authors: ["Tomz Dang"],
    image: undefined,
    section: "blogs",
    ...overrides,
  };
}

function catalog(books = []) {
  return { schemaVersion: 1, source: `${SITE}/books/`, books };
}

function weeklyMetadata(entries) {
  return new Map(entries);
}

function withTemp(fn) {
  const root = mkdtempSync(join(tmpdir(), "tomz-publication-feed-"));
  try {
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const base = { siteUrl: SITE, catalog: catalog() };

// JSON Feed 1.1 required fields and a usable text body.
{
  const feed = buildPublicationFeed({
    ...base,
    articles: [article()],
    weeklyMetadata: weeklyMetadata([]),
  });
  assert.equal(feed.version, JSON_FEED_VERSION);
  assert.equal(feed.home_page_url, "https://tomz.io/");
  assert.equal(feed.feed_url, "https://tomz.io/feed.json");
  assert.equal(feed._tomzio.contractVersion, 1);
  assert.equal(feed.items.length, 1);
  assert.ok(feed.items[0].content_text.length > 0);
  assert.equal(feed.items[0].id, feed.items[0].url);
  assert.deepEqual(feed.items[0].authors, [{ name: "Tomz Dang" }]);
}

// Date-only precision never fabricates a time; datetime keeps RFC 3339.
{
  const dateOnly = buildPublicationFeed({
    ...base,
    articles: [article()],
    weeklyMetadata: weeklyMetadata([]),
  }).items[0];
  assert.equal(dateOnly.date_published, undefined);
  assert.equal(dateOnly._tomzio.publishedDate, "2026-11-15");
  assert.equal(dateOnly._tomzio.publishedPrecision, "date");

  const precise = buildPublicationFeed({
    ...base,
    articles: [
      article({
        datePublished: "2026-11-15T09:07:05+08:00",
        dateModified: "2026-11-16T07:18:27+08:00",
      }),
    ],
    weeklyMetadata: weeklyMetadata([]),
  }).items[0];
  assert.equal(precise.date_published, "2026-11-15T09:07:05+08:00");
  assert.equal(precise.date_modified, "2026-11-16T07:18:27+08:00");
  assert.equal(precise._tomzio.publishedPrecision, "datetime");
  assert.deepEqual(normalizePublicationDate("2026-11-15T09:07:05"), {
    value: "2026-11-15",
    precision: "date",
  });
  assert.equal(normalizePublicationDate("2026-02-31"), undefined);
}

// One canonical identity survives duplicate static pages.
{
  const feed = buildPublicationFeed({
    ...base,
    articles: [
      article({ sourceFile: "b.html", title: "后出现的标题" }),
      article({ sourceFile: "a.html", title: "先出现的标题" }),
    ],
    weeklyMetadata: weeklyMetadata([]),
  });
  assert.equal(feed.items.length, 1);
  assert.equal(feed.items[0].title, "先出现的标题");
}

// A logical Book collection keeps the Blog canonical and does not duplicate it.
{
  const feed = buildPublicationFeed({
    ...base,
    catalog: catalog([
      {
        id: "book-a",
        entries: [
          {
            title: "已有博客收录",
            url: "https://tomz.io/blogs/shared-thinking/example",
            position: 3,
          },
        ],
      },
    ]),
    articles: [article()],
    weeklyMetadata: weeklyMetadata([]),
  });
  assert.equal(feed.items.length, 1);
  assert.equal(feed.items[0].id, "https://tomz.io/blogs/shared-thinking/example/");
  assert.equal(feed.items[0]._tomzio.section, "blogs");
  assert.deepEqual(feed.items[0]._tomzio.books, [
    { id: "book-a", position: 3 },
  ]);
}

// Missing optional metadata is omitted, not invented. The body still has a
// truthful title and a link to the canonical article.
{
  const feed = buildPublicationFeed({
    ...base,
    articles: [
      article({
        description: "",
        authors: [],
        datePublished: undefined,
        dateModified: undefined,
        image: "https://tomz.io/tomz-avatar.png",
      }),
    ],
    weeklyMetadata: weeklyMetadata([]),
  });
  const item = feed.items[0];
  assert.equal(item.summary, undefined);
  assert.equal(item.authors, undefined);
  assert.equal(item.image, undefined);
  assert.equal(item.date_published, undefined);
  assert.equal(item.date_modified, undefined);
  assert.equal(item._tomzio.publishedDate, undefined);
  assert.match(item.content_text, /一篇已发布的文章/);
  assert.match(item.content_text, /https:\/\/tomz\.io\/blogs\/shared-thinking\/example\//);
}

// Weekly issue and weekly article stay distinct; the article points at the
// confirmed issue canonical.
{
  const issue = article({
    sourceFile: "weekly/010/index.html",
    canonical: "https://tomz.io/weekly/010/",
    title: "见π 010｜效率的暗面",
    section: "weekly",
    authors: ["Mira", "Tomz Dang"],
  });
  const entry = article({
    sourceFile: "weekly/010/article/index.html",
    canonical: "https://tomz.io/weekly/010/article/",
    title: "期内文章",
    section: "weekly",
    authors: ["Mira"],
  });
  const feed = buildPublicationFeed({
    ...base,
    articles: [entry, issue],
    weeklyMetadata: weeklyMetadata([
      ["/weekly/010", { issueNumber: 10, group: "见π" }],
      ["/weekly/010/article", { issueNumber: 10, group: "见π" }],
    ]),
  });
  const byId = new Map(feed.items.map((item) => [item.id, item]));
  assert.equal(byId.get("https://tomz.io/weekly/010/")._tomzio.kind, "issue");
  assert.equal(byId.get("https://tomz.io/weekly/010/article/")._tomzio.kind, "article");
  assert.deepEqual(byId.get("https://tomz.io/weekly/010/article/")._tomzio.issue, {
    number: 10,
    url: "https://tomz.io/weekly/010/",
  });
}

// A path alone is not enough: without a published issue target, no issue
// relationship or issue kind is claimed.
{
  const entry = article({
    sourceFile: "weekly/010/article/index.html",
    canonical: "https://tomz.io/weekly/010/article/",
    title: "期内文章",
    section: "weekly",
  });
  const feed = buildPublicationFeed({
    ...base,
    articles: [entry],
    weeklyMetadata: weeklyMetadata([
      ["/weekly/010", { issueNumber: 10, group: "见π" }],
      ["/weekly/010/article", { issueNumber: 10, group: "见π" }],
    ]),
  });
  assert.equal(feed.items[0]._tomzio.kind, "article");
  assert.equal(feed.items[0]._tomzio.issue, undefined);
}

// Deterministic ordering: real modification first, then publication, then id.
{
  const feed = buildPublicationFeed({
    ...base,
    articles: [
      article({ canonical: "https://tomz.io/blogs/shared-thinking/a/", title: "A" }),
      article({ canonical: "https://tomz.io/blogs/shared-thinking/b/", title: "B" }),
      article({
        canonical: "https://tomz.io/blogs/shared-thinking/c/",
        title: "C",
        datePublished: "2026-12-01",
      }),
    ],
    weeklyMetadata: weeklyMetadata([]),
  });
  assert.deepEqual(feed.items.map((item) => item.title), ["C", "A", "B"]);
}

{
  const feed = buildPublicationFeed({
    ...base,
    articles: [
      article({
        canonical: "https://tomz.io/blogs/shared-thinking/newer-publication/",
        title: "较新的发布",
        datePublished: "2026-11-01",
        dateModified: "2026-11-02T00:00:00+08:00",
      }),
      article({
        canonical: "https://tomz.io/blogs/shared-thinking/newer-edit/",
        title: "较新的修改",
        datePublished: "2026-01-01",
        dateModified: "2026-12-01T00:00:00+08:00",
      }),
    ],
    weeklyMetadata: weeklyMetadata([]),
  });
  assert.deepEqual(feed.items.map((item) => item.title), ["较新的修改", "较新的发布"]);
}

// Invalid Book catalog or non-site identities are broken input, not empty data.
{
  assert.throws(
    () =>
      buildPublicationFeed({
        ...base,
        catalog: { schemaVersion: 2, books: [] },
        articles: [article()],
        weeklyMetadata: weeklyMetadata([]),
      }),
    /Book catalog/,
  );
  assert.throws(
    () =>
      buildPublicationFeed({
        ...base,
        articles: [article({ canonical: "https://example.com/blogs/x/" })],
        weeklyMetadata: weeklyMetadata([]),
      }),
    /public HTTPS canonical URL/,
  );
  assert.throws(
    () =>
      buildPublicationFeed({
        ...base,
        articles: [],
        weeklyMetadata: weeklyMetadata([]),
      }),
    /no published Article entries/,
  );
}

// Static collection skips malformed JSON-LD and non-Article pages, but rejects
// an Article whose identity disagrees with its canonical link.
withTemp((root) => {
  mkdirSync(join(root, "blogs/example"), { recursive: true });
  writeFileSync(
    join(root, "blogs/example/index.html"),
    '<link rel="canonical" href="https://tomz.io/blogs/example/"><script type="application/ld+json">' +
      JSON.stringify({
        "@type": "Article",
        url: "https://tomz.io/blogs/example/",
        headline: "Example",
        author: [{ "@type": "Person", name: "Tomz Dang" }],
      }) +
      "</script>",
  );
  writeFileSync(
    join(root, "index.html"),
    '<link rel="canonical" href="https://tomz.io/"><script type="application/ld+json">{broken</script>',
  );
  const articles = collectFeedArticles(root, SITE);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].canonical, "https://tomz.io/blogs/example/");

  writeFileSync(
    join(root, "blogs/example/index.html"),
    '<link rel="canonical" href="https://tomz.io/blogs/example/"><script type="application/ld+json">' +
      JSON.stringify({
        "@type": "Article",
        url: "https://tomz.io/blogs/other/",
        headline: "Example",
      }) +
      "</script>",
  );
  assert.throws(() => collectFeedArticles(root, SITE), /does not match canonical/);
});

// GitHub Pages static output carries the deployment base in canonical links;
// published feed identity stays on the production canonical.
withTemp((root) => {
  mkdirSync(join(root, "blogs/example"), { recursive: true });
  writeFileSync(
    join(root, "index.html"),
    '<link rel="canonical" href="https://tomz.io/tomz-io/">',
  );
  writeFileSync(
    join(root, "blogs/example/index.html"),
    '<link rel="canonical" href="https://tomz.io/tomz-io/blogs/example/"><script type="application/ld+json">' +
      JSON.stringify({
        "@type": "Article",
        url: "https://tomz.io/tomz-io/blogs/example/",
        headline: "Example",
        image: "https://tomz.io/tomz-io/assets/example-cover.webp",
      }) +
      "</script>",
  );
  const articles = collectFeedArticles(root, SITE);
  assert.equal(articles[0].canonical, "https://tomz.io/blogs/example/");
  assert.equal(articles[0].section, "blogs");
  assert.equal(
    articles[0].image,
    "https://tomz.io/assets/example-cover.webp",
  );
  assert.equal(
    productionCanonical(
      "https://tomz.io/tomz-io/weekly/010/",
      "/tomz-io",
    ),
    "https://tomz.io/weekly/010/",
  );
});

// Published weekly Markdown metadata is read without falling back to paths.
withTemp((root) => {
  mkdirSync(join(root, "weekly/010"), { recursive: true });
  writeFileSync(
    join(root, "weekly/010/index.md"),
    "---\ntitle: 见π 010\ngroup: 见π\nissue: 10\ndate: 2026年11月15日\n---\n\n正文\n",
  );
  writeFileSync(
    join(root, "weekly/010/article.md"),
    "---\ntitle: 文章\ngroup: 见π\nissue: 10\ndate: 2026年11月15日\n---\n\n正文\n",
  );
  const metadata = collectWeeklyMetadata(root);
  assert.deepEqual(metadata.get("/weekly/010"), {
    issueNumber: 10,
    group: "见π",
  });
  assert.deepEqual(metadata.get("/weekly/010/article"), {
    issueNumber: 10,
    group: "见π",
  });
});

console.log(
  "PASS publication feed: JSON Feed 1.1 shape, date precision, canonical dedupe, logical Book archive, issue/article split, missing metadata, broken input",
);
