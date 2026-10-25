const PERSONAL_TOP = 285;
const PERSONAL_LINE_HEIGHT = 28;
const COMMON_LINE_HEIGHT = 26;

/** 캔버스의 실제 글자 너비를 사용하므로 한글과 명시적 줄바꿈도 보존합니다. */
export function wrapCardText(
  text: string,
  measure: (value: string) => number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const character of paragraph) {
      if (line && measure(line + character) > maxWidth) {
        lines.push(line);
        line = character;
      } else {
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
  const commonTop = Math.max(460, personalBottom + 108);
  const commonBottom = commonTop + (Math.max(1, commonLines) - 1) * COMMON_LINE_HEIGHT;
  const illustrationTop = Math.max(535, commonBottom + 40);
  const height = Math.max(800, illustrationTop + 190 + 75);

  return {
    personalTop: PERSONAL_TOP,
    personalLineHeight: PERSONAL_LINE_HEIGHT,
    commonTop,
    commonLineHeight: COMMON_LINE_HEIGHT,
    illustrationTop,
    footerTop: height - 25,
    height,
  };
}
