import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(process.argv[2] || "/tmp/br003a-source");
const expectedSourceSha = readFileSync(resolve(root, ".br003a-source-sha"), "utf8").trim();
const failures = [];

function filesUnder(base) {
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(base, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function digest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function compareTree(relativeRoot) {
  const sourceBase = resolve(sourceRoot, relativeRoot);
  const targetBase = resolve(root, relativeRoot);
  const sourceFiles = filesUnder(sourceBase).map((path) => relative(sourceBase, path).replaceAll("\\", "/")).sort();
  const targetFiles = filesUnder(targetBase).map((path) => relative(targetBase, path).replaceAll("\\", "/")).sort();

  if (JSON.stringify(sourceFiles) !== JSON.stringify(targetFiles)) {
    const sourceSet = new Set(sourceFiles);
    const targetSet = new Set(targetFiles);
    const missing = sourceFiles.filter((path) => !targetSet.has(path));
    const extra = targetFiles.filter((path) => !sourceSet.has(path));
    failures.push(`${relativeRoot}: file set differs; missing=${missing.join(",") || "none"}; extra=${extra.join(",") || "none"}`);
  }

  for (const path of sourceFiles) {
    const target = resolve(targetBase, path);
    if (existsSync(target) && digest(resolve(sourceBase, path)) !== digest(target)) {
      failures.push(`${relativeRoot}/${path}: content differs`);
    }
  }
}

compareTree("src");
compareTree("public");

for (const path of [
  "index.html",
  "docs.html",
  "mira-docs-static.ts",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  "tsconfig.node.json",
]) {
  const source = resolve(sourceRoot, path);
  const target = resolve(root, path);
  if (!existsSync(source) || !existsSync(target)) failures.push(`${path}: missing in source or target`);
  else if (digest(source) !== digest(target)) failures.push(`${path}: content differs from source`);
}

const sourceMarkdown = filesUnder(resolve(sourceRoot, "src/pages"))
  .filter((path) => path.endsWith(".md"))
  .map((path) => relative(resolve(sourceRoot, "src/pages"), path).replaceAll("\\", "/"))
  .sort();
const targetMarkdown = filesUnder(resolve(root, "src/pages"))
  .filter((path) => path.endsWith(".md"))
  .map((path) => relative(resolve(root, "src/pages"), path).replaceAll("\\", "/"))
  .sort();

if (sourceMarkdown.length < 66) failures.push(`source Markdown count below BR003A baseline: ${sourceMarkdown.length}`);
if (JSON.stringify(sourceMarkdown) !== JSON.stringify(targetMarkdown)) failures.push("src/pages Markdown file set differs from pinned source");

let identicalMarkdown = 0;
for (const path of sourceMarkdown) {
  const target = resolve(root, "src/pages", path);
  if (existsSync(target) && digest(resolve(sourceRoot, "src/pages", path)) === digest(target)) identicalMarkdown += 1;
}

const historical13 = [
  "blogs/mira-letters/a-seat-at-the-writing-table.md",
  "blogs/mira-letters/to-those-who-still-believe-in-their-work.md",
  "blogs/shared-thinking/evolution-to-a-real-person.md",
  "blogs/shared-thinking/future-after-humanity.md",
  "blogs/shared-thinking/matter-awakens.md",
  "blogs/product-journal/2026-07-05-open-source-agent-ecosystem.md",
  "blogs/product-journal/codex-app-server-automation-notes.md",
  "blogs/product-journal/mira-tts-provider-notes.md",
  "blogs/product-journal/qingcheng-mcp-bridge-notes.md",
  "blogs/engineering/insight-capture-pipeline.md",
  "blogs/engineering/insight-rebuild-pipeline.md",
  "blogs/engineering/mcp-marketplace-agent-integration.md",
  "blogs/engineering/media-capability-packaging.md",
];
for (const path of historical13) {
  if (!existsSync(resolve(root, "src/pages", path))) failures.push(`historical BR003 source missing: ${path}`);
}

for (const path of [
  "docs/about/author.md",
  "mira-docs-api/guide/what-is-mira-docs.md",
  "design-md/视觉/product-design-system.md",
]) {
  if (!existsSync(resolve(root, "src/pages", path))) failures.push(`representative content missing: ${path}`);
}

const vite = readFileSync(resolve(root, "vite.config.ts"), "utf8");
if (!vite.includes('isGitHubPagesBuild ? "/tomz-io/" : "/"')) failures.push("vite.config.ts: target Pages base missing");
if (vite.includes('isGitHubPagesBuild ? "/uichat-mira-docs/" : "/"')) failures.push("vite.config.ts: upstream Pages base still active");

if (failures.length) {
  console.error("BR003A mirror integrity failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`BR003A mirror integrity passed: source=${expectedSourceSha}; Markdown=${sourceMarkdown.length}; identical=${identicalMarkdown}; differing=${sourceMarkdown.length - identicalMarkdown}; src/public byte-identical; historical13=13/13.`);
