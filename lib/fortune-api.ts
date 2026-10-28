import { getFortune } from "./fortune";
import { isValidDateString, validateFortuneDate } from "./date";

export function getSharedFortuneResult(
  date: string,
  digitParam: string,
  today: string,
) {
  if (!isValidDateString(today)) {
    throw new RangeError("오늘 날짜는 실제 날짜인 YYYY-MM-DD여야 합니다.");
  }

  if (!/^[0-9]$/.test(digitParam) || validateFortuneDate(date, today)) {
    return null;
  }

  return getFortune(date, Number(digitParam));
}

export {
  FortuneInputError,
  getFortune,
  type FortuneInputErrorCode,
} from "./fortune";
export {
  getSeoulDateString,
  validateFortuneDate,
  type FortuneDateError,
} from "./date";
export type { FortuneResult } from "./types";
