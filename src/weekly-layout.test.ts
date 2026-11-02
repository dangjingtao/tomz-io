import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const weeklyCss = readFileSync(fileURLToPath(new URL("./weekly.css", import.meta.url)), "utf8");
const indexCss = readFileSync(fileURLToPath(new URL("./weekly-index.css", import.meta.url)), "utf8");

describe("Weekly publication layout contract", () => {
  it("uses a 1216px publication frame aligned with the PC navigation content", () => {
    expect(weeklyCss).toMatch(/\.weekly-frame\s*\{width:min\(calc\(100% - 64px\),1216px\)/);
  });

  it("keeps issue indexes aligned with the desktop chapter sidebar", () => {
    expect(indexCss).toMatch(/\.weekly-issue-index-layout\s*\{[^}]*grid-template-columns:minmax\(0,800px\) minmax\(220px,260px\);\s*justify-content:space-between/);
    expect(indexCss).toMatch(/@media\(max-width:920px\)/);
    expect(indexCss).toMatch(/@media\(min-width:921px\)/);
    expect(indexCss).toMatch(/\.weekly-index-markdown>ol\{max-width:min\(100%,840px\)/);
    expect(indexCss).toMatch(/\.weekly-index-markdown>p:has\(>img:only-child\)\{max-width:min\(100%,960px\)/);
    expect(indexCss).not.toMatch(/\.weekly-index-markdown>p:first-child:has\(>img:only-child\)\{max-width:min\(100%,560px\)/);
    expect(indexCss).toMatch(/\.weekly-reading-grid\s*\{[^}]*max-width:100%/);
  });

  it("keeps the article and desktop TOC columns within the magazine frame", () => {
    expect(weeklyCss).toMatch(/\.weekly-issue-layout\s*\{[^}]*grid-template-columns:minmax\(0,800px\) minmax\(220px,260px\);\s*justify-content:space-between;gap:clamp\(36px,5vw,72px\)/);
    expect(weeklyCss).toMatch(/\.weekly-aside\s*\{[^}]*position:sticky;top:88px/);
  });

  it("uses a full-height mobile TOC below the site and page navigation", () => {
    expect(weeklyCss).toMatch(/\.weekly-mobile-subnav\s*\{[^}]*position:sticky;top:64px/);
    expect(weeklyCss).toMatch(/\.weekly-mobile-subnav-panel\s*\{[^}]*position:fixed;inset:112px 0 0/);
    expect(weeklyCss).toMatch(/\.weekly-mobile-subnav-panel\[hidden\]\{display:none\}/);
  });

  it("keeps existing tablet and mobile frame overrides", () => {
    expect(weeklyCss).toMatch(/@media\(max-width:920px\)\s*\{\s*\.weekly-frame\{width:min\(calc\(100% - 40px\),820px\)\}/);
    expect(weeklyCss).toMatch(/@media\(max-width:700px\)\s*\{\s*\.weekly-frame\{width:calc\(100% - 32px\)\}/);
  });
});
