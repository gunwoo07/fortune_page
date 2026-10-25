import { describe, expect, it } from "vitest";
import {
  getFortune,
  getSeoulDateString,
  validateFortuneDate,
  type FortuneResult,
} from "./fortune-api";

describe("frontend fortune contract", () => {
  it("validates a shared date and returns the documented result shape", () => {
    const today = getSeoulDateString(new Date("2026-10-25T03:00:00.000Z"));
    const date = "2026-10-25";

    expect(validateFortuneDate(date, today)).toBeNull();
    const result: FortuneResult = getFortune(date, 8);

    expect(Object.keys(result).sort()).toEqual(
      [
        "date",
        "digit",
        "dday",
        "personalMessage",
        "commonMessage",
        "resultId",
      ].sort(),
    );
    expect(result).toMatchObject({
      date,
      digit: 8,
      dday: 25,
      resultId: "2026-10-25-8",
    });
  });

  it("exposes a distinct error for a future date before engine lookup", () => {
    expect(validateFortuneDate("2026-10-26", "2026-10-25")).toBe(
      "future-date",
    );
  });
});
