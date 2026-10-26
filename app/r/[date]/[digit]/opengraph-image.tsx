import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSeoulDateString, getSharedFortuneResult } from "@/lib/fortune-api";
import { ddayLabel } from "@/components/page-fortune/ui-model";

export const alt = "페이지 부적의 운세 결과 공유 카드";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type SharedResultImageProps = {
  params: Promise<{ date: string; digit: string }>;
};

export default async function SharedResultImage({
  params,
}: SharedResultImageProps) {
  await connection();
  const { date, digit } = await params;
  const result = getSharedFortuneResult(date, digit, getSeoulDateString());

  if (!result) {
    notFound();
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 64,
          backgroundColor: "#faf8f0",
          color: "#18251d",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex" }}>페이지 부적</div>
          <div style={{ display: "flex" }}>
            {ddayLabel(result.dday)} · 페이지 끝자리 {result.digit}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            marginTop: 36,
            padding: "48px 56px",
            border: "1px solid #e6e0d2",
            borderRadius: 32,
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: "#667466" }}>
            오늘의 개인 운세
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 46,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            {result.personalMessage}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 30,
              lineHeight: 1.4,
              color: "#3e5144",
            }}
          >
            {result.commonMessage}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 20,
            fontSize: 20,
            color: "#778073",
          }}
        >
          오늘의 페이지에서 만나요
        </div>
      </div>
    ),
    size,
  );
}
