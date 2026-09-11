import { describe, expect, it } from "vitest";
import type { Doc } from "../content/mira-docs-adapter";
import type { SiteArea } from "../types/site";
import { getPageTitle } from "./page-title";

const docs = [
  { path: "/blogs/example", title: "Example article" } as Doc,
];
const areas = [
  { path: "/blogs", title: "博客" } as SiteArea,
];

describe("getPageTitle", () => {
  it("uses the site title for the home page", () => {
    expect(getPageTitle("/", docs, areas)).toBe("独立开发与产品设计");
  });

  it("uses the dedicated About title", () => {
    expect(getPageTitle("/about", docs, areas)).toBe("关于 Tomz Dang");
  });

  it("prefers an exact document title before area fallback", () => {
    expect(getPageTitle("/blogs/example", docs, areas)).toBe("Example article");
    expect(getPageTitle("/blogs", docs, areas)).toBe("博客");
  });

  it("returns the not-found title for unknown paths", () => {
    expect(getPageTitle("/missing", docs, areas)).toBe("页面不存在");
  });
});
