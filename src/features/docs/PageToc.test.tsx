import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageToc, PageTocLinks } from "./PageToc";

const headings = [
  { id: "first", text: "第一节" },
  { id: "second", text: "第二节" },
];

describe("PageToc", () => {
  it("renders stable anchor targets and the active section", () => {
    const html = renderToStaticMarkup(
      <PageToc headings={headings} activeHeading="second" />,
    );

    expect(html).toContain('href="#first"');
    expect(html).toContain('href="#second"');
    expect(html).toContain('aria-current="location"');
    expect(html).toContain(">本页目录<");
  });

  it("supports numbered presentation without changing heading ids", () => {
    const html = renderToStaticMarkup(
      <PageTocLinks headings={headings} numbered />,
    );

    expect(html).toContain(">01<");
    expect(html).toContain(">02<");
    expect(html).toContain('href="#first"');
    expect(html).toContain('href="#second"');
  });
});
