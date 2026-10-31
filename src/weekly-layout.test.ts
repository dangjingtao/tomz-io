import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const weeklyCss = readFileSync(fileURLToPath(new URL("./weekly.css", import.meta.url)), "utf8");
const indexCss = readFileSync(fileURLToPath(new URL("./weekly-index.css", import.meta.url)), "utf8");

describe("Weekly publication desktop layout contract", () => {
  it("uses a 1216px publication frame aligned with the PC navigation content", () => {
    expect(weeklyCss).toMatch(/\.weekly-frame\s*\{width:min\(calc\(100% - 64px\),1216px\)/);
  });

  it("lets the cover grow but keeps individual articles readable", () => {
    expect(weeklyCss).toMatch(/\.weekly-latest-grid\s*\{[^}]*grid-template-columns:clamp\(300px,28vw,350px\) minmax\(0,1fr\)/);
    expect(weeklyCss).toMatch(/\.weekly-issue-layout\s*\{[^}]*grid-template-columns:minmax\(0,800px\) 220px/);
    expect(indexCss).toMatch(/\.weekly-issue-index-layout\s*\{[^}]*grid-template-columns:minmax\(0,980px\)/);
    expect(indexCss).toMatch(/\.weekly-reading-grid\s*\{[^}]*max-width:980px/);
  });

  it("keeps existing tablet and mobile frame overrides", () => {
    expect(weeklyCss).toMatch(/@media\(max-width:920px\)\s*\{\s*\.weekly-frame\{width:min\(calc\(100% - 40px\),820px\)\}/);
    expect(weeklyCss).toMatch(/@media\(max-width:700px\)\s*\{\s*\.weekly-frame\{width:calc\(100% - 32px\)\}/);
  });
});
