"use client";

import {
  HiOutlineCircleStack,
  HiOutlineBolt,
  HiOutlineFunnel,
  HiOutlineChartBar,
} from "react-icons/hi2";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { THEME, mockFunnelData, FUNNEL_COLORS } from "../constants";

interface Counters {
  total: number;
  today: number;
  pending: number;
  completed: number;
}

interface DashboardTabProps {
  counters: Counters;
  activeVisitorData: any[];
  activeReferrerSites: any[];
  setActiveTab: (tab: string) => void;
}

export default function DashboardTab({
  counters,
  activeVisitorData,
  activeReferrerSites,
  setActiveTab,
}: DashboardTabProps) {
  const statCards = [
    { label: '누적 접수 건', val: counters.total, icon: HiOutlineCircleStack, color: '#EEF4FF', iconColor: '#3366FF' },
    { label: '금일 실시간', val: counters.today, icon: HiOutlineBolt, color: '#FFF9EB', iconColor: '#F59E0B' },
    { label: '검토 대기중', val: counters.pending, icon: HiOutlineFunnel, color: '#F9F5FF', iconColor: '#7F56D9' },
    { label: '상담 완료 건', val: counters.completed, icon: HiOutlineChartBar, color: '#ECFDF3', iconColor: '#12B76A' },
  ];

  const funnelItems = [
    { label: '신규 유입 스트림', val: counters.total, percent: 100 },
    { label: '조건 충족 매칭', val: counters.pending, percent: Math.round((counters.pending / Math.max(1, counters.total)) * 100) },
    { label: '내부 관리 프로세스', val: counters.completed, percent: Math.round((counters.completed / Math.max(1, counters.total)) * 100) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* KPI 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {statCards.map((c, i) => (
          <div key={i} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', border: `1px solid ${THEME.border}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ marginBottom: '24px', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <c.icon size={24} color={c.iconColor} />
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>{c.label}</p>
            <h2 style={{ fontSize: '42px', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>{c.val}</h2>
          </div>
        ))}
      </div>

      {/* 차트 2개 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {/* 방문자 통계 */}
        <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>방문자 통계</h3>
              <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, opacity: 0.8 }}>최근 30일</span>
            </div>
            <button onClick={() => setActiveTab('analytics')} style={{ fontSize: '13px', fontWeight: 700, color: THEME.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>자세히 보기 &rarr;</button>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            {activeVisitorData.length === 0 ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: THEME.textMuted }}>
                <HiOutlineChartBar size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <p style={{ fontWeight: 800, fontSize: '14px', opacity: 0.6 }}>수집된 데이터가 없습니다.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeVisitorData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: THEME.textMuted }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: THEME.textMuted }} dx={-10} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${THEME.border}`, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="views" name="페이지뷰" stroke={THEME.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="visitors" name="방문자" stroke="#101828" strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 유입 경로 분석 */}
        <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>유입 경로 분석</h3>
              <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, opacity: 0.8 }}>최근 30일</span>
            </div>
            <button onClick={() => setActiveTab('analytics')} style={{ fontSize: '13px', fontWeight: 700, color: THEME.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>자세히 보기 &rarr;</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '300px', position: 'relative' }}>
            {activeReferrerSites.length === 0 ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: THEME.textMuted }}>
                <HiOutlineChartBar size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <p style={{ fontWeight: 800, fontSize: '14px', opacity: 0.6 }}>수집된 데이터가 없습니다.</p>
              </div>
            ) : (
              <>
                <div style={{ width: '45%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={activeReferrerSites.slice(0, 5).map(r => ({
                          name: r.site,
                          value: parseFloat(r.rate.replace('%', ''))
                        }))} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={80} 
                        outerRadius={110} 
                        paddingAngle={3} 
                        dataKey="value" 
                        stroke="none"
                      >
                        {activeReferrerSites.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${THEME.border}`, fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '55%', paddingLeft: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {activeReferrerSites.slice(0, 5).map((item, idx) => (
                    <div key={item.site} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: THEME.textMain, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.site}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 900, flexShrink: 0, marginLeft: '8px' }}>{item.rate}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 신청 프로세스 현황 */}
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '32px', border: `1px solid ${THEME.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>신청 프로세스 현황</h3>
          <div style={{ backgroundColor: '#F2F4F7', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, color: THEME.primary }}>주간 목표 전환율: 75%</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {funnelItems.map((p, i) => (
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
  );
}
