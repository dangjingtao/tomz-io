import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function findChrome() {
  for (const candidate of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    try {
      return execFileSync("which", [candidate], { encoding: "utf8" }).trim();
    } catch {
      // Try the next browser available on the GitHub-hosted runner.
    }
  }
  throw new Error("No Chrome/Chromium binary found on CI runner");
}

function dumpProductionDom(path: string) {
  const chrome = findChrome();
  const url = `https://tomz.io${path}?live-smoke=${Date.now()}`;
  return execFileSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--virtual-time-budget=5000",
      "--dump-dom",
      url,
    ],
    { encoding: "utf8", timeout: 30_000 },
  );
}

const live = process.env.CI ? describe : describe.skip;

live("见π production shell", () => {
  for (const path of ["/weekly", "/weekly/001"]) {
    it(`${path} uses the shared site header`, () => {
      const html = dumpProductionDom(path);
      expect(html).toContain("top-nav");
      expect(html).toContain("mobile-menu-button");
      expect(html).toContain("weekly-app");
      expect(html).not.toContain("weekly-pub-nav");
    }, 40_000);
  }
});
