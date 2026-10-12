export type FortuneResult = {
  date: string;          // YYYY-MM-DD, Asia/Seoul 기준
  digit: number;         // 0..9
  dday: number;          // 시험일 - 해당 날짜
  personalMessage: string;
  commonMessage: string;
  resultId: string;      // 분석 또는 공유 카드 식별용
};