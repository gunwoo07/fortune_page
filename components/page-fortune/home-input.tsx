"use client";

import { useEffect, useState, useTransition } from "react";
import { unstable_rethrow, useRouter } from "next/navigation";
import { submitDigit } from "./home-actions";
import { InputScreen } from "./input-screen";

/** 입력 상호작용과 서버 갱신만 담당하며 날짜를 브라우저에서 판단하지 않습니다. */
export function HomeInput({ dday }: { dday: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // 열린 탭은 주기적으로, 다시 돌아온 탭은 즉시 서버의 날짜·운영 상태를 갱신합니다.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const interval = window.setInterval(() => router.refresh(), 30_000);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  function confirmDigit(digit: number) {
    setNotice("");
    startTransition(async () => {
      try {
        // 제출 시 서버가 한국 날짜와 운영 상태를 다시 확인하고 B의 결과 경로로 이동합니다.
        await submitDigit(digit);
      } catch (error) {
        // Next의 redirect는 제어 흐름이므로 일반적인 통신 실패와 구분합니다.
        unstable_rethrow(error);
        setNotice("페이지를 열지 못했어요. 잠시 후 다시 확인해주세요.");
      }
    });
  }

  return (
    <InputScreen
      dday={dday}
      onConfirm={confirmDigit}
      pending={pending}
      notice={notice}
    />
  );
}
