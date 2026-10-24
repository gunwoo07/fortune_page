"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { FortuneResult } from "@/lib/types";
import { ddayLabel } from "./ui-model";
import styles from "./page-fortune.module.css";

export type ResultScreenProps = {
  result: FortuneResult;
  /** B supplies the validated canonical result path. Preview passes an explicitly marked demo path. */
  sharePath: string;
  preview?: boolean;
};

export function ResultScreen({ result, sharePath, preview = false }: ResultScreenProps) {
  const [status, setStatus] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const manualInput = useRef<HTMLInputElement>(null);

  function shareUrl() {
    return new URL(sharePath, window.location.origin).href;
  }

  async function copyLink() {
    const url = shareUrl();
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setStatus("링크를 복사했어요.");
      setManualUrl("");
    } catch {
      setManualUrl(url);
      setStatus("아래 링크를 길게 누르거나 선택해서 복사해주세요.");
    }
  }

  async function share() {
    if (!navigator.share) { await copyLink(); return; }
    try {
      await navigator.share({ title: preview ? "페이지 부적 · 디자인 미리보기" : "오늘의 페이지 부적", text: result.personalMessage, url: shareUrl() });
      setStatus("공유했어요.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      await copyLink();
    }
  }

  async function saveImage() {
    setSaving(true);
    setStatus("");
    try {
      await document.fonts.ready;
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 2400;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.scale(3, 3);
      context.fillStyle = "#fff";
      context.fillRect(0, 0, 400, 800);
      context.fillStyle = "#111";
      context.textAlign = "center";
      context.font = '750 60px Arial, sans-serif';
      context.fillText(ddayLabel(result.dday), 200, 150);
      context.font = '15px Arial, "Page Korean", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
      let y = 285;
      for (const paragraph of result.personalMessage.split("\n")) {
        let line = "";
        for (const character of paragraph) {
          if (context.measureText(line + character).width > 310) {
            context.fillText(line, 200, y); y += 28; line = character;
          } else line += character;
        }
        context.fillText(line, 200, y); y += 28;
      }
      y = Math.max(460, y + 80);
      context.font = '14px Arial, "Page Korean", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
      let line = "";
      for (const character of result.commonMessage) {
        if (context.measureText(line + character).width > 310) {
          context.fillText(line, 200, y); y += 26; line = character;
        } else line += character;
      }
      context.fillText(line, 200, y);
      const drawing = new window.Image();
      drawing.src = "/illustrations/page-clover.svg";
      await drawing.decode();
      context.drawImage(drawing, 42, Math.max(535, y + 40), 140, 190);
      context.font = '11px Arial, "Page Korean", sans-serif';
      context.fillStyle = "#666";
      context.fillText(preview ? "페이지 부적 · 디자인 미리보기 · 실제 운세가 아닙니다" : `페이지 부적 · ${result.date} · 끝자리 ${result.digit}`, 200, 775);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image generation failed")), "image/png"));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `page-fortune-${preview ? "preview-" : ""}${result.date}-${result.digit}.png`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setStatus("이미지 저장을 요청했어요. 다운로드 목록을 확인해주세요.");
    } catch {
      setStatus("이미지를 저장하지 못했어요. 화면을 캡처하거나 링크를 복사해주세요.");
    } finally { setSaving(false); }
  }

  return (
    <main className={`${styles.sheet} ${styles.resultSheet}`} aria-label="오늘의 페이지 부적 결과">
      <h1 className={styles.dday} aria-label={`수능 ${ddayLabel(result.dday)}`}>{ddayLabel(result.dday)}</h1>
      <section aria-label="오늘의 개인 운세" className={styles.personal}>{result.personalMessage}</section>
      <section aria-label="오늘 모든 수험생에게" className={styles.common}>{result.commonMessage}</section>
      <Image className={styles.clover} src="/illustrations/page-clover.svg" width={140} height={190} alt="" loading="eager" />
      <div className={styles.resultActions}>
        <button className={styles.shareButton} onClick={share}>결과 공유하기</button>
        <div className={styles.secondaryActions}>
          <button className={styles.textButton} onClick={copyLink}>링크 복사</button>
          <button className={styles.textButton} onClick={saveImage} disabled={saving}>{saving ? "이미지 만드는 중…" : "이미지 저장"}</button>
          <Link className={styles.textButton} href="/">처음으로</Link>
        </div>
        <p className={styles.status} role="status" aria-live="polite">{status}</p>
        {manualUrl && <input ref={manualInput} className={styles.manualCopy} aria-label="복사할 결과 링크" readOnly value={manualUrl} onFocus={() => manualInput.current?.select()} />}
      </div>
    </main>
  );
}
