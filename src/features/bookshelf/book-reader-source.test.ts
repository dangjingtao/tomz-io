import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../../utils/markdown";
import {
  bookReaderHeadings,
  normalizeBookArticleSource,
} from "./book-reader-source";

describe("book reader source", () => {
  it("derives primary TOC headings from the exact source sent to the renderer", () => {
    const source = [
      "# 标题",
      "",
      "## 第一节",
      "",
      "### 第一节里的子问题",
      "",
      "# 次级大段",
      "",
      "## 第二节",
    ].join("\n");

    const normalized = normalizeBookArticleSource(source, "标题");
    expect(normalized).not.toContain("# 标题");
    expect(normalized).toContain("## 次级大段");
    expect(normalized).toContain("### 第一节里的子问题");

    const headings = bookReaderHeadings(source, "标题");
    expect(headings).toEqual([
      { id: "第一节", text: "第一节" },
      { id: "次级大段", text: "次级大段" },
      { id: "第二节", text: "第二节" },
    ]);

    const html = renderMarkdown(normalized);
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
    expect(html).toContain('id="第一节里的子问题"');
  });
});
