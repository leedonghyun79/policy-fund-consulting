import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정책자금 컨설팅 | 중소기업·소상공인 정부 정책자금 무료 상담",
  description:
    "정책자금, 제대로 알고 제대로 받으세요. 중소기업·소상공인을 위한 정부 정책자금 맞춤 진단, 서류 준비 컨설팅, 비대면 상담까지 한 번에.",
  keywords:
    "정책자금, 정부지원금, 소상공인대출, 중소기업자금, 창업자금, 운전자금, 시설자금, 사업자대출, 법인컨설팅",
  openGraph: {
    title: "정책자금 컨설팅 | 무료 상담 신청",
    description:
      "복잡한 절차는 줄이고, 승인 가능성은 높이세요. 맞춤 자금 진단부터 서류 준비까지.",
    type: "website",
  },
};

import Providers from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
