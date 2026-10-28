import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import {
  getSeoulDateString,
  getSharedFortuneResult,
} from "@/lib/fortune-api";
import { ResultScreen } from "@/components/page-fortune/result-screen";
import { ddayLabel } from "@/components/page-fortune/ui-model";
import styles from "@/components/page-fortune/page-fortune.module.css";
import { getSiteUrl } from "@/lib/site-url";

type SharedResultProps = {
  params: Promise<{ date: string; digit: string }>;
};

export async function generateMetadata({
  params,
}: SharedResultProps): Promise<Metadata> {
  await connection();
  const { date, digit } = await params;
  const result = getSharedFortuneResult(date, digit, getSeoulDateString());

  if (!result) {
    return {
      title: "페이지를 찾지 못했어요",
      robots: { index: false, follow: false },
    };
  }

  const sharePath = `/r/${result.date}/${result.digit}`;
  const shareUrl = new URL(sharePath, getSiteUrl());
  const imageUrl = new URL(`${sharePath}/opengraph-image`, getSiteUrl());
  // 이미지 URL에 버전을 붙여 이전 텍스트 카드의 이미지 캐시와 구분합니다.
  imageUrl.searchParams.set("v", "clover-1");
  const title = `수능 ${ddayLabel(result.dday)} · 오늘의 페이지 응원`;
  const description =
    "책 페이지 숫자로 만난 오늘의 개인 운세와 수험생 모두를 위한 응원입니다.";
  const imageAlt = "네잎클로버를 들고 있는 손그림 캐릭터";

  return {
    title,
    description,
    alternates: { canonical: shareUrl },
    openGraph: {
      title,
      description,
      siteName: "수능 페이지 부적",
      type: "website",
      url: shareUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
    robots: { index: false, follow: false },
  };
}

async function SharedResult({ params }: SharedResultProps) {
  await connection();
  const { date, digit } = await params;
  const result = getSharedFortuneResult(date, digit, getSeoulDateString());

  if (!result) {
    notFound();
  }

  return (
    <ResultScreen
      result={result}
      sharePath={`/r/${result.date}/${result.digit}`}
    />
  );
}

export default function Page({ params }: SharedResultProps) {
  return (
    <Suspense fallback={<p className={styles.loading} role="status">결과를 확인하고 있어요…</p>}>
      <SharedResult params={params} />
    </Suspense>
  );
}
