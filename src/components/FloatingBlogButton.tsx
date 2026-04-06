"use client";

import { usePathname } from "next/navigation";

export default function FloatingBlogButton() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <a
      href="https://blog.naver.com/biz-support-center"
      target="_blank"
      rel="noopener noreferrer"
      className="naver-floating"
      title="네이버 블로그"
    >
      <img
        src="/blog_512.png"
        alt="네이버 블로그"
        className="pc-only"
        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
      />
      <img
        src="/blog_512.png"
        alt="네이버 블로그"
        className="mo-only"
        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
      />
    </a>
  );
}
