import type { FortuneResult } from "@/lib/types";

/** Deliberately fixed visual fixture, NOT a date engine, assignment or real fortune. */
export function previewResult(digit: number): FortuneResult {
  return {
    date: "2026-10-10",
    digit,
    dday: 40,
    personalMessage: "오늘은 마음속 소음이 조금씩 잦아드는 날이에요.\n네가 가고 있는 흐름을 천천히 믿어 봐요.",
    commonMessage: "지나온 시간은 생각보다 오래 너의 편에 남아 있어.",
    resultId: `design-preview-${digit}`,
  };
}
