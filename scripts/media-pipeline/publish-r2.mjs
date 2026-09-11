import path from "node:path";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const DEFAULT_MANIFEST = ".mira-cache/media-r2/manifest.json";
const DEFAULT_PUBLIC_BASE = "https://assets.tomz.io";
const WRANGLER_VERSION = process.env.MEDIA_WRANGLER_VERSION || "4.129.1";
const args = new Set(process.argv.slice(2));
const planOnly = args.has("--plan");
const confirmed = args.has("--confirm");

function required(names) {
  const missing = names.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length) throw new Error(`Missing R2 environment: ${missing.join(", ")}`);
}

function wrangler(args) {
  if (planOnly) {
    console.log(`[plan] wrangler ${args.join(" ")}`);
    return;
  }
  const result = spawnSync(
    "npx",
    ["--yes", `wrangler@${WRANGLER_VERSION}`, ...args],
    { env: process.env, encoding: "utf8" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `wrangler exited with ${result.status}`);
  }
}

async function remoteState(publicBase, object) {
  const probe = `${publicBase}/${object.key}?media-check=${object.sha256}-${Date.now()}`;
  const response = await fetch(probe, {
    method: "HEAD",
    redirect: "follow",
    headers: { "cache-control": "no-cache" },
  });
  if (response.status === 404) return "missing";
  if (!response.ok) throw new Error(`R2 public HEAD failed (${response.status}): ${object.key}`);

  const rawLength = response.headers.get("content-length");
  if (rawLength !== null) {
    const length = Number(rawLength);
    if (Number.isFinite(length) && length !== object.bytes) return "mismatch";
  }
  return "present";
}

async function verifyRemote(publicBase, object) {
  let lastState = "missing";
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    lastState = await remoteState(publicBase, object);
    if (lastState === "present") return;
    if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, attempt * 400));
  }
  throw new Error(`R2 verification failed (${lastState}): ${object.key}`);
}

async function main() {
  if (!planOnly && !confirmed) throw new Error("R2 publish requires explicit --confirm.");
  if (!planOnly) required(["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "R2_BUCKET"]);

  const repoRoot = process.cwd();
  const manifestPath = path.resolve(repoRoot, process.env.MEDIA_MANIFEST || DEFAULT_MANIFEST);
  const cacheRoot = path.dirname(manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.addressing !== "sha256") throw new Error("Refusing to publish a non-content-addressed media manifest.");

  const bucket = process.env.R2_BUCKET || "<R2_BUCKET>";
  const publicBase = String(process.env.R2_PUBLIC_BASE_URL || manifest.publicBase || DEFAULT_PUBLIC_BASE).replace(/\/+$/, "");
  let uploaded = 0;
  let skipped = 0;

  for (const object of manifest.objects || []) {
    if (!planOnly) {
      const state = await remoteState(publicBase, object);
      if (state === "present") {
        console.log(`R2 content already present: ${object.key}`);
        skipped += 1;
        continue;
      }
      if (state === "mismatch") {
        console.warn(`R2 hash path has unexpected size; repairing: ${object.key}`);
      }
    }

    const local = path.join(cacheRoot, object.file);
    wrangler([
      "r2", "object", "put", `${bucket}/${object.key}`,
      "--file", local,
      "--content-type", object.contentType,
      "--cache-control", "public, max-age=31536000, immutable",
      "--remote",
    ]);

    if (!planOnly) await verifyRemote(publicBase, object);
    uploaded += 1;
  }

  console.log(`R2 media publish complete: ${uploaded} uploaded, ${skipped} content-addressed hit(s).`);
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exit(1);
});
