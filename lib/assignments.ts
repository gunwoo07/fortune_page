import {
  ASSIGNMENT_TEMPLATE_EXAM_YEAR,
  getCampaignStartDate,
  getExamDate,
} from "../config/campaign";
import { ASSIGNMENTS } from "../content/assignments.generated";
import type { FortuneKeyword } from "../content/keywords";
import { isValidDateString } from "./date";

export type AssignmentTable = Record<string, FortuneKeyword[]>;

export function getCampaignDates(examYear: number): string[] {
  const campaignStart = getCampaignStartDate(examYear);
  const examDate = getExamDate(examYear);
  const startTime = Date.parse(`${campaignStart}T00:00:00.000Z`);
  const endTime = Date.parse(`${examDate}T00:00:00.000Z`);

  if (
    !isValidDateString(campaignStart) ||
    !isValidDateString(examDate) ||
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    startTime > endTime
  ) {
    throw new RangeError("배정 기간 설정이 올바르지 않습니다.");
  }

  const dates: string[] = [];
  for (let time = startTime; time <= endTime; time += 86_400_000) {
    dates.push(new Date(time).toISOString().slice(0, 10));
  }

  return dates;
}

export function generateAssignmentTable(examYear: number): AssignmentTable {
  const templateDates = getCampaignDates(ASSIGNMENT_TEMPLATE_EXAM_YEAR);
  const campaignDates = getCampaignDates(examYear);
  const table: AssignmentTable = {};

  for (const [index, date] of campaignDates.entries()) {
    const templateDate = templateDates[index];
    const templateAssignment = templateDate
      ? ASSIGNMENTS[templateDate]
      : undefined;
    if (!templateAssignment) {
      throw new Error(
        `기준 연도 ${ASSIGNMENT_TEMPLATE_EXAM_YEAR}의 ${date} 배정이 없습니다.`,
      );
    }
    table[date] = [...templateAssignment];
  }

  return table;
}

const assignmentTables = new Map<number, AssignmentTable>();

export function getAssignmentTable(examYear: number): AssignmentTable {
  const cached = assignmentTables.get(examYear);
  if (cached) return cached;

  const table = generateAssignmentTable(examYear);
  assignmentTables.set(examYear, table);
  return table;
}
