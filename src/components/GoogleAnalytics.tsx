"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const isDev = process.env.NODE_ENV === "development";

  // 어드민 페이지(/admin) 또는 개발 환경에서는 추적 제외
  if (isDev || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
