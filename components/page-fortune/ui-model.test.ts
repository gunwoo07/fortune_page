import { describe, expect, it } from "vitest";
import { ddayLabel, parseDigit } from "./ui-model";

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
