import { LeadStatus } from "@prisma/client";

// Mock GA Data
export const mockVisitorData = [
  { date: '03-31', views: 5, visitors: 2 },
  { date: '04-01', views: 6, visitors: 5 },
  { date: '04-02', views: 8, visitors: 2 },
  { date: '04-03', views: 3, visitors: 3 },
  { date: '04-04', views: 5, visitors: 4 },
  { date: '04-05', views: 2, visitors: 1 },
  { date: '04-06', views: 7, visitors: 4 },
];

export const mockFunnelData = [
  { name: '구글 검색', value: 45 },
  { name: '네이버 검색', value: 25 },
  { name: '소셜 미디어', value: 15 },
  { name: '직접 유입', value: 10 },
  { name: '참조 링크', value: 5 },
];

export const FUNNEL_COLORS = ['#101828', '#3366FF', '#6366f1', '#a855f7', '#ec4899'];

export const mockReferrerSites = [
  { site: 'blog.naver.com', views: 824, rate: '24.1%' },
  { site: 'search.naver.com', views: 612, rate: '18.0%' },
  { site: 'google.com', views: 453, rate: '13.3%' },
  { site: 'cafe.naver.com', views: 241, rate: '7.1%' },
  { site: 'm.search.daum.net', views: 120, rate: '3.5%' },
];

export const mockSearchKeywords = [
  { keyword: '소상공인 대출', clicks: 420 },
  { keyword: '부천 정책자금', clicks: 380 },
  { keyword: '정부지원금 컨설팅', clicks: 215 },
  { keyword: '비티씨 정책자금', clicks: 190 },
  { keyword: '창업자금 대출', clicks: 142 },
];

// Premium Theme Constants
export const THEME = {
  primary: "#3366FF",
  primaryHover: "#2952CC",
  secondary: "#101828",
  bg: "#F9FAFB",
  surface: "#ffffff",
  border: "#EAECF0",
  textMain: "#101828",
  textMuted: "#667085",
};

export const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string; dot: string }> = {
  NEW: { label: "진행중", color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6" },
  CONTACTED: { label: "진행 완료", color: "#059669", bg: "#ecfdf5", dot: "#10b981" },
  CLOSED: { label: "진행 불가", color: "#4b5563", bg: "#f3f4f6", dot: "#6b7280" },
  QUALIFIED: { label: "진행중", color: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
  CONVERTED: { label: "진행 완료", color: "#059669", bg: "#ecfdf5", dot: "#10b981" },
  SPAM: { label: "진행 불가", color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
};

export const industryLabels: Record<string, string> = {
  MANUFACTURING: "제조업",
  RETAIL: "도·소매업",
  SERVICE: "서비스업",
  FOOD: "요식업",
  OTHER: "기타",
};
