import { CAMPAIGN_START_DATE, EXAM_DATE } from "../config/campaign";
import { KEYWORDS, type FortuneKeyword } from "../content/keywords";
import { isValidDateString } from "./date";

export type AssignmentTable = Record<string, FortuneKeyword[]>;

export function getCampaignDates(): string[] {
  const startTime = Date.parse(`${CAMPAIGN_START_DATE}T00:00:00.000Z`);
  const endTime = Date.parse(`${EXAM_DATE}T00:00:00.000Z`);

  if (
    !isValidDateString(CAMPAIGN_START_DATE) ||
    !isValidDateString(EXAM_DATE) ||
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

function createRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function hashDate(date: string): number {
  let hash = 2166136261;
  for (const character of date) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return hash >>> 0;
}

function shuffledKeywords(random: () => number): FortuneKeyword[] {
  const shuffled = [...KEYWORDS];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createDailyAssignment(
  date: string,
  previous: FortuneKeyword[] | undefined,
): FortuneKeyword[] {
  const random = createRandom(hashDate(date));
  const choices = Array.from({ length: KEYWORDS.length }, () =>
    shuffledKeywords(random),
  );
  const assignment: FortuneKeyword[] = [];
  const used = new Set<FortuneKeyword>();

  function assignDigit(digit: number): boolean {
    if (digit === KEYWORDS.length) return true;

    for (const keyword of choices[digit]) {
      if (used.has(keyword) || keyword === previous?.[digit]) continue;

      assignment[digit] = keyword;
      used.add(keyword);
      if (assignDigit(digit + 1)) return true;
      used.delete(keyword);
    }

    return false;
  }

  // 백트래킹으로 일일 중복 없는 배정을 만들며, 전날과 같은 숫자-키워드 조합을 제외합니다.
  if (!assignDigit(0)) {
    throw new Error(`${date} 키워드 배정표를 생성하지 못했습니다.`);
  }

  return assignment;
}

export function generateAssignmentTable(): AssignmentTable {
  const table: AssignmentTable = {};
  let previous: FortuneKeyword[] | undefined;

  for (const date of getCampaignDates()) {
    const dailyAssignment = createDailyAssignment(date, previous);
    table[date] = dailyAssignment;
    previous = dailyAssignment;
  }

  return table;
}
