import { describe, expect, it } from "vitest";
import type { SiteArea } from "../types/site";
import { appBase } from "../utils/paths";
import type { Doc } from "./mira-docs-adapter";
import {
  buildSiteAreas,
  buildSiteNav,
  getBlogNavCategories,
} from "./site-model";

function doc(overrides: Partial<Doc>): Doc {
  return {
    path: "/blogs/example",
    root: "blogs",
    directory: "",
    title: "Example",
    description: "Example description",
    group: "产品",
    order: 1,
    source: "",
    headings: [],
    ...overrides,
  } as Doc;
}

describe("site model", () => {
  it("builds areas from declared and discovered roots while dropping empty roots", () => {
    const areas = buildSiteAreas(
      [
        doc({ root: "blogs", path: "/blogs/example", nav: "博客" }),
        doc({ root: "weekly", path: "/weekly/001", nav: "见π" }),
      ],
      ["blogs", "weekly", "empty"],
    );

    expect(areas.map((area) => area.key)).toEqual(["blogs", "weekly"]);
    expect(areas.map((area) => area.title)).toEqual(["博客", "见π"]);
  });

  it("keeps the top navigation order and excludes submissions", () => {
    const area = (key: string, title: string): SiteArea => ({
      key,
      title,
      description: "",
      docs: [doc({ root: key })],
      path: `/${key}`,
      href: `${appBase}${key}`,
    });

    const nav = buildSiteNav([
      area("weekly", "见π"),
      area("submissions", "投稿"),
      area("blogs", "博客"),
    ]);

    expect(nav.map((item) => item.label)).toEqual(["博客", "见π", "关于"]);
  });

  it("derives blog category counts without exposing archive", () => {
    const blogArea: SiteArea = {
      key: "blogs",
      title: "博客",
      description: "",
      path: "/blogs",
      href: `${appBase}blogs`,
      docs: [
        doc({ group: "产品" }),
        doc({ path: "/blogs/second", group: "产品" }),
        doc({ path: "/blogs/third", group: "工程" }),
        doc({ path: "/blogs/archive", group: "归档" }),
      ],
    };

    expect(getBlogNavCategories([blogArea])).toEqual([
      { label: "产品", count: 2 },
      { label: "工程", count: 1 },
    ]);
  });
});
