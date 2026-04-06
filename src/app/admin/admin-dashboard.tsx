"use client";

import { useMemo, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { LeadStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/src/store/ui-store";
import {
  HiOutlineSquares2X2,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBell,
  HiOutlineTrash,
  HiOutlineCircleStack,
  HiOutlineBolt,
  HiOutlineFunnel,
  HiOutlineChartBar,
  HiOutlineUserCircle,
  HiChevronRight,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlineCalendarDays,
  HiOutlineGlobeAlt,
  HiOutlineMagnifyingGlass,
  HiChevronDown,
  HiChevronUp,
  HiOutlineViewColumns,
  HiOutlineArrowDownTray
} from "react-icons/hi2";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import DashboardTab from "./components/DashboardTab";
import AnalyticsTab from "./components/AnalyticsTab";
import AnalyticsPeriodTab from "./components/AnalyticsPeriodTab";
import AnalyticsSitesTab from "./components/AnalyticsSitesTab";
import AnalyticsKeywordsTab from "./components/AnalyticsKeywordsTab";
import ConsultationsTab from "./components/ConsultationsTab";
import MembersTab from "./components/MembersTab";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DeletedPanel from "./components/DeletedPanel";

import { LeadRow, AdminUserRow } from "./types";
import { 
  THEME, 
  statusConfig, 
  industryLabels, 
  mockVisitorData, 
  mockFunnelData, 
  FUNNEL_COLORS, 
  mockReferrerSites, 
  mockSearchKeywords 
} from "./constants";


export default function AdminDashboard({ initialLeads, currentUser }: { initialLeads: LeadRow[], currentUser?: any }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ui = useUIStore();
  const ITEMS_PER_PAGE = 10;

  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", username: "", password: "", role: "MANAGER", customRole: "" });
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [editAdminForm, setEditAdminForm] = useState({ id: "", name: "", username: "", password: "" });
  const [adminLoading, setAdminLoading] = useState(false);
  const [editAdminLoading, setEditAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, LeadStatus>>({});
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [showDeletedPanel, setShowDeletedPanel] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);
  const [periodMode, setPeriodMode] = useState<'day' | 'month'>('day');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(4);

  // Queries & Mutations
  const { data: leads = initialLeads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/consultations");
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return json.leads as LeadRow[];
    },
    initialData: initialLeads,
    refetchInterval: () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return 10000;
      }
      return 3000;
    },
    refetchIntervalInBackground: true,
  });

  const { data: adminUsers = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return json.users as AdminUserRow[];
    },
    enabled: ui.activeTab === "members",
  });

  const { data: gaOverview } = useQuery({
    queryKey: ['ga_overview'],
    queryFn: () => fetch('/api/analytics?type=overview').then(res => res.json()),
    refetchInterval: 300000,
    enabled: ui.activeTab === 'dashboard' || ui.activeTab.startsWith('analytics'),
  });

  const { data: gaReferrers } = useQuery({
    queryKey: ['ga_referrers'],
    queryFn: () => fetch('/api/analytics?type=referrers').then(res => res.json()),
    refetchInterval: 300000,
    enabled: ui.activeTab === 'dashboard' || ui.activeTab.startsWith('analytics'),
  });

  const { data: gaKeywords } = useQuery({
    queryKey: ['ga_keywords'],
    queryFn: () => fetch('/api/analytics?type=keywords').then(res => res.json()),
    refetchInterval: 300000,
    enabled: ui.activeTab === 'dashboard' || ui.activeTab.startsWith('analytics'),
  });

  const { data: gaMonthly } = useQuery({
    queryKey: ['ga_monthly', selectedYear],
    queryFn: () => fetch(`/api/analytics?type=monthly&year=${selectedYear}`).then(res => res.json()),
    refetchInterval: 300000,
    enabled: ui.activeTab === 'analytics_period' && periodMode === 'month',
  });

  const allVisitorData = gaOverview && gaOverview.visitorData ? gaOverview.visitorData : [];
  // 차트/KPI 요약용: 최근 30일
  const activeVisitorData = allVisitorData.slice(-30);
  const activeReferrerSites = gaReferrers && gaReferrers.referrerSites ? gaReferrers.referrerSites : [];
  const activeSearchKeywords = gaKeywords && gaKeywords.keywords ? gaKeywords.keywords : [];

  const todayData = activeVisitorData[activeVisitorData.length - 1] || { visitors: 0, bounceRate: 0, avgSessionDuration: 0 };
  const yesterdayData = activeVisitorData[activeVisitorData.length - 2];

  // 성장률 계산 함수: 데이터가 없거나 둘 다 0이면 0.0 반환
  const calculateGrowth = (current: number, previous: number | undefined) => {
    if (previous === undefined || (current === 0 && previous === 0)) return "0.0";
    if (previous === 0) return current > 0 ? "100.0" : "0.0";
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const visitorPercent = calculateGrowth(todayData.visitors, yesterdayData?.visitors);
  const visitorDiff = todayData.visitors - (yesterdayData?.visitors || 0);

  const durationMins = Math.floor((todayData.avgSessionDuration || 0) / 60);
  const durationSecs = Math.round((todayData.avgSessionDuration || 0) % 60);
  const durationDiff = (todayData.avgSessionDuration || 0) - (yesterdayData?.avgSessionDuration || 0);
  const durationPercent = calculateGrowth(todayData.avgSessionDuration || 0, yesterdayData?.avgSessionDuration);
  const bounceDiff = (todayData.bounceRate || 0) - (yesterdayData?.bounceRate || 0);

  const KPIs = [
    { title: "일간 총 방문자", value: `${todayData.visitors.toLocaleString()}명`, percent: `${visitorDiff >= 0 ? '+' : ''}${visitorPercent}%`, color: visitorDiff >= 0 ? "#10b981" : "#ef4444", isPositive: visitorDiff >= 0 },
    { title: "평균 체류 시간", value: `${durationMins}분 ${durationSecs}초`, percent: `${durationDiff >= 0 ? '+' : ''}${durationPercent}%`, color: durationDiff >= 0 ? "#10b981" : "#ef4444", isPositive: durationDiff >= 0 },
    { title: "평균 이탈률", value: `${(todayData.bounceRate || 0).toFixed(1)}%`, percent: `${bounceDiff > 0 ? '+' : ''}${bounceDiff.toFixed(1)}%`, color: bounceDiff <= 0 ? "#10b981" : "#ef4444", isPositive: bounceDiff <= 0 }
  ];

  const filteredVisitorData = useMemo(() => {
    if (periodMode === 'month') {
      // 월별: GA monthly API 결과 사용 (해당 연도 전체)
      return gaMonthly && gaMonthly.monthlyData ? gaMonthly.monthlyData : [];
    }
    
    // 일별: YYYY-MM-DD 형식 기준으로 선택 연도/월 필터
    return allVisitorData.filter((d: any) => {
      const dateStr: string = d.date || '';
      if (!dateStr.includes('-')) return false;
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // YYYY-MM-DD
        return Number(parts[0]) === selectedYear && Number(parts[1]) === selectedMonth;
      }
      // 혹시 MM-DD 형식이면 월만 비교
      return Number(parts[0]) === selectedMonth;
    });
  }, [allVisitorData, gaMonthly, periodMode, selectedYear, selectedMonth]);


  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: LeadStatus }) => {
      const res = await fetch(`/api/admin/consultations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setPendingStatuses(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  });

  const updateAdminMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${editAdminForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editAdminForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      setAdminMessage({ type: 'success', text: "관리자 정보가 수정되었습니다." });
      setIsEditAdminModalOpen(false);
    },
    onError: (error: any) => {
      setAdminMessage({ type: 'error', text: error.message });
    }
  });

  const updateAdminUser = () => {
    updateAdminMutation.mutate();
  };

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
    },
    onSuccess: () => {
      window.location.href = "/admin/login";
    },
    onError: (error: any) => {
      alert(error.message);
    }
  });

  const deleteAdminUser = (id: string) => {
    deleteAdminMutation.mutate(id);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/consultations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] })
  });

  const { data: deletedLeads = [], refetch: refetchDeleted } = useQuery({
    queryKey: ["deleted-leads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/consultations/deleted");
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return json.leads as LeadRow[];
    },
    enabled: showDeletedPanel,
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/consultations/${id}/restore`, { method: "POST" });
      if (!res.ok) throw new Error("Restore failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      refetchDeleted();
    }
  });

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (adminMessage) {
      const timer = setTimeout(() => {
        setAdminMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [adminMessage]);

  // Filter & Pagination Logic
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (ui.searchTerm) {
      result = result.filter(l => (
        l.businessName.toLowerCase().includes(ui.searchTerm.toLowerCase()) ||
        (l.representativeName || "").toLowerCase().includes(ui.searchTerm.toLowerCase()) ||
        l.addressRoad.toLowerCase().includes(ui.searchTerm.toLowerCase()) ||
        (industryLabels[l.industry] || l.industry).toLowerCase().includes(ui.searchTerm.toLowerCase())
      ));
    }
    if (ui.statusFilter !== "ALL") {
      result = result.filter(l => statusConfig[l.status]?.label === ui.statusFilter);
    }
    return result;
  }, [leads, ui.searchTerm, ui.statusFilter]);

  const paginatedLeads = useMemo(() => {
    const start = (ui.currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeads, ui.currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const counters = useMemo(() => ({
    total: leads.length,
    today: leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length,
    pending: leads.filter(l => l.status === "NEW").length,
    completed: leads.filter(l => l.status === "CONTACTED" || l.status === "CONVERTED").length,
  }), [leads]);

  const newLeads = useMemo(() => leads.filter(l => l.status === "NEW"), [leads]);
  const hasUnread = newLeads.some(l => !ui.readNotiIds.includes(l.id));

  // Handlers
  const exportToExcel = () => {
    const data = filteredLeads.map((l, i) => {
      const amountRaw = l.desiredAmountText ? l.desiredAmountText.replace(/,/g, "").replace(/원/g, "").trim() : "";
      const isNumeric = amountRaw !== "" && /^\d+$/.test(amountRaw);

      return {
        "No.": filteredLeads.length - i,
        "사업자명": l.businessName,
        "대표자명": l.representativeName || "-",
        "연락처": l.phoneRaw,
        "도로명주소": l.addressRoad,
        "상세주소": l.addressDetail || "",
        "업종": industryLabels[l.industry] || l.industry,
        "필요자금": isNumeric ? Number(amountRaw) : (l.desiredAmountText || "-"),
        "진행 상태": statusConfig[l.status]?.label,
        "신청일시": new Date(l.createdAt).toLocaleString()
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);

    // Apply currency format to '필요자금' column (Column G / Index 6)
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1:I1");
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: 7 })];
      if (cell && cell.t === 'n') {
        cell.z = '#,##0"원"'; // Right-aligns numbers and adds suffix
      }
    }

    // Set Column Widths (Characters approximately)
    ws['!cols'] = [
      { wch: 8 },   // No.
      { wch: 25 },  // 사업자명
      { wch: 15 },  // 대표자명
      { wch: 20 },  // 연락처
      { wch: 50 },  // 도로명주소
      { wch: 40 },  // 상세주소
      { wch: 15 },  // 업종
      { wch: 15 },  // 필요자금
      { wch: 12 },  // 진행 상태
      { wch: 25 },  // 신청일시
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `Leads_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const createAdminUser = async () => {
    setAdminLoading(true);
    setAdminMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...adminForm,
          role: adminForm.role === "CUSTOM" ? adminForm.customRole : adminForm.role
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "관리자 등록에 실패했습니다.");
      }

      setAdminMessage({ type: "success", text: "관리자 계정이 등록되었습니다." });
      setAdminForm({ name: "", username: "", password: "", role: "MANAGER", customRole: "" });
      setIsAddAdminModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      const message = err instanceof Error ? err.message : "관리자 등록에 실패했습니다.";
      setAdminMessage({ type: "error", text: message });
    } finally {
      setAdminLoading(false);
    }
  };

  if (!isMounted) return null;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', backgroundColor: THEME.secondary, color: '#fff', padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 950, marginBottom: '16px' }}>PC 모드 접속 안내</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '40px' }}>어드민 대시보드는 PC 환경에 최적화되어 있습니다.<br />데스크탑 기기에서 접속해 주시기 바랍니다.</p>
        <button onClick={() => router.replace("/")} style={{ padding: '16px 32px', borderRadius: '16px', backgroundColor: THEME.primary, border: 'none', color: '#fff', fontWeight: 800 }}>메인 페이지로</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: THEME.bg, overflow: 'hidden', position: 'fixed' }}>
      <Sidebar
        isSidebarCollapsed={ui.isSidebarCollapsed}
        activeTab={ui.activeTab}
        isAnalyticsExpanded={isAnalyticsExpanded}
        setIsAnalyticsExpanded={setIsAnalyticsExpanded}
        setActiveTab={ui.setActiveTab}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Header
          activeTab={ui.activeTab}
          hasUnread={hasUnread}
          newLeads={newLeads}
          readNotiIds={ui.readNotiIds}
          addReadNotiId={ui.addReadNotiId}
          setActiveTab={ui.setActiveTab}
          setSearchTerm={ui.setSearchTerm}
          showNotiDropdown={showNotiDropdown}
          setShowNotiDropdown={setShowNotiDropdown}
          currentUser={currentUser}
        />
        <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
          {ui.activeTab === 'dashboard' && (
            <DashboardTab
              counters={counters}
              activeVisitorData={activeVisitorData}
              activeReferrerSites={activeReferrerSites}
              setActiveTab={ui.setActiveTab}
            />
          )}
          {ui.activeTab === 'analytics' && (
            <AnalyticsTab
              KPIs={KPIs}
              activeVisitorData={activeVisitorData}
              activeReferrerSites={activeReferrerSites}
              activeSearchKeywords={activeSearchKeywords}
              setActiveTab={ui.setActiveTab}
              leads={leads}
            />
          )}
          {ui.activeTab === 'analytics_period' && (
            <AnalyticsPeriodTab
              periodMode={periodMode}
              setPeriodMode={setPeriodMode}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              filteredVisitorData={filteredVisitorData}
              leads={leads}
            />
          )}
          {ui.activeTab === 'analytics_sites' && (
            <AnalyticsSitesTab activeReferrerSites={activeReferrerSites} />
          )}
          {ui.activeTab === 'analytics_keywords' && (
            <AnalyticsKeywordsTab activeSearchKeywords={activeSearchKeywords} />
          )}
          {ui.activeTab === 'consultations' && (
            <ConsultationsTab
              searchTerm={ui.searchTerm}
              setSearchTerm={ui.setSearchTerm}
              statusFilter={ui.statusFilter}
              setStatusFilter={ui.setStatusFilter}
              setShowDeletedPanel={setShowDeletedPanel}
              exportToExcel={exportToExcel}
              paginatedLeads={paginatedLeads}
              filteredLeads={filteredLeads}
              pendingStatuses={pendingStatuses}
              setPendingStatuses={setPendingStatuses}
              updateMutation={updateMutation}
              deleteMutation={deleteMutation}
              currentPage={ui.currentPage}
              setCurrentPage={ui.setCurrentPage}
              totalPages={totalPages}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            />
          )}
          {ui.activeTab === 'members' && (
            <MembersTab
              adminUsers={adminUsers}
              currentUser={currentUser}
              adminForm={adminForm}
              setAdminForm={setAdminForm}
              editAdminForm={editAdminForm}
              setEditAdminForm={setEditAdminForm}
              isAddAdminModalOpen={isAddAdminModalOpen}
              setIsAddAdminModalOpen={setIsAddAdminModalOpen}
              isEditAdminModalOpen={isEditAdminModalOpen}
              setIsEditAdminModalOpen={setIsEditAdminModalOpen}
              adminLoading={adminLoading}
              editAdminLoading={updateAdminMutation.isPending}
              createAdminUser={createAdminUser}
              updateAdminUser={updateAdminUser}
              deleteAdminUser={deleteAdminUser}
              setAdminMessage={setAdminMessage}
            />
          )}
          {ui.activeTab === 'settings' && (
            <div style={{ padding: '120px 0', textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', fontWeight: 950 }}>시스템 설정</h3>
              <p style={{ color: THEME.textMuted, marginTop: '24px' }}>핵심 시스템 파라미터 및 워크플로우를 재구성합니다.<br />보안 패치 0.8.4 대기 중.</p>
            </div>
          )}
        </div>
      </main>

      {showDeletedPanel && (
        <DeletedPanel
          showDeletedPanel={showDeletedPanel}
          deletedLeads={deletedLeads}
          setShowDeletedPanel={setShowDeletedPanel}
          restoreMutation={restoreMutation}
        />
      )}

      {/* Toast Notification */}
      {adminMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '50%',
          transform: 'translateX(50%)',
          padding: '16px 24px',
          borderRadius: '12px',
          backgroundColor: adminMessage.type === 'success' ? '#10b981' : '#f43f5e',
          color: '#fff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          animation: 'slideUpFade 0.3s ease-out forwards'
        }}>
          {adminMessage.text}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .nav-btn { transition: all 0.2s ease; }
        .nav-btn:hover { background-color: rgba(255,255,255,0.08) !important; color: #fff !important; }
        .nav-bottom-btn { transition: all 0.2s ease; }
        .nav-bottom-btn:hover { background-color: rgba(255,255,255,0.05) !important; color: #fff !important; }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translate(50%, 20px); }
          to { opacity: 1; transform: translate(50%, 0); }
        }
      `}} />
    </div >
  );
}
