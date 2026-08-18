import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

function filesUnder(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function normalizedDate(value: unknown): unknown {
  if (typeof value !== "string" || !value.trim()) return value;
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text) && !Number.isNaN(Date.parse(text))) {
    return text;
  }

  const match = text.match(/^(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})日?$/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? value : new Date(parsed).toISOString().slice(0, 10);
}

function normalizeStructuredData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeStructuredData);
  if (!value || typeof value !== "object") return value;

  const record = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(record)) {
    normalized[key] = key === "datePublished" || key === "dateModified"
      ? normalizedDate(item)
      : normalizeStructuredData(item);
  }
  return normalized;
}

export function br003aStaticSeoGuard(): Plugin {
  return {
    name: "br003a-static-seo-guard",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const dist = resolve(process.cwd(), "dist");
      let changed = 0;
      for (const path of filesUnder(dist).filter((file) => file.endsWith(".html"))) {
        const original = readFileSync(path, "utf8");
        const next = original.replace(
          /(<script[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
          (whole, open, raw, close) => {
            try {
              const parsed = JSON.parse(raw);
              const normalized = JSON.stringify(normalizeStructuredData(parsed)).replace(/</g, "\\u003c");
              return `${open}${normalized}${close}`;
            } catch {
              return whole;
            }
          },
        );
        if (next !== original) {
          writeFileSync(path, next);
          changed += 1;
        }
      }
      console.log(`BR003A static SEO guard normalized JSON-LD in ${changed} HTML files.`);
    },
  };
}
