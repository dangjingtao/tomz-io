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
});
