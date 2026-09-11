import { describe, expect, it, vi } from "vitest";
import type { Doc } from "../../content/mira-docs-adapter";
import type { SiteArea } from "../../types/site";

vi.mock("../../content/mira-docs-adapter", () => ({
  compareDocs: (
    left: { order: number; title: string },
    right: { order: number; title: string },
  ) => left.order - right.order || left.title.localeCompare(right.title),
}));

import {
  directoryTitle,
  docsByDirectory,
  docsByProjectDirectory,
  isProjectArea,
  projectIdFromPath,
  projectNavTitle,
} from "./docs-utils";

function doc(overrides: Partial<Doc>): Doc {
  return {
    path: "/example",
    title: "Example",
    order: 0,
    directory: "example",
    ...overrides,
  } as Doc;
}

describe("docs helpers", () => {
  it("formats nested directory names for navigation", () => {
    expect(directoryTitle("shared-thinking/agent_runtime")).toBe(
      "Shared Thinking / Agent Runtime",
    );
  });

  it("groups documents by directory and sorts each group", () => {
    const groups = docsByDirectory([
      doc({ title: "Later", order: 2, directory: "notes" }),
      doc({ title: "First", order: 1, directory: "notes" }),
      doc({ title: "Other", order: 1, directory: "other" }),
    ]);

    expect(groups.map((group) => group.directory)).toEqual(["notes", "other"]);
    expect(groups[0].docs.map((item) => item.title)).toEqual(["First", "Later"]);
  });

  it("splits project navigation labels on the first colon", () => {
    expect(projectNavTitle("工程：运行时设计")).toEqual({
      category: "工程",
      title: "运行时设计",
    });
    expect(projectNavTitle("独立标题")).toEqual({ category: "", title: "独立标题" });
  });

  it("extracts project ids only from project paths", () => {
    expect(projectIdFromPath("/projects/mira/runtime")).toBe("mira");
    expect(projectIdFromPath("/blogs/mira")).toBeUndefined();
  });

  it("builds project groups with overview metadata and sorted articles", () => {
    const groups = docsByProjectDirectory([
      doc({ path: "/projects/mira/runtime", title: "Runtime", order: 3 }),
      doc({ path: "/projects/mira", title: "Mira", order: 2 }),
      doc({ path: "/projects/mira/agent", title: "Agent", order: 1 }),
      doc({ path: "/projects/alpha", title: "Alpha", order: 1 }),
    ]);

    expect(groups.map((group) => group.id)).toEqual(["alpha", "mira"]);
    expect(groups[1].overview?.title).toBe("Mira");
    expect(groups[1].articles.map((item) => item.title)).toEqual(["Agent", "Runtime"]);
  });

  it("detects project areas from their documents", () => {
    expect(isProjectArea({ docs: [doc({ type: "project" })] } as SiteArea)).toBe(true);
    expect(isProjectArea({ docs: [doc({ type: "blog" })] } as SiteArea)).toBe(false);
  });
});
