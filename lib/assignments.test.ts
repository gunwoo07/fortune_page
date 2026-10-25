import { describe, expect, it } from "vitest";
import { CAMPAIGN_START_DATE, EXAM_DATE } from "../config/campaign";
import { KEYWORDS } from "../content/keywords";
import { ASSIGNMENTS } from "../content/assignments.generated";
import { generateAssignmentTable } from "./assignments";

describe("generateAssignmentTable", () => {
  it("generates a reproducible assignment for every campaign date", () => {
    const first = generateAssignmentTable();
    const second = generateAssignmentTable();

    expect(first).toEqual(second);
    expect(first).toEqual(ASSIGNMENTS);
    expect(Object.keys(first)[0]).toBe(CAMPAIGN_START_DATE);
    expect(Object.keys(first).at(-1)).toBe(EXAM_DATE);
    expect(Object.keys(first)).toHaveLength(62);
  });

  it("assigns all keywords once per day and changes each digit's keyword the next day", () => {
    const table = generateAssignmentTable();
    const dates = Object.keys(table);

    for (const [index, date] of dates.entries()) {
      const daily = table[date];
      expect(daily).toHaveLength(KEYWORDS.length);
      expect(new Set(daily)).toEqual(new Set(KEYWORDS));

      if (index > 0) {
        const previous = table[dates[index - 1]];
        for (let digit = 0; digit < KEYWORDS.length; digit += 1) {
          expect(daily[digit]).not.toBe(previous[digit]);
        }
      }
    }
  });
});
