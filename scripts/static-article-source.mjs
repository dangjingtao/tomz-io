import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

// Shared final-static-HTML reader for RSS and JSON Feed. Neither feed owns a
// second editable article registry.
export function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

export function canonicalFromHtml(html) {
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i)?.[1];
}

export function jsonLdObjects(html, { strict = false } = {}) {
  const objects = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) objects.push(...parsed);
      else if (parsed && Array.isArray(parsed["@graph"])) objects.push(...parsed["@graph"]);
      else objects.push(parsed);
    } catch (error) {
      if (strict) throw new Error("Invalid published JSON-LD", { cause: error });
      // RSS historically skips invalid JSON-LD; static verification owns it.
    }
  }
  return objects.filter((value) => value && typeof value === "object");
}

export function isArticle(value) {
  const type = value?.["@type"];
  return Array.isArray(type) ? type.includes("Article") : type === "Article";
}

export function authorNames(author) {
  const values = Array.isArray(author) ? author : author ? [author] : [];
  return values
    .map((value) => typeof value === "string" ? value : value?.name)
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}
