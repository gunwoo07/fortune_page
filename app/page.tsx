import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getSeoulDateString } from "@/lib/fortune-api";
import { HomeInput } from "@/components/page-fortune/home-input";
import { getHomeView } from "@/components/page-fortune/home-view";
import { StateScreen } from "@/components/page-fortune/state-screen";
import styles from "@/components/page-fortune/page-fortune.module.css";

export const metadata: Metadata = {
  title: "수능 페이지 응원 | 오늘의 응원",
  description:
    "책 페이지의 숫자로 오늘의 작은 운세와 수능 응원을 만나보세요. 오늘도 수험생 모두를 응원합니다.",
};

async function TodayScreen() {
  // Resolve the Korean date per request, not once when the app is built.
  await connection();
  const view = getHomeView(getSeoulDateString());

  if (view.kind !== "active") {
    return <StateScreen kind={view.kind} />;
  }

  return <HomeInput key={view.date} dday={view.dday} />;
}

/** Home owns only today's input/status screen. B owns /r/[date]/[digit]. */
export default function Home() {
  return (
    <Suspense fallback={<p className={styles.loading} role="status">페이지를 펼치고 있어요…</p>}>
      <TodayScreen />
    </Suspense>
  );
}
