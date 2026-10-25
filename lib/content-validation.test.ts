import { describe, expect, it } from "vitest";
import { ASSIGNMENTS } from "../content/assignments.generated";
import { COMMON_MESSAGES, PERSONAL_MESSAGES } from "../content/fortunes";
import { getCampaignDates } from "./assignments";
import { validateContentAndAssignments } from "./content-validation";

describe("validateContentAndAssignments", () => {
  it("accepts the complete campaign content and assignment table", () => {
    expect(validateContentAndAssignments()).toEqual([]);
  });

  it("reports missing daily assignments and repeated adjacent assignments", () => {
    const dates = getCampaignDates();
    const modified: Record<string, unknown> = { ...ASSIGNMENTS };
    delete modified[dates[0]];
    modified[dates[2]] = [...ASSIGNMENTS[dates[1]]];

    const errors = validateContentAndAssignments(modified);
    expect(errors).toContain(`${dates[0]}: 숫자별 배정 배열이 없습니다.`);
    expect(errors).toContain(
      `${dates[2]}: 숫자 0의 키워드가 전날과 반복됩니다.`,
    );
  });

  it("reports duplicate keywords within a date", () => {
    const dates = getCampaignDates();
    const modified: Record<string, unknown> = { ...ASSIGNMENTS };
    const duplicateDay = [...ASSIGNMENTS[dates[0]]];
    duplicateDay[1] = duplicateDay[0];
    modified[dates[0]] = duplicateDay;

    expect(validateContentAndAssignments(modified)).toContain(
      `${dates[0]}: 같은 날 중복 키워드가 있습니다.`,
    );
  });

  it("reports missing personal and common messages", () => {
    const personal = {
      ...PERSONAL_MESSAGES,
      차분함: { ...PERSONAL_MESSAGES.차분함, "D-day": "" },
    };
    const common: Record<string, string> = { ...COMMON_MESSAGES };
    delete common[getCampaignDates()[0]];

    const errors = validateContentAndAssignments(
      ASSIGNMENTS,
      personal,
      common,
    );
    expect(errors).toContain("차분함/D-day: 문구가 비어 있거나 누락됐습니다.");
    expect(errors).toContain(
      `${getCampaignDates()[0]}: 공통 응원 문구가 비어 있거나 누락됐습니다.`,
    );
  });
});
