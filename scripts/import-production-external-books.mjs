import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";
import { importExternalBook } from "./import-external-book.mjs";

const root = process.cwd();
const registryPath = resolve(root, "external-books.production.json");
const workspaceRoot = resolve(root, ".external-books-production");
const historyOutput = resolve(root, ".mira-cache/external-content-history.json");

function fail(message) {
  throw new Error(`production external books: ${message}`);
}

function readRegistry() {
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  if (registry.schemaVersion !== 1) fail("schemaVersion must be 1");
  if (!Array.isArray(registry.books)) fail("books must be an array");
  return registry.books;
}

function validateSource(source, index) {
  const label = `books[${index}]`;
  const repository = typeof source?.repository === "string" ? source.repository.trim() : "";
  const sha = typeof source?.sha === "string" ? source.sha.trim() : "";

  if (!/^dangjingtao\/[A-Za-z0-9._-]+$/.test(repository)) {
    fail(`${label}.repository must be a public dangjingtao/owner repository`);
  }
  if (!/^[0-9a-f]{40}$/.test(sha)) {
    fail(`${label}.sha must be an exact 40-character commit SHA`);
  }
  return { repository, sha };
}

function runGit(args, options = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: options.encoding,
    stdio: options.encoding ? ["ignore", "pipe", "inherit"] : "inherit",
  });
}

async function main() {
  const sources = readRegistry();
  if (sources.length === 0) {
    console.log("No production external books configured.");
    return;
  }

  rmSync(workspaceRoot, { recursive: true, force: true });
  mkdirSync(workspaceRoot, { recursive: true });
  mkdirSync(resolve(root, ".mira-cache"), { recursive: true });

  const combinedHistory = {};

  for (const [index, rawSource] of sources.entries()) {
    const { repository, sha } = validateSource(rawSource, index);
    const sourceDir = resolve(
      workspaceRoot,
      `${String(index).padStart(2, "0")}-${basename(repository)}`,
    );
    const sourceHistoryPath = resolve(workspaceRoot, `${index}.history.json`);

    runGit([
      "clone",
      "--quiet",
      "--no-checkout",
      `https://github.com/${repository}.git`,
      sourceDir,
    ]);
    runGit(["-C", sourceDir, "checkout", "--quiet", "--detach", sha]);

    const actualSha = runGit(
      ["-C", sourceDir, "rev-parse", "HEAD"],
      { encoding: "utf8" },
    ).trim();
    if (actualSha !== sha) {
      fail(`${repository}: checked out ${actualSha}, expected ${sha}`);
    }

    const result = await importExternalBook({
      source: sourceDir,
      output: resolve(root, "src/pages/books"),
      sourceRepository: repository,
      sourceSha: sha,
      historyOutput: sourceHistoryPath,
    });

    const sourceHistory = JSON.parse(readFileSync(sourceHistoryPath, "utf8"));
    for (const [path, history] of Object.entries(sourceHistory)) {
      if (combinedHistory[path]) fail(`duplicate imported history key: ${path}`);
      combinedHistory[path] = history;
    }

    console.log(`Imported production external book ${result.bookId} from ${repository}@${sha}`);
  }

  writeFileSync(historyOutput, `${JSON.stringify(combinedHistory, null, 2)}\n`, "utf8");
  rmSync(workspaceRoot, { recursive: true, force: true });
  console.log(`Production external books ready: ${sources.length}`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
