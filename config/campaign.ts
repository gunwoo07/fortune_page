export const DAYS_BEFORE_EXAM = 60;
export const ASSIGNMENT_TEMPLATE_EXAM_YEAR = 2026;

const DAY_IN_MILLISECONDS = 86_400_000;

function assertExamYear(year: number): void {
  if (!Number.isInteger(year) || year < 0 || year > 9999) {
    throw new RangeError("수능 연도는 네 자리 연도여야 합니다.");
  }
}

export function getExamDate(year: number): string {
  assertExamYear(year);
  const novemberFirst = new Date(0);
  novemberFirst.setUTCFullYear(year, 10, 1);
  novemberFirst.setUTCHours(0, 0, 0, 0);
  const daysUntilThursday = (4 - novemberFirst.getUTCDay() + 7) % 7;
  const thirdThursday = 1 + daysUntilThursday + 14;
  return `${String(year).padStart(4, "0")}-11-${String(thirdThursday).padStart(2, "0")}`;
}

export function getCampaignStartDate(year: number): string {
  const examTime = Date.parse(`${getExamDate(year)}T00:00:00.000Z`);
  return new Date(examTime - DAYS_BEFORE_EXAM * DAY_IN_MILLISECONDS)
    .toISOString()
    .slice(0, 10);
}
