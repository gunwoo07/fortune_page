import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "페이지 부적 · 디자인 미리보기",
  description: "오늘 처음 펼친 책의 마지막 자리에서 만나는 작은 응원. 현재는 화면 디자인 미리보기입니다.",
  robots: { index: false, follow: false },
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
