import { describe, expect, it } from "vitest";
import { ASSIGNMENT_TEMPLATE_EXAM_YEAR } from "../config/campaign";
import { createCommonMessages, PERSONAL_MESSAGES } from "../content/fortunes";
import { generateAssignmentTable, getCampaignDates } from "./assignments";
import { validateContentAndAssignments } from "./content-validation";

describe("validateContentAndAssignments", () => {
  it("accepts the complete campaign content and assignment table", () => {
    expect(
      validateContentAndAssignments(
        undefined,
        undefined,
        undefined,
        ASSIGNMENT_TEMPLATE_EXAM_YEAR,
      ),
    ).toEqual([]);
  });

  it("accepts the reused content for a later annual campaign", () => {
    expect(
      validateContentAndAssignments(undefined, undefined, undefined, 2027),
    ).toEqual([]);
  });

  it("reports missing daily assignments and repeated adjacent assignments", () => {
    const dates = getCampaignDates(ASSIGNMENT_TEMPLATE_EXAM_YEAR);
    const modified: Record<string, unknown> = {
      ...generateAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR),
    };
    delete modified[dates[0]];
    modified[dates[2]] = [
      ...generateAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR)[dates[1]],
    ];

    const errors = validateContentAndAssignments(
      modified,
      undefined,
      undefined,
      ASSIGNMENT_TEMPLATE_EXAM_YEAR,
    );
    expect(errors).toContain(`${dates[0]}: 숫자별 배정 배열이 없습니다.`);
    expect(errors).toContain(
      `${dates[2]}: 숫자 0의 키워드가 전날과 반복됩니다.`,
    );
  });

  it("reports duplicate keywords within a date", () => {
    const table = generateAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR);
    const dates = getCampaignDates(ASSIGNMENT_TEMPLATE_EXAM_YEAR);
    const modified: Record<string, unknown> = { ...table };
    const duplicateDay = [...table[dates[0]]];
    duplicateDay[1] = duplicateDay[0];
    modified[dates[0]] = duplicateDay;

    expect(
      validateContentAndAssignments(
        modified,
        undefined,
        undefined,
        ASSIGNMENT_TEMPLATE_EXAM_YEAR,
      ),
    ).toContain(`${dates[0]}: 같은 날 중복 키워드가 있습니다.`);
  });

  it("reports missing personal and common messages", () => {
    const dates = getCampaignDates(ASSIGNMENT_TEMPLATE_EXAM_YEAR);
    const personal = {
      ...PERSONAL_MESSAGES,
      차분함: { ...PERSONAL_MESSAGES.차분함, "D-day": "" },
    };
    const common: Record<string, string> = {
      ...createCommonMessages(ASSIGNMENT_TEMPLATE_EXAM_YEAR),
    };
    delete common[dates[0]];

    const errors = validateContentAndAssignments(
      generateAssignmentTable(ASSIGNMENT_TEMPLATE_EXAM_YEAR),
      personal,
      common,
      ASSIGNMENT_TEMPLATE_EXAM_YEAR,
    );
    expect(errors).toContain("차분함/D-day: 문구가 비어 있거나 누락됐습니다.");
    expect(errors).toContain(
      `${dates[0]}: 공통 응원 문구가 비어 있거나 누락됐습니다.`,
    );
  });
});
