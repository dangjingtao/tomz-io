import path from "node:path";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const DEFAULT_MANIFEST = ".mira-cache/media-r2/manifest.json";
const args = new Set(process.argv.slice(2));
const planOnly = args.has("--plan");
const confirmed = args.has("--confirm");

function required(names) {
  const missing = names.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length) throw new Error(`Missing R2 environment: ${missing.join(", ")}`);
}

function aws(args, { allowFailure = false } = {}) {
  const environment = {
    ...process.env,
    AWS_EC2_METADATA_DISABLED: "true",
    AWS_RETRY_MODE: process.env.AWS_RETRY_MODE || "standard",
    AWS_MAX_ATTEMPTS: process.env.AWS_MAX_ATTEMPTS || "5",
  };
  if (planOnly) {
    console.log(`[plan] aws ${args.join(" ")}`);
    return { status: 0, stdout: "", stderr: "" };
  }
  const result = spawnSync("aws", args, { env: environment, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(result.stderr || `aws exited with ${result.status}`);
  }
  return result;
}

async function main() {
  if (!planOnly && !confirmed) throw new Error("R2 publish requires explicit --confirm.");
  if (!planOnly) required(["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "R2_ACCOUNT_ID", "R2_BUCKET"]);

  const repoRoot = process.cwd();
  const manifestPath = path.resolve(repoRoot, process.env.MEDIA_MANIFEST || DEFAULT_MANIFEST);
  const cacheRoot = path.dirname(manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const account = process.env.R2_ACCOUNT_ID || "<R2_ACCOUNT_ID>";
  const bucket = process.env.R2_BUCKET || "<R2_BUCKET>";
  const endpoint = `https://${account}.r2.cloudflarestorage.com`;
  const common = ["--endpoint-url", endpoint, "--no-cli-pager"];

  let uploaded = 0;
  let skipped = 0;
  for (const object of manifest.objects || []) {
    const remote = aws([
      "s3api", "head-object", "--bucket", bucket, "--key", object.key, ...common,
    ], { allowFailure: true });
    if (!planOnly && remote.status === 0) {
      try {
        const metadata = JSON.parse(remote.stdout || "{}");
        if (metadata?.Metadata?.sha256 === object.sha256 && Number(metadata?.ContentLength) === object.bytes) {
          console.log(`R2 unchanged: ${object.key}`);
          skipped += 1;
          continue;
        }
      } catch {
        // A malformed head response is treated as a cache miss and uploaded again.
      }
    }

    const local = path.join(cacheRoot, object.file);
    aws([
      "s3", "cp", local, `s3://${bucket}/${object.key}`,
      "--content-type", object.contentType,
      "--cache-control", "public, max-age=300, must-revalidate",
      "--metadata", `sha256=${object.sha256}`,
      "--only-show-errors",
      ...common,
    ]);

    if (!planOnly) {
      const verified = aws([
        "s3api", "head-object", "--bucket", bucket, "--key", object.key, ...common,
      ]);
      const metadata = JSON.parse(verified.stdout || "{}");
      if (metadata?.Metadata?.sha256 !== object.sha256 || Number(metadata?.ContentLength) !== object.bytes) {
        throw new Error(`R2 verification failed: ${object.key}`);
      }
    }
    uploaded += 1;
  }

  console.log(`R2 media publish complete: ${uploaded} uploaded, ${skipped} unchanged.`);
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exit(1);
});
