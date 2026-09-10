import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const DEFAULT_MANIFEST = ".mira-cache/media-r2/manifest.json";

export async function applyProductionMedia(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const manifestPath = path.resolve(repoRoot, options.manifest || DEFAULT_MANIFEST);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const byFile = new Map();

  for (const rewrite of manifest.rewrites || []) {
    const key = rewrite.file;
    const mappings = byFile.get(key) || new Map();
    const previous = mappings.get(rewrite.from);
    if (previous && previous !== rewrite.to) {
      throw new Error(`Conflicting media rewrite in ${key}.`);
    }
    mappings.set(rewrite.from, rewrite.to);
    byFile.set(key, mappings);
  }

  let changedFiles = 0;
  for (const [relativeFile, mappings] of byFile) {
    const file = path.resolve(repoRoot, relativeFile);
    const safe = path.relative(repoRoot, file);
    if (safe.startsWith("..") || path.isAbsolute(safe)) throw new Error(`Unsafe rewrite path: ${relativeFile}`);
    let source = await readFile(file, "utf8");
    let changed = false;
    for (const [from, to] of mappings) {
      if (!source.includes(from)) throw new Error(`Media source changed before apply: ${relativeFile}`);
      const next = source.split(from).join(to);
      if (next !== source) changed = true;
      source = next;
    }
    if (changed) {
      await writeFile(file, source);
      changedFiles += 1;
    }
  }

  return { changedFiles, rewrites: manifest.rewrites?.length || 0 };
}

async function main() {
  const result = await applyProductionMedia();
  console.log(`Applied ${result.rewrites} media rewrite(s) across ${result.changedFiles} source file(s).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error?.stack || error);
    process.exit(1);
  });
}
