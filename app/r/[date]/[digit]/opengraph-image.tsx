import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSeoulDateString, getSharedFortuneResult } from "@/lib/fortune-api";

export const alt = "네잎클로버를 들고 있는 손그림 캐릭터";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type SharedResultImageProps = {
  params: Promise<{ date: string; digit: string }>;
};

export default async function SharedResultImage({ params }: SharedResultImageProps) {
  await connection();
  const { date, digit } = await params;
  const result = getSharedFortuneResult(date, digit, getSeoulDateString());
  if (!result) notFound();

  // 결과 화면과 같은 원본을 씁니다. 외부 URL/폰트 없이 서버에서 공유 이미지를 만듭니다.
  const svg = await readFile(join(process.cwd(), "public/illustrations/page-clover.svg"));
  const illustration = `data:image/svg+xml;base64,${svg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        {/* next/image는 OG 렌더러용이 아니므로 같은 SVG를 일반 이미지로 전달합니다. */}
        <img src={illustration} width={350} height={475} alt={alt} />
      </div>
    ),
    size,
  );
}
