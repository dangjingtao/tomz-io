import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("Site header desktop dropdown layout contract", () => {
  it("keeps closed dropdown panels out of the document scroll area", () => {
    const cssPath = fileURLToPath(new URL("./styles/site-header.css", import.meta.url));
    const css = readFileSync(cssPath, "utf8");

    expect(css).toMatch(/\.menu-dropdown-panel\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/\.menu-dropdown\.open \.menu-dropdown-panel\s*\{[^}]*display:\s*grid/);
    expect(css).toMatch(/\.about-nav-dropdown \.blog-nav-panel\s*\{[^}]*left:\s*auto[^}]*right:\s*-10px/);
  });
});
