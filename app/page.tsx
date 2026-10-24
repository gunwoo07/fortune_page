import { Suspense } from "react";
import Link from "next/link";
import { PreviewInput } from "@/components/page-fortune/preview-input";
import { ResultScreen } from "@/components/page-fortune/result-screen";
import { StateScreen } from "@/components/page-fortune/state-screen";
import { previewResult } from "@/components/page-fortune/preview-fixture";
import { parseDigit } from "@/components/page-fortune/ui-model";
import styles from "@/components/page-fortune/page-fortune.module.css";

type Query = Promise<Record<string, string | string[] | undefined>>;

async function Preview({ searchParams }: { searchParams: Query }) {
  const query = await searchParams;
  const mode = query.preview;
  const digit = typeof query.digit === "string" ? parseDigit(query.digit) : null;
  let screen;
  if (mode === "closed" || mode === "not-started") {
    screen = <StateScreen kind={mode} />;
  } else if (mode === "invalid" || (mode === "result" && digit === null)) {
    screen = <StateScreen kind="invalid" />;
  } else if (mode === "result" && digit !== null) {
    screen = <ResultScreen result={previewResult(digit)} sharePath={`/?preview=result&digit=${digit}`} preview />;
  } else {
    screen = <PreviewInput />;
  }
  return <>
    {screen}
    <footer className={styles.previewNote}>
      <strong>디자인 미리보기 · D-40과 문구는 예시이며 실제 운세가 아닙니다.</strong><br />
      날짜·운세 엔진 연결 전 화면입니다.<br />
      <Link href="/?preview=closed">운영 종료 화면 보기</Link>
    </footer>
  </>;
}

export default function Home({ searchParams }: { searchParams: Query }) {
  return <Suspense fallback={<p className={styles.previewNote} role="status">페이지를 펼치고 있어요…</p>}>
    <Preview searchParams={searchParams} />
  </Suspense>;
}
