import { describe, expect, it } from "vitest";
import type { Doc } from "../../content/mira-docs-adapter";
import {
  weeklyDateLabel,
  weeklyDisplayTitle,
  weeklyIssueNumber,
  weeklyIssuePath,
  groupWeeklyToc,
} from "./weekly-utils";

function doc(overrides: Partial<Doc>): Doc {
  return overrides as Doc;
}

describe("weekly helpers", () => {
  it("derives a weekly article's issue from its containing directory", () => {
    expect(weeklyIssueNumber(doc({ root: "weekly", directory: "009", order: 3 }))).toBe(9);
    expect(weeklyIssueNumber(doc({ root: "weekly", directory: "009/feature", issue: 8, order: 3 }))).toBe(9);
    expect(weeklyIssuePath(doc({ root: "weekly", directory: "009", order: 3 }))).toBe("/weekly/009");
  });

  it("falls back to explicit issue metadata and then order when no numbered weekly directory exists", () => {
    expect(weeklyIssueNumber(doc({ root: "weekly", directory: "", issue: 7, order: 99 }))).toBe(7);
    expect(weeklyIssueNumber(doc({ order: 3 }))).toBe(3);
  });

  it("removes only the known issue prefix from display titles", () => {
    expect(weeklyDisplayTitle(doc({ title: "见π #12：Agent 之后" }))).toBe("Agent 之后");
    expect(weeklyDisplayTitle(doc({ title: "周刊 8 - 一周观察" }))).toBe("一周观察");
    expect(weeklyDisplayTitle(doc({ title: "没有编号的标题" }))).toBe("没有编号的标题");
  });

  it("normalizes Chinese calendar dates for magazine display", () => {
    expect(weeklyDateLabel("2026年9月3日")).toBe("2026.09.03");
    expect(weeklyDateLabel("2026-09-03")).toBe("2026-09-03");
    expect(weeklyDateLabel()).toBe("");
  });
});

describe("weekly table of contents", () => {
  it("keeps older H2-only articles and issue categories navigable", () => {
    const toc = groupWeeklyToc([
      { id: "cover", text: "封面文章", depth: 2 },
      { id: "history", text: "历史一页", depth: 2 },
    ]);
    expect(toc.map((group) => group.heading.id)).toEqual(["cover", "history"]);
    expect(toc.every((group) => group.children.length === 0)).toBe(true);
  });

  it("nests H3 arguments under their actual H2 chapter", () => {
    const toc = groupWeeklyToc([
      { id: "system", text: "源代码失去中心地位", depth: 2 },
      { id: "review", text: "代码审查", depth: 3 },
      { id: "tests", text: "单元测试", depth: 3 },
      { id: "cost", text: "Token 为王", depth: 2 },
      { id: "tokens", text: "Token 的门槛", depth: 3 },
    ]);
    expect(toc).toHaveLength(2);
    expect(toc[0].children.map((item) => item.id)).toEqual(["review", "tests"]);
    expect(toc[1].children.map((item) => item.id)).toEqual(["tokens"]);
  });

  it("does not lose an orphan H3 when older Markdown omits a parent chapter", () => {
    const toc = groupWeeklyToc([{ id: "reference", text: "参考", depth: 3 }]);
    expect(toc).toHaveLength(1);
    expect(toc[0].heading.id).toBe("reference");
  });
});
