import { describe, expect, it } from "vitest";
import { appBase, decodedPathname, docHref } from "./paths";

describe("paths", () => {
  it("joins document paths to the configured app base without duplicate leading slashes", () => {
    expect(docHref("/blogs/example")).toBe(`${appBase}blogs/example`);
    expect(docHref("blogs/example")).toBe(`${appBase}blogs/example`);
  });

  it("decodes valid URI paths", () => {
    expect(decodedPathname("/blogs/hello%20world")).toBe("/blogs/hello world");
  });

  it("returns malformed URI paths unchanged", () => {
    expect(decodedPathname("/blogs/%E0%A4%A")).toBe("/blogs/%E0%A4%A");
  });
});
