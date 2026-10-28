import { getExamDate } from "../config/campaign";
import { KEYWORDS } from "../content/keywords";
import {
  createCommonMessages,
  DDAY_RANGES,
  PERSONAL_MESSAGES,
} from "../content/fortunes";
import { generateAssignmentTable, getCampaignDates } from "./assignments";
import { getSeoulDateString } from "./date";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getUpcomingExamYear(): number {
  const today = getSeoulDateString();
  const currentYear = Number(today.slice(0, 4));
  return today > getExamDate(currentYear) ? currentYear + 1 : currentYear;
}

export function validateContentAndAssignments(
  assignments?: unknown,
  personalMessages: unknown = PERSONAL_MESSAGES,
  commonMessages?: unknown,
  examYear = getUpcomingExamYear(),
): string[] {
  // 문구와 배정이 연간 캠페인 기간 전체를 빠짐없이 채우는지 검사합니다.
  const errors: string[] = [];
  const resolvedAssignments =
    assignments === undefined ? generateAssignmentTable(examYear) : assignments;
  const resolvedCommonMessages =
    commonMessages === undefined
      ? createCommonMessages(examYear)
      : commonMessages;
  const dates = getCampaignDates(examYear);
  const generatedAssignments = generateAssignmentTable(examYear);
  const expectedDates = new Set(dates);

  if (!isRecord(resolvedAssignments)) {
    errors.push("배정표는 날짜별 객체여야 합니다.");
    return errors;
  }

  for (const date of dates) {
    const daily = resolvedAssignments[date];
    if (!Array.isArray(daily)) {
      errors.push(`${date}: 숫자별 배정 배열이 없습니다.`);
      continue;
    }

    if (JSON.stringify(daily) !== JSON.stringify(generatedAssignments[date])) {
      errors.push(`${date}: 생성 스크립트 결과와 배정 파일이 다릅니다.`);
    }

    if (daily.length !== KEYWORDS.length) {
      errors.push(`${date}: 0~9 숫자에 대응하는 키워드 10개가 필요합니다.`);
    }

    const dailyKeywords = daily.filter(
      (keyword): keyword is string => typeof keyword === "string",
    );
    if (new Set(dailyKeywords).size !== dailyKeywords.length) {
      errors.push(`${date}: 같은 날 중복 키워드가 있습니다.`);
    }

    for (const keyword of dailyKeywords) {
      if (!KEYWORDS.some((known) => known === keyword)) {
        errors.push(`${date}: 등록되지 않은 키워드 "${keyword}"가 있습니다.`);
      }
    }

    const dateIndex = dates.indexOf(date);
    const previous =
      dateIndex > 0 ? resolvedAssignments[dates[dateIndex - 1]] : undefined;
    if (Array.isArray(previous)) {
      for (let digit = 0; digit < daily.length; digit += 1) {
        if (daily[digit] === previous[digit]) {
          errors.push(`${date}: 숫자 ${digit}의 키워드가 전날과 반복됩니다.`);
        }
      }
    }
  }

  for (const date of Object.keys(resolvedAssignments)) {
    if (!expectedDates.has(date)) {
      errors.push(`${date}: 캠페인 기간 밖의 배정 날짜입니다.`);
    }
  }

  if (!isRecord(personalMessages)) {
    errors.push("개인 운세 문구는 키워드별 객체여야 합니다.");
  } else {
    const personalTextSeen = new Set<string>();
    for (const keyword of KEYWORDS) {
      const messages = personalMessages[keyword];
      if (!isRecord(messages)) {
        errors.push(`${keyword}: 개인 운세 구간 문구가 없습니다.`);
        continue;
      }

      for (const range of DDAY_RANGES) {
        const message = messages[range];
        if (!isNonEmptyText(message)) {
          errors.push(`${keyword}/${range}: 문구가 비어 있거나 누락됐습니다.`);
          continue;
        }
        if (personalTextSeen.has(message)) {
          errors.push(`${keyword}/${range}: 다른 개인 운세와 문구가 중복됩니다.`);
        }
        personalTextSeen.add(message);
      }

      for (const range of Object.keys(messages)) {
        if (!DDAY_RANGES.some((known) => known === range)) {
          errors.push(`${keyword}: 알 수 없는 D-day 구간 "${range}"가 있습니다.`);
        }
      }
    }

    for (const keyword of Object.keys(personalMessages)) {
      if (!KEYWORDS.some((known) => known === keyword)) {
        errors.push(`등록되지 않은 키워드 "${keyword}"의 개인 운세가 있습니다.`);
      }
    }
  }

  if (!isRecord(resolvedCommonMessages)) {
    errors.push("공통 응원 문구는 날짜별 객체여야 합니다.");
  } else {
    const commonTextSeen = new Set<string>();
    for (const date of dates) {
      const message = resolvedCommonMessages[date];
      if (!isNonEmptyText(message)) {
        errors.push(`${date}: 공통 응원 문구가 비어 있거나 누락됐습니다.`);
        continue;
      }
      if (commonTextSeen.has(message)) {
        errors.push(`${date}: 다른 날짜의 공통 응원과 문구가 중복됩니다.`);
      }
      commonTextSeen.add(message);
    }

    for (const date of Object.keys(resolvedCommonMessages)) {
      if (!expectedDates.has(date)) {
        errors.push(`${date}: 캠페인 기간 밖의 공통 응원 날짜입니다.`);
      }
    }
  }

  return errors;
}
