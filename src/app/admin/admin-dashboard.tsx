"use client";

import { useMemo, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { LeadStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/src/store/ui-store";
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineTrash
} from "react-icons/hi";

type LeadRow = {
  id: string;
  businessName: string;
  phoneRaw: string;
  addressRoad: string;
  addressDetail: string | null;
  industry: string;
  desiredAmountText: string | null;
  status: LeadStatus;
  createdAt: string;
};

// Premium Theme Constants
const THEME = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  secondary: "#0f172a",
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#f1f5f9",
  textMain: "#0f172a",
  textMuted: "#64748b",
};

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string; dot: string }> = {
  NEW: { label: "진행중", color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6" },
  CONTACTED: { label: "진행 완료", color: "#059669", bg: "#ecfdf5", dot: "#10b981" },
  CLOSED: { label: "진행 불가", color: "#4b5563", bg: "#f3f4f6", dot: "#6b7280" },
  QUALIFIED: { label: "진행중", color: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
  CONVERTED: { label: "진행 완료", color: "#059669", bg: "#ecfdf5", dot: "#10b981" },
  SPAM: { label: "진행 불가", color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
};

const industryLabels: Record<string, string> = {
  MANUFACTURING: "제조업",
  RETAIL: "도·소매업",
  SERVICE: "서비스업",
  FOOD: "요식업",
  OTHER: "기타",
};

export default function AdminDashboard({ initialLeads }: { initialLeads: LeadRow[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ui = useUIStore();
  const ITEMS_PER_PAGE = 10;

  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", username: "", password: "", role: "MANAGER" });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, LeadStatus>>({});
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/consultations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] })
  });

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter & Pagination Logic
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (ui.searchTerm) {
      result = result.filter(l => (
        l.businessName.toLowerCase().includes(ui.searchTerm.toLowerCase()) ||
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
    inProgress: leads.filter(l => statusConfig[l.status]?.label === "진행중").length,
    completed: leads.filter(l => statusConfig[l.status]?.label === "진행 완료").length,
  }), [leads]);

  const newLeads = useMemo(() => leads.filter(l => l.status === "NEW"), [leads]);
  const hasUnread = newLeads.some(l => !ui.readNotiIds.includes(l.id));

  // Handlers
  const exportToExcel = () => {
    const data = filteredLeads.map((l, i) => ({
      "No.": filteredLeads.length - i,
      "사업자명": l.businessName,
      "연락처": l.phoneRaw,
      "주소": l.addressRoad,
      "업종": industryLabels[l.industry] || l.industry,
      "희망자금": (() => {
        if (!l.desiredAmountText) return "";
        const num = l.desiredAmountText.replace(/,/g, "").replace(/원/g, "").trim();
        return /^\d+$/.test(num) ? Number(num) : l.desiredAmountText;
      })(),
      "상태": statusConfig[l.status]?.label,
      "날짜": new Date(l.createdAt).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `Leads_${new Date().toISOString().split('T')[0]}.xlsx`);
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

      {/* 사이드바 */}
      <aside style={{ width: ui.isSidebarCollapsed ? '90px' : '300px', backgroundColor: THEME.secondary, color: '#fff', display: 'flex', flexDirection: 'column', transition: 'width 0.4s' }}>
        <div style={{ padding: '48px 24px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>P</div>
            {!ui.isSidebarCollapsed && <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>PIXEL ADMIN</h2>}
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'dashboard', label: '대시보드', icon: HiOutlineViewGrid },
              { id: 'consultations', label: '상담 현황', icon: HiOutlineClipboardList },
              { id: 'members', label: '관리자 제어', icon: HiOutlineUsers },
              { id: 'settings', label: '시스템 설정', icon: HiOutlineCog },
            ].map(item => (
              <button key={item.id} onClick={() => ui.setActiveTab(item.id)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: ui.activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent', color: ui.activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <item.icon size={22} />
                {!ui.isSidebarCollapsed && <span style={{ fontWeight: 800 }}>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ padding: '24px' }}>
          <button onClick={() => { if (confirm("로그아웃 하시겠습니까?")) { fetch("/api/admin/logout", { method: "POST" }).then(() => router.replace("/admin/login")); } }} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fda4af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <HiOutlineLogout size={18} /> {!ui.isSidebarCollapsed && "로그아웃"}
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <header style={{ height: '100px', backgroundColor: '#fff', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: THEME.textMain }}>{ui.activeTab.toUpperCase()}</h1>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotiDropdown(!showNotiDropdown)} style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative' }}>
              <HiOutlineBell size={26} color={THEME.textMuted} />
              {hasUnread && <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />}
            </button>
            {showNotiDropdown && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowNotiDropdown(false)} />
                <div style={{ position: 'absolute', top: '50px', right: 0, width: '320px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', zIndex: 100, padding: '20px' }}>
                  <h4 style={{ margin: '0 0 16px', fontWeight: 900 }}>최신 알림</h4>
                  {newLeads.map(l => (
                    <div key={l.id} onClick={() => { ui.addReadNotiId(l.id); ui.setActiveTab('consultations'); ui.setSearchTerm(l.businessName); setShowNotiDropdown(false); }} style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', opacity: ui.readNotiIds.includes(l.id) ? 0.5 : 1 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 800 }}>{l.businessName} 상담 신청</p>
                      <small style={{ color: THEME.textMuted }}>{new Date(l.createdAt).toLocaleTimeString()}</small>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
          {ui.activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                  { label: '누적 건수', val: counters.total, color: '#3b82f6' },
                  { label: '오늘 신청', val: counters.today, color: '#f59e0b' },
                  { label: '진행중', val: counters.inProgress, color: '#8b5cf6' },
                  { label: '완료 건수', val: counters.completed, color: '#10b981' }
                ].map((c, i) => (
                  <div key={i} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: THEME.textMuted }}>{c.label}</p>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, margin: 0 }}>{c.val}</h2>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ui.activeTab === 'consultations' && (
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '32px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', gap: '20px' }}>
                <input type="text" placeholder="검색어 입력..." value={ui.searchTerm} onChange={e => ui.setSearchTerm(e.target.value)} style={{ flex: 1, padding: '16px 24px', borderRadius: '16px', border: `1px solid ${THEME.border}`, outline: 'none' }} />
                <select value={ui.statusFilter} onChange={e => ui.setStatusFilter(e.target.value)} style={{ padding: '0 20px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
                  <option value="ALL">전체 상태</option><option value="진행중">진행중</option><option value="진행 완료">진행 완료</option><option value="진행 불가">진행 불가</option>
                </select>
                <button onClick={exportToExcel} style={{ padding: '0 24px', backgroundColor: THEME.secondary, color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 800 }}>내보내기</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}><tr style={{ textAlign: 'left' }}>{['No.', '이름', '연락처', '업종', '상태', '관리'].map(h => <th key={h} style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: THEME.textMuted }}>{h}</th>)}</tr></thead>
                <tbody>
                  {paginatedLeads.map((l, i) => {
                    const status = pendingStatuses[l.id] || l.status;
                    const st = statusConfig[status] || statusConfig.NEW;
                    return (
                      <tr key={l.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '24px 32px' }}>{filteredLeads.length - ((ui.currentPage - 1) * ITEMS_PER_PAGE) - i}</td>
                        <td style={{ padding: '24px 32px', fontWeight: 800 }}>{l.businessName}</td>
                        <td style={{ padding: '24px 32px' }}>{l.phoneRaw}</td>
                        <td style={{ padding: '24px 32px' }}>{industryLabels[l.industry] || l.industry}</td>
                        <td style={{ padding: '24px 32px' }}>
                          <select value={status} onChange={e => setPendingStatuses(p => ({ ...p, [l.id]: e.target.value as LeadStatus }))} style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${st.color}44`, color: st.color, fontWeight: 800 }}>
                            <option value="NEW">진행중</option><option value="CONTACTED">진행 완료</option><option value="CLOSED">진행 불가</option>
                          </select>
                          {pendingStatuses[l.id] && status !== l.status && <button onClick={() => updateMutation.mutate({ id: l.id, status })} style={{ marginLeft: '10px', padding: '6px 12px', borderRadius: '8px', background: THEME.primary, color: '#fff', border: 'none' }}>저장</button>}
                        </td>
                        <td style={{ padding: '24px 32px' }}>
                          {(status === "CONTACTED" || status === "CONVERTED") && <button onClick={() => { if (confirm("삭제하시겠습니까?")) deleteMutation.mutate(l.id); }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><HiOutlineTrash size={18} /></button>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <p style={{ fontSize: '12px', color: THEME.textMuted }}>{ui.currentPage} / {totalPages}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button disabled={ui.currentPage === 1} onClick={() => ui.setCurrentPage(p => p - 1)} style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, background: '#fff' }}>이전</button>
                  <button disabled={ui.currentPage === totalPages} onClick={() => ui.setCurrentPage(p => p + 1)} style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, background: '#fff' }}>다음</button>
                </div>
              </div>
            </div>
          )}

          {ui.activeTab === 'members' && (
            <div style={{ padding: '120px 0', textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 950 }}>접근 권한 제어</h3>
              <p style={{ color: THEME.textMuted, marginTop: '16px' }}>시스템 관리자 계정 및 보안 등급을 설정합니다. (준비 중..)</p>
            </div>
          )}

          {ui.activeTab === 'settings' && (
            <div style={{ padding: '120px 0', textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', fontWeight: 950 }}>시스템 설정</h3>
              <p style={{ color: THEME.textMuted, marginTop: '24px' }}>핵심 시스템 파라미터 및 워크플로우를 재구성합니다.<br />보안 패치 0.8.4 대기 중.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
