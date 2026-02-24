"use client";

import { FormEvent, useEffect, useRef, useState, useMemo } from "react";
import {
  FiShield,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
import DaumPostcodeEmbed from 'react-daum-postcode';

const STATUS_DATA = [
  { name: "김재*", biz: "법인사업자", product: "운전·시설자금", tag: "상담 진행중" },
  { name: "이정*", biz: "법인사업자", product: "고용지원금", tag: "상담 진행중" },
  { name: "강하*", biz: "개인사업자", product: "고용지원금", tag: "신청 완료" },
  { name: "장우*", biz: "법인사업자", product: "운전·시설자금", tag: "상담 진행중" },
  { name: "나정*", biz: "개인사업자", product: "고용지원금", tag: "신청 완료" },
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

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("제조업");
  const [address, setAddress] = useState("");
  const [extraAddress, setExtraAddress] = useState("");
  const [showPostcode, setShowPostcode] = useState(false);
  const [activeTargetIndex, setActiveTargetIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [realLeads, setRealLeads] = useState<any[]>([]);
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
    <div className="page-wrapper">
      {/* Header */}
      <header className="header">
        <div className="logo">주식회사 비티씨</div>
        <button className="header-cta-btn" onClick={scrollToForm}>
          무료 상담 신청
        </button>
      </header>

      {/* Hero Section (Reference Image Style) */}
      <section className="hero-image-style">
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="hero-inner-content reveal">
            <h1 className="hero-main-title">
              정책자금, <span className="hero-point">제대로</span> 알고 <br /> <span className="hero-point">제대로</span> 받으세요.
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
          <p className="brand-stats-headcopy" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '40px', wordBreak: 'keep-all', lineHeight: 1.4 }}>
            정부가 매년 준비하는 수조 원의 정책자금,<br />
            <span style={{ color: 'var(--blue-primary)' }}>비티씨는 그 기회를 현실로 만들어 왔습니다.</span>
          </p>
          <div className="brand-stats-grid">
            <div className="brand-stat-item">
              <b>3.6조</b>
              <span>연간 예산</span>
            </div>
            <div className="brand-stat-item">
              <b>300개+</b>
              <span>지원 프로그램</span>
            </div>
            <div className="brand-stat-item">
              <b>1.5만건</b>
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
          <div className="section-subtitle" style={{ maxWidth: 800, margin: '30px auto 0', lineHeight: 1.4, fontSize: '18px', color: 'var(--text-body)' }}>
            "서류 준비만 하다 기회를 놓치진 않으셨나요?"<br />
            한 번의 탈락은 단순한 실패가 아니라<br />
            <b>6개월 이상의 신청 제한</b>으로 이어질 수 있습니다.<br />
            비티씨는 수많은 거절 사례를 분석하여,<br />
            승인 가능성을 극대화하는 맞춤형 전략을 설계합니다.
          </div>

          <div style={{ marginTop: 80, paddingTop: 60 }}>
            <h3 className="section-title" style={{ fontSize: '2rem', fontWeight: 500, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <FiShield style={{ color: 'var(--blue-primary)' }} /> 잠깐! 여기서 정책자금이란?
            </h3>
            <div className="definition-box" style={{ marginTop: 20 }}>
              <h4>정책자금이란?</h4>
              <p>
                정책자금은 정부 및 공공기관이 중소기업과 소상공인의<br />
                경영 안정과 성장을 위해 지원하는 저금리 자금입니다.<br />
                시중 금융권 대비 낮은 금리와 유연한 상환 조건이 적용되며,<br />
                업종·규모·사업 단계에 따라 맞춤 신청이 가능합니다.
              </p>
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
                <h4>① 창업 지원 자금</h4>
                <p>초기 창업기업을 위한 자금<br />(사업화 자금, 시설자금, 운전자금)</p>
              </div>
            </div>
            <div className="card-item card-operating">
              <div className="card-overlay"></div>
              <div className="card-content">
                <h4>② 운전자금</h4>
                <p>재료비, 인건비, 임대료 등<br />운영자금 지원</p>
              </div>
            </div>
            <div className="card-item card-facility">
              <div className="card-overlay"></div>
              <div className="card-content">
                <h4>③ 시설자금</h4>
                <p>공장 설립, 기계 설비 도입,<br />사업장 확장</p>
              </div>
            </div>
            <div className="card-item card-tech">
              <div className="card-overlay"></div>
              <div className="card-content">
                <h4>④ 기술·혁신 자금</h4>
                <p>R&D 기업, 특허 보유 기업<br />대상 지원</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Targeted (Forest Green) */}
      <section className="section-padding bg-forest text-center reveal">
        <div className="deco-wrap">
          <div className="deco-shape deco-1"></div>
          <div className="deco-shape deco-2"></div>
        </div>
        <div className="container">
          <h2 className="section-title white" style={{ marginBottom: 30 }}>
            <span style={{ color: '#93c5fd' }}>어떤 고민</span> 때문에<br />
            여기까지 보고 계신걸까요?
          </h2>

          <div style={{ marginBottom: 40, color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            대표님의 고민, 맞춤 컨설팅으로 해결해드리겠습니다.<br />
            제발 더 이상 혼자 고민하지 마세요.<br />
            <span style={{ color: '#ff9033', fontWeight: 700 }}>10초만 투자해서 지금 바로 무료 상담 신청하세요</span>
          </div>

          <button onClick={scrollToForm} className="btn-vibrant" style={{ marginBottom: 60, padding: '15px 35px', fontSize: '1.1rem' }}>
            무료 상담 신청
          </button>

          <div className="card-grid-2">
            <div className={`card-item ${activeTargetIndex === 1 ? "active-loop" : ""}`}>
              <h4>고금리 대환 필요</h4>
              <p>연 7% 이상의 높은 이자를 감당하고 계신 기업</p>
            </div>
            <div className={`card-item ${activeTargetIndex === 2 ? "active-loop" : ""}`}>
              <h4>긴급 운영자금</h4>
              <p>갑작스러운 유동성 확보가 시급한 소상공인</p>
            </div>
            <div className={`card-item ${activeTargetIndex === 3 ? "active-loop" : ""}`}>
              <h4>시설 투자 계획</h4>
              <p>공장 및 기계 설비 도입을 준비 중인 기업</p>
            </div>
            <div className={`card-item ${activeTargetIndex === 4 ? "active-loop" : ""}`}>
              <h4>한도 부족 해결</h4>
              <p>이미 은행 대출을 가득 받아 대안이 필요할 때</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Live Status */}
      <section className="rolling-section text-center reveal">
        <div className="container">
          <h3 className="section-title" style={{ fontSize: "48px" }}>실시간 상담 신청 현황</h3>
          <div className="table-wrapper text-center">
            <div className="tr-head">
              <div>성함</div>
              <div>사업장</div>
              <div>신청항목</div>
              <div>상태</div>
            </div>
            <div className="rolling-viewport">
              <div className="rolling-list">
                {[...mergedLeads, ...mergedLeads, ...mergedLeads].map((row, i) => (
                  <div className="tr-row" key={i}>
                    <div>{row.name}</div>
                    <div>{row.biz}</div>
                    <div>{row.product}</div>
                    <div>
                      <span className={`tag-status ${row.tag === "상담 진행중" ? "ing" : "done"}`}>
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
          <p className="section-subtitle" style={{ marginBottom: 40 }}>먼저 편하게 말씀해 주세요. 방향은 저희가 잡아드리겠습니다.</p>

          <form onSubmit={handleSubmit} style={{ textAlign: "left", maxWidth: 500, margin: "0 auto" }}>
            <div className="form-group">
              <label className="form-label">사업자명 *</label>
              <input className="form-input" name="businessName" type="text" placeholder="회사명 입력" required />
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
                  style={{ textAlign: 'center' }}
                  onInput={(e: any) => {
                    if (e.target.value.length > 4) e.target.value = e.target.value.slice(0, 4);
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">지역(주소) *</label>
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
              <input
                className="form-input"
                type="text"
                value={extraAddress}
                onChange={(e) => setExtraAddress(e.target.value)}
                placeholder="상세 주소를 입력해주세요"
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
              <input className="form-input" name="desiredAmountText" type="text" placeholder="예: 5,000만원" />
            </div>

            <div style={{ marginTop: 20, fontSize: "0.85rem", color: "#666" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                개인정보처리방침 동의 [약관보기]
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
      <footer style={{ marginTop: "-1px", padding: "60px 20px", background: "#eef3ff", fontSize: "0.85rem", color: "var(--text-muted)" }} className="text-center">
        <div className="container">
          <p style={{ fontWeight: 700, color: "var(--text-dark)", marginBottom: 10 }}>주식회사 비티씨</p>
          <p>상호명: 주식회사 비티씨 | 사업자번호: 452-81-03847</p>
          <p>대표전화: 010-4148-0242 | 경기도 부천시 원미구 옥산로7, 상가 a동 116호</p>
          <p style={{ marginTop: 25, opacity: 0.8 }}>© 2026 주식회사 비티씨. All rights reserved.</p>
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
    </div>
  );
}
