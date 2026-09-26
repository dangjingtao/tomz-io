import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { importExternalBook } from "./import-external-book.mjs";

async function withTemp(fn) {
  const root = await mkdtemp(join(tmpdir(), "external-book-test-"));
  try {
    await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function writeFixture(root, overrides = {}) {
  const source = join(root, "source");
  const output = join(root, "site-books");
  await mkdir(join(source, "essays"), { recursive: true });
  await mkdir(output, { recursive: true });

  const contract = {
    schemaVersion: 1,
    book: {
      id: "example-book",
      title: "Example Book",
      description: "Example description",
      category: "Research",
      kind: "collection",
      order: 50,
      status: "active",
    },
    entries: [
      {
        source: "essays/first.md",
        slug: "first",
        order: 10,
        description: "First entry",
        tags: ["History", "Research"],
        authorship: {
          status: "resolved",
          authors: ["tomz", "mira"],
          writtenBy: ["tomz", "mira"],
        },
      },
    ],
    ...overrides,
  };

  await writeFile(join(source, "publication.json"), JSON.stringify(contract, null, 2));
  await writeFile(
    join(source, "essays/first.md"),
    [
      "---",
      "status: Draft",
      "---",
      "",
      "# First Essay",
      "",
      "A paragraph with an [external source](https://example.com).",
      "",
    ].join("\n"),
  );

  return { source, output, contract };
}

await withTemp(async (root) => {
  const { source, output } = await writeFixture(root);
  const result = await importExternalBook({
    source,
    output,
    sourceRepository: "dangjingtao/example",
    sourceSha: "a".repeat(40),
  });

  assert.equal(result.bookId, "example-book");
  assert.deepEqual(result.entries.map((entry) => entry.slug), ["first"]);

  const manifest = await readFile(join(output, "example-book/_book.yml"), "utf8");
  assert.match(manifest, /id: example-book/);
  assert.match(manifest, /title: "Example Book"/);

  const article = await readFile(join(output, "example-book/first.md"), "utf8");
  assert.match(article, /title: "First Essay"/);
  assert.match(article, /author: "tomz \| mira"/);
  assert.match(article, /writingMode: co-authored/);
  assert.match(article, /commitUrl: "https:\/\/github.com\/dangjingtao\/example\/blob\/a{40}\/essays\/first.md"/);
  assert.doesNotMatch(article, /status: Draft/);
  assert.match(article, /# First Essay/);
});

await withTemp(async (root) => {
  const { source, output, contract } = await writeFixture(root);
  contract.entries[0].authorship = { status: "unresolved", authors: [] };
  await writeFile(join(source, "publication.json"), JSON.stringify(contract, null, 2));

  await assert.rejects(
    () => importExternalBook({ source, output }),
    /authorship must be explicitly resolved/,
  );
});

await withTemp(async (root) => {
  const { source, output, contract } = await writeFixture(root);
  contract.entries[0].source = "../outside.md";
  await writeFile(join(source, "publication.json"), JSON.stringify(contract, null, 2));

  await assert.rejects(
    () => importExternalBook({ source, output }),
    /must stay inside the source repository/,
  );
});

process.stdout.write("external-book importer tests passed\n");
