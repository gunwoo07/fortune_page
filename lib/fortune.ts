import { FortuneResult } from './types';
import { calculateDday } from './date';
import { PERSONAL_MESSAGES, COMMON_MESSAGES, DEFAULT_COMMON_MESSAGE } from '../content/fortunes';

/**
 * 날짜와 선택한 숫자를 받아 해당 일자의 운세 결과 객체를 반환하는 순수 함수
 * @param date YYYY-MM-DD 형식의 문자열 (예: "2026-10-13")
 * @param digit 0부터 9 사이의 선택된 숫자
 */
export function getFortune(date: string, digit: number): FortuneResult {
  // 1. 숫자 범위 검증 (0~9 사이의 정수가 아니면 안전하게 예외 처리)
  if (digit < 0 || digit > 9 || !Number.isInteger(digit)) {
    throw new Error('선택된 숫자는 0부터 9 사이의 정수여야 합니다.');
  }

  // 2. 날짜 형식 검증 (간단한 YYYY-MM-DD 정규식 체크)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('날짜 형식은 YYYY-MM-DD여야 합니다.');
  }

  // 3. D-day 계산 함수 호출
  const dday = calculateDday(date);

  // 4. D-day 구간 판별 (계획서 기준 5개 구간)
  let dDayRange = 'D-60+';
  if (dday === 0) {
    dDayRange = 'D-day';
  } else if (dday >= 1 && dday <= 6) {
    dDayRange = 'D-6~1';
  } else if (dday >= 7 && dday <= 29) {
    dDayRange = 'D-29~7';
  } else if (dday >= 30 && dday <= 59) {
    dDayRange = 'D-59~30';
  } else {
    dDayRange = 'D-60+';
  }

  // 5. 결과 ID 생성 (공유 카드나 분석에 활용할 고유 식별자)
  const resultId = `${date}-${digit}`;

  // 6. 날짜와 숫자에 따른 개인 운세 문구 선택 
  const messagesForRange = PERSONAL_MESSAGES[dDayRange] || PERSONAL_MESSAGES['D-60+'];
  const messageIndex = (digit + parseInt(date.replaceAll('-', ''), 10)) % messagesForRange.length;
  const personalMessage = messagesForRange[messageIndex];

  // 7. 날짜별 공통 응원 문구 선택 (없으면 기본 응원 문구 사용)
  const commonMessage = COMMON_MESSAGES[date] || DEFAULT_COMMON_MESSAGE;

  return {
    date,
    digit,
    dday,
    personalMessage,
    commonMessage,
    resultId,
  };
}