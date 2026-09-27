import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";
import { slug } from "./slug";

describe("renderMarkdown heading ids", () => {
  it("uses the shared slug contract for rendered heading anchors", () => {
    const heading = "两税法 / Tang fiscal reset";
    const html = renderMarkdown(`## ${heading}`);

    expect(html).toContain(`id="${slug(heading)}"`);
    expect(html).toContain(`href="#${slug(heading)}"`);
  });
});
