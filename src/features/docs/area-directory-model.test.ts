import { describe, expect, it, vi } from "vitest";
import type { Doc } from "../../content/mira-docs-adapter";
import type { SiteArea } from "../../types/site";

vi.mock("../../content/mira-docs-adapter", () => ({
  compareDocs: (
    left: { order: number; directory: string; path: string },
    right: { order: number; directory: string; path: string },
  ) =>
    left.order - right.order ||
    left.directory.localeCompare(right.directory) ||
    left.path.localeCompare(right.path),
}));

import { buildAreaDirectoryModel } from "./area-directory-model";

function doc(overrides: Partial<Doc>): Doc {
  return {
    path: "/docs/example",
    root: "docs",
    directory: "guide",
    title: "Example",
    description: "",
    group: "文档",
    order: 1,
    source: "",
    headings: [],
    ...overrides,
  } as Doc;
}

function area(overrides: Partial<SiteArea>): SiteArea {
  return {
    key: "docs",
    title: "文档",
    description: "",
    path: "/docs",
    href: "/docs",
    docs: [],
    ...overrides,
  } as SiteArea;
}

describe("area directory model", () => {
  it("returns directory groups for ordinary areas", () => {
    const model = buildAreaDirectoryModel(
      area({
        docs: [
          doc({ path: "/docs/b", directory: "guide", order: 2 }),
          doc({ path: "/docs/a", directory: "guide", order: 1 }),
          doc({ path: "/docs/root", directory: "", order: 0 }),
        ],
      }),
    );

    expect(model.kind).toBe("directories");
    if (model.kind !== "directories") return;
    expect(model.groups.map((group) => group.directory)).toEqual(["guide", ""]);
    expect(model.groups[0].docs.map((item) => item.path)).toEqual([
      "/docs/a",
      "/docs/b",
    ]);
  });

  it("returns project groups for project areas", () => {
    const model = buildAreaDirectoryModel(
      area({
        key: "projects",
        path: "/projects",
        docs: [
          doc({ path: "/projects/mira", root: "projects", type: "project", title: "Mira", order: 1 }),
          doc({ path: "/projects/mira/runtime", root: "projects", directory: "mira", title: "Runtime", order: 2 }),
        ],
      }),
    );

    expect(model.kind).toBe("projects");
    if (model.kind !== "projects") return;
    expect(model.projects).toHaveLength(1);
    expect(model.projects[0].overview?.path).toBe("/projects/mira");
    expect(model.projects[0].articles[0].path).toBe("/projects/mira/runtime");
  });
});
