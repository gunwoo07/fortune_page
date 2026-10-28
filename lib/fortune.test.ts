import { describe, expect, it } from "vitest";
import { ASSIGNMENT_TEMPLATE_EXAM_YEAR } from "../config/campaign";
import { getAssignmentTable, getCampaignDates } from "./assignments";
import { getFortune, FortuneInputError } from "./fortune";

describe("getFortune", () => {
  it("returns a stable result for the same date and digit", () => {
    const first = getFortune("2026-10-25", 8);
    const second = getFortune("2026-10-25", 8);

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      date: "2026-10-25",
      digit: 8,
      dday: 25,
      resultId: "2026-10-25-8",
    });
    expect(first.personalMessage).toBeTruthy();
    expect(first.commonMessage).toBeTruthy();
  });

  it.each(["2026-02-30", "2026-1-01", "not-a-date"])(
    "rejects invalid date %s",
    (date) => {
      expect(() => getFortune(date, 0)).toThrow(
        expect.objectContaining<Partial<FortuneInputError>>({
          code: "invalid-date",
        }),
      );
    },
  );

  it.each([-1, 1.5, 10, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid digit %s",
    (digit) => {
      expect(() => getFortune("2026-10-25", digit)).toThrow(
        expect.objectContaining<Partial<FortuneInputError>>({
          code: "invalid-digit",
        }),
      );
    },
  );

  it("accepts both ends of the configured campaign", () => {
    expect(getFortune("2026-09-20", 0).dday).toBe(60);
    expect(getFortune("2026-11-19", 9).dday).toBe(0);
  });

  it("generates results for the next annual campaign", () => {
    expect(getFortune("2027-09-19", 8)).toMatchObject({
      date: "2027-09-19",
      dday: 60,
    });
    expect(getFortune("2027-11-18", 8)).toMatchObject({
      date: "2027-11-18",
      dday: 0,
    });
  });

  it("produces a result for every digit on every campaign date", () => {
    for (const date of getCampaignDates(ASSIGNMENT_TEMPLATE_EXAM_YEAR)) {
      for (let digit = 0; digit <= 9; digit += 1) {
        const result = getFortune(date, digit);
        expect(result.date).toBe(date);
        expect(result.digit).toBe(digit);
        expect(result.personalMessage).toBeTruthy();
        expect(result.commonMessage).toBeTruthy();
        expect(result).not.toHaveProperty("keyword");
        expect(getAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR)[date][digit]).toBeTruthy();
      }
    }
  });

  it("rejects dates outside the configured campaign", () => {
    expect(() => getFortune("2026-09-19", 0)).toThrow(
      expect.objectContaining<Partial<FortuneInputError>>({
        code: "before-campaign",
      }),
    );
    expect(() => getFortune("2026-11-20", 0)).toThrow(
      expect.objectContaining<Partial<FortuneInputError>>({
        code: "campaign-ended",
      }),
    );
  });
});
