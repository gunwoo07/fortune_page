import { describe, expect, it } from "vitest";
import { getSharedFortuneResult } from "./fortune-api";

describe("shared fortune result", () => {
  const today = "2026-10-26";

  it("recreates today's result from the URL parameters", () => {
    const result = getSharedFortuneResult(today, "8", today);

    expect(result).toMatchObject({
      date: today,
      digit: 8,
      resultId: `${today}-8`,
    });
  });

  it("keeps valid past results available for shared links", () => {
    const date = "2026-10-25";

    expect(getSharedFortuneResult(date, "8", today)).toMatchObject({
      date,
      digit: 8,
      resultId: `${date}-8`,
    });
  });

  it.each([
    ["invalid date format", "2026/10/25", "8"],
    ["nonexistent date", "2026-02-30", "8"],
    ["future date", "2026-10-27", "8"],
    ["date before campaign", "2026-09-18", "8"],
    ["date after exam day", "2026-11-20", "8"],
    ["negative digit", today, "-1"],
    ["two-digit number", today, "08"],
    ["non-numeric digit", today, "a"],
  ])("rejects %s", (_label, date, digit) => {
    expect(getSharedFortuneResult(date, digit, today)).toBeNull();
  });

  it("surfaces an invalid server date instead of treating it as a bad URL", () => {
    expect(() => getSharedFortuneResult(today, "8", "not-a-date")).toThrow(
      RangeError,
    );
  });
});
