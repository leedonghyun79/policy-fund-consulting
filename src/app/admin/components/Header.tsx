"use client";

import { HiOutlineBell } from "react-icons/hi2";
import { THEME } from "../constants";
import { LeadRow } from "../types";

interface HeaderProps {
  activeTab: string;
  newLeads: LeadRow[];
  hasUnread: boolean;
  readNotiIds: string[];
  showNotiDropdown: boolean;
  setShowNotiDropdown: (show: boolean) => void;
  addReadNotiId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  currentUser?: { name: string; username: string; role: string; customRole?: string | null };
}

const tabTitle: Record<string, string> = {
  dashboard: '대시보드',
  consultations: '상담현황',
};

export default function Header({
  activeTab,
  newLeads,
  hasUnread,
  readNotiIds,
  showNotiDropdown,
  setShowNotiDropdown,
  addReadNotiId,
  setActiveTab,
  setSearchTerm,
  currentUser,
}: HeaderProps) {
  return (
    <header style={{
      height: '80px',
      backgroundColor: '#fff',
      borderBottom: `1px solid ${THEME.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: THEME.textMain, margin: 0 }}>
          {tabTitle[activeTab] ?? '관리제어'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F2F4F7', padding: '6px 14px', borderRadius: '100px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#12B76A' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#12B76A' }}>시스템 가동 중</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: THEME.secondary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>
            {currentUser?.name?.[0] || 'A'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 800 }}>
              {currentUser?.role === 'SUPER' ? '시스템 관리자' : (currentUser?.role === 'MANAGER' ? '최고 관리자' : (currentUser?.role || '시스템 관리자'))}
            </p>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotiDropdown(!showNotiDropdown)} style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative', padding: '8px' }}>
            <HiOutlineBell size={24} color={THEME.textMuted} />
            {hasUnread && (
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
            )}
          </button>
          {showNotiDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowNotiDropdown(false)} />
              <div style={{ position: 'absolute', top: '50px', right: 0, width: '320px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', zIndex: 100, padding: '20px' }}>
                <h4 style={{ margin: '0 0 16px', fontWeight: 900 }}>최신 알림</h4>
                {newLeads.map(l => (
                  <div
                    key={l.id}
                    onClick={() => {
                      addReadNotiId(l.id);
                      setActiveTab('consultations');
                      setSearchTerm(l.businessName);
                      setShowNotiDropdown(false);
                    }}
                    style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', opacity: readNotiIds.includes(l.id) ? 0.5 : 1 }}
                  >
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
  );
}
