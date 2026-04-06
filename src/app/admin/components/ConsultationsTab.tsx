"use client";

import { HiOutlineTrash } from "react-icons/hi2";
import { THEME, statusConfig, industryLabels } from "../constants";
import { LeadRow } from "../types";
import { LeadStatus } from "@prisma/client";

interface ConsultationsTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  setShowDeletedPanel: (show: boolean) => void;
  exportToExcel: () => void;
  paginatedLeads: LeadRow[];
  filteredLeads: LeadRow[];
  pendingStatuses: Record<string, LeadStatus>;
  setPendingStatuses: (updater: (prev: Record<string, LeadStatus>) => Record<string, LeadStatus>) => void;
  updateMutation: any;
  deleteMutation: any;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  totalPages: number;
  ITEMS_PER_PAGE: number;
}

export default function ConsultationsTab({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  setShowDeletedPanel,
  exportToExcel,
  paginatedLeads,
  filteredLeads,
  pendingStatuses,
  setPendingStatuses,
  updateMutation,
  deleteMutation,
  currentPage,
  setCurrentPage,
  totalPages,
  ITEMS_PER_PAGE,
}: ConsultationsTabProps) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '32px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="사업자명, 대표자명, 주소, 업종으로 검색" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '16px 24px', borderRadius: '16px', border: `1px solid ${THEME.border}`, outline: 'none' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0 20px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
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
            const st = statusConfig[status as LeadStatus] || statusConfig.NEW;
            return (
              <tr key={l.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                <td style={{ padding: '18px 16px', whiteSpace: 'nowrap' }}>{filteredLeads.length - ((currentPage - 1) * ITEMS_PER_PAGE) - i}</td>
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
      <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', gap: '16px' }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: '10px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, background: '#fff', fontSize: '13px', fontWeight: 700, cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>이전</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {totalPages <= 1 ? (
            <button style={{ width: '40px', height: '40px', borderRadius: '10px', background: THEME.primary, color: '#fff', border: 'none', fontWeight: 800 }}>1</button>
          ) : (
            Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: currentPage === n ? 'none' : `1px solid ${THEME.border}`,
                  background: currentPage === n ? THEME.primary : '#fff',
                  color: currentPage === n ? '#fff' : THEME.textMain,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {n}
              </button>
            ))
          )}
        </div>
        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ padding: '10px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, background: '#fff', fontSize: '13px', fontWeight: 700, cursor: (currentPage === totalPages || totalPages === 0) ? 'default' : 'pointer', opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1 }}>다음</button>
      </div>
    </div>
  );
}
