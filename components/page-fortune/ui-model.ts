/** Input and display helpers only. Campaign dates and fortune rules belong to B. */
export function parseDigit(input: string): number | null {
  return /^[0-9]$/.test(input) ? Number(input) : null;
}

export function ddayLabel(dday: number): string {
  if (dday < 0) return "운영 종료";
  return dday === 0 ? "D-day" : `D-${dday}`;
}
