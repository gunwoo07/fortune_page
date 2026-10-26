import Image from "next/image";
import Link from "next/link";
import styles from "./page-fortune.module.css";

export type StateScreenKind = "closed" | "invalid" | "not-started";

const MESSAGES: Record<StateScreenKind, { heading: string; message: string; label: string }> = {
  closed: {
    heading: "여기까지 온 너에게",
    message: "페이지 부적의 이야기는 여기서 마무리해요. 함께한 시간들이 네 마음에 따뜻하게 남기를 바라요.",
    label: "운영 종료",
  },
  invalid: {
    heading: "페이지를 찾지 못했어요",
    message: "날짜나 숫자를 다시 확인해주세요. 오늘의 페이지에서 다시 시작할 수 있어요.",
    label: "페이지 부적",
  },
  "not-started": {
    heading: "곧, 첫 페이지를 펼쳐요",
    message: "아직 페이지 부적을 준비하고 있어요. 시작하는 날, 이곳에서 만나요.",
    label: "페이지 부적",
  },
};

/** 상태 판단은 호출자가 맡습니다. 이 컴포넌트는 안내 문구와 그림만 표시합니다. */
export function StateScreen({ kind }: { kind: StateScreenKind }) {
  const message = MESSAGES[kind];

  return (
    <main className={`${styles.sheet} ${styles.stateSheet}`}>
      <p className={styles.prompt}>{message.label}</p>
      <h1 className={styles.stateTitle}>{message.heading}</h1>
      <p className={styles.stateMessage}>{message.message}</p>
      <Image
        className={styles.clover}
        src="/illustrations/page-clover.svg"
        width={140}
        height={190}
        alt=""
        loading="eager"
      />
      {kind === "invalid" && (
        <Link className={styles.textButton} href="/">처음으로 돌아가기</Link>
      )}
    </main>
  );
}
