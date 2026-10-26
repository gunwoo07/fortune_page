import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getSeoulDateString } from "@/lib/fortune-api";
import { HomeInput } from "@/components/page-fortune/home-input";
import { getHomeView } from "@/components/page-fortune/home-view";
import { StateScreen } from "@/components/page-fortune/state-screen";
import styles from "@/components/page-fortune/page-fortune.module.css";

export const metadata: Metadata = {
  title: "페이지 부적",
  description: "오늘 처음 펼친 책의 마지막 자리에서 만나는 작은 응원.",
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
