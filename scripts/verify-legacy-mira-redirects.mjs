import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const redirectsPath = resolve(process.cwd(), "dist/_redirects");
const expected = [
  "/about/author https://mira.tomz.io/about/author/ 301",
  "/about/author/ https://mira.tomz.io/about/author/ 301",
  "/design-md https://mira.tomz.io/design-md/ 301",
  "/design-md/* https://mira.tomz.io/design-md/:splat 301",
  "/mira-docs-api https://mira.tomz.io/mira-docs-api/ 301",
  "/mira-docs-api/* https://mira.tomz.io/mira-docs-api/:splat 301",
  "/blogs/engineering https://mira.tomz.io/blogs/engineering/ 301",
  "/blogs/engineering/* https://mira.tomz.io/blogs/engineering/:splat 301",
  "/blogs/product-journal https://mira.tomz.io/blogs/product-journal/ 301",
  "/blogs/product-journal/* https://mira.tomz.io/blogs/product-journal/:splat 301",
];

if (!existsSync(redirectsPath)) {
  console.error(`Legacy Mira redirect verification failed: missing ${redirectsPath}`);
  process.exit(1);
}

const redirects = readFileSync(redirectsPath, "utf8");
const missing = expected.filter((rule) => !redirects.split(/\r?\n/).includes(rule));

if (missing.length) {
  console.error("Legacy Mira redirect verification failed. Missing rules:");
  for (const rule of missing) console.error(`- ${rule}`);
  process.exit(1);
}

console.log(`Legacy Mira redirects verified: ${expected.length} rules.`);
