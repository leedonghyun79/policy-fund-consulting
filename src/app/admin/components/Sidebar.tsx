import { useRouter } from "next/navigation";
import { 
  HiOutlineSquares2X2, 
  HiOutlineChartBar, 
  HiOutlineHome, 
  HiOutlineCalendarDays, 
  HiOutlineGlobeAlt, 
  HiOutlineMagnifyingGlass, 
  HiOutlineClipboardDocumentList, 
  HiOutlineUsers, 
  HiOutlineCog6Tooth, 
  HiChevronDown, 
  HiOutlineArrowLeftOnRectangle 
} from "react-icons/hi2";
import { THEME } from "../constants";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarCollapsed: boolean;
  isAnalyticsExpanded: boolean;
  setIsAnalyticsExpanded: (expanded: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  isAnalyticsExpanded,
  setIsAnalyticsExpanded
}: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: HiOutlineSquares2X2 },
    { 
      id: 'analytics_group', 
      label: '방문자 통계 (요약)', 
      icon: HiOutlineChartBar, 
      isToggle: true 
    },
    { id: 'analytics', label: '홈', icon: HiOutlineHome, isSub: true },
    { id: 'analytics_period', label: '기간별 분석', icon: HiOutlineCalendarDays, isSub: true },
    { id: 'analytics_sites', label: '유입 사이트 분석', icon: HiOutlineGlobeAlt, isSub: true },
    { id: 'analytics_keywords', label: '유입 검색어 분석', icon: HiOutlineMagnifyingGlass, isSub: true },
    { id: 'consultations', label: '상담현황', icon: HiOutlineClipboardDocumentList },
    { id: 'members', label: '접근 권한 제어', icon: HiOutlineUsers },
    { id: 'settings', label: '시스템 설정', icon: HiOutlineCog6Tooth },
  ];

  return (
    <aside style={{ 
      width: isSidebarCollapsed ? '90px' : '280px', 
      backgroundColor: THEME.secondary, 
      color: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: 'width 0.4s' 
    }}>
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
          {!isSidebarCollapsed && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>주식회사 비티씨</h2>
              <span style={{ fontSize: '10px', opacity: 0.5 }}>통합 관리 시스템 v1.2</span>
            </div>
          )}
        </div>

        <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', margin: '0 0 16px 12px' }}>주요 현황</p>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              style={{
                overflow: 'hidden',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                maxHeight: (!isAnalyticsExpanded && item.isSub) ? '0px' : '60px',
                opacity: (!isAnalyticsExpanded && item.isSub) ? 0 : 1,
                marginBottom: (!isAnalyticsExpanded && item.isSub) ? '0px' : '4px'
              }}
            >
              <button className="nav-btn" onClick={() => {
                if (item.isToggle) {
                  setIsAnalyticsExpanded(!isAnalyticsExpanded);
                } else {
                  setActiveTab(item.id);
                }
              }} style={{
                width: '100%',
                padding: item.isSub ? '12px 16px 12px 48px' : '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeTab === item.id ? '#fff' : (item.isSub ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)'),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
                fontSize: item.isSub ? '13px' : '14px'
              }}>
                {activeTab === item.id && !item.isToggle && (
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: '20%', 
                    bottom: '20%', 
                    width: '3px', 
                    backgroundColor: THEME.primary, 
                    borderRadius: '0 4px 4px 0' 
                  }} />
                )}
                {item.icon && <item.icon size={20} />}
                {!isSidebarCollapsed && (
                  <span style={{ fontWeight: item.isSub ? 600 : 700, flex: 1, textAlign: 'left' }}>
                    {item.label}
                  </span>
                )}
                {!isSidebarCollapsed && item.isToggle && (
                  <div style={{ 
                    transform: isAnalyticsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.3s', 
                    display: 'flex' 
                  }}>
                    <HiChevronDown size={14} color="rgba(255,255,255,0.4)" />
                  </div>
                )}
              </button>
            </div>
          ))}
        </nav>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          className="nav-bottom-btn" 
          onClick={() => router.push("/")} 
          style={{ 
            width: '100%', 
            padding: '14px', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.05)', 
            color: 'rgba(255,255,255,0.5)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            fontSize: '13px', 
            background: 'transparent' 
          }}
        >
          <HiOutlineHome size={16} /> {!isSidebarCollapsed && "메인페이지 이동"}
        </button>
        <button 
          className="nav-bottom-btn" 
          onClick={() => { 
            if (confirm("로그아웃 하시겠습니까?")) { 
              fetch("/api/admin/logout", { method: "POST" }).then(() => router.replace("/admin/login")); 
            } 
          }} 
          style={{ 
            width: '100%', 
            padding: '14px', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.05)', 
            color: 'rgba(255,255,255,0.4)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            fontSize: '13px', 
            background: 'transparent' 
          }}
        >
          <HiOutlineArrowLeftOnRectangle size={16} /> {!isSidebarCollapsed && "안전하게 로그아웃"}
        </button>
      </div>
    </aside>
  );
}
