import type { FortuneResult } from "../../lib/types";
import { calculateCardLayout, wrapCardText } from "./card-layout";
import { formatResultDate } from "./ui-model";

const SCALE = 3;
const WIDTH = 400;
const TEXT_WIDTH = 310;
const PERSONAL_FONT = '15px Arial, "Page Korean", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
const COMMON_FONT = '14px Arial, "Page Korean", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

/** 결과 카드만 PNG로 저장합니다. 검증용 화면 캡처 도구와는 별개의 서비스 기능입니다. */
export async function downloadFortuneCard(result: FortuneResult): Promise<void> {
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("카드 이미지를 만들 수 없습니다.");

  // 크기 변경 시 캔버스 상태가 초기화되므로 먼저 줄 수를 구하고, 아래에서 다시 스타일을 설정합니다.
  context.font = PERSONAL_FONT;
  const personalLines = wrapCardText(result.personalMessage, (text) => context.measureText(text).width, TEXT_WIDTH);
  context.font = COMMON_FONT;
  const commonLines = wrapCardText(result.commonMessage, (text) => context.measureText(text).width, TEXT_WIDTH);
  const layout = calculateCardLayout(personalLines.length, commonLines.length);

  canvas.width = WIDTH * SCALE;
  canvas.height = layout.height * SCALE;
  context.scale(SCALE, SCALE);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, WIDTH, layout.height);
  context.fillStyle = "#111";
  context.textAlign = "center";
  context.font = '700 44px Arial, "Page Korean", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  context.fillText(formatResultDate(result.date), WIDTH / 2, 150);

  context.font = PERSONAL_FONT;
  personalLines.forEach((line, index) => {
    context.fillText(line, WIDTH / 2, layout.personalTop + index * layout.personalLineHeight);
  });
  context.font = COMMON_FONT;
  commonLines.forEach((line, index) => {
    context.fillText(line, WIDTH / 2, layout.commonTop + index * layout.commonLineHeight);
  });

  const illustration = new window.Image();
  illustration.src = "/illustrations/page-clover.svg";
  await illustration.decode();
  context.drawImage(illustration, 42, layout.illustrationTop, 140, 190);

  context.fillStyle = "#666";
  context.font = '11px Arial, "Page Korean", sans-serif';
  context.fillText(`페이지 부적 · ${result.date} · 끝자리 ${result.digit}`, WIDTH / 2, layout.footerTop);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((image) => {
      if (image) resolve(image);
      else reject(new Error("PNG 변환에 실패했습니다."));
    }, "image/png");
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `page-fortune-${result.date}-${result.digit}.png`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  // 브라우저가 다운로드를 시작하기 전에 Blob URL이 해제되지 않도록 여유를 둡니다.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
