import { describe, expect, it } from "vitest";
import type { Doc } from "../../content/mira-docs-adapter";
import {
  weeklyDateLabel,
  weeklyDisplayTitle,
  weeklyIssueNumber,
} from "./weekly-utils";

function doc(overrides: Partial<Doc>): Doc {
  return overrides as Doc;
}

describe("weekly helpers", () => {
  it("prefers an explicit issue number over order", () => {
    expect(weeklyIssueNumber(doc({ issue: 7, order: 99 }))).toBe(7);
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
