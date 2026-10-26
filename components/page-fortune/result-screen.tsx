import Image from "next/image";
import type { FortuneResult } from "../../lib/types";
import { ResultActions } from "./result-actions";
import { ddayLabel } from "./ui-model";
import styles from "./page-fortune.module.css";

export type ResultScreenProps = {
  result: FortuneResult;
  sharePath: string;
};

/**
 * B의 결과 페이지가 검증한 데이터를 받아 서버에서 본문을 렌더링합니다.
 * 날짜 계산·결과 조회·OG 생성은 하지 않고, 브라우저 동작만 ResultActions에 맡깁니다.
 */
export function ResultScreen({ result, sharePath }: ResultScreenProps) {
  return (
    <main className={`${styles.sheet} ${styles.resultSheet}`} aria-label="오늘의 페이지 부적 결과">
      <h1 className={styles.dday} aria-label={`수능 ${ddayLabel(result.dday)}`}>
        {ddayLabel(result.dday)}
      </h1>
      <section className={styles.personal} aria-label="오늘의 개인 운세">
        {result.personalMessage}
      </section>
      <section className={styles.common} aria-label="오늘 모든 수험생에게">
        {result.commonMessage}
      </section>
      <Image
        className={styles.clover}
        src="/illustrations/page-clover.svg"
        width={140}
        height={190}
        alt=""
        loading="eager"
      />
      <ResultActions result={result} sharePath={sharePath} />
    </main>
  );
}
