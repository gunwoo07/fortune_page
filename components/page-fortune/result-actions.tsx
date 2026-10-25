"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FortuneResult } from "../../lib/types";
import { downloadFortuneCard } from "./card-image";
import styles from "./page-fortune.module.css";

export type ResultActionsProps = {
  result: FortuneResult;
  /** B가 검증된 결과에 맞춰 전달하는 /r/YYYY-MM-DD/숫자 경로입니다. */
  sharePath: string;
};

/** 브라우저 API는 클릭 후에만 호출하고, 결과 본문 렌더링과 분리합니다. */
export function ResultActions({ result, sharePath }: ResultActionsProps) {
  const [status, setStatus] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const manualInput = useRef<HTMLInputElement>(null);

  function getShareUrl(): string {
    return new URL(sharePath, window.location.origin).href;
  }

  async function copyLink() {
    const url = getShareUrl();

    try {
      if (!navigator.clipboard) throw new Error("클립보드를 지원하지 않습니다.");
      await navigator.clipboard.writeText(url);
      setManualUrl("");
      setStatus("링크를 복사했어요.");
    } catch {
      // 권한 거절을 성공으로 표시하지 않고, 사용자가 직접 복사할 수 있게 합니다.
      setManualUrl(url);
      setStatus("아래 링크를 길게 누르거나 선택해서 복사해주세요.");
    }
  }

  async function shareResult() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: "오늘의 페이지 부적",
        text: result.personalMessage,
        url: getShareUrl(),
      });
      setStatus("공유했어요.");
    } catch (error) {
      // 사용자가 공유 창을 닫은 경우에는 오류나 복사 동작으로 방해하지 않습니다.
      if (error instanceof Error && error.name === "AbortError") return;
      await copyLink();
    }
  }

  async function saveImage() {
    if (saving) return;
    setSaving(true);
    setStatus("");

    try {
      await downloadFortuneCard(result);
      setStatus("이미지 저장을 요청했어요. 다운로드 목록을 확인해주세요.");
    } catch {
      setStatus("이미지를 저장하지 못했어요. 화면을 캡처하거나 링크를 복사해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.resultActions}>
      <button className={styles.shareButton} type="button" onClick={shareResult}>
        결과 공유하기
      </button>
      <div className={styles.secondaryActions}>
        <button className={styles.textButton} type="button" onClick={copyLink}>
          링크 복사
        </button>
        <button className={styles.textButton} type="button" onClick={saveImage} disabled={saving}>
          {saving ? "이미지 만드는 중…" : "이미지 저장"}
        </button>
        <Link className={styles.textButton} href="/">처음으로</Link>
      </div>
      <p className={styles.status} role="status" aria-live="polite">{status}</p>
      {manualUrl && (
        <input
          ref={manualInput}
          className={styles.manualCopy}
          aria-label="복사할 결과 링크"
          readOnly
          value={manualUrl}
          onFocus={() => manualInput.current?.select()}
        />
      )}
    </div>
  );
}
