"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { ddayLabel, parseDigit } from "./ui-model";
import styles from "./page-fortune.module.css";

export type InputScreenProps = {
  dday: number;
  onConfirm: (digit: number) => void;
  pending?: boolean;
  notice?: string;
};

/** The form validates the digit; its parent owns navigation and date refresh. */
export function InputScreen({
  dday,
  onConfirm,
  pending = false,
  notice = "",
}: InputScreenProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const digit = parseDigit(value);
    if (digit === null) {
      setError("0부터 9까지, 숫자 한 자리만 입력해주세요.");
      input.current?.focus();
      return;
    }

    setError("");
    onConfirm(digit);
  }

  return (
    <main className={`${styles.sheet} ${styles.inputSheet}`} aria-label="페이지 부적 숫자 입력">
      <h1 className={styles.dday} aria-label={`수능 ${ddayLabel(dday)}`}>
        {ddayLabel(dday)}
      </h1>
      <Image
        className={styles.wave}
        src="/illustrations/page-wave.svg"
        width={160}
        height={205}
        alt=""
        priority
      />

      <form className={styles.form} onSubmit={submit} noValidate aria-busy={pending}>
        <label className={styles.prompt} htmlFor="page-digit">
          오늘 처음으로 편 책 페이지의<br />
          마지막 자리 숫자를 입력해주세요
        </label>
        <input
          ref={input}
          id="page-digit"
          name="digit"
          className={styles.digitInput}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          pattern="[0-9]"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          aria-invalid={Boolean(error)}
          aria-describedby="digit-error"
          disabled={pending}
        />
        <p className={styles.error} id="digit-error" role="alert">{error}</p>
        <button className={styles.confirm} type="submit" disabled={pending}>
          {pending ? "펼치는 중…" : "확인"}
        </button>
        <p className={styles.status} role="status">{notice}</p>
      </form>
    </main>
  );
}
