import { strict as assert } from "node:assert";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createCatalog } from "./generate-book-catalog.mjs";

function fixture(mutator = (x) => x) {
  const root = mkdtempSync(join(tmpdir(), "tomz-catalog-"));
  mkdirSync(join(root, "books", "covers"), { recursive: true });
  mkdirSync(join(root, "books", "agent"), { recursive: true });
  writeFileSync(join(root, "books", "index.html"), "<h1>书架</h1>");
  const data = mutator({
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: "一起学智能体", description: "学习 Agent",
    url: "https://tomz.io/books/agent", image: "/books/covers/agent.webp",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "第一篇", url: "https://tomz.io/books/agent/first" },
        { "@type": "ListItem", position: 2, name: "第二篇", url: "https://tomz.io/blogs/second" },
      ],
    },
  });
  mkdirSync(join(root, "src", "pages", "books", "agent"), { recursive: true });
  writeFileSync(join(root, "src", "pages", "books", "agent", "_book.yml"),
    "id: agent\ntitle: 一起学智能体\norder: 10\nkind: study\nstatus: active\n");
  writeFileSync(join(root, "books", "agent", "index.html"),
    '<script type="application/ld+json">' + JSON.stringify(data) + "</script>");
  return root;
}
test("publishes book metadata and logically included chapters from public JSON-LD", () => {
  const root = fixture();
  try {
    const result = createCatalog(root, root);
    assert.equal(result.schemaVersion, 1);
    assert.equal(result.books.length, 1);
    assert.equal(result.books[0].cover, "https://tomz.io/books/covers/agent.webp");
    assert.equal(result.books[0].entryCount, 2);
    assert.equal(result.books[0].order, 10);
    assert.equal(result.books[0].status, "active");
    assert.deepEqual(result.books[0].entries.map((x) => x.position), [1, 2]);
    assert.equal(result.books[0].entries[1].url, "https://tomz.io/blogs/second");
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test("rejects insecure cover schemes, preserving the publisher's arbitrary HTTPS cover contract", () => {
  const root = fixture((data) => ({ ...data, image: "http://untrusted.invalid/cover.png" }));
  try { assert.throws(() => createCatalog(root, root), /untrusted book cover/); }
  finally { rmSync(root, { recursive: true, force: true }); }
});
test("accepts a publisher-specified external HTTPS cover", () => {
  const root = fixture((data) => ({ ...data, image: "https://cdn.example.com/cover.webp?v=2" }));
  try { assert.equal(createCatalog(root, root).books[0].cover, "https://cdn.example.com/cover.webp?v=2"); }
  finally { rmSync(root, { recursive: true, force: true }); }
});
test("rejects broken chapter positions and non-public URLs", () => {
  const root = fixture((data) => ({
    ...data,
    mainEntity: { "@type": "ItemList", itemListElement: [{ name: "x", position: 5, url: "javascript:alert(1)" }] },
  }));
  try { assert.throws(() => createCatalog(root, root), /invalid agent.entries/); }
  finally { rmSync(root, { recursive: true, force: true }); }
});
