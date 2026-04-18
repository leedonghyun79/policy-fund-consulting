"use client";

import { CSSProperties, FormEvent, useEffect, useRef, useState, useMemo } from "react";
import {
  FiShield,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiBarChart2,
  FiTruck,
} from "react-icons/fi";
import DaumPostcodeEmbed from 'react-daum-postcode';

const STATUS_DATA = [
  { bizName: "유진*텍", repName: "이*진", industry: "제조업", tag: "진행 완료" },
  { bizName: "지이*코리아", repName: "강*호", industry: "기타", tag: "진행 완료" },
  { bizName: "대흥*류", repName: "김*수", industry: "도·소매업", tag: "진행중" },
  { bizName: "영진*밀", repName: "박*호", industry: "제조업", tag: "진행 완료" },
  { bizName: "바른*푸드", repName: "윤*아", industry: "요식업", tag: "진행중" },
  { bizName: "씨앤*루션", repName: "정*우", industry: "서비스업", tag: "진행 완료" },
  { bizName: "한결*자인", repName: "서*하", industry: "기타", tag: "진행중" },
  { bizName: "미래*노베이션", repName: "임*준", industry: "제조업", tag: "진행 완료" },
  { bizName: "명성*린", repName: "오*승", industry: "기타", tag: "진행 완료" },
  { bizName: "태양*라", repName: "송*철", industry: "기타", tag: "진행 완료" },
  { bizName: "글로*정밀", repName: "전*민", industry: "제조업", tag: "진행 완료" },
];

const REGIONS = [
  "서울특별시", "부산광역시", "인천광역시", "대구광역시", "광주광역시", "대전광역시",
  "울산광역시", "세종특별자치시", "경기도", "강원도", "충청북도", "충청남도",
  "경상북도", "경상남도", "전라북도", "전라남도", "제주특별자치도",
];

const INDUSTRY_TO_CODE: Record<string, string> = {
  제조업: "MANUFACTURING",
  "도·소매업": "RETAIL",
  서비스업: "SERVICE",
  요식업: "FOOD",
  기타: "OTHER",
};

const CountUp = ({ end, decimals = 0, suffix = "" }: { end: number, decimals?: number, suffix?: string }) => {
  const [count, setCount] = useState(end);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 800; // Snappier 0.8 seconds animation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function: easeOutExpo
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCount(easing * end);

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        window.requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (elementRef.current) observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={elementRef}>
      <span className="brand-stat-number">
        {count.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })}
      </span>
      <span className="brand-stat-unit">{suffix}</span>
    </span>
  );
};

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("제조업");
  const [address, setAddress] = useState("");
  const [extraAddress, setExtraAddress] = useState("");
  const [showPostcode, setShowPostcode] = useState(false);
  const [activeTargetIndex, setActiveTargetIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [realLeads, setRealLeads] = useState<any[]>([]);
  const [rollingIndex, setRollingIndex] = useState(0);
  const [isRollingTransition, setIsRollingTransition] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecentLeads = async () => {
      try {
        const res = await fetch("/api/consult");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.leads)) {
            setRealLeads(data.leads);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leads", err);
      }
    };
    fetchRecentLeads();
  }, []);

  const mergedLeads = useMemo(() => {
    // Combine real leads with dummy data, keep total around a healthy number for the loop
    const combined = [...realLeads, ...STATUS_DATA];
    return combined.slice(0, 15); // Show top 15 (max 10 real + default dummy)
  }, [realLeads]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTargetIndex((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Rolling Status logic
  useEffect(() => {
    if (mergedLeads.length === 0) return;
    const interval = setInterval(() => {
      setRollingIndex((prev) => {
        if (prev >= mergedLeads.length) {
          // Snap back will happen in another effect
          return prev + 1;
        }
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [mergedLeads.length]);

  useEffect(() => {
    if (rollingIndex > mergedLeads.length) {
      const timeout = setTimeout(() => {
        setIsRollingTransition(false);
        setRollingIndex(0);
        setTimeout(() => setIsRollingTransition(true), 50);
      }, 650); // Match CSS transition
      return () => clearTimeout(timeout);
    }
  }, [rollingIndex, mergedLeads.length]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) {
      alert("개인정보처리방침 동의가 필요합니다.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const params = new URLSearchParams(window.location.search);

    const payload = {
      businessName: String(formData.get("businessName") || ""),
      representativeName: String(formData.get("representativeName") || ""),
      phoneMiddle: String(formData.get("phoneMiddle") || ""),
      phoneLast: String(formData.get("phoneLast") || ""),
      addressRoad: address,
      addressDetail: extraAddress,
      industry: INDUSTRY_TO_CODE[selectedIndustry],
      desiredAmountText: String(formData.get("desiredAmountText") || ""),
      agreed,
      consentVersion: "v1",
      referrer: document.referrer || null,
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmTerm: params.get("utm_term"),
      utmContent: params.get("utm_content"),
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "상담 신청 중 오류가 발생했습니다.");
      }

      form.reset();
      setAddress("");
      setExtraAddress("");
      setSelectedIndustry("제조업");
      setAgreed(false);
      setShowModal(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "상담 신청 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-wrapper">
      {/* Header */}
      <header className="header">
        <div className="logo">
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
        </div>
        <button className="header-cta-btn" onClick={scrollToForm}>
          무료 상담 신청
        </button>
      </header>

      {/* Hero Section (Reference Image Style) */}
      <section className="hero-image-style">
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="hero-inner-content reveal">
            <div className="hero-hook-badge">
              <FiCheckCircle className="icon" /> 성과가 없으면 비용도 받지 않습니다!
            </div>
            <h1 className="hero-main-title">
              정책자금, <span className="hero-point">제대로</span> 알고<br className="mo-only" /> <span className="hero-point">제대로</span> 받으세요.
            </h1>
            <p className="hero-desc">
              중소기업·소상공인을 위한 정부 정책자금<br />
              복잡한 절차는 줄이고, 승인 가능성은 높이세요.
            </p>



            <div className="hero-checkpoints">
              <div className="checkpoint-item">
                <FiCheck className="icon" /> 맞춤 자금 진단
              </div>
              <div className="checkpoint-item">
                <FiCheck className="icon" /> 서류 준비 컨설팅
              </div>
              <div className="checkpoint-item">
                <FiCheck className="icon" /> 비대면 상담 가능
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className={`scroll-indicator ${scrolled ? "hidden" : ""}`}>
            <div className="mouse">
              <div className="wheel"></div>
            </div>
            <span>SCROLL</span>
          </div>

        </div>
      </section>

      {/* Section 1-1: Brand Stats (Separated from Hero) */}
      <section className="section-padding reveal" style={{ background: '#fff' }}>
        <div className="container text-center">
          <p className="brand-stats-headcopy">
            <span style={{ color: '#363636' }}>매년 수조 원의 정책자금,</span><br />
            <span className="font-ria text-blue">비티씨는 그 기회를</span><br />
            <span style={{ color: '#363636' }}>현실로 만들어 왔습니다.</span>
          </p>
          <div className="brand-stats-grid">
            <div className="brand-stat-item">
              <b>
                <CountUp end={3.6} decimals={1} suffix="조" />
              </b>
              <span>연간 예산</span>
            </div>
            <div className="brand-stat-item">
              <b>
                <CountUp end={300} suffix="개+" />
              </b>
              <span>지원 프로그램</span>
            </div>
            <div className="brand-stat-item">
              <b>
                <CountUp end={1.5} decimals={1} suffix="만건" />
              </b>
              <span>누적 상담</span>
            </div>
          </div>

        </div>
      </section>

      {/* Section 2: Trust & Pain Point Focus (Text Only) */}
      <section className="section-padding bg-light text-center reveal">
        <div className="container">
          <h2 className="section-title">
            정보는 넘칩니다. <br />부족한 건 <span style={{ color: "var(--blue-primary)" }}>'전략'</span>입니다.<br />
          </h2>
          <div className="section-subtitle-large">
            <span className="hook-text">"서류 준비만 하다 기회를<br className="mo-only" /> 놓치진 않으셨나요?"</span>
            한 번의 탈락은 단순한 실패가 아니라<br />
            <span className="highlight-red">6개월 이상의 신청 제한</span>으로 이어질 수 있습니다.<br />
            비티씨는 수많은 거절 사례를 분석하여,<br />
            승인 가능성을 극대화하는 맞춤형 전략을 설계합니다.
          </div>

          <div style={{ marginTop: 80, paddingTop: 60 }}>
            <h3 className="section-title definition-title">
              <FiShield /> 정책자금, 제대로 알고 계신가요?
            </h3>
            <div className="definition-box" style={{ marginTop: 20 }}>
              <h4>정책자금이란?</h4>
              <p>
                정부가 중소기업·소상공인을 위해 지원하는 저금리 자금입니다.
              </p>
              <ul className="definition-list">
                <li>시중 금융권 대비 낮은 금리</li>
                <li>유연한 상환 조건</li>
                <li>업종·규모·사업 단계별 맞춤 신청 가능</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2-1: Policy Fund Types */}
      <section className="section-padding bg-image-section reveal">
        <div className="container text-center">
          <h2 className="section-title">정책자금 종류 안내</h2>

          <div className="card-grid-2">
            <div className="card-item card-startup">
              <div className="card-overlay"></div>
              <div className="card-content">
                <h4>창업 지원 자금</h4>
                <p>초기 창업기업을 위한 자금<br />(사업화 자금, 시설자금, 운전자금)</p>
              </div>
            </div>
            <div className="card-item card-operating">
              <div className="card-overlay"></div>
              <div className="card-content">
                <h4>운전자금</h4>
                <p>재료비, 인건비, 임대료 등<br />운영자금 지원</p>
              </div>
            </div>
            <div className="card-item card-facility">
              <div className="card-overlay"></div>
              <div className="card-content">
                <h4>시설자금</h4>
                <p>공장 설립, 기계 설비 도입,<br />사업장 확장</p>
              </div>
            </div>
            <div className="card-item card-tech">
              <div className="card-overlay"></div>
              <div className="card-content">
                <h4>기술·혁신 자금</h4>
                <p>R&D 기업, 특허 보유 기업<br />대상 지원</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Targeted (Forest Green) */}
      <section className="bg-forest text-center reveal">
        <div className="deco-wrap">
          <div className="deco-shape deco-1"></div>
          <div className="deco-shape deco-2"></div>
        </div>
        <div className="container">
          <h2 className="section-title white" style={{ marginBottom: 30 }}>
            <span style={{ color: '#93c5fd' }}>어떤 고민으로</span><br /> 여기까지 오셨나요?
          </h2>

          <div className="forest-desc">
            대표님의 고민, 맞춤 컨설팅으로 해결해드리겠습니다.<br />
            더 이상 혼자 고민하지 마세요.
          </div>

          <div className="card-grid-2">
            <div className={`card-item ${activeTargetIndex === 1 ? "active-loop" : ""}`}>
              <div className="card-icon" style={{ marginBottom: 15, fontSize: '2rem' }}>
                <FiAlertCircle />
              </div>
              <h4>긴급 운영자금</h4>
              <p>갑작스러운 유동성 확보가<br />시급한 소상공인</p>
            </div>
            <div className={`card-item ${activeTargetIndex === 2 ? "active-loop" : ""}`}>
              <div className="card-icon" style={{ marginBottom: 15, fontSize: '2rem' }}>
                <FiDollarSign />
              </div>
              <h4>고금리 대환 필요</h4>
              <p>연 7% 이상의 높은 이자를<br />감당하고 계신 기업</p>
            </div>
            <div className={`card-item ${activeTargetIndex === 3 ? "active-loop" : ""}`}>
              <div className="card-icon" style={{ marginBottom: 15, fontSize: '2rem' }}>
                <FiBarChart2 />
              </div>
              <h4>한도 부족 해결</h4>
              <p>이미 은행 대출을 가득 받아<br />대안이 필요할 때</p>
            </div>
            <div className={`card-item ${activeTargetIndex === 4 ? "active-loop" : ""}`}>
              <div className="card-icon" style={{ marginBottom: 15, fontSize: '2rem' }}>
                <FiTruck />
              </div>
              <h4>시설 투자 계획</h4>
              <p>공장 및 기계 설비 도입을<br />준비 중인 기업</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Live Status */}
      <section className="rolling-section text-center reveal">
        <div className="container">
          <h3 className="section-title">최근 상담 사례</h3>
          <div className="table-wrapper text-center">
            <div className="tr-head">
              <div>사업자</div>
              <div>대표자</div>
              <div>업종</div>
              <div>상태</div>
            </div>
            <div className="rolling-viewport">
              <div
                className={`rolling-list ${!isRollingTransition ? 'no-transition' : ''}`}
                style={{
                  transform: `translateY(-${rollingIndex * 55}px)`,
                }}
              >
                {[...mergedLeads, ...mergedLeads.slice(0, 4)].map((row, i) => (
                  <div className="tr-row" key={i}>
                    <div>{row.bizName}</div>
                    <div>{row.repName}</div>
                    <div>{row.industry}</div>
                    <div>
                      <span className={`tag-status ${row.tag?.includes("진행중") ? "ing" : "done"}`}>
                        {row.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Consultation Form */}
      <section className="form-box reveal" ref={formRef} id="consult">
        <div className="container text-center">
          <h2 className="section-title">
            <span style={{ color: "var(--blue-primary)" }}>성과가 없으면</span><br />
            비용도 받지 않습니다!
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 40 }}>먼저 편하게 말씀해 주세요.<br className="mo-only" /> 방향은 저희가 잡아드리겠습니다.</p>

          <form onSubmit={handleSubmit} autoComplete="off" style={{ textAlign: "left", maxWidth: 500, margin: "0 auto" }}>
            <div className="form-group">
              <label className="form-label">사업자명 *</label>
              <input className="form-input" name="businessName" type="text" placeholder="회사명 입력" required autoComplete="off" />
            </div>
            <div className="form-group">
              <label className="form-label">대표자명 *</label>
              <input className="form-input" name="representativeName" type="text" placeholder="대표자성함 입력" required autoComplete="off" />
            </div>
            <div className="form-group">
              <label className="form-label">휴대폰번호 *</label>
              <div className="form-row" style={{ alignItems: 'center' }}>
                <input className="form-input" type="text" value="010" readOnly style={{ width: '85px', textAlign: 'center', backgroundColor: '#f8fafc' }} />
                <span style={{ color: '#999' }}>-</span>
                <input
                  className="form-input"
                  name="phoneMiddle"
                  type="number"
                  placeholder="0000"
                  required
                  autoComplete="off"
                  style={{ textAlign: 'center' }}
                  onInput={(e: any) => {
                    if (e.target.value.length > 4) e.target.value = e.target.value.slice(0, 4);
                  }}
                />
                <span style={{ color: '#999' }}>-</span>
                <input
                  className="form-input"
                  name="phoneLast"
                  type="number"
                  placeholder="0000"
                  required
                  autoComplete="off"
                  style={{ textAlign: 'center' }}
                  onInput={(e: any) => {
                    if (e.target.value.length > 4) e.target.value = e.target.value.slice(0, 4);
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">지역(주소) *</label>
              
              {/* PC Version: Postcode Search */}
              <div className="pc-only">
                <div className="form-row" style={{ marginBottom: 8 }}>
                  <input
                    className="form-input"
                    type="text"
                    value={address}
                    placeholder="주소 찾기를 클릭하세요"
                    readOnly
                    onClick={() => setShowPostcode(true)}
                    required
                  />
                  <button type="button" className="btn-search" onClick={() => setShowPostcode(true)}>주소 찾기</button>
                </div>
              </div>

              {/* Mobile Version: Simple Dropdown */}
              <div className="mo-only" style={{ marginBottom: 8 }}>
                <select 
                  className="form-input" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23666\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 15px center', backgroundSize: '18px' }}
                  required
                >
                  <option value="">지역 선택</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <input
                className="form-input"
                type="text"
                value={extraAddress}
                onChange={(e) => setExtraAddress(e.target.value)}
                placeholder="상세 주소를 입력해주세요"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label">업종 *</label>
              <div className="industry-grid">
                {["제조업", "도·소매업", "서비스업", "요식업", "기타"].map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    className={`industry-btn ${selectedIndustry === industry ? "active" : ""}`}
                    onClick={() => setSelectedIndustry(industry)}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">희망 자금 규모 (선택)</label>
              <input className="form-input" name="desiredAmountText" type="text" placeholder="예: 5,000만원" autoComplete="off" />
            </div>

            <div style={{ marginTop: 20, fontSize: "0.85rem", color: "#666" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                개인정보처리방침 동의
                <button type="button" onClick={() => setShowTermsModal(true)} style={{ color: "var(--blue-primary)", textDecoration: "underline", background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}>
                  [약관보기]
                </button>
              </label>
            </div>

            <div style={{ marginTop: 40 }} className="text-center">
              <button type="submit" className="btn-vibrant" disabled={submitting}>
                {submitting ? "접수 완료 중..." : "무료 상담 신청하기"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: "-1px", padding: "60px 20px", background: "#eef3ff", fontSize: "0.85rem", color: "var(--text-muted)", wordBreak: "keep-all" }} className="text-center">
        <div className="container" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#1E40AF" />
              <path d="M9 7H16.5C18.9853 7 21 9.01472 21 11.5C21 13.9853 18.9853 16 16.5 16H9V7Z" fill="white" />
              <path d="M9 16H18.5C20.9853 16 23 18.0147 23 20.5C23 22.9853 20.9853 25 18.5 25H9V16Z" fill="white" />
              <path d="M11 11H15V13H11V11Z" fill="#1E40AF" />
              <path d="M11 19H17V21H11V19Z" fill="#1E40AF" />
              <rect x="23" y="5" width="4" height="12" rx="1" fill="#3B82F6" />
              <path d="M21 12L25 4L29 12H21Z" fill="#60A5FA" />
            </svg>
            <p style={{ fontWeight: 800, color: "var(--text-dark)", marginBottom: 0, fontSize: "1rem" }}>주식회사 비티씨</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <p>상호명: 주식회사 비티씨 | 사업자번호: 452-81-03847</p>
            <p>대표전화: 010-4148-0242</p>
            <p>경기도 부천시 원미구 옥산로7, 상가 a동 116호</p>
          </div>
          <p style={{ marginTop: 20, opacity: 0.6, fontSize: "0.75rem" }}>© 2026 주식회사 비티씨. All rights reserved.</p>
        </div>
      </footer>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: 320 }}>
            <div className="modal-icon"><FiCheckCircle /></div>
            <h3>신청 완료!</h3>
            <p style={{ fontSize: 15 }}>24시간 이내에 전문가가 연락드립니다.</p>
            <button className="header-cta-btn" style={{ width: "100%", marginTop: 20 }} onClick={() => setShowModal(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
      {showPostcode && (
        <div className="modal-overlay" onClick={() => setShowPostcode(false)}>
          <div className="modal-content-address" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>주소 찾기</h3>
              <button className="btn-close" onClick={() => setShowPostcode(false)}>&times;</button>
            </div>
            <DaumPostcodeEmbed
              onComplete={(data: any) => {
                let fullAddress = data.address;
                let extraAddressPart = '';

                if (data.addressType === 'R') {
                  if (data.bname !== '') {
                    extraAddressPart += data.bname;
                  }
                  if (data.buildingName !== '') {
                    extraAddressPart += (extraAddressPart !== '' ? `, ${data.buildingName}` : data.buildingName);
                  }
                  fullAddress += (extraAddressPart !== '' ? ` (${extraAddressPart})` : '');
                }

                setAddress(fullAddress);
                setShowPostcode(false);
              }}
            />
          </div>
        </div>
      )}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" style={{ maxWidth: 600, width: "95%", textAlign: "left", maxHeight: "85vh", overflowY: "auto", padding: "30px 20px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 15 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>이용약관 및 개인정보처리방침</h2>
              <button onClick={() => setShowTermsModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#666" }}>&times;</button>
            </div>

            <div style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.8 }}>

              {/* 이용약관 */}
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>이용약관</h3>

              <p><strong>제 1 장 총칙</strong></p>
              <p><strong>제 1 조 (목적)</strong> 이 약관은 이 페이지의 이용에 관한 조건 및 절차와 기타 필요한 사항을 규정하는 것을 목적으로 합니다.</p>
              <p><strong>제 2 조 (용어의 정의)</strong> 이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
              <p><strong>제 3 조 (약관의 효력과 변경)</strong></p>
              <p><strong>제 4 조 (약관외 준칙)</strong> 이 약관에 명시되지 않은 사항이 관계 법령에 규정되어 있을 경우 그 규정에 따르며, 그렇지 않은 경우에는 일반적인 관례에 따릅니다.</p>
              <p><strong>제 5 조 (적용범위)</strong></p>

              <p style={{ marginTop: 12 }}><strong>제 2 장 서비스 이용 계약</strong></p>
              <p><strong>제 6 조 (이용계약의 성립)</strong></p>
              <p><strong>제 7 조 (이용계약 승인의 유보)</strong></p>

              <p style={{ marginTop: 12 }}><strong>제 3 장 서비스의 이용</strong></p>
              <p><strong>제 8 조 (서비스 이용시간)</strong></p>
              <p><strong>제 9 조 (이용계약의 해지 및 서비스 이용의 제한)</strong></p>
              <p><strong>제 10 조 (이용자 게시물의 삭제 이용 제한)</strong></p>
              <p><strong>제 11 조 (서비스의 중지 및 제한)</strong></p>

              <p style={{ marginTop: 12 }}><strong>제 4 장 의무</strong></p>
              <p><strong>제 12 조 (시스템의 의무)</strong></p>
              <p><strong>제 12조의 1 (개인정보보호)</strong></p>
              <p><strong>제 13 조 (이용자의 의무)</strong></p>
              <p><strong>제 13 조의 1 (입력정보등)</strong></p>

              <p style={{ marginTop: 12 }}><strong>제 5 장 저작권 및 면책</strong></p>
              <p><strong>제 14 조 (게재된 자료에 대한 권리)</strong></p>
              <p><strong>제 15 조 (면책)</strong></p>

              <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #eee" }} />

              {/* 개인정보보호정책 */}
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>개인정보보호정책</h3>

              <p><strong>가. 수집하는 개인정보 항목 및 수집방법</strong></p>
              <p>- 사업자명, 대표자명, 휴대폰번호, 지역(주소), 업종, 희망 자금 규모</p>

              <p style={{ marginTop: 10 }}><strong>나. 개인정보의 수집 및 이용목적</strong></p>
              <p>수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
              <p>- 담당자들의 전화 상담</p>

              <p style={{ marginTop: 10 }}><strong>다. 수집한 개인정보의 보유 및 이용기간</strong></p>
              <p>- 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>

              <p style={{ marginTop: 10 }}><strong>라. 동의를 거부할 경우 신청정보가 제공되지 않습니다.</strong></p>

              <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #eee" }} />

              {/* 개인정보 제3자 제공 */}
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>개인정보 제3자 제공 정책</h3>
              <p>회사는 제3자 서비스와의 연결을 위해서 아래와 같이 이용자의 개인정보를 제공하고 있습니다.</p>
              <p style={{ marginTop: 8 }}>1. 제공하는 개인정보 항목 : 성함, 연락처</p>
              <p style={{ marginTop: 8 }}>2. 제공받는 자의 개인정보 이용목적</p>
              <p>- 서비스 제공에 관한 이행 및 서비스 제공에 따른 콘텐츠 제공</p>
              <p>- 고객을 대상으로 제품 상담 응대 및 판매 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 상담, 요금정산, 구매 및 요금결제, 구매내역, 물품배송 또는 청구지 등 발송</p>
              <p>- 마케팅 및 광고에 활용 : 신규 서비스(제품) 개발 및 특화, 이벤트 등 광고성 정보 전달, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</p>
              <p style={{ marginTop: 8 }}>3. 제공하는 개인정보 항목 : 이름, 나이, 연락처, 주소</p>
              <p style={{ marginTop: 8 }}>4. 제공받는 자의 보유 이용기간 : 3년</p>
              <p style={{ marginTop: 8 }}>5. 고객은 제3자 개인정보 제공에 대하여 동의를 거부할 권리가 있으며 동의를 거부할 경우 서비스 제공 및 서비스 제공에 따른 콘텐츠 제공에 제한이 있을 수 있습니다.</p>

              <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #eee" }} />

              {/* 개인정보의 파기 */}
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>개인정보의 파기</h3>
              <p>1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
              <p style={{ marginTop: 8 }}>2. 정보주체로부터 동의 받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관 장소를 달리하여 보존합니다.</p>
              <p style={{ marginTop: 8 }}>3. 개인정보 파기의 절차 및 방법은 다음과 같습니다.</p>
              <p style={{ marginTop: 6 }}>1) 파기절차 : 회사는 파기 사유가 발생한 개인정보를 선정하고, 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</p>
              <p style={{ marginTop: 6 }}>2) 파기방법 : 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</p>

              <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #eee" }} />

              {/* 기술적·관리적 보호 대책 */}
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>개인정보 보호를 위한 기술적·관리적 보호 대책</h3>
              <p>회사는 이용자들의 개인정보 보호를 위해 다음과 같은 기술적, 관리적 대책을 강구하고 있습니다.</p>
              <p style={{ marginTop: 8 }}>1. 개인정보 암호화 : 이용자의 비밀번호 등 중요 정보는 암호화되어 저장 및 관리되고 있으며, 개인정보의 확인 및 변경은 본인에 의해서만 가능합니다.</p>
              <p style={{ marginTop: 8 }}>2. 해킹 등에 대비한 대책 : 회사는 해킹이나 악성코드에 의하여 이용자들의 개인정보가 유출·훼손되는 것을 방지하기 위하여 침입차단 시스템을 24시간 운영하여 외부로부터의 무단접근을 통제하고 있으며, 백신 프로그램을 설치하여 시스템이 악성코드나 바이러스에 감염되지 않도록 노력하고 있습니다.</p>
              <p style={{ marginTop: 8 }}>3. 개인정보 취급 직원의 최소화 및 교육 : 개인정보를 처리하는 직원을 최소한으로 관리하며, 개인정보취급자에 대한 정기 교육, 전사 임직원에 대한 수시 교육을 통해 개인정보의 중요성을 인식하고 있습니다.</p>
              <p style={{ marginTop: 8 }}>4. 개인정보 보호전담 인력의 운영 : 개인정보 보호를 위해 개인정보 보호전담 인력을 운영하고 있으며, 개인정보 처리방침의 이행사항 및 개인정보 처리자의 준수 여부를 확인하여 문제가 발견될 경우 즉시 수정하고 바로 잡을 수 있도록 노력하고 있습니다.</p>
              <p style={{ marginTop: 8 }}>5. 위와 같은 노력 이외에 이용자 스스로도 제3자에게 개인정보가 노출되지 않도록 주의하셔야 합니다.</p>
              <p style={{ marginTop: 8 }}>6. 비인가자에 대한 출입 통제 : 개인정보를 보관하고 있는 물리적 보관 장소를 별도로 두고 이에 대해 출입통제 절차를 수립, 운영하고 있습니다.</p>

              <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #eee" }} />

              {/* 쿠키 안내 */}
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>쿠키(Cookie) 사용 안내</h3>
              <p>회사는 서비스 품질 개선 및 광고 성과 분석을 위해 쿠키를 사용합니다.</p>
              <p style={{ marginTop: 8 }}><strong>수집 도구 및 목적</strong></p>
              <p>- Google Analytics: 방문 통계 분석 및 광고 성과 측정 (쿠키명: _ga, _gid, _gat / 보유 최대 2년)</p>
              <p style={{ marginTop: 8 }}><strong>쿠키 관련 안내</strong></p>
              <p>쿠키는 이용자의 편의 향상 및 서비스 개선 목적으로만 활용됩니다. 브라우저 설정에서 쿠키 저장 방식을 조정할 수 있으나, 변경 시 일부 서비스가 정상적으로 동작하지 않을 수 있습니다.</p>
            </div>

            <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowTermsModal(false)} style={{ background: "var(--blue-primary)", color: "#fff", border: "none", padding: "10px 25px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
