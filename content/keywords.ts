export const KEYWORDS = [
  "차분함",
  "용기",
  "지속",
  "회복",
  "여유",
  "집중",
  "믿음",
  "균형",
  "단단함",
  "희망",
] as const;

export type FortuneKeyword = (typeof KEYWORDS)[number];
