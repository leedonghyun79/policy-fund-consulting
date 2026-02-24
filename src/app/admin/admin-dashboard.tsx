"use client";

import { useMemo, useState, useEffect, FormEvent } from "react";
import * as XLSX from "xlsx";
import { LeadStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineBell,
  HiOutlineLightningBolt,
  HiOutlineTrendingUp,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineDatabase,
  HiOutlineHome,
  HiOutlineMenuAlt2,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight
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
  glass: "rgba(255, 255, 255, 0.7)",
};

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string; dot: string }> = {
  NEW: { label: "진행중", color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6" },
  QUALIFIED: { label: "진행중", color: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
  CONTACTED: { label: "진행 완료", color: "#059669", bg: "#ecfdf5", dot: "#10b981" },
  CONVERTED: { label: "진행 완료", color: "#059669", bg: "#ecfdf5", dot: "#10b981" },
  CLOSED: { label: "진행 불가", color: "#4b5563", bg: "#f3f4f6", dot: "#6b7280" },
  SPAM: { label: "필터링", color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
};

const industryLabels: Record<string, string> = {
  MANUFACTURING: "제조업",
  RETAIL: "도·소매업",
  SERVICE: "서비스업",
  FOOD: "요식업",
  OTHER: "기타",
};

export default function AdminDashboard({ initialLeads }: { initialLeads: LeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", username: "", password: "", role: "MANAGER" });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, LeadStatus>>({});
  const [collapsed, setCollapsed] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [lastSeenLeadId, setLastSeenLeadId] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredLeads = useMemo(() => {
    setCurrentPage(1); // Reset to first page on search
    if (!searchTerm) return leads;
    return leads.filter(l =>
      l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phoneRaw.includes(searchTerm)
    );
  }, [leads, searchTerm]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);

  const newLeads = useMemo(() => leads.filter(l => l.status === "NEW"), [leads]);
  const latestNewId = newLeads.length > 0 ? newLeads[0].id : null;
  const hasUnread = latestNewId !== null && latestNewId !== lastSeenLeadId;

  const counters = useMemo(() => ({
    total: leads.length,
    today: leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length,
    pending: leads.filter(l => l.status === "NEW").length,
    completed: leads.filter(l => l.status === "CONTACTED" || l.status === "CONVERTED").length,
  }), [leads]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/consultations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status update failed");
      setLeads((prev) => prev.map((row) => row.id === id ? { ...row, status } : row));
    } catch (error) {
      alert("변경에 실패했습니다.");
    } finally {
      setLoadingId(null);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredLeads.map((lead, index) => ({
      "No.": filteredLeads.length - index,
      "사업자명": lead.businessName,
      "연락처": lead.phoneRaw,
      "도로명주소": lead.addressRoad,
      "상세주소": lead.addressDetail || "",
      "업종": industryLabels[lead.industry] || lead.industry,
      "희망자금": (() => {
        if (!lead.desiredAmountText) return "";
        const numeric = lead.desiredAmountText.replace(/,/g, "");
        if (/^\d+$/.test(numeric)) {
          return Number(numeric).toLocaleString() + "원";
        }
        return lead.desiredAmountText.endsWith("원") ? lead.desiredAmountText : lead.desiredAmountText + "원";
      })(),
      "상태": statusConfig[lead.status]?.label || lead.status,
      "신청일시": new Date(lead.createdAt).toLocaleString('ko-KR')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consultations");

    // 컬럼 너비 설정
    const maxWidths = [
      { wch: 8 }, // No.
      { wch: 25 }, // 사업자명
      { wch: 15 }, // 연락처
      { wch: 40 }, // 도로명주소
      { wch: 30 }, // 상세주소
      { wch: 15 }, // 업종
      { wch: 15 }, // 희망자금
      { wch: 12 }, // 상태
      { wch: 25 }, // 신청일시
    ];
    worksheet["!cols"] = maxWidths;

    XLSX.writeFile(workbook, `상담_신청_리스트_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const logout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };
  const onAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage(null);
    try {
      // 실제 API 연동 시 fetch를 사용합니다. 현재는 데모용 지연 처리를 수행합니다.
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAdminMessage({ type: 'success', text: "관리자가 성공적으로 추가되었습니다." });
      setTimeout(() => {
        setIsAddAdminModalOpen(false);
        setAdminMessage(null);
        setAdminForm({ name: "", username: "", password: "", role: "MANAGER" });
      }, 1500);
    } catch (err) {
      setAdminMessage({ type: 'error', text: "오류가 발생했습니다." });
    } finally {
      setAdminLoading(false);
    }
  };

  if (!isMounted) return null;

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: THEME.secondary,
        color: '#fff',
        padding: '32px',
        textAlign: 'center',
        fontFamily: '"Pretendard Variable", sans-serif'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <HiOutlineDatabase size={40} color={THEME.primary} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 950, marginBottom: '16px', letterSpacing: '-0.04em' }}>관리자 터미널 안내</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '40px', wordBreak: 'keep-all' }}>
          어드민 대시보드는 정밀한 데이터 분석 및 관리를 위해<br />
          <strong style={{ color: '#fff' }}>PC 환경에 최적화</strong>되어 있습니다.<br /><br />
          보안 및 원활한 시스템 운용을 위해<br />
          PC 모드 또는 데스크탑 기기에서 접속해 주시기 바랍니다.
        </p>
        <button
          onClick={() => router.replace("/")}
          style={{
            padding: '16px 32px',
            borderRadius: '16px',
            backgroundColor: THEME.primary,
            border: 'none',
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          메인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: THEME.bg, overflow: 'hidden', position: 'fixed', top: 0, left: 0, fontFamily: '"Pretendard Variable", sans-serif' }}>

      {/* 🚀 프리미엄 사이드바 */}
      <aside style={{
        width: collapsed ? '90px' : '300px',
        height: '100%',
        backgroundColor: THEME.secondary,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            right: '-15px',
            top: '120px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: THEME.primary,
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 20,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
        >
          {collapsed ? <HiOutlineChevronDoubleRight /> : <HiOutlineChevronDoubleLeft />}
        </button>

        <div style={{ padding: collapsed ? '48px 21px' : '48px 32px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              minWidth: '48px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${THEME.primary}, #3b82f6)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
            }}>
              <span style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic' }}>P</span>
            </div>
            {!collapsed && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>비티씨</h2>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#60a5fa', letterSpacing: '0.15em', opacity: 0.8 }}>관리 엔진 v1.2</span>
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          <p style={{
            padding: '0 16px',
            fontSize: '10px',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.2em',
            marginBottom: '16px',
            whiteSpace: 'nowrap',
            display: collapsed ? 'none' : 'block'
          }}>주요 현황</p>
          {[
            { id: 'dashboard', label: '대시보드 통계', icon: HiOutlineViewGrid },
            { id: 'consultations', label: '상담 현황', icon: HiOutlineClipboardList },
            { id: 'members', label: '접근 권한 제어', icon: HiOutlineUsers },
            { id: 'settings', label: '시스템 설정', icon: HiOutlineCog },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="sidebar-nav-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '12px',
                padding: '16px 14px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.6)',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
            >
              <item.icon size={22} style={{ color: activeTab === item.id ? THEME.primary : 'inherit', minWidth: '22px' }} />
              {!collapsed && <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.02em' }}>{item.label}</span>}
              {activeTab === item.id && !collapsed && <div style={{ position: 'absolute', right: 0, top: '25%', height: '50%', width: '4px', backgroundColor: THEME.primary, borderRadius: '4px 0 0 4px' }} />}
            </button>
          ))}

          <button
            onClick={() => router.push("/")}
            className="sidebar-nav-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '12px',
              padding: '16px 14px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.8)',
              marginTop: '20px',
              whiteSpace: 'nowrap'
            }}
          >
            <HiOutlineHome size={22} style={{ minWidth: '22px' }} />
            {!collapsed && <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.02em' }}>메인페이지</span>}
          </button>
        </nav>

        <div style={{ padding: collapsed ? '30px 10px' : '32px' }}>
          <button
            onClick={logout}
            className="sidebar-nav-btn"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fda4af',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <HiOutlineLogout size={18} style={{ minWidth: '18px' }} />
            {!collapsed && "시스템 로그아웃"}
          </button>
        </div>
      </aside>

      {/* 🖥️ 메인 패널 */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* 🏔️ 상단 헤더 */}
        <header style={{ height: '100px', backgroundColor: THEME.surface, borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: THEME.textMain, letterSpacing: '-0.04em', margin: 0 }}>
              {activeTab === 'dashboard' ? '대시보드' : activeTab === 'consultations' ? '데이터베이스' : '접근 제어'}
            </h1>
            <div style={{ height: '32px', width: '1px', backgroundColor: THEME.border }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted }}>시스템 가동 중</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 20px', backgroundColor: '#f1f5f9', borderRadius: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: THEME.secondary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>A</div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '12px', fontWeight: 900, color: THEME.textMain, margin: 0 }}>수석 관리자</p>
                <p style={{ fontSize: '10px', fontWeight: 700, color: THEME.primary, margin: 0 }}>권한: 마스터</p>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowNotiDropdown(!showNotiDropdown);
                  if (!showNotiDropdown && latestNewId) {
                    setLastSeenLeadId(latestNewId);
                  }
                }}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <HiOutlineBell size={26} />
                {hasUnread && (
                  <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
                )}
              </button>

              {showNotiDropdown && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                    onClick={() => setShowNotiDropdown(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50px',
                    right: '-10px',
                    width: '320px',
                    backgroundColor: '#fff',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    border: `1px solid ${THEME.border}`,
                    zIndex: 100,
                    overflow: 'hidden',
                    animation: 'modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}>
                    <div style={{ padding: '24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: THEME.textMain }}>실시간 알림</h4>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: THEME.primary, backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '8px' }}>
                        {leads.filter(l => l.status === "NEW").length}건 미확인
                      </span>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
                      {leads.filter(l => l.status === "NEW").length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                          <p style={{ fontSize: '13px', color: THEME.textMuted, margin: 0 }}>새로운 상담 문의가 없습니다.</p>
                        </div>
                      ) : (
                        leads.filter(l => l.status === "NEW").map((l) => (
                          <div
                            key={l.id}
                            onClick={() => {
                              setActiveTab('consultations');
                              setSearchTerm(l.businessName);
                              setShowNotiDropdown(false);
                            }}
                            style={{
                              padding: '16px',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            className="noti-item"
                          >
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <HiOutlineLightningBolt size={20} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 800, color: THEME.textMain, lineHeight: 1.4 }}>
                                  <span style={{ color: THEME.primary }}>{l.businessName}</span> 님 상담 문의입니다.
                                </p>
                                <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: THEME.textMuted }}>
                                  {new Date(l.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {leads.filter(l => l.status === "NEW").length > 0 && (
                      <div
                        style={{ padding: '16px', textAlign: 'center', borderTop: `1px solid ${THEME.border}`, cursor: 'pointer' }}
                        onClick={() => {
                          setActiveTab('consultations');
                          setShowNotiDropdown(false);
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 800, color: THEME.textMuted }}>전체 상담 현황 보기</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 📦 콘텐츠 영역 */}
        <div style={{ flex: 1, padding: '64px', overflowY: 'auto', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* 📊 대시보드 뷰 */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

                {/* 지표 카드 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                  {[
                    { label: '누적 접수 건', val: counters.total, icon: HiOutlineDatabase, color: '#3b82f6', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
                    { label: "금일 실시간", val: counters.today, icon: HiOutlineLightningBolt, color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' },
                    { label: '검토 대기중', val: counters.pending, icon: HiOutlineFilter, color: '#8b5cf6', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' },
                    { label: '상담 완료 건', val: counters.completed, icon: HiOutlineTrendingUp, color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }
                  ].map((item, i) => (
                    <div key={i} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '32px', border: `1px solid ${THEME.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                        <item.icon size={28} />
                      </div>
                      <p style={{ fontSize: '11px', fontWeight: 950, color: THEME.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>{item.label}</p>
                      <h2 style={{ fontSize: '42px', fontWeight: 900, color: THEME.textMain, letterSpacing: '-0.06em', margin: 0 }}>{item.val}</h2>
                    </div>
                  ))}
                </div>

                {/* 분석 섹션 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
                  <div style={{ backgroundColor: '#fff', padding: '48px', borderRadius: '40px', border: `1px solid ${THEME.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 900, color: THEME.textMain, margin: 0 }}>신청 프로세스 현황</h3>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: THEME.primary, backgroundColor: '#eff6ff', padding: '8px 16px', borderRadius: '12px' }}>주간 목표 전환율: 75%</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {[
                        { label: '신규 유입 스트림', val: counters.pending, color: '#3b82f6' },
                        { label: '조건 충족 매칭', val: counters.completed, color: '#10b981' },
                        { label: '내부 관리 프로세스', val: counters.total - counters.pending - counters.completed, color: '#94a3b8' }
                      ].map((p, i) => {
                        const pct = Math.round((p.val / (counters.total || 1)) * 100);
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: THEME.textMain }}>{p.label} <span style={{ color: THEME.textMuted, fontSize: '12px', fontWeight: 600, marginLeft: '8px' }}>({p.val} 건)</span></span>
                              <span style={{ fontSize: '14px', fontWeight: 900, color: THEME.textMain }}>{pct}%</span>
                            </div>
                            <div style={{ height: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: p.color, borderRadius: '6px', transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 📑 데이터 그리드 뷰 */}
            {activeTab === 'consultations' && (
              <div style={{ backgroundColor: '#fff', borderRadius: '40px', border: `1px solid ${THEME.border}`, overflow: 'hidden', boxShadow: '0 4px 30px rgba(0,0,0,0.01)' }}>
                <div style={{ padding: '40px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', gap: '24px', alignItems: 'center', backgroundColor: '#fafbfd' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <HiOutlineSearch size={20} color="#94a3b8" style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="사업자명, 연락처, 도로명 주소로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', height: '64px', paddingLeft: '64px', paddingRight: '24px', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '20px', fontSize: '15px', fontWeight: 700, color: THEME.textMain, outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    />
                  </div>
                  <button style={{ height: '64px', padding: '0 32px', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '20px', fontWeight: 800, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><HiOutlineFilter size={20} /> 필터 설정</button>
                  <button style={{ height: '64px', padding: '0 32px', backgroundColor: THEME.secondary, color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', letterSpacing: '0.05em' }} onClick={exportToExcel}><HiOutlineDownload size={20} /> 데이터 내보내기</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fff', borderBottom: `2px solid ${THEME.border}` }}>
                        {['No.', '사업자명', '연락처', '주소', '업종', '필요자금', '상담 상태'].map((h, i) => (
                          <th key={i} style={{ padding: '24px 40px', fontSize: '11px', fontWeight: 950, color: THEME.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody style={{ verticalAlign: 'middle' }}>
                      {paginatedLeads.map((row, index) => {
                        const currentStatus = pendingStatuses[row.id] || row.status;
                        const st = statusConfig[currentStatus] || statusConfig.NEW;
                        const isChanged = pendingStatuses[row.id] && pendingStatuses[row.id] !== row.status;

                        return (
                          <tr key={row.id} style={{ borderBottom: `1px solid ${THEME.border}`, transition: 'background-color 0.2s' }}>
                            <td style={{ padding: '32px 40px' }}>
                              <p style={{ fontSize: '14px', fontWeight: 700, color: THEME.textMuted, margin: 0 }}>{filteredLeads.length - ((currentPage - 1) * ITEMS_PER_PAGE) - index}</p>
                            </td>
                            <td style={{ padding: '32px 40px' }}>
                              <p style={{ fontSize: '16px', fontWeight: 900, color: THEME.textMain, margin: 0, letterSpacing: '-0.02em' }}>{row.businessName}</p>
                            </td>
                            <td style={{ padding: '32px 40px' }}>
                              <p style={{ fontSize: '14px', fontWeight: 800, color: THEME.textMain, margin: 0 }}>{row.phoneRaw}</p>
                            </td>
                            <td style={{ padding: '32px 40px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 700, color: THEME.textMuted, margin: 0, wordBreak: 'keep-all' }}>{row.addressRoad}</p>
                            </td>
                            <td style={{ padding: '32px 40px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 800, color: THEME.textMuted, margin: 0 }}>{industryLabels[row.industry] || row.industry}</p>
                            </td>
                            <td style={{ padding: '32px 40px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 800, color: THEME.textMain, margin: 0 }}>
                                {(() => {
                                  if (!row.desiredAmountText) return "-";
                                  const numeric = row.desiredAmountText.replace(/,/g, "");
                                  if (/^\d+$/.test(numeric)) {
                                    return Number(numeric).toLocaleString() + "원";
                                  }
                                  return row.desiredAmountText.endsWith("원") ? row.desiredAmountText : row.desiredAmountText + "원";
                                })()}
                              </p>
                            </td>
                            <td style={{ padding: '32px 40px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => setPendingStatuses(prev => ({ ...prev, [row.id]: e.target.value as LeadStatus }))}
                                  disabled={loadingId === row.id}
                                  style={{
                                    width: '120px',
                                    height: '40px',
                                    padding: '0 12px',
                                    borderRadius: '12px',
                                    backgroundColor: st.bg,
                                    border: `1px solid ${st.color}44`,
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    color: st.color,
                                    cursor: 'pointer',
                                    outline: 'none'
                                  }}
                                >
                                  {Object.entries(statusConfig).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                  ))}
                                </select>

                                {isChanged && (
                                  <button
                                    onClick={() => updateStatus(row.id, pendingStatuses[row.id])}
                                    disabled={loadingId === row.id}
                                    style={{
                                      padding: '8px 16px',
                                      borderRadius: '10px',
                                      backgroundColor: THEME.primary,
                                      color: '#fff',
                                      border: 'none',
                                      fontSize: '11px',
                                      fontWeight: 900,
                                      cursor: 'pointer',
                                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                                    }}
                                  >
                                    {loadingId === row.id ? "저장 중..." : "저장"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '32px 40px', backgroundColor: '#fafbfd', borderTop: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: THEME.textMuted, letterSpacing: '0.05em' }}>페이지 <span style={{ color: THEME.textMain }}>{currentPage}</span> / {totalPages || 1} (총 {filteredLeads.length}개)</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '10px 20px', border: `1px solid ${THEME.border}`, background: currentPage === 1 ? '#f8fafc' : '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: 900, color: currentPage === 1 ? '#cbd5e1' : THEME.textMain, cursor: currentPage === 1 ? 'default' : 'pointer' }}
                    >
                      이전
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages || totalPages === 0}
                      style={{ padding: '10px 20px', border: `1px solid ${THEME.border}`, background: (currentPage >= totalPages || totalPages === 0) ? '#f8fafc' : '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: 900, color: (currentPage >= totalPages || totalPages === 0) ? '#cbd5e1' : THEME.textMain, cursor: (currentPage >= totalPages || totalPages === 0) ? 'default' : 'pointer' }}
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 👥 관리자 권한 제어 뷰 */}
            {activeTab === 'members' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                  <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 950, color: THEME.textMain, letterSpacing: '-0.05em', margin: 0 }}>공인 워크스페이스</h2>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: THEME.textMuted, marginTop: '8px' }}>특권 액세스 토큰을 통한 운용 노드 및 관리자 식별 관리를 수행합니다.</p>
                  </div>
                  <button onClick={() => setIsAddAdminModalOpen(true)} style={{ height: '64px', padding: '0 32px', backgroundColor: THEME.primary, color: '#fff', borderRadius: '20px', border: 'none', fontWeight: 900, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}><HiOutlinePlus size={22} /> 관리자 등록</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                  {[
                    { name: '수석 관리자', id: 'admin', role: '등급: ROOT', joinedAt: '2024.01.12' },
                    { name: '운영 팀장', id: 'ops_lee', role: '등급: ALPHA', joinedAt: '2024.02.10' },
                    { name: '시스템 엔지니어', id: 'eng_kim', role: '등급: BETA', joinedAt: '2024.02.24' },
                  ].map((u, i) => (
                    <div key={i} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '40px', border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 950, color: THEME.primary }}>{u.name.substring(0, 1)}</div>
                        <span style={{ padding: '6px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '10px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>활성화 상태</span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 950, color: THEME.textMain, margin: '0 0 6px' }}>{u.name}</h3>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: THEME.textMuted, margin: 0 }}>노드 ID: <span style={{ color: THEME.primary }}>@{u.id}</span></p>

                      <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '9px', fontWeight: 850, color: THEME.textMuted, margin: '0 0 4px', textTransform: 'uppercase' }}>액세스 등급</p>
                          <p style={{ fontSize: '12px', fontWeight: 900, color: THEME.textMain, margin: 0 }}>{u.role}</p>
                        </div>
                        <button style={{ padding: '0 12px', borderRadius: '10px', border: `1px solid ${THEME.border}`, background: 'none', cursor: 'pointer' }}><HiOutlineChevronRight size={18} color="#cbd5e1" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🛠️ 설정 뷰 */}
            {activeTab === 'settings' && (
              <div style={{ padding: '120px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '40px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '48px' }}>
                  <HiOutlineCog size={64} color={THEME.textMuted} />
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: 950, color: THEME.textMain, letterSpacing: '-0.06em' }}>핵심 설정 재구성</h3>
                <p style={{ fontSize: '15px', fontWeight: 600, color: THEME.textMuted, maxWidth: '400px', lineHeight: 1.7, marginTop: '16px' }}>글로벌 운용 파라미터 및 워크플로우 프로토콜이 동기화 중입니다. 보안 패치 0.8.4 대기 중.</p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 🔐 관리자 등록 모달 */}
      {isAddAdminModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(24px)' }} onClick={() => setIsAddAdminModalOpen(false)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '48px', padding: '64px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)', border: '1px solid #ffffff' }}>
            <button onClick={() => setIsAddAdminModalOpen(false)} style={{ position: 'absolute', top: '40px', right: '40px', border: 'none', background: '#f1f5f9', width: '40px', height: '40px', borderRadius: '14px', cursor: 'pointer', color: THEME.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiOutlineX size={20} /></button>

            <div style={{ textAlign: 'left', marginBottom: '48px' }}>
              <span style={{ fontSize: '11px', fontWeight: 950, color: THEME.primary, letterSpacing: '0.15em', textTransform: 'uppercase' }}>보안 프로토콜</span>
              <h2 style={{ fontSize: '28px', fontWeight: 950, color: THEME.textMain, margin: '8px 0 0', letterSpacing: '-0.04em' }}>신규 운용 노드 등록</h2>
            </div>

            <form onSubmit={onAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 950, color: THEME.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>관리자 성함 (실명)</label>
                <input required value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} placeholder="성함을 입력하세요" style={{ width: '100%', height: '64px', padding: '0 24px', backgroundColor: '#f8fafc', border: `1px solid ${THEME.border}`, borderRadius: '20px', fontSize: '15px', fontWeight: 700, color: THEME.textMain, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 950, color: THEME.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>접속 인증 계정 (ID)</label>
                <input required value={adminForm.username} onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })} placeholder="시스템 접속용 아이디" style={{ width: '100%', height: '64px', padding: '0 24px', backgroundColor: '#f8fafc', border: `1px solid ${THEME.border}`, borderRadius: '20px', fontSize: '15px', fontWeight: 700, color: THEME.textMain, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 950, color: THEME.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>보안 비밀번호 (PW)</label>
                <input type="password" required value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="강력한 암호를 설정하세요" style={{ width: '100%', height: '64px', padding: '0 24px', backgroundColor: '#f8fafc', border: `1px solid ${THEME.border}`, borderRadius: '20px', fontSize: '15px', fontWeight: 700, color: THEME.textMain, outline: 'none' }} />
              </div>

              {adminMessage && (
                <div style={{ padding: '20px', borderRadius: '20px', backgroundColor: adminMessage.type === 'success' ? '#ecfdf5' : '#fef2f2', color: adminMessage.type === 'success' ? '#059669' : '#dc2626', fontSize: '13px', fontWeight: 800, textAlign: 'center' }}>
                  {adminMessage.text}
                </div>
              )}

              <button type="submit" disabled={adminLoading} style={{ width: '100%', height: '72px', backgroundColor: THEME.primary, color: '#fff', borderRadius: '24px', border: 'none', fontWeight: 950, fontSize: '15px', letterSpacing: '0.05em', cursor: 'pointer', marginTop: '16px', boxShadow: '0 15px 30px rgba(37, 99, 235, 0.3)' }}>
                {adminLoading ? '노드 인증 진행 중...' : '접근 권한 활성화 및 등록'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
