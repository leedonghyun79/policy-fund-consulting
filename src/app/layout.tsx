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
  title: "비티씨 부천정책자금 컨설팅 | 소상공인 저금리 대출 · 사업자 대출",
  description:
    "정책자금 지원금, 제대로 알고 제대로 받으세요. 소상공인 저금리 대출, 사업자 대출, 중소기업 지원금 등 정부지원금 맞춤 진단과 창업자금·운영자금·시설자금을 위한 부천 및 전국 전문 컨설팅을 제공합니다.",
  keywords:
    "비티씨, 정책자금, 소상공인 저금리 대출, 사업자 대출, 중소기업 지원금, 부천정책자금, 정부지원금, 창업자금, 운영자금, 시설자금",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "비티씨 부천정책자금 컨설팅 | 소상공인 저금리 대출 · 사업자 대출",
    description:
      "소상공인 저금리 대출, 사업자 대출, 정부지원금 승인 가능성을 높이세요. 창업자금, 운영자금, 시설자금 등 중소기업 맞춤 자금 진단부터 부천 및 전 지역 무료 상담까지 비티씨가 도와드립니다.",
    type: "website",
    url: "https://btccompany.co.kr",
    images: [
      {
        url: "https://btccompany.co.kr/og-image.png",
        width: 1200,
        height: 630,
        alt: "비티씨 정책자금 컨설팅",
      },
    ],
    siteName: "(주)비티씨",
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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "비티씨",
                "alternateName": ["(주)비티씨", "비티씨 정책자금"],
                "url": "https://btccompany.co.kr",
              },
              {
                "@context": "https://schema.org",
                "@type": "ConsultingService",
                "name": "(주)비티씨",
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
              }
            ]),
          }}
        />
        <Providers>
          {children}
          <a
            href="https://blog.naver.com/biz-support-center"
            target="_blank"
            rel="noopener noreferrer"
            className="naver-floating"
            title="네이버 블로그"
          >
            <img
              src="/nav_b_100.png"
              alt="네이버 블로그"
              className="pc-only"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
            <img
              src="/nav_b_500.png"
              alt="네이버 블로그"
              className="mo-only"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </a>

        </Providers>
      </body>

    </html>
  );
}
