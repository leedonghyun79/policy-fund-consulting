import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
import FloatingBlogButton from "../components/FloatingBlogButton";

import GoogleAnalytics from "../components/GoogleAnalytics";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "비티씨 | 부천정책자금 컨설팅 · 소상공인 저금리 대출 · 사업자 대출",
  description:
    "정책자금 지원금, 제대로 알고 제대로 받으세요. 소상공인 저금리 대출, 사업자 대출, 중소기업 지원금 등 정부지원금 맞춤 진단과 창업자금·운영자금·시설자금을 위한 부천 및 전국 전문 컨설팅을 제공합니다.",
  keywords:
    "비티씨, 정책자금, 소상공인 저금리 대출, 사업자 대출, 중소기업 지원금, 부천정책자금, 정부지원금, 창업자금, 운영자금, 시설자금",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  applicationName: "비티씨",
  openGraph: {
    title: "비티씨 | 부천정책자금 컨설팅 · 소상공인 저금리 대출 · 사업자 대출",
    description:
      "소상공인 저금리 대출, 사업자 대출, 정부지원금 승인 가능성을 높이세요. 창업자금, 운영자금, 시설자금 등 중소기업 맞춤 자금 진단부터 부천 및 전 지역 무료 상담까지 비티씨가 도와드립니다.",
    type: "website",
    url: "https://btccompany.co.kr",
    siteName: "비티씨",
  },
  twitter: {
    card: "summary_large_image",
    title: "비비티씨 | 부천정책자금 컨설팅 · 소상공인 저금리 대출 · 사업자 대출",
    description: "소상공인 저금리 대출, 사업자 대출, 정부지원금 승인 가능성을 높이세요. 창업자금, 운영자금, 시설자금 등 중소기업 맞춤 자금 진단부터 부천 및 전 지역 무료 상담까지 비티씨가 도와드립니다.",
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
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ko" className={outfit.variable}>
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://btccompany.co.kr/#website",
                  "name": "비티씨",
                  "alternateName": ["비티씨 정책자금", "BTC Company"],
                  "url": "https://btccompany.co.kr",
                  "description": "소상공인·중소기업을 위한 정부 정책자금 컨설팅 전문 기업",
                  "inLanguage": "ko-KR",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://btccompany.co.kr/?s={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": ["FinancialService", "LocalBusiness"],
                  "@id": "https://btccompany.co.kr/#organization",
                  "name": "비티씨",
                  "alternateName": "BTC Company",
                  "description": "소상공인 저금리 대출, 사업자 대출, 중소기업 정부 정책자금 정밀 진단 및 맞춤 컨설팅 서비스를 제공합니다.",
                  "url": "https://btccompany.co.kr",
                  "telephone": "1555-0756",
                  "priceRange": "무료 상담",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "부천시",
                    "addressRegion": "경기도",
                    "addressCountry": "KR"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": "37.5034",
                    "longitude": "126.7660"
                  },
                  "openingHoursSpecification": [
                    {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                      "opens": "09:00",
                      "closes": "18:00"
                    }
                  ],
                  "areaServed": {
                    "@type": "Country",
                    "name": "KR"
                  },
                  "serviceType": ["정책자금 컨설팅", "소상공인 대출 상담", "사업자 대출", "중소기업 지원금"],
                  "sameAs": [
                    "https://btccompany.co.kr"
                  ],
                  "parentOrganization": {
                    "@type": "Organization",
                    "@id": "https://btccompany.co.kr/#organization"
                  }
                }
              ]
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <FloatingBlogButton />
        </Providers>
      </body>
    </html>
  );
}
