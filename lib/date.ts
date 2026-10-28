import { getCampaignStartDate, getExamDate } from "../config/campaign";

export type FortuneDateError =
  | "invalid-date"
  | "invalid-today"
  | "before-campaign"
  | "future-date"
  | "campaign-ended";

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function toEpochDay(value: string): number {
  // 날짜를 UTC 자정 기준 정수로 바꿔 서버의 시간대나 DST가 계산에 섞이지 않게 합니다.
  return Date.parse(`${value}T00:00:00.000Z`) / 86_400_000;
}

export function getSeoulDateString(now: Date = new Date()): string {
  // 출력 형식은 로케일 문자열 대신 날짜 구성 요소를 조합해 YYYY-MM-DD로 고정합니다.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");

  if (!year || !month || !day) {
    throw new Error("한국 날짜를 계산하지 못했습니다.");
  }

  return `${year.padStart(4, "0")}-${month}-${day}`;
}

export function calculateDday(dateString: string): number {
  if (!isValidDateString(dateString)) {
    throw new RangeError("날짜 형식은 실제 날짜인 YYYY-MM-DD여야 합니다.");
  }

  const examDate = getExamDate(Number(dateString.slice(0, 4)));
  return toEpochDay(examDate) - toEpochDay(dateString);
}

export function validateFortuneDate(
  dateString: string,
  today: string,
): FortuneDateError | null {
  if (!isValidDateString(dateString)) {
    return "invalid-date";
  }

  if (!isValidDateString(today)) {
    return "invalid-today";
  }

  const year = Number(dateString.slice(0, 4));
  const campaignStartDate = getCampaignStartDate(year);
  const examDate = getExamDate(year);

  if (dateString < campaignStartDate) {
    return "before-campaign";
  }

  // 과거 결과 링크는 유지하되, 시험일 이후와 오늘 이후의 결과는 새로 열지 않습니다.
  if (dateString > examDate) {
    return "campaign-ended";
  }

  if (dateString > today) {
    return "future-date";
  }

  return null;
}