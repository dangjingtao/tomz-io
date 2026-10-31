import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const weeklyCss = readFileSync(fileURLToPath(new URL("./weekly.css", import.meta.url)), "utf8");
const indexCss = readFileSync(fileURLToPath(new URL("./weekly-index.css", import.meta.url)), "utf8");

describe("Weekly publication desktop layout contract", () => {
  it("uses a 1216px publication frame aligned with the PC navigation content", () => {
    expect(weeklyCss).toMatch(/\.weekly-frame\s*\{width:min\(calc\(100% - 64px\),1216px\)/);
  });

  it("aligns full-width issue indexes with the masthead and widens desktop material", () => {
    expect(weeklyCss).toMatch(/\.weekly-latest-grid\s*\{[^}]*grid-template-columns:clamp\(300px,28vw,350px\) minmax\(0,1fr\)/);
    expect(indexCss).toMatch(/\.weekly-issue-index-layout\s*\{[^}]*grid-template-columns:minmax\(0,1fr\);\s*justify-content:stretch/);
    expect(indexCss).toMatch(/@media\(min-width:921px\)/);
    expect(indexCss).toMatch(/\.weekly-index-markdown>ol\{max-width:min\(100%,840px\)/);
    expect(indexCss).toMatch(/\.weekly-index-markdown>p:has\(>img:only-child\)\{max-width:min\(100%,960px\)/);
    expect(indexCss).toMatch(/\.weekly-index-markdown>p:first-child:has\(>img:only-child\)\{max-width:min\(100%,560px\)/);
    expect(indexCss).toMatch(/\.weekly-reading-grid\s*\{[^}]*max-width:100%/);
  });

  it("expands article columns without a 196px sidebar gap", () => {
    expect(weeklyCss).toMatch(/\.weekly-issue-layout\s*\{[^}]*grid-template-columns:minmax\(0,880px\) 220px;\s*justify-content:start;gap:64px/);
  });

  it("keeps existing tablet and mobile frame overrides", () => {
    expect(weeklyCss).toMatch(/@media\(max-width:920px\)\s*\{\s*\.weekly-frame\{width:min\(calc\(100% - 40px\),820px\)\}/);
    expect(weeklyCss).toMatch(/@media\(max-width:700px\)\s*\{\s*\.weekly-frame\{width:calc\(100% - 32px\)\}/);
  });
});
