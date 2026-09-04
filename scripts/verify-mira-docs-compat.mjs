import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";

const contentRoot = resolve(process.cwd(), "src/pages");

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith(".md") && !/^README\.md$/i.test(entry.name)
      ? [path]
      : [];
  });
}

const failures = [];
const routes = new Map();
const counts = new Map();
const files = markdownFiles(contentRoot);
const projectDirectories = new Map();
const projectsRoot = resolve(contentRoot, "projects");
const booksRoot = resolve(contentRoot, "books");

function manifestScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function manifestId(path) {
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (key === "id") return manifestScalar(line.slice(separator + 1));
  }
  return "";
}

if (existsSync(booksRoot)) {
  for (const entry of readdirSync(booksRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifestPath = resolve(booksRoot, entry.name, "_book.yml");
    if (!existsSync(manifestPath)) continue;
    const id = manifestId(manifestPath);
    if (!id) {
      failures.push(`Book manifest 缺少 id: books/${entry.name}/_book.yml`);
    } else if (id !== entry.name) {
      failures.push(
        `Book manifest id 必须与目录一致: books/${entry.name}/_book.yml -> id=${id}`,
      );
    }
  }
}

if (existsSync(projectsRoot)) {
  for (const entry of readdirSync(projectsRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && !existsSync(resolve(projectsRoot, entry.name, "index.md"))) {
      failures.push(`项目目录缺少概览 index.md: projects/${entry.name}`);
    }
  }
}

for (const file of markdownFiles(projectsRoot)) {
  const sourcePath = relative(contentRoot, file).replace(/\\/g, "/");
  if (basename(file).toLowerCase() !== "index.md") {
    failures.push(`项目文章必须使用独立目录和 index.md: ${sourcePath}`);
  }
  const directory = dirname(file);
  projectDirectories.set(directory, (projectDirectories.get(directory) ?? 0) + 1);
}
for (const [directory, count] of projectDirectories) {
  if (count !== 1) {
    failures.push(`项目文章目录必须且只能包含一个 Markdown: ${relative(contentRoot, directory)}`);
  }
}

for (const file of files) {
  const sourcePath = relative(contentRoot, file).replace(/\\/g, "/");
  const raw = readFileSync(file, "utf8");

  try {
    const doc = parseMiraDoc(sourcePath, raw);
    const route = doc.path;
    const previous = routes.get(route);

    if (previous) {
      failures.push(`重复路由 ${route}: ${previous}, ${sourcePath}`);
    } else {
      routes.set(route, sourcePath);
    }

    if (!doc.title.trim() || doc.title === doc.path) {
      failures.push(`缺少 title: ${sourcePath}`);
    }
    if (!doc.body.trim()) {
      failures.push(`正文为空: ${sourcePath}`);
    }
    if (sourcePath.startsWith("projects/")) {
      const authors = Array.isArray(doc.data.author)
        ? doc.data.author.map(String)
        : [];
      if (Object.hasOwn(doc.data, "project")) {
        failures.push(`项目归属由目录决定，不应维护 project 字段: ${sourcePath}`);
      }
      if (doc.type !== "project") failures.push(`项目 type 必须为 project: ${sourcePath}`);
      if (!doc.description.trim()) failures.push(`项目缺少 description: ${sourcePath}`);
      if (!doc.group.trim()) failures.push(`项目缺少 group: ${sourcePath}`);
      if (!doc.status?.trim()) failures.push(`项目缺少 status: ${sourcePath}`);
      if (authors.length !== 1 || authors[0] !== "tomz" || doc.data.writtenBy !== "tomz") {
        failures.push(`项目署名必须为 Tomz: ${sourcePath}`);
      }
      const h1 = doc.body.match(/^#\s+(.+)$/m)?.[1]?.trim();
      if (h1 !== doc.title) failures.push(`项目首个 H1 必须与 title 一致: ${sourcePath}`);
    }

    counts.set(doc.type, (counts.get(doc.type) ?? 0) + 1);
  } catch (error) {
    failures.push(
      `${sourcePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (files.length === 0) {
  failures.push(`没有在 ${contentRoot} 找到 Markdown 内容`);
}

if (failures.length > 0) {
  console.error("MiraDocs 兼容检查失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const summary = [...counts.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([type, count]) => `${type}=${count}`)
  .join(", ");

console.log(
  `MiraDocs compatibility passed: ${files.length} files, ${routes.size} routes (${summary}).`,
);
