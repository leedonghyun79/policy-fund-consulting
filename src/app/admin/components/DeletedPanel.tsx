"use client";

import { THEME, industryLabels } from "../constants";
import { LeadRow } from "../types";

interface DeletedPanelProps {
  showDeletedPanel: boolean;
  setShowDeletedPanel: (show: boolean) => void;
  deletedLeads: LeadRow[];
  restoreMutation: any;
}

export default function DeletedPanel({
  showDeletedPanel,
  setShowDeletedPanel,
  deletedLeads,
  restoreMutation
}: DeletedPanelProps) {
  if (!showDeletedPanel) return null;

  return (
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
  );
}
