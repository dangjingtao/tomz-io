import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(fileURLToPath(new URL("./bookshelf.css", import.meta.url)), "utf8");

describe("Book chapter reading baseline", () => {
  it("uses one prose-width canvas without a table of contents", () => {
    expect(css).toMatch(/\.book-reader\s*\{[^}]*width:\s*min\(var\(--book-reader-prose-width\),\s*calc\(100% - 64px\)\)/);
    expect(css).toMatch(/\.book-reader-header\s*\{[^}]*max-width:\s*var\(--book-reader-prose-width\);\s*margin:\s*0 0 48px/);
    expect(css).toMatch(/\.book-reader-reading-layout\s*\{[^}]*margin:\s*0;/);
    expect(css).toMatch(/\.book-reader-body\s*\{[^}]*margin:\s*0;/);
    expect(css).toMatch(/\.book-reader-pagination\s*\{[^}]*margin:\s*56px 0 0/);
  });

  it("aligns back link, title and prose when a desktop TOC is visible", () => {
    expect(css).toMatch(/\.book-reader\.has-toc\s*\{[^}]*var\(--book-reader-toc-gap\)\s*\),/);
    expect(css).toMatch(/\.book-reader-desktop-backbar-inner\s*\{[^}]*max-width:\s*var\(--book-reader-prose-width\);\s*margin:\s*0;/);
    expect(css).toMatch(/\.book-reader-reading-layout\.has-toc\s*\{[^}]*display:\s*grid/);
    expect(css).toMatch(/grid-template-columns:\s*minmax\(0,\s*var\(--book-reader-prose-width\)\)\s*var\(--book-reader-toc-width\)/);
  });

  it("retains the phone's single-column reader and TOC overlay", () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*760px\)/);
    expect(css).toMatch(/\.book-reader-reading-layout\.has-toc\s*\{\s*display:\s*block;/);
    expect(css).toMatch(/\.book-reader-toc\s*\{\s*display:\s*none;/);
  });
});
