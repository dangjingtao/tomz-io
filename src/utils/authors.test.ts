import { describe, expect, it } from "vitest";
import type { Doc } from "../content/mira-docs-adapter";
import {
  getDocAuthorLabel,
  getDocAuthors,
  getDocSignature,
} from "./authors";

function doc(overrides: Partial<Doc> = {}): Doc {
  return overrides as Doc;
}

describe("author helpers", () => {
  it("defaults documents without an explicit author to Tomz", () => {
    const value = doc();
    expect(getDocAuthors(value)).toEqual(["tomz"]);
    expect(getDocAuthorLabel(value)).toBe("Tomz Dang");
  });

  it("deduplicates authors while preserving their first-seen order", () => {
    const value = doc({ author: ["tomz", "mira", "tomz"] });
    expect(getDocAuthors(value)).toEqual(["tomz", "mira"]);
    expect(getDocAuthorLabel(value)).toBe("Tomz Dang × Mira");
  });

  it("uses the co-authored signature when multiple authors are present", () => {
    const signature = getDocSignature(doc({ author: ["tomz", "mira"] }));
    expect(signature.title).toBe("Tomz Dang × Mira");
    expect(signature.body).toContain("共同讨论与写作");
    expect(signature.links).toEqual([]);
  });

  it("keeps Mira publication links in the Mira signature", () => {
    const signature = getDocSignature(
      doc({
        author: ["mira"],
        commitUrl: "https://github.com/dangjingtao/tomz-io/commit/example",
      }),
    );
    expect(signature.title).toBe("来自Mira");
    expect(signature.links.map((item) => item.label)).toEqual([
      "查看 Mira 来信 →",
      "查看发布记录 →",
    ]);
  });
});
