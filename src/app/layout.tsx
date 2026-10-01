import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import FloatingBlogButton from "../components/FloatingBlogButton";
import GoogleAnalytics from "../components/GoogleAnalytics";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-outfit",
});

const siteUrl = "https://btccompany.co.kr";
const siteTitle = "비티씨 | 부천정책자금 컨설팅 · 소상공인 저금리 대출 · 사업자 대출";
const siteDescription =
  "정책자금 지원금, 제대로 알고 제대로 받으세요. 소상공인 저금리 대출, 사업자 대출, 중소기업 지원금 등 정부지원금 맞춤 진단과 창업자금·운영자금·시설자금을 위한 부천 및 전국 전문 컨설팅을 제공합니다.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords:
    "비티씨, 정책자금, 소상공인 저금리 대출, 사업자 대출, 중소기업 지원금, 부천정책자금, 정부지원금, 창업자금, 운영자금, 시설자금",
  robots: "index, follow",
  applicationName: "비티씨",
  openGraph: {
    title: siteTitle,
    description:
      "소상공인 저금리 대출, 사업자 대출, 정부지원금 승인 가능성을 높이세요. 창업자금, 운영자금, 시설자금 등 중소기업 맞춤 자금 진단부터 부천 및 전 지역 무료 상담까지 비티씨가 도와드립니다.",
    type: "website",
    url: siteUrl,
    siteName: "비티씨",
  },
  twitter: {
    card: "summary_large_image",
    title: "비티씨 부천정책자금 컨설팅 | 소상공인 저금리 대출 · 사업자 대출",
    description:
      "소상공인 저금리 대출, 사업자 대출, 정부지원금 승인 가능성을 높이세요. 창업자금, 운영자금, 시설자금 등 중소기업 맞춤 자금 진단부터 부천 및 전 지역 무료 상담까지 비티씨가 도와드립니다.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "비티씨",
      url: siteUrl,
      description: siteDescription,
      inLanguage: "ko-KR",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      // ProfessionalService = LocalBusiness 하위 타입. 실제 사업장 주소는 신뢰 신호, 서비스 지역은 전국.
      // 주소·전화는 푸터 표기와 반드시 일치시킬 것 (NAP 일관성)
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#organization`,
      name: "주식회사 비티씨",
      alternateName: "BTC COMPANY",
      url: siteUrl,
      description: siteDescription,
      logo: `${siteUrl}/icon.svg`,
      image: `${siteUrl}/opengraph-image`,
      telephone: "+82-1555-0756",
      vatID: "452-81-03847",
      priceRange: "₩0 (무료 상담)",
      areaServed: { "@type": "Country", name: "대한민국" },
      knowsAbout: [
        "정책자금 컨설팅",
        "소상공인 저금리 대출",
        "사업자 대출",
        "정부지원금 승인",
        "중소기업 정책자금",
        "창업자금",
        "운영자금",
        "시설자금",
      ],
      sameAs: ["https://blog.naver.com/biz-support-center"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+82-1555-0756",
        contactType: "customer service",
        areaServed: "KR",
        availableLanguage: ["Korean"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "옥산로 7, 상가 a동 116호",
        addressLocality: "부천시 원미구",
        addressRegion: "경기도",
        postalCode: "14597",
        addressCountry: "KR",
      },
    },
  ],
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
            __html: JSON.stringify(jsonLd),
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
