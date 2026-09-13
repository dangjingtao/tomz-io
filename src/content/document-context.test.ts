import { describe, expect, it } from "vitest";
import type { Doc } from "./mira-docs-adapter";
import { buildDocumentContext } from "./document-context";

function doc(overrides: Partial<Doc>): Doc {
  return {
    path: "/blogs/example",
    root: "blogs",
    directory: "",
    title: "Example",
    description: "",
    group: "文档",
    order: 1,
    source: "",
    headings: [],
    ...overrides,
  } as Doc;
}

describe("document context", () => {
  it("orders ordinary documents with the existing order/directory/path contract", () => {
    const current = doc({ path: "/blogs/b", order: 2 });
    const context = buildDocumentContext(current, [
      doc({ path: "/blogs/c", order: 3 }),
      current,
      doc({ path: "/blogs/a", order: 1 }),
      doc({ path: "/weekly/001", root: "weekly", order: 0 }),
    ]);

    expect(context.previous?.path).toBe("/blogs/a");
    expect(context.next?.path).toBe("/blogs/c");
  });

  it("keeps project navigation inside the current project", () => {
    const current = doc({
      path: "/projects/mira/runtime",
      root: "projects",
      directory: "mira",
      order: 2,
    });
    const context = buildDocumentContext(current, [
      doc({ path: "/projects/alpha", root: "projects", order: 0 }),
      doc({ path: "/projects/mira", root: "projects", order: 1 }),
      current,
      doc({ path: "/projects/mira/tools", root: "projects", directory: "mira", order: 3 }),
    ]);

    expect(context.previous?.path).toBe("/projects/mira");
    expect(context.next?.path).toBe("/projects/mira/tools");
  });

  it("orders weekly issues by issue number just like the previous page logic", () => {
    const current = doc({
      path: "/weekly/002",
      root: "weekly",
      issue: 2,
      order: 20,
    });
    const context = buildDocumentContext(current, [
      doc({ path: "/weekly/003", root: "weekly", issue: 3, order: 1 }),
      current,
      doc({ path: "/weekly/001", root: "weekly", issue: 1, order: 99 }),
    ]);

    expect(context.previous?.path).toBe("/weekly/001");
    expect(context.next?.path).toBe("/weekly/003");
  });

  it("returns open boundaries for the first and last document", () => {
    const first = doc({ path: "/blogs/first", order: 1 });
    const last = doc({ path: "/blogs/last", order: 2 });

    expect(buildDocumentContext(first, [first, last]).previous).toBeUndefined();
    expect(buildDocumentContext(last, [first, last]).next).toBeUndefined();
  });
});
