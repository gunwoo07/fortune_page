import { FortuneResult } from './types';
import { calculateDday } from './date';

/**
 * 날짜와 선택한 숫자를 받아 해당 일자의 운세 결과 객체를 반환하는 순수 함수
 * @param date YYYY-MM-DD 형식의 문자열 (예: "2026-10-13")
 * @param digit 0부터 9 사이의 선택된 숫자
 */
export function getFortune(date: string, digit: number): FortuneResult {
  // 1. 숫자 범위 검증 (0~9가 아니면 안전하게 예외 처리)
  if (digit < 0 || digit > 9 || !Number.isInteger(digit)) {
    throw new Error('선택된 숫자는 0부터 9 사이의 정수여야 합니다.');
  }

  // 2. D-day 계산 함수 호출
  const dday = calculateDday(date);

  // 3. 결과 ID 생성 (공유 카드나 분석에 활용할 고유 식별자)
  const resultId = `${date}-${digit}`;

  // TODO: 추후 콘텐츠(content/) 파일과 연동하여 
  // 날짜와 숫자에 맞는 실제 키워드 및 운세/공통 응원 문구를 조합할 예정입니다.
  const personalMessage = `오늘 전해지는 마음의 방향이 온전히 닿기를 바랍니다. (D-${dday}, 선택한 수: ${digit})`;
  const commonMessage = '지나온 시간은 생각보다 오래 너의 편에 남아 있어.';

  return {
    date,
    digit,
    dday,
    personalMessage,
    commonMessage,
    resultId,
  };
}