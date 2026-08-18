import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";

const contentRoot = resolve(process.cwd(), "src/content/markdown");

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith(".md") && !/^README\.md$/i.test(entry.name) ? [path] : [];
  });
}

function authors(doc) {
  const value = doc.data.author;
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(/[|,，]/).map((item) => item.trim()).filter(Boolean);
}

const failures = [];
const routes = new Map();

const fixtures = [
  [
    "scalar author",
    `---\ntitle: Scalar author\ndescription: fixture\ngroup: 产品手记\norder: 1\nauthor: tomz | mira\n---\n\n# Scalar author\n`,
  ],
  [
    "YAML list author",
    `---\ntitle: YAML list author\ndescription: fixture\ngroup: 产品手记\norder: 2\nauthor:\n  - tomz\n  - mira\n---\n\n# YAML list author\n`,
  ],
];

for (const [name, raw] of fixtures) {
  try {
    const doc = parseMiraDoc(`blogs/fixtures/${name.replace(/\s+/g, "-")}.md`, raw);
    const parsedAuthors = authors(doc);
    if (parsedAuthors.join("|") !== "tomz|mira") {
      failures.push(`${name}: author 解析结果为 ${JSON.stringify(parsedAuthors)}`);
    }
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

for (const file of markdownFiles(contentRoot)) {
  const sourcePath = relative(contentRoot, file).replace(/\\/g, "/");
  try {
    const doc = parseMiraDoc(sourcePath, readFileSync(file, "utf8"));
    const previous = routes.get(doc.path);
    if (previous) failures.push(`重复路由 ${doc.path}: ${previous}, ${sourcePath}`);
    else routes.set(doc.path, sourcePath);
    if (!doc.title.trim()) failures.push(`缺少 title: ${sourcePath}`);
    if (!doc.body.trim()) failures.push(`正文为空: ${sourcePath}`);
  } catch (error) {
    failures.push(`${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  console.error("MiraDocs compatibility check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`MiraDocs compatibility passed: author fixtures=2, content routes=${routes.size}.`);
