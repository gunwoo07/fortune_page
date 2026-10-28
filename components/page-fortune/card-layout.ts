const CARD_WIDTH = 400;
const PERSONAL_TOP = 155;
const PERSONAL_LINE_HEIGHT = 27;
const COMMON_LINE_HEIGHT = 26;
const ILLUSTRATION_WIDTH = 190;
const ILLUSTRATION_HEIGHT = 258;

/** 캔버스의 실제 글자 너비를 사용하므로 한글과 명시적 줄바꿈도 보존합니다. */
export function wrapCardText(
  text: string,
  measure: (value: string) => number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/ +/u)) {
      if (!word) continue;

      if (line && measure(`${line} ${word}`) > maxWidth) {
        lines.push(line);
        line = "";
      }
      if (measure(word) <= maxWidth) {
        line = line ? `${line} ${word}` : word;
        continue;
      }

      // 한 단어가 카드 폭보다 길 때에만 글자 단위로 나눕니다.
      for (const character of word) {
        if (line && measure(line + character) > maxWidth) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }

  return lines;
}

/** 문장이 길어져도 응원·그림·꼬리말이 서로 겹치거나 잘리지 않게 높이를 늘립니다. */
export function calculateCardLayout(personalLines: number, commonLines: number) {
  const personalBottom = PERSONAL_TOP + (Math.max(1, personalLines) - 1) * PERSONAL_LINE_HEIGHT;
  const commonTop = Math.max(245, personalBottom + 72);
  const commonBottom = commonTop + (Math.max(1, commonLines) - 1) * COMMON_LINE_HEIGHT;
  const illustrationTop = Math.max(360, commonBottom + 70);
  const height = Math.max(800, illustrationTop + ILLUSTRATION_HEIGHT + 105);

  return {
    titleTop: 88,
    personalTop: PERSONAL_TOP,
    personalLineHeight: PERSONAL_LINE_HEIGHT,
    commonTop,
    commonLineHeight: COMMON_LINE_HEIGHT,
    illustrationLeft: (CARD_WIDTH - ILLUSTRATION_WIDTH) / 2,
    illustrationTop,
    illustrationWidth: ILLUSTRATION_WIDTH,
    illustrationHeight: ILLUSTRATION_HEIGHT,
    footerTop: height - 32,
    height,
  };
}
