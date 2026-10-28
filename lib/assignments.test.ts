import { describe, expect, it } from "vitest";
import {
  ASSIGNMENT_TEMPLATE_EXAM_YEAR,
  getCampaignStartDate,
  getExamDate,
} from "../config/campaign";
import { KEYWORDS } from "../content/keywords";
import { ASSIGNMENTS } from "../content/assignments.generated";
import { generateAssignmentTable } from "./assignments";

describe("generateAssignmentTable", () => {
  it("generates a reproducible assignment for every campaign date", () => {
    const first = generateAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR);
    const second = generateAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR);

    expect(first).toEqual(second);
    expect(first).toEqual(ASSIGNMENTS);
    expect(Object.keys(first)[0]).toBe(
      getCampaignStartDate(ASSIGNMENT_TEMPLATE_EXAM_YEAR),
    );
    expect(Object.keys(first).at(-1)).toBe(
      getExamDate(ASSIGNMENT_TEMPLATE_EXAM_YEAR),
    );
    expect(Object.keys(first)).toHaveLength(61);
  });

  it("reuses the assignment pattern for a different exam year", () => {
    const template = generateAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR);
    const nextYear = generateAssignmentTable(2027);

    expect(Object.values(nextYear)).toEqual(Object.values(template));
  });

  it("assigns all keywords once per day and changes each digit's keyword the next day", () => {
    const table = generateAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR);
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
