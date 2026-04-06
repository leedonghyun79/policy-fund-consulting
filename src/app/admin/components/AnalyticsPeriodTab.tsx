"use client";

import { useState } from "react";
import { HiOutlineChartBar, HiOutlineViewColumns, HiOutlineArrowDownTray } from "react-icons/hi2";
import { THEME } from "../constants";

interface AnalyticsPeriodTabProps {
  periodMode: 'day' | 'month';
  setPeriodMode: (mode: 'day' | 'month') => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  filteredVisitorData: any[];
}

export default function AnalyticsPeriodTab({
  periodMode,
  setPeriodMode,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  filteredVisitorData,
}: AnalyticsPeriodTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredVisitorData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filteredVisitorData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ background: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>기간별 분석</h3>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setPeriodMode('day')}
              style={{ 
                padding: '6px 16px', borderRadius: '6px', border: 'none', 
                backgroundColor: periodMode === 'day' ? '#0f172a' : 'transparent', 
                color: periodMode === 'day' ? '#fff' : '#64748b', 
                fontSize: '13px', fontWeight: 800, cursor: 'pointer' 
              }}>일별</button>
            <button 
              onClick={() => setPeriodMode('month')}
              style={{ 
                padding: '6px 16px', borderRadius: '6px', border: 'none', 
                backgroundColor: periodMode === 'month' ? '#0f172a' : 'transparent', 
                color: periodMode === 'month' ? '#fff' : '#64748b', 
                fontSize: '13px', fontWeight: 800, cursor: 'pointer' 
              }}>월별</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ padding: '8px 32px 8px 16px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px', fontWeight: 700, outline: 'none', cursor: 'pointer', appearance: 'none', background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") no-repeat right 12px center/16px`, backgroundColor: '#fff' }}>
            <option value={2026}>2026년</option>
            <option value={2025}>2025년</option>
          </select>
          {periodMode === 'day' && (
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ padding: '8px 32px 8px 16px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '13px', fontWeight: 700, outline: 'none', cursor: 'pointer', appearance: 'none', background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") no-repeat right 12px center/16px`, backgroundColor: '#fff' }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          )}
          <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${THEME.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <HiOutlineViewColumns size={18} color={THEME.textMuted} />
          </button>
          <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${THEME.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <HiOutlineArrowDownTray size={18} color={THEME.textMuted} />
          </button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8fafc' }}>
          <tr>
            {[periodMode === 'day' ? '분석 일자' : '분석 월', '페이지뷰 (PV)', '순방문자 (UV)', '회원가입/전환', '이탈률', '평균 세션 (초)'].map(h => (
              <th key={h} style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredVisitorData.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '80px 0', textAlign: 'center', color: THEME.textMuted }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineChartBar size={42} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700 }}>수집된 데이터가 없습니다.</p>
                </div>
              </td>
            </tr>
          ) : (
            paginatedData.map((row: any, i: number) => {
              const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;
              return (
                <tr key={actualIndex} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                  <td style={{ padding: '20px 24px', fontWeight: 800, color: THEME.primary }}>
                    {periodMode === 'day' 
                      ? (row.date?.length === 5 ? `${selectedYear}-${row.date}` : row.date)
                      : `${selectedYear}-${actualIndex + 1 < 10 ? '0' : ''}${actualIndex + 1}`
                    }
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{(row.views || 0).toLocaleString()}</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{(row.visitors || 0).toLocaleString()}</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{Math.round((row.visitors || 0) * 0.05)}건</td>
                  <td style={{ padding: '20px 24px', color: '#ef4444', fontWeight: 800 }}>{(row.bounceRate || 0).toFixed(1)}%</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{Math.round(row.avgSessionDuration || 0)}s</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', gap: '8px', background: '#f8fafc' }}>
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
