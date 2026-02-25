"use client";

import { useMemo, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { AdminRole, LeadStatus } from "@prisma/client";
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

type AdminUserRow = {
  id: string;
  name: string;
  username: string;
  role: AdminRole;
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
  const [adminForm, setAdminForm] = useState({ name: "", username: "", password: "", role: "MANAGER", customRole: "" });
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
      "도로명주소": l.addressRoad,
      "상세주소": l.addressDetail || "",
      "업종": industryLabels[l.industry] || l.industry,
      "희망자금": l.desiredAmountText || "",
      "진행 상태": statusConfig[l.status]?.label,
      "신청일시": new Date(l.createdAt).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);

    // Set Column Widths (Characters approximately)
    ws['!cols'] = [
      { wch: 5 },  // No.
      { wch: 20 }, // 사업자명
      { wch: 15 }, // 연락처
      { wch: 35 }, // 도로명주소
      { wch: 25 }, // 상세주소
      { wch: 15 }, // 업종
      { wch: 15 }, // 희망자금
      { wch: 12 }, // 진행 상태
      { wch: 25 }, // 신청일시
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
                <input type="text" placeholder="사업자명, 주소, 업종으로 검색" value={ui.searchTerm} onChange={e => ui.setSearchTerm(e.target.value)} style={{ flex: 1, padding: '16px 24px', borderRadius: '16px', border: `1px solid ${THEME.border}`, outline: 'none' }} />
                <select value={ui.statusFilter} onChange={e => ui.setStatusFilter(e.target.value)} style={{ padding: '0 20px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
                  <option value="ALL">전체 상태</option><option value="진행중">진행중</option><option value="진행 완료">진행 완료</option><option value="진행 불가">진행 불가</option>
                </select>
                <button onClick={exportToExcel} style={{ padding: '0 24px', backgroundColor: THEME.secondary, color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 800 }}>내보내기</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}><tr style={{ textAlign: 'left' }}>{['No.', '사업자명', '연락처', '도로명주소', '상세주소', '업종', '희망자금', '진행 상태', '신청일시', '관리'].map(h => <th key={h} style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 800, color: THEME.textMuted }}>{h}</th>)}</tr></thead>
                <tbody>
                  {paginatedLeads.map((l, i) => {
                    const status = pendingStatuses[l.id] || l.status;
                    const st = statusConfig[status] || statusConfig.NEW;
                    return (
                      <tr key={l.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '18px 24px' }}>{filteredLeads.length - ((ui.currentPage - 1) * ITEMS_PER_PAGE) - i}</td>
                        <td style={{ padding: '18px 24px', fontWeight: 800 }}>{l.businessName}</td>
                        <td style={{ padding: '18px 24px' }}>{l.phoneRaw}</td>
                        <td style={{ padding: '18px 24px', fontSize: '13px' }}>{l.addressRoad}</td>
                        <td style={{ padding: '18px 24px', fontSize: '13px' }}>{l.addressDetail || "-"}</td>
                        <td style={{ padding: '18px 24px' }}>{industryLabels[l.industry] || l.industry}</td>
                        <td style={{ padding: '18px 24px' }}>{l.desiredAmountText || "-"}</td>
                        <td style={{ padding: '18px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select value={status} onChange={e => setPendingStatuses(p => ({ ...p, [l.id]: e.target.value as LeadStatus }))} style={{ padding: '6px', borderRadius: '8px', border: `1px solid ${st.color}44`, color: st.color, fontWeight: 800, fontSize: '13px' }}>
                              <option value="NEW">진행중</option><option value="CONTACTED">진행 완료</option><option value="CLOSED">진행 불가</option>
                            </select>
                            {pendingStatuses[l.id] && status !== l.status && <button onClick={() => updateMutation.mutate({ id: l.id, status })} style={{ padding: '6px 10px', borderRadius: '8px', background: THEME.primary, color: '#fff', border: 'none', fontSize: '12px' }}>저장</button>}
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px', fontSize: '12px', color: THEME.textMuted }}>{new Date(l.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '18px 24px' }}>
                          {(status === "CONTACTED" || status === "CONVERTED" || status === "CLOSED" || status === "SPAM") && <button onClick={() => { if (confirm("삭제하시겠습니까?")) deleteMutation.mutate(l.id); }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><HiOutlineTrash size={18} /></button>}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '20px', padding: '24px 28px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: THEME.textMain }}>관리자 계정 관리</h3>
                  <p style={{ margin: '8px 0 0', color: THEME.textMuted, fontSize: '13px' }}>로그인 가능한 관리자 계정을 등록하고 권한을 관리합니다.</p>
                </div>
                <button
                  onClick={() => {
                    setAdminMessage(null);
                    setIsAddAdminModalOpen(true);
                  }}
                  style={{ height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', backgroundColor: THEME.primary, color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  관리자 등록
                </button>
              </div>

              {adminMessage && (
                <div style={{ padding: '14px 18px', borderRadius: '14px', backgroundColor: adminMessage.type === 'success' ? '#ecfdf5' : '#fef2f2', color: adminMessage.type === 'success' ? '#047857' : '#b91c1c', border: `1px solid ${adminMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}` }}>
                  {adminMessage.text}
                </div>
              )}

              <div style={{ backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '20px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      {['이름', '아이디', '권한', '등록일'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: THEME.textMuted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: THEME.textMuted }}>등록된 관리자 계정이 없습니다.</td>
                      </tr>
                    )}
                    {adminUsers.map((u) => (
                      <tr key={u.id} style={{ borderTop: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700 }}>{u.name}</td>
                        <td style={{ padding: '14px 20px', color: THEME.textMuted }}>{u.username}</td>
                        <td style={{ padding: '14px 20px' }}>
                          {u.role === 'SUPER' ? '최고관리자' : (u.role === 'MANAGER' ? '매니저' : u.role)}
                        </td>
                        <td style={{ padding: '14px 20px', color: THEME.textMuted }}>{new Date(u.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isAddAdminModalOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 100 }} onClick={() => setIsAddAdminModalOpen(false)} />
                  <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '460px', backgroundColor: '#fff', borderRadius: '18px', border: `1px solid ${THEME.border}`, padding: '24px', zIndex: 101 }}>
                    <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>관리자 등록</h4>
                    <p style={{ margin: '8px 0 20px', fontSize: '13px', color: THEME.textMuted }}>새로운 관리자 계정을 생성합니다.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input value={adminForm.name} onChange={(e) => setAdminForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="이름" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />
                      <input value={adminForm.username} onChange={(e) => setAdminForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="아이디 (영문 소문자/숫자, 4자 이상)" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />
                      <input type="password" value={adminForm.password} onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="비밀번호 (8자 이상)" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 800, color: THEME.textMain }}>관리자 등급 설정</p>
                        <select
                          value={adminForm.role}
                          onChange={(e) => setAdminForm((prev) => ({ ...prev, role: e.target.value }))}
                          style={{ width: '100%', height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }}
                        >
                          <option value="MANAGER">매니저</option>
                          <option value="SUPER">최고관리자</option>
                          <option value="CUSTOM">직접 작성</option>
                        </select>
                      </div>

                      {adminForm.role === "CUSTOM" && (
                        <input
                          value={adminForm.customRole}
                          onChange={(e) => setAdminForm((prev) => ({ ...prev, customRole: e.target.value }))}
                          placeholder="등급 이름을 입력하세요 (예: 부관리자)"
                          style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }}
                        />
                      )}
                    </div>

                    <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button onClick={() => setIsAddAdminModalOpen(false)} style={{ height: '40px', padding: '0 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, backgroundColor: '#fff', cursor: 'pointer' }}>취소</button>
                      <button
                        onClick={createAdminUser}
                        disabled={adminLoading}
                        style={{ height: '40px', padding: '0 16px', borderRadius: '10px', border: 'none', backgroundColor: THEME.primary, color: '#fff', cursor: 'pointer', fontWeight: 700, opacity: adminLoading ? 0.6 : 1 }}
                      >
                        {adminLoading ? '등록 중...' : '등록'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {false && (
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
