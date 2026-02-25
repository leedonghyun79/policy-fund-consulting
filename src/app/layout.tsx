import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "비티씨 정책자금 컨설팅 | 부천정책자금·정부지원금 무료 상담",
  description:
    "정책자금 지원금, 제대로 알고 제대로 받으세요. 중소기업·소상공인을 위한 정부 정책자금 맞춤 진단, 부천정책자금 컨설팅, 비대면 상담까지 부천 및 전 지역 전문 컨설팅을 제공합니다.",
  keywords:
    "비티씨, 정책자금, 소상공인, 중소기업, 지원금, 부천정책자금, 정부지원금, 창업자금, 운전자금, 시설자금, 법인컨설팅",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "비티씨 정책자금 컨설팅 | 부천정책자금 및 정부지원금 무료 상담",
    description:
      "복잡한 정책자금 절차는 줄이고, 승인 가능성은 높이세요. 소상공인·중소기업 맞춤 자금 진단부터 서류 준비까지 비티씨가 도와드립니다.",
    type: "website",
    url: "https://btccompany.co.kr",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "비티씨 정책자금 컨설팅",
      },
    ],
  },
  alternates: {
    canonical: "https://btccompany.co.kr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={outfit.variable}>
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ConsultingService",
              "name": "비티씨 정책자금 컨설팅",
              "description": "중소기업 및 소상공인을 위한 정부 정책자금 정밀 진단 및 컨설팅 서비스",
              "url": "https://btccompany.co.kr",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "부천시",
                "addressRegion": "경기도",
                "addressCountry": "KR"
              },
              "areaServed": "KR",
              "provider": {
                "@type": "Organization",
                "name": "비티씨",
                "url": "https://btccompany.co.kr"
              }
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
