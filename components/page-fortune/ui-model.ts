/** Input and display helpers only. Campaign dates and fortune rules belong to B. */
export function parseDigit(input: string): number | null {
  return /^[0-9]$/.test(input) ? Number(input) : null;
}

/** 검증된 결과 날짜를 그대로 표시합니다. Date 파싱이나 현재 시간대에 의존하지 않습니다. */
export function formatResultDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}

export function ddayLabel(dday: number): string {
  if (dday < 0) return "운영 종료";
  return dday === 0 ? "D-day" : `D-${dday}`;
}
