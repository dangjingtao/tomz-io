import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MobileBookToc from "./MobileBookToc";

const headings = [
  { id: "first", text: "第一节" },
  { id: "second", text: "第二节" },
];

describe("MobileBookToc", () => {
  it("stays out of the document when closed", () => {
    const html = renderToStaticMarkup(
      <MobileBookToc
        open={false}
        headings={headings}
        activeHeading=""
        onClose={() => {}}
      />,
    );
    expect(html).toBe("");
  });

  it("renders an accessible sheet with the shared TOC links when open", () => {
    const html = renderToStaticMarkup(
      <MobileBookToc
        open
        headings={headings}
        activeHeading="second"
        onClose={() => {}}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('id="book-reader-mobile-toc-sheet"');
    expect(html).toContain('href="#first"');
    expect(html).toContain('href="#second"');
    expect(html).toContain('aria-current="location"');
  });
});
