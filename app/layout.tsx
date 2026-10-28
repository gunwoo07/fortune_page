import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "수능 페이지 부적 | 오늘의 수험생 응원",
  description:
    "책 페이지의 숫자로 오늘의 작은 운세와 수능 응원을 만나보세요. 오늘도 수험생 모두를 응원합니다.",
  openGraph: {
    siteName: "수능 페이지 부적",
    title: "수능 페이지 부적 | 오늘의 수험생 응원",
    description:
      "책 페이지의 숫자로 오늘의 작은 운세와 수능 응원을 만나보세요. 오늘도 수험생 모두를 응원합니다.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
