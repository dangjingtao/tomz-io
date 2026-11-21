import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("Markdown mobile layout contract", () => {
  it("keeps prose shrinkable and wide blocks locally scrollable", () => {
    const cssPath = fileURLToPath(new URL("./markdown.css", import.meta.url));
    const css = readFileSync(cssPath, "utf8");

    expect(css).toMatch(/\.markdown\{[^}]*min-width:0[^}]*max-width:100%[^}]*overflow-wrap:anywhere/);
    expect(css).toMatch(/\.markdown pre\{[^}]*overflow-x:auto/);
    expect(css).toMatch(/\.markdown-mermaid\{[^}]*overflow-x:auto/);
    expect(css).toMatch(/\.markdown th,\.markdown td\{[^}]*overflow-wrap:anywhere/);
    expect(css).toMatch(/@media\(max-width:820px\)\{[\s\S]*\.markdown table\{table-layout:fixed\}/);
  });
}
  it("masks full-bleed HTML media behind the sticky blog article header", () => {
    const articleCssPath = fileURLToPath(new URL("./blog-detail.css", import.meta.url));
    const articleCss = readFileSync(articleCssPath, "utf8");
    const markdownCssPath = fileURLToPath(new URL("./markdown.css", import.meta.url));
    const markdownCss = readFileSync(markdownCssPath, "utf8");

    expect(markdownCss).toMatch(/\\.visual-html-frame\\{margin:32px -24px 48px/);
    expect(articleCss).toMatch(/\\.article-header\\{[^}]*margin-inline:-24px;padding:22px 24px 24px;[^}]*background:var\\(--canvas\\)/);
    expect(articleCss).toMatch(/@media\\(max-width:820px\\)\\{[^}]*\\.article-header\\{margin-inline:-8px;padding-inline:8px\\}/);
    expect(articleCss).toMatch(/\\.article-header\\{margin-top:-30px;padding:12px 8px 12px;/);
  });
});
