"use client";

import { useMemo, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { AdminRole, LeadStatus } from "@prisma/client";
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
  HiOutlineHome
} from "react-icons/hi2";

type LeadRow = {
  id: string;
  businessName: string;
  representativeName: string | null;
  phoneRaw: string;
  addressRoad: string;
  addressDetail: string | null;
  industry: string;
  desiredAmountText: string | null;
  status: LeadStatus;
  createdAt: string;
  deletedAt?: string | null;
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
  primary: "#3366FF",
  primaryHover: "#2952CC",
  secondary: "#101828",
  bg: "#F9FAFB",
  surface: "#ffffff",
  border: "#EAECF0",
  textMain: "#101828",
  textMuted: "#667085",
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
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [editAdminForm, setEditAdminForm] = useState({ id: "", name: "", username: "", password: "" });
  const [adminLoading, setAdminLoading] = useState(false);
  const [editAdminLoading, setEditAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, LeadStatus>>({});
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [showDeletedPanel, setShowDeletedPanel] = useState(false);

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

  const updateAdminUser = async () => {
    setEditAdminLoading(true);
    setAdminMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${editAdminForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editAdminForm.name,
          username: editAdminForm.username,
          password: editAdminForm.password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "관리자 수정에 실패했습니다. 권한이 없거나 중복된 아이디일 수 있습니다.");
      }

      setAdminMessage({ type: "success", text: "관리자 계정이 수정되었습니다." });
      setEditAdminForm({ id: "", name: "", username: "", password: "" });
      setIsEditAdminModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      const message = err instanceof Error ? err.message : "관리자 수정에 실패했습니다.";
      setAdminMessage({ type: "error", text: message });
    } finally {
      setEditAdminLoading(false);
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
      <aside style={{ width: ui.isSidebarCollapsed ? '90px' : '280px', backgroundColor: THEME.secondary, color: '#fff', display: 'flex', flexDirection: 'column', transition: 'width 0.4s' }}>
        <div style={{ padding: '32px 24px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#1E40AF" />
              <path d="M9 7H16.5C18.9853 7 21 9.01472 21 11.5C21 13.9853 18.9853 16 16.5 16H9V7Z" fill="white" />
              <path d="M9 16H18.5C20.9853 16 23 18.0147 23 20.5C23 22.9853 20.9853 25 18.5 25H9V16Z" fill="white" />
              <path d="M11 11H15V13H11V11Z" fill="#1E40AF" />
              <path d="M11 19H17V21H11V19Z" fill="#1E40AF" />
              <rect x="23" y="5" width="4" height="12" rx="1" fill="#3B82F6" />
              <path d="M21 12L25 4L29 12H21Z" fill="#60A5FA" />
            </svg>
            {!ui.isSidebarCollapsed && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>주식회사 비티씨</h2>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>통합 관리 시스템 v1.2</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', margin: '0 0 16px 12px' }}>주요 현황</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'dashboard', label: '대시보드 통계', icon: HiOutlineSquares2X2 },
              { id: 'consultations', label: '상담현황', icon: HiOutlineClipboardDocumentList },
              { id: 'members', label: '접근 권한 제어', icon: HiOutlineUsers },
              { id: 'settings', label: '시스템 설정', icon: HiOutlineCog6Tooth },
            ].map(item => (
              <button key={item.id} className="nav-btn" onClick={() => ui.setActiveTab(item.id)} style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: ui.activeTab === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: ui.activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative'
              }}>
                {ui.activeTab === item.id && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', backgroundColor: THEME.primary, borderRadius: '0 4px 4px 0' }} />}
                <item.icon size={20} />
                {!ui.isSidebarCollapsed && <span style={{ fontWeight: 700, fontSize: '14px' }}>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="nav-bottom-btn" onClick={() => router.push("/")} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', background: 'transparent' }}>
            <HiOutlineHome size={16} /> {!ui.isSidebarCollapsed && "메인페이지 이동"}
          </button>
          <button className="nav-bottom-btn" onClick={() => { if (confirm("로그아웃 하시겠습니까?")) { fetch("/api/admin/logout", { method: "POST" }).then(() => router.replace("/admin/login")); } }} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', background: 'transparent' }}>
            <HiOutlineArrowLeftOnRectangle size={16} /> {!ui.isSidebarCollapsed && "안전하게 로그아웃"}
          </button>
        </div>
      </aside >

      {/* 메인 영역 */}
      < main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }
      }>
        <header style={{ height: '80px', backgroundColor: '#fff', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: THEME.textMain, margin: 0 }}>{ui.activeTab === 'dashboard' ? '대시보드' : (ui.activeTab === 'consultations' ? '상담현황' : '관리제어')}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F2F4F7', padding: '6px 14px', borderRadius: '100px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#12B76A' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#12B76A' }}>시스템 가동 중</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: THEME.secondary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>A</div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 800 }}>최고 관리자</p>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotiDropdown(!showNotiDropdown)} style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative', padding: '8px' }}>
                <HiOutlineBell size={24} color={THEME.textMuted} />
                {hasUnread && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />}
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
          </div>
        </header>

        <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
          {ui.activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                  { label: '누적 접수 건', val: counters.total, icon: HiOutlineCircleStack, color: '#EEF4FF', iconColor: '#3366FF' },
                  { label: '금일 실시간', val: counters.today, icon: HiOutlineBolt, color: '#FFF9EB', iconColor: '#F59E0B' },
                  { label: '검토 대기중', val: counters.pending, icon: HiOutlineFunnel, color: '#F9F5FF', iconColor: '#7F56D9' },
                  { label: '상담 완료 건', val: counters.completed, icon: HiOutlineChartBar, color: '#ECFDF3', iconColor: '#12B76A' }
                ].map((c, i) => (
                  <div key={i} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', border: `1px solid ${THEME.border}`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ marginBottom: '24px', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <c.icon size={24} color={c.iconColor} />
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>{c.label}</p>
                    <h2 style={{ fontSize: '42px', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>{c.val}</h2>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '32px', border: `1px solid ${THEME.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>신청 프로세스 현황</h3>
                  <div style={{ backgroundColor: '#F2F4F7', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, color: THEME.primary }}>주간 목표 전환율: 75%</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {[
                    { label: '신규 유입 스트림', val: counters.total, percent: 100 },
                    { label: '조건 충족 매칭', val: counters.pending, percent: Math.round((counters.pending / Math.max(1, counters.total)) * 100) },
                    { label: '내부 관리 프로세스', val: counters.completed, percent: Math.round((counters.completed / Math.max(1, counters.total)) * 100) }
                  ].map((p, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>{p.label} <span style={{ color: THEME.textMuted, fontWeight: 500, fontSize: '12px' }}>({p.val}건)</span></p>
                        <span style={{ fontSize: '14px', fontWeight: 900 }}>{p.percent}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#F2F4F7', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.percent}%`, height: '100%', backgroundColor: THEME.primary, borderRadius: '100px', transition: 'width 1s ease-out' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {ui.activeTab === 'consultations' && (
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '32px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="사업자명, 대표자명, 주소, 업종으로 검색" value={ui.searchTerm} onChange={e => ui.setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '16px 24px', borderRadius: '16px', border: `1px solid ${THEME.border}`, outline: 'none' }} />
                <select value={ui.statusFilter} onChange={e => ui.setStatusFilter(e.target.value)} style={{ padding: '0 20px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
                  <option value="ALL">전체 상태</option><option value="진행중">진행중</option><option value="진행 완료">진행 완료</option><option value="진행 불가">진행 불가</option>
                </select>
                <button onClick={() => setShowDeletedPanel(true)} style={{ padding: '0 20px', backgroundColor: '#fff', color: '#ef4444', borderRadius: '16px', border: '1px solid #ef4444', fontWeight: 800, cursor: 'pointer' }}>🗑 삭제된 항목</button>
                <button onClick={exportToExcel} style={{ padding: '0 24px', backgroundColor: THEME.secondary, color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>내보내기</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr style={{ textAlign: 'left' }}>
                    {['No.', '사업자명', '대표자명', '연락처', '도로명주소', '상세주소', '업종', '필요자금', '진행 상태', '신청일시', '관리'].map((h, idx) => (
                      <th key={h} style={{
                        padding: '20px 16px',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: THEME.textMain,
                        whiteSpace: idx === 4 || idx === 5 ? 'normal' : 'nowrap',
                        minWidth: idx === 4 ? '200px' : (idx === 5 ? '150px' : 'auto')
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((l, i) => {
                    const status = pendingStatuses[l.id] || l.status;
                    const st = statusConfig[status] || statusConfig.NEW;
                    return (
                      <tr key={l.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '18px 16px', whiteSpace: 'nowrap' }}>{filteredLeads.length - ((ui.currentPage - 1) * ITEMS_PER_PAGE) - i}</td>
                        <td style={{ padding: '18px 16px', fontWeight: 800, whiteSpace: 'nowrap' }}>{l.businessName}</td>
                        <td style={{ padding: '18px 16px', fontWeight: 700, whiteSpace: 'nowrap' }}>{l.representativeName || "-"}</td>
                        <td style={{ padding: '18px 16px', whiteSpace: 'nowrap' }}>{l.phoneRaw}</td>
                        <td style={{ padding: '18px 16px', fontSize: '13px', minWidth: '200px', lineHeight: '1.4' }}>{l.addressRoad}</td>
                        <td style={{ padding: '18px 16px', fontSize: '13px', minWidth: '150px', lineHeight: '1.4' }}>{l.addressDetail || "-"}</td>
                        <td style={{ padding: '18px 16px', whiteSpace: 'nowrap' }}>{industryLabels[l.industry] || l.industry}</td>
                        <td style={{ padding: '18px 16px', fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'right', fontSize: '14px' }}>
                          {(() => {
                            if (!l.desiredAmountText) return "-";
                            const clean = l.desiredAmountText.replace(/,/g, "").replace(/원/g, "").trim();
                            if (/^\d+$/.test(clean)) {
                              const val = Number(clean);
                              if (val >= 100000) {
                                return (val / 10000).toFixed(1).replace(/\.0$/, "") + "만";
                              }
                              return val.toLocaleString() + "원";
                            }
                            return l.desiredAmountText.includes("원") ? l.desiredAmountText : l.desiredAmountText + "원";
                          })()}
                        </td>
                        <td style={{ padding: '18px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select value={status} onChange={e => setPendingStatuses(p => ({ ...p, [l.id]: e.target.value as LeadStatus }))} style={{ padding: '6px', borderRadius: '8px', border: `1px solid ${st.color}44`, color: st.color, fontWeight: 800, fontSize: '13px', backgroundColor: '#fff' }}>
                              <option value="NEW">진행중</option><option value="CONTACTED">진행 완료</option><option value="CLOSED">진행 불가</option>
                            </select>
                            {pendingStatuses[l.id] && status !== l.status && <button onClick={() => updateMutation.mutate({ id: l.id, status })} style={{ padding: '6px 10px', borderRadius: '8px', background: THEME.primary, color: '#fff', border: 'none', fontSize: '12px', cursor: 'pointer' }}>저장</button>}
                          </div>
                        </td>
                        <td style={{ padding: '18px 16px', fontSize: '12px', color: THEME.textMuted, whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '18px 16px', textAlign: 'center' }}>
                          {(status === "CONTACTED" || status === "CONVERTED" || status === "CLOSED" || status === "SPAM") && <button onClick={() => { if (confirm("삭제하시겠습니까?")) deleteMutation.mutate(l.id); }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}><HiOutlineTrash size={18} /></button>}
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

              <div style={{ backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '20px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      {['이름', '아이디', '등급', '등록일', '관리'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: THEME.textMuted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: THEME.textMuted }}>등록된 관리자 계정이 없습니다.</td>
                      </tr>
                    )}
                    {adminUsers.map((u) => (
                      <tr key={u.id} style={{ borderTop: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700 }}>{u.name}</td>
                        <td style={{ padding: '14px 20px', color: THEME.textMuted }}>{u.username}</td>
                        <td style={{ padding: '14px 20px' }}>
                          {u.role === 'SUPER' ? '시스템 관리자' : (u.role === 'MANAGER' ? '최고 관리자' : u.role)}
                        </td>
                        <td style={{ padding: '14px 20px', color: THEME.textMuted }}>{new Date(u.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <button
                            onClick={() => {
                              setAdminMessage(null);
                              setEditAdminForm({ id: u.id, name: u.name, username: u.username, password: "" });
                              setIsEditAdminModalOpen(true);
                            }}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, backgroundColor: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: THEME.textMain }}
                          >
                            수정
                          </button>
                        </td>
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
                          <option value="MANAGER">최고 관리자</option>
                          <option value="SUPER">시스템 관리자</option>
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

              {isEditAdminModalOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 100 }} onClick={() => setIsEditAdminModalOpen(false)} />
                  <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '460px', backgroundColor: '#fff', borderRadius: '18px', border: `1px solid ${THEME.border}`, padding: '24px', zIndex: 101 }}>
                    <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>관리자 정보 수정</h4>
                    <p style={{ margin: '8px 0 20px', fontSize: '13px', color: THEME.textMuted }}>관리자 정보를 수정합니다. 빈 칸으로 남겨두는 항목은 변경되지 않습니다.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted }}>이름</label>
                      <input value={editAdminForm.name} onChange={(e) => setEditAdminForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="이름" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />

                      <label style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, marginTop: '4px' }}>아이디</label>
                      <input value={editAdminForm.username} onChange={(e) => setEditAdminForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="아이디 (영문 소문자/숫자, 4자 이상)" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />

                      <label style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, marginTop: '4px' }}>새 비밀번호 (변경시에만 입력)</label>
                      <input type="password" value={editAdminForm.password} onChange={(e) => setEditAdminForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="새 비밀번호 (8자 이상)" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button onClick={() => setIsEditAdminModalOpen(false)} style={{ height: '40px', padding: '0 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, backgroundColor: '#fff', cursor: 'pointer' }}>취소</button>
                      <button
                        onClick={updateAdminUser}
                        disabled={editAdminLoading}
                        style={{ height: '40px', padding: '0 16px', borderRadius: '10px', border: 'none', backgroundColor: THEME.primary, color: '#fff', cursor: 'pointer', fontWeight: 700, opacity: editAdminLoading ? 0.6 : 1 }}
                      >
                        {editAdminLoading ? '저장 중...' : '저장'}
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
      </main >

      {/* 삭제된 항목 패널 */}
      {
        showDeletedPanel && (
          <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 200 }} onClick={() => setShowDeletedPanel(false)} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90vw', maxWidth: '900px', maxHeight: '80vh', backgroundColor: '#fff', borderRadius: '24px', zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
              <div style={{ padding: '28px 32px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>🗑 삭제된 항목</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: THEME.textMuted }}>복구 버튼을 눌러 항목을 복원할 수 있습니다.</p>
                </div>
                <button onClick={() => setShowDeletedPanel(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: THEME.textMuted }}>×</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {deletedLeads.length === 0 ? (
                  <div style={{ padding: '80px 20px', textAlign: 'center', color: THEME.textMuted }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>✅</p>
                    <p style={{ fontWeight: 700 }}>삭제된 항목이 없습니다.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        {['사업자명', '대표자명', '연락처', '업종', '삭제일시', '복구'].map(h => (
                          <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: THEME.textMuted, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deletedLeads.map(l => (
                        <tr key={l.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={{ padding: '16px 20px', fontWeight: 800 }}>{l.businessName}</td>
                          <td style={{ padding: '16px 20px' }}>{l.representativeName || '-'}</td>
                          <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>{l.phoneRaw}</td>
                          <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>{industryLabels[l.industry] || l.industry}</td>
                          <td style={{ padding: '16px 20px', fontSize: '12px', color: '#ef4444', whiteSpace: 'nowrap' }}>{l.deletedAt ? new Date(l.deletedAt).toLocaleString() : '-'}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <button
                              onClick={() => { if (confirm(`"${l.businessName}" 항목을 복구하시겠습니까?`)) restoreMutation.mutate(l.id); }}
                              style={{ padding: '8px 16px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
                            >
                              ↩ 복구
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )
      }

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
