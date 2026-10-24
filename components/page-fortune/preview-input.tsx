"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { InputScreen } from "./input-screen";

/** Replace this preview wrapper with B's server date + canonical /r/ navigation at integration. */
export function PreviewInput() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <InputScreen dday={40} pending={pending} onConfirm={(digit) => startTransition(() => router.push(`/?preview=result&digit=${digit}`))} />;
}
