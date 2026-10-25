"use server";

import { redirect } from "next/navigation";
import { getSeoulDateString } from "../../lib/fortune-api";
import { getHomeView } from "./home-view";

/**
 * 홈 폼의 제출 처리입니다. 결과 라우트나 운세 엔진을 대신 구현하지 않습니다.
 * 오래 열린 탭·잘못된 기기 시계에 영향받지 않도록 제출 시 서버 날짜를 다시 읽습니다.
 */
export async function submitDigit(digit: number): Promise<void> {
  // Server Action은 UI를 거치지 않고 호출할 수도 있으므로 입력을 다시 확인합니다.
  if (typeof digit !== "number" || !Number.isInteger(digit) || digit < 0 || digit > 9) {
    redirect("/");
  }

  const view = getHomeView(getSeoulDateString());
  if (view.kind !== "active") {
    redirect("/");
  }

  // 실제 결과 조회·경로 검증·메타데이터는 B의 페이지에서 이어서 처리합니다.
  redirect(`/r/${view.date}/${digit}`);
}
