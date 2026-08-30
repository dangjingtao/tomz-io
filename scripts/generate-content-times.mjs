import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { parseMiraDoc } from "@uichat-mira/docs";

const root = process.cwd();
const pagesRoot = resolve(root, "src/pages");
const outputPath = resolve(root, "src/content/content-times.generated.ts");
const cachePath = resolve(root, ".mira-cache/content-times.json");
const SITE_OFFSET_MS = 8 * 60 * 60 * 1000;

// These commits remain valid modification history, but are not evidence that an
// already-published article first went public at the migration timestamp.
const NON_PUBLICATION_EVIDENCE =
  /\bmirror\b|\bmigrat(?:e|ed|es|ing|ion)\b|source mirror|full source|内容迁移|目录迁移|迁站|搬迁|归属调整/i;

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? markdownFiles(path)
      : entry.name.endsWith(".md") && !/^README\.md$/i.test(entry.name)
        ? [path]
        : [];
  });
}

function runGit(args, { quiet = false } = {}) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", quiet ? "ignore" : "pipe"],
    }).trim();
  } catch (error) {
    if (quiet) return "";
    throw error;
  }
}

function dataString(data, key) {
  const value = data[key];
  if (Array.isArray(value)) return value.length ? String(value[0]) : undefined;
  if (value == null || value === "") return undefined;
  return String(value);
}

function normalizedDateOnly(value) {
  if (!value?.trim()) return undefined;
  const text = value.trim();
  const match = text.match(/^(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})日?$/);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function toSiteIso(value) {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  const shifted = new Date(Date.parse(value) + SITE_OFFSET_MS);
  return shifted.toISOString().replace(/Z$/, "+08:00");
}

function normalizePublishedOverride(value, sourcePath) {
  if (!value?.trim()) return undefined;
  const text = value.trim();
  const dateOnly = normalizedDateOnly(text);
  if (dateOnly) return { value: dateOnly, precision: "date", source: "override" };

  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) || Number.isNaN(Date.parse(text))) {
    throw new Error(
      `${sourcePath}: publishedAt must be YYYY-MM-DD or an ISO datetime with an explicit timezone`,
    );
  }
  return {
    value: toSiteIso(text),
    precision: "datetime",
    source: "override",
  };
}

function isPublicationEvidence(commit) {
  return !NON_PUBLICATION_EVIDENCE.test(commit.subject);
}

function resolvePublishedAt({ sourcePath, declaredDate, publishedAt, commits }) {
  const override = normalizePublishedOverride(publishedAt, sourcePath);
  if (override) return override;

  // A hand-written legacy date is an author-declared publication fact. Do not
  // let Git infer a more precise time-of-day or replace it with repository
  // history: old articles may predate this repository or have been migrated.
  const dateOnly = normalizedDateOnly(declaredDate);
  if (dateOnly) {
    return { value: dateOnly, precision: "date", source: "declared-date" };
  }

  const firstPublicationCommit = commits
    .filter(isPublicationEvidence)
    .sort(
      (left, right) => Date.parse(left.committedAt) - Date.parse(right.committedAt),
    )[0];
  const firstCommit = firstPublicationCommit || commits.at(-1);
  return firstCommit
    ? {
        value: toSiteIso(firstCommit.committedAt),
        precision: "datetime",
        source: "git-first-commit",
        evidenceCommit: firstCommit.sha,
      }
    : undefined;
}

const shallow = runGit(["rev-parse", "--is-shallow-repository"], { quiet: true });
if (shallow === "true") {
  const message =
    "Content time generation requires complete Git history. Use a full clone or actions/checkout with fetch-depth: 0.";
  if (process.env.CI) {
    console.error(message);
    process.exit(1);
  }
  console.warn(`Warning: ${message}`);
}

const contentTimes = {};
for (const file of markdownFiles(pagesRoot)) {
  const repositoryPath = relative(root, file).replace(/\\/g, "/");
  const sourcePath = relative(pagesRoot, file).replace(/\\/g, "/");
  const source = readFileSync(file, "utf8");
  const doc = parseMiraDoc(sourcePath, source);
  const raw = runGit(
    ["log", "--follow", "--format=%H%x09%cI%x09%s", "--", repositoryPath],
    { quiet: true },
  );
  const commits = raw
    .split(/\r?\n/)
    .map((line) => {
      const [sha, committedAt, ...subjectParts] = line.split("\t");
      return {
        sha: sha?.trim(),
        committedAt: committedAt?.trim(),
        subject: subjectParts.join("\t").trim(),
      };
    })
    .filter(
      (commit) =>
        commit.sha &&
        commit.committedAt &&
        !Number.isNaN(Date.parse(commit.committedAt)),
    )
    .sort(
      (left, right) => Date.parse(right.committedAt) - Date.parse(left.committedAt),
    );
  const commitTimes = [...new Set(commits.map((commit) => commit.committedAt))];
  const published = resolvePublishedAt({
    sourcePath,
    declaredDate: dataString(doc.data, "date") || doc.date,
    publishedAt: dataString(doc.data, "publishedAt"),
    commits,
  });

  contentTimes[sourcePath] = {
    commitTimes,
    latestCommitAt: commits[0]?.committedAt,
    firstCommitAt: commits.at(-1)?.committedAt,
    publishedAt: published?.value,
    publishedPrecision: published?.precision,
    publishedSource: published?.source,
    publishedEvidenceCommit: published?.evidenceCommit,
    modifiedAt: toSiteIso(commits[0]?.committedAt),
  };
}

const generatedSource = `// Generated by scripts/generate-content-times.mjs. Do not edit by hand.\n\nexport type GeneratedContentTimeEntry = {\n  readonly commitTimes: readonly string[];\n  readonly latestCommitAt?: string;\n  readonly firstCommitAt?: string;\n  readonly publishedAt?: string;\n  readonly publishedPrecision?: \"date\" | \"datetime\";\n  readonly publishedSource?: \"override\" | \"declared-date\" | \"git-first-commit\";\n  readonly publishedEvidenceCommit?: string;\n  readonly modifiedAt?: string;\n};\n\nexport const contentTimes: Readonly<Record<string, GeneratedContentTimeEntry>> = ${JSON.stringify(contentTimes, null, 2)};\n`;

mkdirSync(dirname(outputPath), { recursive: true });
mkdirSync(dirname(cachePath), { recursive: true });
writeFileSync(outputPath, generatedSource, "utf8");
writeFileSync(cachePath, `${JSON.stringify(contentTimes, null, 2)}\n`, "utf8");
console.log(
  `Content time index generated: ${Object.keys(contentTimes).length} Markdown files -> ${relative(root, outputPath)}`,
);
