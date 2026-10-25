import { describe, expect, it } from "vitest";
import {
  calculateDday,
  getSeoulDateString,
  isValidDateString,
  validateFortuneDate,
} from "./date";

describe("isValidDateString", () => {
  it("accepts real YYYY-MM-DD dates and rejects malformed or impossible dates", () => {
    expect(isValidDateString("2026-02-28")).toBe(true);
    expect(isValidDateString("2024-02-29")).toBe(true);
    expect(isValidDateString("2026-02-29")).toBe(false);
    expect(isValidDateString("2026-13-01")).toBe(false);
    expect(isValidDateString("2026-1-01")).toBe(false);
  });
});

describe("calculateDday", () => {
  it.each([
    ["2026-09-20", 60],
    ["2026-09-21", 59],
    ["2026-10-20", 30],
    ["2026-10-21", 29],
    ["2026-11-12", 7],
    ["2026-11-13", 6],
    ["2026-11-18", 1],
    ["2026-11-19", 0],
    ["2026-11-20", -1],
  ])("returns D-day %i for %s", (date, expected) => {
    expect(calculateDday(date)).toBe(expected);
  });

  it("rejects impossible dates", () => {
    expect(() => calculateDday("2026-02-30")).toThrow(RangeError);
  });
});

describe("getSeoulDateString", () => {
  it("calculates the date in Seoul across the UTC day boundary", () => {
    expect(getSeoulDateString(new Date("2026-10-24T14:59:59.000Z"))).toBe(
      "2026-10-24",
    );
    expect(getSeoulDateString(new Date("2026-10-24T15:00:00.000Z"))).toBe(
      "2026-10-25",
    );
  });
});

describe("validateFortuneDate", () => {
  it("allows past dates through the exam date, but rejects future and post-exam dates", () => {
    expect(validateFortuneDate("2026-10-24", "2026-10-25")).toBeNull();
    expect(validateFortuneDate("2026-10-26", "2026-10-25")).toBe(
      "future-date",
    );
    expect(validateFortuneDate("2026-11-20", "2026-11-20")).toBe(
      "campaign-ended",
    );
  });

  it("distinguishes an invalid requested date from an invalid current date", () => {
    expect(validateFortuneDate("2026-02-30", "2026-10-25")).toBe(
      "invalid-date",
    );
    expect(validateFortuneDate("2026-10-25", "not-a-date")).toBe(
      "invalid-today",
    );
  });
});
