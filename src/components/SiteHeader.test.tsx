import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { allDocs } from "../content/mira-docs-adapter";
import SiteHeader from "./SiteHeader";

describe("SiteHeader guest contributor links", () => {
  it("points to an existing guest contributor page instead of an invented route", () => {
    expect(allDocs.some((doc) => doc.path === "/submissions/t-zt")).toBe(true);

    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/"]}>
        <SiteHeader
          nav={[{ label: "关于", href: "/about" }]}
          blogNavCategories={[]}
          githubUrl="https://github.com/dangjingtao"
          tomzMarkSrc="/brand/tomz-mark.png"
          appBase="/"
          onSearch={() => undefined}
          onToggleTheme={() => undefined}
          darkMode={false}
        />
      </MemoryRouter>,
    );

    expect(html).toContain('href="/submissions/t-zt"');
    expect(html).not.toContain("/submissions/contributors");
  });
});
