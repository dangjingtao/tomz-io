import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { prepareProductionMedia } from "./prepare.mjs";
import { applyProductionMedia } from "./apply.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "tomz-media-pipeline-"));
try {
  const pageDir = path.join(root, "src/pages/weekly");
  await mkdir(pageDir, { recursive: true });

  const webpBytes = await sharp({
    create: { width: 12, height: 8, channels: 3, background: { r: 120, g: 90, b: 70 } },
  }).webp({ quality: 80 }).toBuffer();
  const pngPath = path.join(pageDir, "diagram.png");
  await sharp({
    create: { width: 48, height: 32, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0.6 } },
  }).png().toFile(pngPath);

  const dataWebp = `data:image/webp;base64,${webpBytes.toString("base64")}`;
  const markdown = `---\ntitle: Test\nissue: 1\ncover: ${dataWebp}\n---\n\n![diagram](./diagram.png)\n\n<img src="https://example.com/remote.png" alt="remote">\n<img src="data:image/svg+xml,%3Csvg%3E%3C/svg%3E" alt="svg">\n`;
  const page = path.join(pageDir, "001-test.md");
  await writeFile(page, markdown);

  const { manifest, cacheRoot } = await prepareProductionMedia({ repoRoot: root });
  assert.equal(manifest.rewrites.length, 2);
  assert.equal(manifest.objects.length, 2);

  const cover = manifest.objects.find((item) => item.key === "tomz-io/jianpi/001/cover.webp");
  assert.ok(cover, "weekly cover should use the semantic jianpi path");
  assert.equal(cover.strategy, "webp-base64-passthrough");
  const stagedCover = await readFile(path.join(cacheRoot, cover.file));
  assert.deepEqual(stagedCover, webpBytes, "base64 WebP must remain byte-identical");

  assert.ok(manifest.rewrites.some((item) => item.to === "https://assets.tomz.io/tomz-io/jianpi/001/cover.webp"));
  assert.ok(manifest.rewrites.some((item) => item.to.includes("/tomz-io/jianpi/001/diagram.")));
  assert.ok(!manifest.rewrites.some((item) => item.from.includes("example.com")));
  assert.ok(!manifest.rewrites.some((item) => item.from.startsWith("data:image/svg+xml")));

  await applyProductionMedia({ repoRoot: root });
  const applied = await readFile(page, "utf8");
  assert.ok(applied.includes("https://assets.tomz.io/tomz-io/jianpi/001/cover.webp"));
  assert.ok(applied.includes("https://example.com/remote.png"));
  assert.ok(applied.includes("data:image/svg+xml"));
  assert.ok(!applied.includes(dataWebp));

  console.log("media pipeline tests passed");
} finally {
  await rm(root, { recursive: true, force: true });
}
