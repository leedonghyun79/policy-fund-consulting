import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 주식회사 비티씨",
  description:
    "주식회사 비티씨의 개인정보처리방침입니다. 수집하는 개인정보 항목, 이용목적, 보유기간, 쿠키 사용 등에 관한 내용을 안내합니다.",
  robots: "noindex, follow",
};

export default function PrivacyPage() {
  return (
    <main className="page-wrapper">
      {/* Header */}
      <header className="header">
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E40AF" />
            <path d="M9 7H16.5C18.9853 7 21 9.01472 21 11.5C21 13.9853 18.9853 16 16.5 16H9V7Z" fill="white" />
            <path d="M9 16H18.5C20.9853 16 23 18.0147 23 20.5C23 22.9853 20.9853 25 18.5 25H9V16Z" fill="white" />
            <path d="M11 11H15V13H11V11Z" fill="#1E40AF" />
            <path d="M11 19H17V21H11V19Z" fill="#1E40AF" />
            <rect x="23" y="5" width="4" height="12" rx="1" fill="#3B82F6" />
            <path d="M21 12L25 4L29 12H21Z" fill="#60A5FA" />
          </svg>
          <span>주식회사 비티씨</span>
        </Link>
        <Link href="/" className="header-cta-btn" style={{ textDecoration: "none", display: "inline-block", lineHeight: "normal" }}>
          홈으로
        </Link>
      </header>

      {/* Privacy Content */}
      <section style={{ padding: "60px 20px 100px" }}>
        <div className="container" style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* 페이지 헤더 */}
          <div style={{ marginBottom: 48, borderBottom: "2px solid var(--blue-primary)", paddingBottom: 24 }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>
              최종 수정일: 2026년 4월 7일
            </p>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-dark)", lineHeight: 1.3 }}>
              개인정보처리방침
            </h1>
            <p style={{ marginTop: 16, color: "var(--text-muted)", lineHeight: 1.8 }}>
              주식회사 비티씨(이하 "회사")는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관련 법령에 따라 아래와 같이 개인정보처리방침을 수립·공개합니다.
            </p>
          </div>

          {/* 목차 */}
          <nav style={{ background: "#f8fafc", borderRadius: 12, padding: "20px 24px", marginBottom: 48, border: "1px solid var(--border)" }}>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 12, color: "var(--text-dark)" }}>목차</p>
            <ol style={{ paddingLeft: 20, color: "var(--blue-primary)", fontSize: "0.9rem", lineHeight: 2 }}>
              <li><a href="#article1" style={{ color: "var(--blue-primary)" }}>수집하는 개인정보 항목 및 수집방법</a></li>
              <li><a href="#article2" style={{ color: "var(--blue-primary)" }}>개인정보의 수집 및 이용목적</a></li>
              <li><a href="#article3" style={{ color: "var(--blue-primary)" }}>개인정보의 보유 및 이용기간</a></li>
              <li><a href="#article4" style={{ color: "var(--blue-primary)" }}>개인정보의 제3자 제공</a></li>
              <li><a href="#article5" style={{ color: "var(--blue-primary)" }}>개인정보의 파기</a></li>
              <li><a href="#article6" style={{ color: "var(--blue-primary)" }}>쿠키(Cookie) 사용 안내</a></li>
              <li><a href="#article7" style={{ color: "var(--blue-primary)" }}>기술적·관리적 보호 대책</a></li>
              <li><a href="#article8" style={{ color: "var(--blue-primary)" }}>이용자의 권리 및 행사방법</a></li>
              <li><a href="#article9" style={{ color: "var(--blue-primary)" }}>개인정보 보호책임자</a></li>
            </ol>
          </nav>

          {/* 본문 */}
          <div style={{ lineHeight: 1.85, color: "var(--text-body)", fontSize: "0.95rem" }}>

            {/* 제1조 */}
            <article id="article1" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제1조 수집하는 개인정보 항목 및 수집방법</h2>
              <p style={{ marginBottom: 12 }}>회사는 상담 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>구분</th>
                    <th style={thStyle}>수집 항목</th>
                    <th style={thStyle}>수집 방법</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdStyle}>필수</td>
                    <td style={tdStyle}>사업자명, 대표자명, 휴대폰번호, 지역(주소), 업종</td>
                    <td style={tdStyle}>홈페이지 상담 신청 폼</td>
                  </tr>
                  <tr>
                    <td style={tdStyle}>선택</td>
                    <td style={tdStyle}>희망 자금 규모</td>
                    <td style={tdStyle}>홈페이지 상담 신청 폼</td>
                  </tr>
                  <tr>
                    <td style={tdStyle}>자동</td>
                    <td style={tdStyle}>접속 IP, 방문 경로(UTM), 쿠키</td>
                    <td style={tdStyle}>서비스 이용 과정에서 자동 수집</td>
                  </tr>
                </tbody>
              </table>
            </article>

            {/* 제2조 */}
            <article id="article2" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제2조 개인정보의 수집 및 이용목적</h2>
              <p>수집한 개인정보는 다음의 목적을 위해 이용합니다.</p>
              <ul style={listStyle}>
                <li>정책자금 컨설팅 상담 안내 및 전화 연락</li>
                <li>서비스 제공 및 맞춤 정보 발송</li>
                <li>서비스 이용 통계 분석 및 서비스 개선</li>
                <li>마케팅·광고 성과 분석 (광고 유입 경로 파악 등)</li>
              </ul>
            </article>

            {/* 제3조 */}
            <article id="article3" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제3조 개인정보의 보유 및 이용기간</h2>
              <p style={{ marginBottom: 12 }}>
                원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 지체 없이 해당 정보를 파기합니다.
                단, 관계법령에 의해 보존이 필요한 경우 아래 기간 동안 보존합니다.
              </p>
              <ul style={listStyle}>
                <li>계약 또는 청약 철회에 관한 기록: 5년 (전자상거래법)</li>
                <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)</li>
                <li>상담 이력: 상담 완료 후 3년</li>
              </ul>
            </article>

            {/* 제4조 */}
            <article id="article4" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제4조 개인정보의 제3자 제공</h2>
              <p style={{ marginBottom: 12 }}>회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보를 제공합니다.</p>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>제공받는 자</th>
                    <th style={thStyle}>제공 목적</th>
                    <th style={thStyle}>제공 항목</th>
                    <th style={thStyle}>보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdStyle}>제휴 컨설턴트 및 전문 대행 기관</td>
                    <td style={tdStyle}>정책자금 상담 및 서비스 제공</td>
                    <td style={tdStyle}>사업자명, 대표자명, 연락처, 지역, 업종</td>
                    <td style={tdStyle}>목적 달성 시까지 (최대 3년)</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: "0.875rem" }}>
                ※ 이용자는 제3자 제공에 대한 동의를 거부할 권리가 있으나, 거부 시 상담 서비스 이용이 제한될 수 있습니다.
              </p>
            </article>

            {/* 제5조 */}
            <article id="article5" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제5조 개인정보의 파기</h2>
              <ul style={listStyle}>
                <li>보유기간 경과 또는 처리목적 달성 시 지체 없이 파기합니다.</li>
                <li>전자적 파일: 복구 불가능한 기술적 방법으로 삭제합니다.</li>
                <li>출력물·서면: 분쇄기를 이용해 파기합니다.</li>
              </ul>
            </article>

            {/* 제6조: 쿠키 */}
            <article id="article6" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제6조 쿠키(Cookie) 사용 안내</h2>
              <div style={{ background: "#eff6ff", borderRadius: 10, padding: "20px 24px", border: "1px solid #bfdbfe", marginBottom: 16 }}>
                <p style={{ fontWeight: 700, color: "#1e40af", marginBottom: 8 }}>📌 쿠키란?</p>
                <p>
                  쿠키는 웹사이트를 방문할 때 브라우저에 저장되는 소규모 데이터 파일입니다.
                  회사는 이를 통해 서비스 이용 현황을 분석하고 품질을 개선합니다.
                </p>
              </div>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>수집 목적 및 항목</p>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>도구</th>
                    <th style={thStyle}>쿠키명(예시)</th>
                    <th style={thStyle}>목적</th>
                    <th style={thStyle}>보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdStyle}>Google Analytics</td>
                    <td style={tdStyle}>_ga, _gid, _gat</td>
                    <td style={tdStyle}>방문 통계 분석, 광고 성과 측정</td>
                    <td style={tdStyle}>최대 2년</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: 16, fontWeight: 700, marginBottom: 8 }}>쿠키 수집 거부 방법</p>
              <p style={{ marginBottom: 8 }}>
                이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
                단, 거부 시 일부 서비스 이용이 제한될 수 있습니다.
              </p>
              <ul style={listStyle}>
                <li>Chrome: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</li>
                <li>Edge: 설정 &gt; 쿠키 및 사이트 사용 권한</li>
                <li>Safari: 환경설정 &gt; 개인정보 보호 &gt; 쿠키 차단</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                Google Analytics 데이터 수집 거부:{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue-primary)" }}>
                  Google 애널리틱스 차단 브라우저 부가기능 설치
                </a>
              </p>
            </article>

            {/* 제7조 */}
            <article id="article7" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제7조 기술적·관리적 보호 대책</h2>
              <ul style={listStyle}>
                <li>암호화 저장: 개인정보는 암호화하여 안전하게 보관합니다.</li>
                <li>접근 통제: 개인정보를 취급하는 직원을 최소화하고 정기적으로 교육합니다.</li>
                <li>해킹 대비: 침입차단 시스템 운영 및 보안 취약점 점검을 실시합니다.</li>
                <li>백신 프로그램: 최신 버전 유지 및 정기적 점검을 수행합니다.</li>
              </ul>
            </article>

            {/* 제8조 */}
            <article id="article8" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제8조 이용자의 권리 및 행사방법</h2>
              <p style={{ marginBottom: 12 }}>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
              <ul style={listStyle}>
                <li>개인정보 열람 요청</li>
                <li>오류 정정 또는 삭제 요청</li>
                <li>처리 정지 요청</li>
                <li>동의 철회 요청</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                위 권리 행사는 아래 개인정보 보호책임자에게 이메일 또는 전화로 요청하시면 지체 없이 처리하겠습니다.
              </p>
            </article>

            {/* 제9조 */}
            <article id="article9" style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>제9조 개인정보 보호책임자</h2>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "20px 24px", border: "1px solid var(--border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "8px 0", fontWeight: 700, width: 140, color: "var(--text-dark)" }}>회사명</td>
                      <td style={{ padding: "8px 0" }}>주식회사 비티씨</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0", fontWeight: 700, color: "var(--text-dark)" }}>대표전화</td>
                      <td style={{ padding: "8px 0" }}>1555-0756</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0", fontWeight: 700, color: "var(--text-dark)" }}>주소</td>
                      <td style={{ padding: "8px 0" }}>경기도 부천시 원미구 옥산로7, 상가 a동 116호</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0", fontWeight: 700, color: "var(--text-dark)" }}>사업자번호</td>
                      <td style={{ padding: "8px 0" }}>452-81-03847</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: "0.875rem" }}>
                개인정보 침해에 관한 신고나 상담은 개인정보 침해신고센터(privacy.kisa.or.kr)에도 문의하실 수 있습니다.
              </p>
            </article>

            {/* 부칙 */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <p>본 개인정보처리방침은 <strong>2026년 4월 7일</strong>부터 적용됩니다.</p>
              <p style={{ marginTop: 8 }}>방침 변경 시 변경 사항을 웹사이트에 공지합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 20px", background: "#eef3ff", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 600, margin: "0 auto" }}>
          <p>© 2026 주식회사 비티씨. All rights reserved.</p>
          <p style={{ marginTop: 8 }}>
            <Link href="/" style={{ color: "var(--blue-primary)" }}>홈으로 돌아가기</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

// 스타일 상수
const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.15rem",
  fontWeight: 800,
  color: "var(--text-dark)",
  marginBottom: 16,
  paddingBottom: 10,
  borderBottom: "2px solid var(--blue-light)",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
  marginTop: 8,
};

const thStyle: React.CSSProperties = {
  background: "#e8f0fe",
  padding: "10px 14px",
  textAlign: "left",
  fontWeight: 700,
  color: "#1e40af",
  border: "1px solid #c7d7fb",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #e2e8f0",
  verticalAlign: "top",
};

const listStyle: React.CSSProperties = {
  paddingLeft: 24,
  marginTop: 8,
  lineHeight: 2,
};
