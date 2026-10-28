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
  const title = `수능 ${ddayLabel(result.dday)} · 페이지 끝자리 ${result.digit} | 페이지 부적`;
  const description = `${result.personalMessage} ${result.commonMessage}`;
  const imageAlt = `수능 ${ddayLabel(result.dday)}, 페이지 끝자리 ${result.digit}의 운세 결과`;

  return {
    title,
    description,
    alternates: { canonical: shareUrl },
    openGraph: {
      title,
      description,
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
