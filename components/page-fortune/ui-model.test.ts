import { describe, expect, it } from "vitest";
import { ddayLabel, formatResultDate, parseDigit } from "./ui-model";

describe("digit input", () => {
  it("accepts each single ASCII digit, including zero", () => {
    for (let digit = 0; digit <= 9; digit += 1) {
      expect(parseDigit(String(digit))).toBe(digit);
    }
  });

  it.each(["", " ", "10", "-1", "1.5", "a", "８", " 8", "8 "])(
    "rejects invalid input %j",
    (input) => expect(parseDigit(input)).toBeNull(),
  );
});

describe("result date title", () => {
  it.each([
    ["2026-11-01", "11월 1일"],
    ["2026-10-28", "10월 28일"],
    ["2026-01-01", "1월 1일"],
  ])("formats the result date %s without depending on today's timezone", (date, label) => {
    expect(formatResultDate(date)).toBe(label);
  });
});

describe("D-day label", () => {
  it.each([
    [40, "D-40"],
    [1, "D-1"],
    [0, "D-day"],
    [-1, "운영 종료"],
  ])("formats %i as %s", (dday, label) => {
    expect(ddayLabel(dday)).toBe(label);
  });
});
