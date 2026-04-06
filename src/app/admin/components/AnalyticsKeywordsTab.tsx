"use client";

import { useState } from "react";
import { HiOutlineChartBar } from "react-icons/hi2";
import { THEME } from "../constants";

interface AnalyticsKeywordsTabProps {
  activeSearchKeywords: any[];
}

export default function AnalyticsKeywordsTab({ activeSearchKeywords }: AnalyticsKeywordsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(activeSearchKeywords.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = activeSearchKeywords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ background: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, padding: '32px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px' }}>유입 검색어 분석</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ borderBottom: `1px solid ${THEME.border}`, background: '#f8fafc' }}>
          <tr>
            <th style={{ width: '75px', padding: '20px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>순위</th>
            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>검색 키워드</th>
            <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>클릭(유입) 건수</th>
          </tr>
        </thead>
        <tbody>
          {activeSearchKeywords.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: '80px 0', textAlign: 'center', color: THEME.textMuted }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineChartBar size={42} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700 }}>수집된 데이터가 없습니다.</p>
                </div>
              </td>
            </tr>
          ) : (
            paginatedData.map((kw: any, i: number) => {
              const rank = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: rank <= 3 ? THEME.primary : '#F2F4F7', color: rank <= 3 ? '#fff' : THEME.textMuted, alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>{rank}</div>
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: 800, fontSize: '14px', color: THEME.textMain }}>{kw.keyword}</td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: 800, fontSize: '15px' }}>{kw.clicks}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <div style={{ padding: '32px 0 0 0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
          disabled={currentPage === 1}
          style={{ padding: '10px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, background: '#fff', fontSize: '13px', fontWeight: 700, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          이전
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button 
            key={n} 
            onClick={() => setCurrentPage(n)}
            style={{ width: '40px', height: '40px', borderRadius: '10px', border: n === currentPage ? 'none' : `1px solid ${THEME.border}`, background: n === currentPage ? THEME.primary : '#fff', color: n === currentPage ? '#fff' : THEME.textMain, fontWeight: 800, cursor: 'pointer' }}
          >
            {n}
          </button>
        ))}
        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
          disabled={currentPage === totalPages}
          style={{ padding: '10px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, background: '#fff', fontSize: '13px', fontWeight: 700, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          다음
        </button>
      </div>
    </div>
  );
}
