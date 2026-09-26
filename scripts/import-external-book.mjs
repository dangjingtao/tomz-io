import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const BOOK_KINDS = new Set(["study", "reading-notes", "novel", "collection", "other"]);
const BOOK_STATUSES = new Set(["active", "completed", "draft", "archived"]);
const SUPPORTED_AUTHORS = new Set(["tomz", "mira", "t-zt"]);

function fail(message) {
  throw new Error(`external-book: ${message}`);
}

function requiredString(value, label) {
  if (typeof value !== "string" || !value.trim()) fail(`${label} is required`);
  return value.trim();
}

function safeSlug(value, label) {
  const slug = requiredString(value, label);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    fail(`${label} must use lowercase letters, numbers, and hyphens: ${slug}`);
  }
  return slug;
}

function safeSourcePath(root, value, label) {
  const relative = requiredString(value, label).replace(/\\/g, "/");
  if (relative.startsWith("/") || relative.split("/").includes("..")) {
    fail(`${label} must stay inside the source repository: ${relative}`);
  }
  const target = resolve(root, relative);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    fail(`${label} escapes the source repository: ${relative}`);
  }
  return { relative, target };
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function stripSourceFrontmatter(markdown) {
  const normalized = markdown.replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---\n") && !normalized.startsWith("---\r\n")) return normalized;
  const lines = normalized.split(/\r?\n/);
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === "---") {
      return lines.slice(index + 1).join("\n").replace(/^\s+/, "");
    }
  }
  fail("source Markdown starts frontmatter but has no closing delimiter");
}

function firstH1(markdown, sourcePath) {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  if (!match) fail(`source Markdown needs an H1 title: ${sourcePath}`);
  return match[1].trim();
}

function validateNoLocalMedia(markdown, sourcePath) {
  const imagePattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of markdown.matchAll(imagePattern)) {
    const url = match[1];
    if (/^(?:https?:|data:)/i.test(url)) continue;
    fail(`local Markdown media is not supported yet (${sourcePath} -> ${url})`);
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function parseArgs(argv) {
  const options = {
    source: "",
    output: "src/pages/books",
    sourceRepository: "",
    sourceSha: "",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];
    if (key === "--source") options.source = value || "";
    else if (key === "--output") options.output = value || "";
    else if (key === "--source-repository") options.sourceRepository = value || "";
    else if (key === "--source-sha") options.sourceSha = value || "";
    else fail(`unknown argument: ${key}`);
    index += 1;
  }
  if (!options.source) fail("--source is required");
  return options;
}

function validateAuthorship(entry, label) {
  const authorship = entry?.authorship;
  if (!authorship || authorship.status !== "resolved") {
    fail(`${label}.authorship must be explicitly resolved in the source repository`);
  }
  if (!Array.isArray(authorship.authors) || authorship.authors.length === 0) {
    fail(`${label}.authorship.authors must contain at least one author`);
  }
  const authors = authorship.authors.map((value) => requiredString(value, `${label}.authorship.authors[]`));
  for (const author of authors) {
    if (!SUPPORTED_AUTHORS.has(author)) {
      fail(`${label} author "${author}" is not registered in tomz.io`);
    }
  }
  const writtenBy = Array.isArray(authorship.writtenBy) && authorship.writtenBy.length
    ? authorship.writtenBy.map((value) => requiredString(value, `${label}.authorship.writtenBy[]`))
    : authors;
  for (const author of writtenBy) {
    if (!SUPPORTED_AUTHORS.has(author)) {
      fail(`${label} writtenBy author "${author}" is not registered in tomz.io`);
    }
  }
  const reviewedBy = authorship.reviewedBy == null
    ? ""
    : requiredString(authorship.reviewedBy, `${label}.authorship.reviewedBy`);
  if (reviewedBy && !SUPPORTED_AUTHORS.has(reviewedBy)) {
    fail(`${label} reviewedBy author "${reviewedBy}" is not registered in tomz.io`);
  }
  return { authors, writtenBy, reviewedBy };
}

export async function importExternalBook(options) {
  const sourceRoot = resolve(options.source);
  const outputRoot = resolve(options.output || "src/pages/books");
  const contractPath = resolve(sourceRoot, "publication.json");
  const contract = JSON.parse(await readFile(contractPath, "utf8"));

  if (contract.schemaVersion !== 1) fail("publication.json schemaVersion must be 1");
  const book = contract.book || {};
  const bookId = safeSlug(book.id, "book.id");
  const title = requiredString(book.title, "book.title");
  const description = requiredString(book.description, "book.description");
  const kind = requiredString(book.kind || "other", "book.kind");
  const status = requiredString(book.status || "active", "book.status");
  const order = Number(book.order ?? 0);
  if (!BOOK_KINDS.has(kind)) fail(`unsupported book.kind: ${kind}`);
  if (!BOOK_STATUSES.has(status)) fail(`unsupported book.status: ${status}`);
  if (!Number.isFinite(order)) fail("book.order must be a number");
  if (!Array.isArray(contract.entries) || contract.entries.length === 0) {
    fail("publication.json entries must not be empty");
  }

  const destination = resolve(outputRoot, bookId);
  if (await exists(destination)) {
    fail(`destination already exists; external import must not overwrite local content: ${destination}`);
  }

  const preparedEntries = [];
  const slugs = new Set();
  for (const [index, entry] of contract.entries.entries()) {
    const label = `entries[${index}]`;
    const slug = safeSlug(entry.slug, `${label}.slug`);
    if (slugs.has(slug)) fail(`duplicate entry slug: ${slug}`);
    slugs.add(slug);
    const source = safeSourcePath(sourceRoot, entry.source, `${label}.source`);
    const entryOrder = Number(entry.order ?? index);
    if (!Number.isFinite(entryOrder)) fail(`${label}.order must be a number`);
    const entryDescription = requiredString(entry.description, `${label}.description`);
    const tags = Array.isArray(entry.tags)
      ? entry.tags.map((value) => requiredString(value, `${label}.tags[]`))
      : [];
    const authorship = validateAuthorship(entry, label);

    const rawMarkdown = await readFile(source.target, "utf8");
    const body = stripSourceFrontmatter(rawMarkdown);
    const entryTitle = firstH1(body, source.relative);
    validateNoLocalMedia(body, source.relative);

    preparedEntries.push({
      slug,
      source: source.relative,
      order: entryOrder,
      description: entryDescription,
      tags,
      authorship,
      title: entryTitle,
      body,
      date: typeof entry.date === "string" ? entry.date.trim() : "",
      publishedAt: typeof entry.publishedAt === "string" ? entry.publishedAt.trim() : "",
      readTime: typeof entry.readTime === "string" ? entry.readTime.trim() : "",
    });
  }

  await mkdir(destination, { recursive: true });
  const manifest = [
    `id: ${bookId}`,
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    book.category ? `category: ${yamlString(book.category)}` : "",
    `kind: ${kind}`,
    `order: ${order}`,
    `status: ${status}`,
    "",
  ].filter((line, index, all) => line !== "" || index === all.length - 1).join("\n");
  await writeFile(resolve(destination, "_book.yml"), manifest, "utf8");

  for (const entry of preparedEntries) {
    const frontmatter = [
      "---",
      `title: ${yamlString(entry.title)}`,
      `description: ${yamlString(entry.description)}`,
      `group: ${yamlString(title)}`,
      `order: ${entry.order}`,
      entry.date ? `date: ${yamlString(entry.date)}` : "",
      entry.publishedAt ? `publishedAt: ${yamlString(entry.publishedAt)}` : "",
      entry.readTime ? `readTime: ${yamlString(entry.readTime)}` : "",
      entry.tags.length ? `tags: ${yamlString(entry.tags.join(" | "))}` : "",
      `author: ${yamlString(entry.authorship.authors.join(" | "))}`,
      `writingMode: ${entry.authorship.authors.length > 1 ? "co-authored" : "authored"}`,
      `writtenBy: ${yamlString(entry.authorship.writtenBy.join(" | "))}`,
      entry.authorship.reviewedBy ? `reviewedBy: ${yamlString(entry.authorship.reviewedBy)}` : "",
      options.sourceRepository && options.sourceSha
        ? `commitUrl: ${yamlString(`https://github.com/${options.sourceRepository}/blob/${options.sourceSha}/${entry.source}`)}`
        : "",
      "---",
      "",
      entry.body.trimEnd(),
      "",
    ].filter(Boolean).join("\n");
    await writeFile(resolve(destination, `${entry.slug}.md`), frontmatter, "utf8");
  }

  return {
    bookId,
    destination,
    entries: preparedEntries.map(({ slug, source, title: entryTitle }) => ({ slug, source, title: entryTitle })),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await importExternalBook(options);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  main().catch(async (error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
