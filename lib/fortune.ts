import type { FortuneResult } from "./types";
import { CAMPAIGN_START_DATE, EXAM_DATE } from "../config/campaign";
import { calculateDday, isValidDateString } from "./date";
import { ASSIGNMENTS } from "../content/assignments.generated";
import { KEYWORDS, type FortuneKeyword } from "../content/keywords";
import {
  COMMON_MESSAGES,
  PERSONAL_MESSAGES,
  type DdayRange,
} from "../content/fortunes";

export type FortuneInputErrorCode =
  | "invalid-date"
  | "invalid-digit"
  | "before-campaign"
  | "campaign-ended"
  | "content-unavailable";

export class FortuneInputError extends RangeError {
  constructor(public readonly code: FortuneInputErrorCode) {
    super(`운세 결과를 만들 수 없는 입력입니다: ${code}`);
    this.name = "FortuneInputError";
  }
}

function getDdayRange(dday: number): DdayRange {
  if (dday === 0) return "D-day";
  if (dday >= 1 && dday <= 6) return "D-6~1";
  if (dday >= 7 && dday <= 29) return "D-29~7";
  if (dday >= 30 && dday <= 59) return "D-59~30";
  return "D-60+";
}

function isFortuneKeyword(value: string): value is FortuneKeyword {
  return KEYWORDS.some((keyword) => keyword === value);
}

/**
 * 날짜와 페이지 끝자리를 받아 같은 입력에 항상 같은 결과를 반환합니다.
 * 미래 날짜는 호출 전에 validateFortuneDate(date, today)로 걸러야 합니다.
 */
export function getFortune(date: string, digit: number): FortuneResult {
  if (!isValidDateString(date)) {
    throw new FortuneInputError("invalid-date");
  }

  if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
    throw new FortuneInputError("invalid-digit");
  }

  if (date < CAMPAIGN_START_DATE) {
    throw new FortuneInputError("before-campaign");
  }

  if (date > EXAM_DATE) {
    throw new FortuneInputError("campaign-ended");
  }

  const dday = calculateDday(date);
  const dDayRange = getDdayRange(dday);
  const dailyAssignment = ASSIGNMENTS[date];
  const assignedKeyword = dailyAssignment?.[digit];
  const commonMessage = COMMON_MESSAGES[date];

  if (!assignedKeyword || !isFortuneKeyword(assignedKeyword) || !commonMessage) {
    throw new FortuneInputError("content-unavailable");
  }

  const personalMessage = PERSONAL_MESSAGES[assignedKeyword][dDayRange];
  if (!personalMessage) {
    throw new FortuneInputError("content-unavailable");
  }

  return {
    date,
    digit,
    dday,
    personalMessage,
    commonMessage,
    resultId: `${date}-${digit}`,
  };
}