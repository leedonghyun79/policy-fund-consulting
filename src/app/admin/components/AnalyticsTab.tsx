"use client";

import { HiOutlineChartBar } from "react-icons/hi2";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { THEME, mockFunnelData, FUNNEL_COLORS } from "../constants";

interface KPI {
  title: string;
  value: string;
  percent: string;
  color: string;
  isPositive: boolean;
}

interface AnalyticsTabProps {
  KPIs: KPI[];
  activeVisitorData: any[];
  activeReferrerSites: any[];
  activeSearchKeywords: any[];
  setActiveTab: (tab: string) => void;
}

export default function AnalyticsTab({
  KPIs,
  activeVisitorData,
  activeReferrerSites,
  activeSearchKeywords,
  setActiveTab
}: AnalyticsTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {KPIs.map((c, i) => (
          <div key={i} style={{ padding: '28px', background: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: THEME.textMuted, fontWeight: 800 }}>{c.title}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <span style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1px' }}>{c.value}</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: c.color, backgroundColor: `${c.color}15`, padding: '4px 10px', borderRadius: '100px', marginBottom: '6px' }}>{c.percent}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>방문자 통계 (요약)</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, opacity: 0.8 }}>최근 30일</span>
          </div>
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
                  <linearGradient id="colorViewsDetail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: THEME.textMuted }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: THEME.textMuted }} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${THEME.border}`, fontWeight: 700 }} />
                <Area type="monotone" dataKey="views" name="페이지뷰" stroke={THEME.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorViewsDetail)" />
                <Area type="monotone" dataKey="visitors" name="방문자" stroke="#101828" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '32px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>기간별 분석</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, opacity: 0.8 }}>최근 30일</span>
            <div style={{ backgroundColor: '#F2F4F7', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>요약</div>
          </div>
          <button onClick={() => setActiveTab('analytics_period')} style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>상세 보기 &rarr;</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {['분석 일자', '페이지뷰 (PV)', '순방문자 (UV)', '회원가입/전환', '이탈률', '평균 세션 (초)'].map(h => (
                <th key={h} style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeVisitorData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '80px 0', textAlign: 'center', color: THEME.textMuted }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <HiOutlineChartBar size={42} style={{ opacity: 0.1, marginBottom: '16px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 700 }}>수집된 데이터가 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              activeVisitorData.map((row: any, i: number) => (
                <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                  <td style={{ padding: '20px 24px', fontWeight: 800, color: THEME.primary }}>{row.date?.length === 5 ? `2026-${row.date}` : row.date}</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{(row.views || 0).toLocaleString()}</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{(row.visitors || 0).toLocaleString()}</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{Math.round((row.visitors || 0) * 0.05)}건</td>
                  <td style={{ padding: '20px 24px', color: '#ef4444', fontWeight: 800 }}>{(row.bounceRate || 0).toFixed(1)}%</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{Math.round(row.avgSessionDuration || 0)}s</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>유입 경로 분석</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, opacity: 0.8 }}>최근 30일</span>
          </div>
          <button onClick={() => setActiveTab('analytics_sites')} style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>상세 보기 &rarr;</button>
        </div>
        <div style={{ position: 'relative', minHeight: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activeReferrerSites.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: THEME.textMuted }}>
              <HiOutlineChartBar size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
              <p style={{ fontWeight: 800, fontSize: '16px', opacity: 0.6 }}>수집된 데이터가 없습니다.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '48px', alignItems: 'center', width: '100%' }}>
              <div style={{ height: '360px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={activeReferrerSites.slice(0, 5).map(r => ({
                        name: r.site,
                        value: parseFloat(r.rate.replace('%', ''))
                      }))} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={100} 
                      outerRadius={140} 
                      paddingAngle={4} 
                      dataKey="value" 
                      stroke="none"
                    >
                      {activeReferrerSites.slice(0, 5).map((entry, index) => <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${THEME.border}`, fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeReferrerSites.slice(0, 5).map((item, idx) => (
                  <div key={item.site} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${FUNNEL_COLORS[idx % FUNNEL_COLORS.length]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <span style={{ fontSize: '16px', fontWeight: 900, color: THEME.textMain, display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.site}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: THEME.textMuted, marginTop: '4px', display: 'block' }}>최근 30일 {item.views.toLocaleString()}회</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '20px', fontWeight: 950, color: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }}>{item.rate}</div>
                      <div style={{ fontSize: '13px', color: THEME.textMuted, marginTop: '6px', fontWeight: 700 }}>이탈률: {item.bounceRate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>유입 사이트 분석</h3>
              <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, opacity: 0.8 }}>최근 30일</span>
            </div>
            <button onClick={() => setActiveTab('analytics_sites')} style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>상세 보기 &rarr;</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: `1px solid ${THEME.border}` }}>
              <tr>
                <th style={{ padding: '12px 0px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>도메인 (URL)</th>
                <th style={{ padding: '12px 0px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: THEME.textMuted }}>유입수 (비율)</th>
              </tr>
            </thead>
            <tbody>
              {activeReferrerSites.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ padding: '60px 0', textAlign: 'center', color: THEME.textMuted }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <HiOutlineChartBar size={32} style={{ opacity: 0.1, marginBottom: '12px' }} />
                      <p style={{ fontSize: '13px', fontWeight: 700 }}>수집된 데이터가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeReferrerSites.slice(0, 5).map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: i === 4 ? 'none' : `1px solid ${THEME.border}` }}>
                    <td style={{ padding: '16px 0', fontWeight: 800, fontSize: '13px', color: THEME.textMain }}>{r.site}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>{r.views} <span style={{ color: THEME.textMuted, fontSize: '12px' }}>({r.rate})</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', border: `1px solid ${THEME.border}`, padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>자주 찾는 검색어</h3>
              <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, opacity: 0.8 }}>최근 30일</span>
            </div>
            <button onClick={() => setActiveTab('analytics_keywords')} style={{ fontSize: '12px', fontWeight: 700, color: THEME.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>상세 보기 &rarr;</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSearchKeywords.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: THEME.textMuted }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineChartBar size={32} style={{ opacity: 0.1, marginBottom: '12px' }} />
                  <p style={{ fontSize: '13px', fontWeight: 700 }}>수집된 데이터가 없습니다.</p>
                </div>
              </div>
            ) : (
              activeSearchKeywords.slice(0, 5).map((kw: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: i === 0 ? '#EEF4FF' : '#f8fafc', borderRadius: '16px', border: i === 0 ? `1px solid ${THEME.primary}40` : `1px solid ${THEME.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: i === 0 ? THEME.primary : '#e2e8f0', color: i === 0 ? '#fff' : THEME.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>{i + 1}</div>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: i === 0 ? THEME.primary : THEME.textMain }}>{kw.keyword}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: THEME.textMain }}>{kw.clicks} 건</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
