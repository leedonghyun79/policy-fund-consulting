"use client";

import { CSSProperties, FormEvent, useEffect, useRef, useState, useMemo } from "react";
import {
  FiShield,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
import DaumPostcodeEmbed from 'react-daum-postcode';

const STATUS_DATA = [
  { name: "김재*", biz: "법인사업자", product: "운전·시설자금", tag: "진행 완료" },
  { name: "이정*", biz: "법인사업자", product: "고용지원금", tag: "진행 완료" },
  { name: "강하*", biz: "개인사업자", product: "고용지원금", tag: "진행중" },
  { name: "장우*", biz: "법인사업자", product: "운전·시설자금", tag: "진행 완료" },
  { name: "나정*", biz: "개인사업자", product: "고용지원금", tag: "진행중" },
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
          <p className="brand-stats-headcopy">
            정부가 매년 준비하는 수조 원의 정책자금,
            <span className="text-blue">비티씨는 그 기회를 현실로 만들어 왔습니다.</span>
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
          <div className="section-subtitle-large">
            "서류 준비만 하다 기회를 놓치진 않으셨나요?"<br />
            한 번의 탈락은 단순한 실패가 아니라<br />
            <b>6개월 이상의 신청 제한</b>으로 이어질 수 있습니다.<br />
            비티씨는 수많은 거절 사례를 분석하여,<br />
            승인 가능성을 극대화하는 맞춤형 전략을 설계합니다.
          </div>

          <div style={{ marginTop: 80, paddingTop: 60 }}>
            <h3 className="section-title definition-title">
              <FiShield /> 잠깐! 여기서 정책자금이란?
            </h3>
            <div className="definition-box" style={{ marginTop: 20 }}>
              <h4>정책자금이란?</h4>
              <p style={{ wordBreak: 'keep-all' }}>
                정책자금은 정부 및 공공기관이 중소기업과 소상공인의
                경영 안정과 성장을 위해 지원하는 저금리 자금입니다.
                시중 금융권 대비 낮은 금리와 유연한 상환 조건이 적용되며,
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

          <div className="forest-desc">
            대표님의 고민, 맞춤 컨설팅으로 해결해드리겠습니다.<br />
            제발 더 이상 혼자 고민하지 마세요.<br />
            <span style={{ color: '#ff9033', fontWeight: 700 }}>10초만 투자해서 지금 바로 무료 상담 신청하세요</span>
          </div>

          <button onClick={scrollToForm} className="btn-vibrant">
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
          <h3 className="section-title">실시간 상담 신청 현황</h3>
          <div className="table-wrapper text-center">
            <div className="tr-head">
              <div>성함</div>
              <div>사업장</div>
              <div>신청항목</div>
              <div>상태</div>
            </div>
            <div className="rolling-viewport">
              <div
                className={`rolling-list ${!isRollingTransition ? 'no-transition' : ''}`}
                style={{
                  transform: `translateY(-${rollingIndex * 60}px)`,
                }}
              >
                {[...mergedLeads, ...mergedLeads.slice(0, 4)].map((row, i) => (
                  <div className="tr-row" key={i}>
                    <div>{row.name}</div>
                    <div>{row.biz}</div>
                    <div>{row.product}</div>
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
          <p className="section-subtitle" style={{ marginBottom: 40 }}>먼저 편하게 말씀해 주세요. 방향은 저희가 잡아드리겠습니다.</p>

          <form onSubmit={handleSubmit} style={{ textAlign: "left", maxWidth: 500, margin: "0 auto" }}>
            <div className="form-group">
              <label className="form-label">사업자명 *</label>
              <input className="form-input" name="businessName" type="text" placeholder="회사명 입력" required />
            </div>
            <div className="form-group">
              <label className="form-label">대표자명 *</label>
              <input className="form-input" name="representativeName" type="text" placeholder="대표자성함 입력" required />
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
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" style={{ maxWidth: 600, width: "95%", textAlign: "left", maxHeight: "85vh", overflowY: "auto", padding: "30px 20px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 15 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>이용약관 및 개인정보처리방침</h2>
              <button onClick={() => setShowTermsModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#666" }}>&times;</button>
            </div>

            <div style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>이용약관</h3>
              <p><strong>제 1 장 총칙</strong></p>
              <p><strong>제 1 조 (목적)</strong> 이 약관은 주식회사 비티씨(이하 "회사")가 제공하는 서비스 이용에 관한 조건 및 절차와 기타 필요한 사항을 규정하는 것을 목적으로 합니다.</p>
              <p><strong>제 2 조 (용어의 정의)</strong> 이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
              <p><strong>제 3 조 (약관의 효력과 변경)</strong> 회사는 본 약관의 내용을 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
              <p><strong>제 4 조 (약관외 준칙)</strong> 이 약관에 명시되지 않은 사항이 관계 법령에 규정되어 있을 경우 그 규정에 따르며, 그렇지 않은 경우에는 일반적인 관례에 따릅니다.</p>
              <p><strong>제 5 조 (적용범위)</strong> 본 약관은 서비스 이용자 모두에게 적용됩니다.</p>

              <p style={{ marginTop: 15 }}><strong>제 2 장 서비스 이용 계약</strong></p>
              <p><strong>제 6 조 (이용계약의 성립)</strong> 이용계약은 이용자의 이용신청에 대한 회사의 이용승낙과 이용자의 약관내용에 대한 동의로 성립됩니다.</p>
              <p><strong>제 7 조 (이용계약 승인의 유보)</strong> 회사는 서비스 관련 설비의 여유가 없거나 기술상 사유가 있는 경우 승인을 유보할 수 있습니다.</p>

              <p style={{ marginTop: 15 }}><strong>제 3 장 서비스의 이용</strong></p>
              <p><strong>제 8 조 (서비스 이용시간)</strong> 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.</p>
              <p><strong>제 9 조 (이용계약의 해지 및 서비스 이용의 제한)</strong> 이용자가 이용계약을 해지하고자 하는 때에는 이용자 본인이 온라인을 통해 회사에 해지 신청을 하여야 합니다.</p>
              <p><strong>제 10 조 (이용자 게시물의 삭제 이용 제한)</strong> 회사는 이용자가 게시하거나 등록하는 서비스 내의 내용물이 규정에 위반되는 경우 사전 통지 없이 삭제할 수 있습니다.</p>
              <p><strong>제 11 조 (서비스의 중지 및 제한)</strong> 회사는 긴급한 시스템 점검, 증설 및 교체 등 부득이한 사유로 인하여 사전 공지 없이 일시적으로 서비스를 중단할 수 있습니다.</p>

              <p style={{ marginTop: 15 }}><strong>제 4 장 의무</strong></p>
              <p><strong>제 12 조 (회사의 의무)</strong> 회사는 특별한 사정이 없는 한 이용자가 신청한 서비스 제공 개시일에 서비스를 이용할 수 있도록 합니다.</p>
              <p><strong>제 12조의 1 (개인정보보호)</strong> 회사는 관련 법령이 정하는 바에 따라서 이용자 등록정보를 포함한 이용자의 개인정보를 보호하기 위하여 노력합니다.</p>
              <p><strong>제 13 조 (이용자의 의무)</strong> 이용자는 관계 법령, 본 약관의 규정, 이용안내 및 서비스 상에 공지한 주의사항 등을 준수하여야 합니다.</p>
              <p><strong>제 13 조의 1 (입력정보등)</strong> 이용자는 상담 신청 시 정확한 정보를 입력해야 하며, 허위 정보 입력 시 서비스 이용에 제한이 있을 수 있습니다.</p>

              <p style={{ marginTop: 15 }}><strong>제 5 장 저작권 및 면책</strong></p>
              <p><strong>제 14 조 (게재된 자료에 대한 권리)</strong> 서비스에 게재된 자료에 대한 권리는 회사에 있습니다.</p>
              <p><strong>제 15 조 (면책)</strong> 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>

              <hr style={{ margin: "25px 0", border: 0, borderTop: "1px solid #eee" }} />

              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>개인정보처리방침</h3>
              <p><strong>가. 수집하는 개인정보 항목 및 수집방법</strong></p>
              <p>- 사업자명, 대표자명, 휴대폰번호, 지역(주소), 업종, 희망 자금 규모</p>

              <p style={{ marginTop: 10 }}><strong>나. 개인정보의 수집 및 이용목적</strong></p>
              <p>수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
              <p>- 정책자금 컨설팅 및 담당 전문가의 전화 상담/안내</p>

              <p style={{ marginTop: 10 }}><strong>다. 수집한 개인정보의 보유 및 이용기간</strong></p>
              <p>- 원칙적으로 개인정보 수집 및 이용목적이 달성된 후(상담 완료 등)에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 보존합니다.</p>

              <p style={{ marginTop: 10 }}><strong>라. 동의 거부권 및 거부 시 불이익</strong></p>
              <p>- 이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으며, 동의를 거부할 경우 상담 신청 서비스 이용이 제한됩니다.</p>

              <p style={{ marginTop: 20 }}><strong>개인정보 제3자 제공 정책</strong></p>
              <p>주식회사 비티씨는 원활한 서비스 제공을 위하여 아래와 같이 이용자의 개인정보를 제공하고 있습니다.</p>
              <p>1. 제공받는 자: 제휴 컨설턴트 및 전문 대행 기관</p>
              <p>2. 제공받는 자의 이용목적: 정책자금 상담 및 서비스 제공, 마케팅 및 광고 활용</p>
              <p>3. 제공하는 항목: 사업자명, 대표자명, 연락처, 지역, 업종 등 신청 정보 일체</p>
              <p>4. 보유 및 이용기간: 제공 목적 달성 시까지 (최대 3년)</p>

              <p style={{ marginTop: 20 }}><strong>개인정보의 파기</strong></p>
              <p>1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
              <p>2. 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하며, 종이에 출력된 개인정보는 분쇄 기를 통해 파기합니다.</p>

              <p style={{ marginTop: 20 }}><strong>기술적·관리적 보호 대책</strong></p>
              <p>회사는 이용자들의 개인정보 보호를 위해 암호화 저장, 해킹 대비 침입차단 시스템 운영, 백신 프로그램 설치, 개인정보 취급 직원 최소화 및 교육 등 최선을 다하고 있습니다.</p>
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
