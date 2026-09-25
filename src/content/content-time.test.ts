import { describe, expect, it } from "vitest";
import { contentTimeSortValue } from "./content-time";

describe("contentTimeSortValue", () => {
  it("orders non-zero-padded Chinese dates chronologically", () => {
    expect(contentTimeSortValue("2026年9月22日")).toBeGreaterThan(
      contentTimeSortValue("2026年9月8日"),
    );
  });

  it("keeps invalid or missing values behind valid dates", () => {
    expect(contentTimeSortValue("2026年9月22日")).toBeGreaterThan(
      contentTimeSortValue("not-a-date"),
    );
    expect(contentTimeSortValue(undefined)).toBe(0);
  });
});
