"use client";

import { THEME } from "../constants";
import { AdminUserRow } from "../types";

interface MembersTabProps {
  adminUsers: AdminUserRow[];
  currentUser?: { name: string; username: string; role: string; };
  setAdminMessage: (msg: { type: 'success' | 'error', text: string } | null) => void;
  setIsAddAdminModalOpen: (open: boolean) => void;
  setEditAdminForm: (form: { id: string, name: string, username: string, password: string }) => void;
  setIsEditAdminModalOpen: (open: boolean) => void;
  isAddAdminModalOpen: boolean;
  adminForm: any;
  setAdminForm: React.Dispatch<React.SetStateAction<any>>;
  createAdminUser: () => void;
  adminLoading: boolean;
  isEditAdminModalOpen: boolean;
  editAdminForm: any;
  updateAdminUser: () => void;
  editAdminLoading: boolean;
  deleteAdminUser: (id: string) => void;
}

export default function MembersTab({
  adminUsers,
  currentUser,
  setAdminMessage,
  setIsAddAdminModalOpen,
  setEditAdminForm,
  setIsEditAdminModalOpen,
  isAddAdminModalOpen,
  adminForm,
  setAdminForm,
  createAdminUser,
  adminLoading,
  isEditAdminModalOpen,
  editAdminForm,
  updateAdminUser,
  editAdminLoading,
  deleteAdminUser,
}: MembersTabProps) {
  const isTopAdmin = currentUser?.role === 'MANAGER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '20px', padding: '24px 28px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: THEME.textMain }}>관리자 계정 관리</h3>
          <p style={{ margin: '8px 0 0', color: THEME.textMuted, fontSize: '13px' }}>로그인 가능한 관리자 계정을 등록하고 권한을 관리합니다.</p>
        </div>
        {isTopAdmin && (
          <button
            onClick={() => {
              setAdminMessage(null);
              setIsAddAdminModalOpen(true);
            }}
            style={{ height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', backgroundColor: THEME.primary, color: '#fff', fontWeight: 800, cursor: 'pointer' }}
          >
            관리자 등록
          </button>
        )}
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
                  {u.username === currentUser?.username && (
                    <div style={{ display: 'flex', gap: '8px' }}>
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
                      {!isTopAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                              deleteAdminUser(u.id);
                            }
                          }}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid #ef4444`, backgroundColor: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  )}
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
              <input value={adminForm.name} onChange={(e) => setAdminForm((prev: any) => ({ ...prev, name: e.target.value }))} placeholder="이름" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />
              <input value={adminForm.username} onChange={(e) => setAdminForm((prev: any) => ({ ...prev, username: e.target.value }))} placeholder="아이디 (영문 소문자/숫자, 4자 이상)" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />
              <input type="password" value={adminForm.password} onChange={(e) => setAdminForm((prev: any) => ({ ...prev, password: e.target.value }))} placeholder="비밀번호 (8자 이상)" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />
              <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 800, color: THEME.textMain }}>관리자 등급 설정</p>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm((prev: any) => ({ ...prev, role: e.target.value }))}
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
                  onChange={(e) => setAdminForm((prev: any) => ({ ...prev, customRole: e.target.value }))}
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
              <input value={editAdminForm.name} onChange={(e) => setEditAdminForm({ ...editAdminForm, name: e.target.value })} placeholder="이름" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />

              <label style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, marginTop: '4px' }}>아이디</label>
              <input value={editAdminForm.username} onChange={(e) => setEditAdminForm({ ...editAdminForm, username: e.target.value })} placeholder="아이디 (영문 소문자/숫자, 4자 이상)" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />

              <label style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, marginTop: '4px' }}>새 비밀번호 (변경시에만 입력)</label>
              <input type="password" value={editAdminForm.password} onChange={(e) => setEditAdminForm({ ...editAdminForm, password: e.target.value })} placeholder="새 비밀번호 (8자 이상)" style={{ height: '44px', borderRadius: '10px', border: `1px solid ${THEME.border}`, padding: '0 12px' }} />
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
  );
}
