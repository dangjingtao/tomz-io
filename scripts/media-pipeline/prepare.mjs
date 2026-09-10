import crypto from "node:crypto";
import path from "node:path";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const SUPPORTED_LOCAL_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const DEFAULT_PUBLIC_BASE = "https://assets.tomz.io";
const DEFAULT_MAX_LONG_EDGE = 5120;
const DEFAULT_CACHE_ROOT = ".mira-cache/media-r2";

function slash(value) {
  return value.split(path.sep).join("/");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sanitizeSegment(value) {
  return String(value || "asset")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}

function stripQuotes(value) {
  const trimmed = String(value || "").trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { bodyOffset: 0, text: "", data: new Map() };
  const data = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (pair) data.set(pair[1], stripQuotes(pair[2]));
  }
  return { bodyOffset: match[0].length, text: match[1], data };
}

async function walkMarkdown(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkMarkdown(absolute)));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(absolute);
  }
  return files.sort();
}

function addReference(references, seen, source, file, rawValue, role, kind) {
  const value = stripQuotes(rawValue);
  if (!value) return;
  const key = `${kind}\u0000${value}`;
  if (seen.has(key)) return;
  seen.add(key);
  references.push({ file, source, value, role, kind });
}

function collectReferences(file, source) {
  const references = [];
  const seen = new Set();
  const frontmatter = parseFrontmatter(source);

  for (const field of ["cover", "image"]) {
    const value = frontmatter.data.get(field);
    if (value) addReference(references, seen, source, file, value, "cover", `frontmatter:${field}`);
  }

  const markdownImage = /!\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
  for (const match of source.matchAll(markdownImage)) {
    addReference(references, seen, source, file, match[1], "inline", "markdown");
  }

  const htmlImage = /<img\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1[^>]*>/gi;
  for (const match of source.matchAll(htmlImage)) {
    addReference(references, seen, source, file, match[2], "inline", "html");
  }

  return { references, frontmatter };
}

function parseDataImage(value) {
  const match = value.match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) return null;
  const subtype = match[1].toLowerCase();
  const extension = subtype === "jpeg" || subtype === "jpg" ? ".jpg" : `.${subtype}`;
  try {
    const bytes = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
    if (!bytes.length) return null;
    return { bytes, extension, sourceKind: "base64" };
  } catch {
    return null;
  }
}

function isIgnoredRemote(value) {
  return /^https?:\/\//i.test(value) || /^blob:/i.test(value) || /^data:image\/svg\+xml/i.test(value);
}

async function resolveLocalImage(value, sourceFile, repoRoot) {
  const withoutQuery = value.split(/[?#]/, 1)[0];
  const extension = path.extname(withoutQuery).toLowerCase();
  if (!SUPPORTED_LOCAL_EXTENSIONS.has(extension)) return null;

  const candidates = [];
  if (withoutQuery.startsWith("/")) {
    candidates.push(path.join(repoRoot, "public", withoutQuery.replace(/^\/+/, "")));
  } else if (/^(src|public)\//.test(withoutQuery)) {
    candidates.push(path.join(repoRoot, withoutQuery));
  } else {
    candidates.push(path.resolve(path.dirname(sourceFile), withoutQuery));
    candidates.push(path.join(repoRoot, "public", withoutQuery));
  }

  for (const candidate of candidates) {
    const relative = path.relative(repoRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    try {
      const info = await stat(candidate);
      if (!info.isFile()) continue;
      return { bytes: await readFile(candidate), extension, sourceKind: "local", sourcePath: candidate };
    } catch {
      // Try the next safe candidate.
    }
  }
  return { unresolved: true, extension };
}

function contentNamespace(sourceFile, pagesRoot, frontmatter) {
  const relative = slash(path.relative(pagesRoot, sourceFile)).replace(/\.md$/i, "");
  const parts = relative.split("/").filter(Boolean);
  const root = parts.shift() || "content";
  const rest = parts.length ? parts : ["index"];

  if (root === "weekly") {
    const issue = Number(frontmatter.data.get("issue"));
    const issueId = Number.isFinite(issue) && issue > 0
      ? String(Math.trunc(issue)).padStart(3, "0")
      : sanitizeSegment(rest.at(-1));
    return `tomz-io/jianpi/${issueId}`;
  }

  return `tomz-io/${sanitizeSegment(root)}/${rest.map(sanitizeSegment).join("/")}`;
}

function objectBaseName(reference, digest, sourcePath) {
  if (reference.role === "cover") return "cover";
  if (sourcePath) {
    const basename = path.basename(sourcePath, path.extname(sourcePath));
    return sanitizeSegment(basename);
  }
  return `inline-${digest.slice(0, 12)}`;
}

async function optimizeImage(input, reference, maxLongEdge) {
  const originalDigest = sha256(input.bytes);
  if (input.extension === ".webp") {
    return {
      bytes: input.bytes,
      extension: ".webp",
      strategy: input.sourceKind === "base64" ? "webp-base64-passthrough" : "webp-passthrough",
      originalDigest,
    };
  }

  const { default: sharp } = await import("sharp");
  const image = sharp(input.bytes, { failOn: "error" }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const longEdge = Math.max(width, height);
  const shouldResize = longEdge > maxLongEdge;
  let pipeline = sharp(input.bytes, { failOn: "error" }).rotate().toColourspace("srgb");
  if (shouldResize) {
    pipeline = pipeline.resize({
      width: width >= height ? maxLongEdge : undefined,
      height: height > width ? maxLongEdge : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  let webp;
  if (input.extension === ".png" && metadata.hasAlpha) {
    webp = await pipeline.webp({ lossless: true, effort: 5 }).toBuffer();
  } else if (reference.role === "cover") {
    webp = await pipeline.webp({ quality: 92, effort: 5, smartSubsample: true }).toBuffer();
  } else if (input.extension === ".png") {
    webp = await pipeline.webp({ quality: 95, nearLossless: true, effort: 5 }).toBuffer();
  } else {
    webp = await pipeline.webp({ quality: 90, effort: 5, smartSubsample: true }).toBuffer();
  }

  const meaningfulSaving = webp.length <= Math.floor(input.bytes.length * 0.95);
  if (!shouldResize && !meaningfulSaving) {
    return {
      bytes: input.bytes,
      extension: input.extension,
      strategy: "original-preserved-small-saving",
      originalDigest,
    };
  }

  return {
    bytes: webp,
    extension: ".webp",
    strategy: shouldResize ? "webp-resized-huge-source" : "webp-optimized",
    originalDigest,
  };
}

function contentType(extension) {
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  return "image/webp";
}

export async function prepareProductionMedia(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const pagesRoot = path.join(repoRoot, "src", "pages");
  const cacheRoot = path.resolve(repoRoot, options.cacheRoot || DEFAULT_CACHE_ROOT);
  const filesRoot = path.join(cacheRoot, "files");
  const manifestPath = path.join(cacheRoot, "manifest.json");
  const publicBase = String(options.publicBase || process.env.R2_PUBLIC_BASE_URL || DEFAULT_PUBLIC_BASE).replace(/\/+$/, "");
  const maxLongEdge = Number(options.maxLongEdge || process.env.MEDIA_MAX_LONG_EDGE || DEFAULT_MAX_LONG_EDGE);
  if (!Number.isFinite(maxLongEdge) || maxLongEdge < 1024) throw new Error("MEDIA_MAX_LONG_EDGE must be at least 1024.");

  await mkdir(filesRoot, { recursive: true });
  const markdownFiles = await walkMarkdown(pagesRoot);
  const warnings = [];
  const rewrites = [];
  const objects = [];
  const objectByKey = new Map();

  for (const sourceFile of markdownFiles) {
    const source = await readFile(sourceFile, "utf8");
    const { references, frontmatter } = collectReferences(sourceFile, source);
    const namespace = contentNamespace(sourceFile, pagesRoot, frontmatter);

    for (const reference of references) {
      if (isIgnoredRemote(reference.value)) continue;
      let input = parseDataImage(reference.value);
      if (!input && /^data:image\//i.test(reference.value)) {
        warnings.push(`${slash(path.relative(repoRoot, sourceFile))}: unsupported or invalid data image (${reference.kind})`);
        continue;
      }
      if (!input) input = await resolveLocalImage(reference.value, sourceFile, repoRoot);
      if (!input) continue;
      if (input.unresolved) {
        warnings.push(`${slash(path.relative(repoRoot, sourceFile))}: local image not found: ${reference.value}`);
        continue;
      }

      const optimized = await optimizeImage(input, reference, maxLongEdge);
      const digest = sha256(optimized.bytes);
      let baseName = objectBaseName(reference, digest, input.sourcePath);
      let objectKey = `${namespace}/${baseName}${optimized.extension}`;
      const existing = objectByKey.get(objectKey);
      if (existing && existing.sha256 !== digest) {
        baseName = `${baseName}-${digest.slice(0, 8)}`;
        objectKey = `${namespace}/${baseName}${optimized.extension}`;
      }

      let object = objectByKey.get(objectKey);
      if (!object) {
        const stagedPath = path.join(filesRoot, ...objectKey.split("/"));
        await mkdir(path.dirname(stagedPath), { recursive: true });
        await writeFile(stagedPath, optimized.bytes);
        object = {
          key: objectKey,
          file: slash(path.relative(cacheRoot, stagedPath)),
          bytes: optimized.bytes.length,
          sha256: digest,
          contentType: contentType(optimized.extension),
          strategy: optimized.strategy,
          sourceKind: input.sourceKind,
        };
        objectByKey.set(objectKey, object);
        objects.push(object);
      }

      rewrites.push({
        file: slash(path.relative(repoRoot, sourceFile)),
        from: reference.value,
        to: `${publicBase}/${objectKey}`,
        kind: reference.kind,
        key: objectKey,
      });
    }
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    publicBase,
    maxLongEdge,
    objects,
    rewrites,
    warnings,
  };
  await mkdir(cacheRoot, { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { manifestPath, manifest, cacheRoot };
}

async function main() {
  const result = await prepareProductionMedia();
  console.log(`Prepared ${result.manifest.objects.length} R2 media object(s) and ${result.manifest.rewrites.length} production rewrite(s).`);
  for (const warning of result.manifest.warnings) console.warn(`[media] ${warning}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error?.stack || error);
    process.exit(1);
  });
}
