import { describe, expect, it } from "vitest";
import { parseBookManifest } from "./book-manifest";

describe("parseBookManifest", () => {
  it("keeps an optional book cover URL", () => {
    const book = parseBookManifest(
      [
        "id: qishu",
        "title: 气数",
        "description: 历史中的选择",
        "cover: https://assets.example.com/qishu.webp",
        "category: 历史 / 制度",
        "kind: collection",
        "order: 40",
        "status: active",
      ].join("\n"),
      "src/pages/books/qishu/_book.yml",
    );

    expect(book.cover).toBe("https://assets.example.com/qishu.webp");
  });

  it("keeps cover optional for existing books", () => {
    const book = parseBookManifest(
      [
        "id: psalms",
        "title: 读诗篇",
        "description: 读经札记",
        "kind: study",
        "order: 10",
        "status: active",
      ].join("\n"),
      "src/pages/books/psalms/_book.yml",
    );

    expect(book.cover).toBeUndefined();
  });
});
