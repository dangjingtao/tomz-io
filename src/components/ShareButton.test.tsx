import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ShareButton from "./ShareButton";

describe("ShareButton presentation variants", () => {
  it("does not inherit generic button rules in the weekly mobile toolbar", () => {
    const markup = renderToStaticMarkup(
      <ShareButton title="见π 008" variant="weekly-mobile" />,
    );
    expect(markup).toContain('class="weekly-mobile-share-action"');
    expect(markup).not.toContain("btn-secondary");
    expect(markup).not.toContain('class="share-button"');
  });

  it("preserves the original share style on other pages", () => {
    const markup = renderToStaticMarkup(<ShareButton title="文章" />);
    expect(markup).toContain('class="btn btn-secondary share-button"');
  });
});
