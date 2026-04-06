"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineDatabase } from "react-icons/hi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [saveId, setSaveId] = useState(false);

  // 비밀번호 찾기 모달 상태
  const [showFindPw, setShowFindPw] = useState(false);
  const [findUsername, setFindUsername] = useState("");
  const [findLoading, setFindLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const savedUsername = localStorage.getItem("admin_saved_username");
    if (savedUsername) {
      setUsername(savedUsername);
      setSaveId(true);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (saveId) {
      localStorage.setItem("admin_saved_username", username);
    } else {
      localStorage.removeItem("admin_saved_username");
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "로그인에 실패했습니다.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onFindPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFindLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: findUsername }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "오류가 발생했습니다.");
      } else {
        alert(data.message || "대표 이메일로 임시 비밀번호가 발송되었습니다.");
        setShowFindPw(false);
        setFindUsername("");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setFindLoading(false);
    }
  };

  if (!isMounted) return null;

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0f172a',
        color: '#fff',
        padding: '32px',
        textAlign: 'center',
        fontFamily: 'Pretendard, sans-serif'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E40AF" />
            <path d="M9 7H16.5C18.9853 7 21 9.01472 21 11.5C21 13.9853 18.9853 16 16.5 16H9V7Z" fill="white" />
            <path d="M9 16H18.5C20.9853 16 23 18.0147 23 20.5C23 22.9853 20.9853 25 18.5 25H9V16Z" fill="white" />
            <path d="M11 11H15V13H11V11Z" fill="#1E40AF" />
            <path d="M11 19H17V21H11V19Z" fill="#1E40AF" />
            <rect x="23" y="5" width="4" height="12" rx="1" fill="#3B82F6" />
            <path d="M21 12L25 4L29 12H21Z" fill="#60A5FA" />
          </svg>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.04em' }}>관리자 터미널 안내</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '40px', wordBreak: 'keep-all' }}>
          어드민 로그인 및 대시보드는 보안과<br />
          정밀한 관리를 위해 <strong style={{ color: '#fff' }}>PC 환경에 최적화</strong>되어 있습니다.<br /><br />
          원활한 시스템 사용을 위해<br />
          PC 또는 데스크탑 기기에서 접속해 주시기 바랍니다.
        </p>
        <button
          onClick={() => router.replace("/")}
          style={{
            padding: '16px 32px',
            borderRadius: '16px',
            backgroundColor: '#2563eb',
            border: 'none',
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          메인페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white font-sans">
      <div className="w-full max-w-[420px] p-8 text-center animate-in fade-in duration-500">

        {/* Logo/Header */}
        <div style={{ marginBottom: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E40AF" />
            <path d="M9 7H16.5C18.9853 7 21 9.01472 21 11.5C21 13.9853 18.9853 16 16.5 16H9V7Z" fill="white" />
            <path d="M9 16H18.5C20.9853 16 23 18.0147 23 20.5C23 22.9853 20.9853 25 18.5 25H9V16Z" fill="white" />
            <path d="M11 11H15V13H11V11Z" fill="#1E40AF" />
            <path d="M11 19H17V21H11V19Z" fill="#1E40AF" />
            <rect x="23" y="5" width="4" height="12" rx="1" fill="#3B82F6" />
            <path d="M21 12L25 4L29 12H21Z" fill="#60A5FA" />
          </svg>
          <h1 className="text-slate-800 flex items-center gap-3" style={{ margin: 0 }}>
            <span style={{ fontWeight: 900, fontSize: '30px', letterSpacing: '-0.05em' }}>ADMIN</span>
            <div style={{ width: '1.5px', height: '20px', backgroundColor: '#cbd5e1' }}></div>
            <span style={{ fontWeight: 600, fontSize: '20px', color: '#94a3b8' }}>비티씨 시스템</span>
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', paddingLeft: '8px', paddingBottom: '8px' }}>아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="아이디를 입력하세요"
              className="w-full h-[64px] bg-[#F1F5F9] border border-transparent rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all placeholder:text-slate-400"
              style={{ fontSize: '15px', paddingLeft: '32px', paddingRight: '32px' }}
            />
          </div>

          <div style={{ marginBottom: '40px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', paddingLeft: '8px', paddingBottom: '8px' }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
              className="w-full h-[64px] bg-[#F1F5F9] border border-transparent rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all placeholder:text-slate-400"
              style={{ fontSize: '15px', paddingLeft: '32px', paddingRight: '32px' }}
            />
          </div>

          {error && (
            <p className="text-rose-500 text-xs font-bold py-1 text-left ml-1" style={{ marginBottom: '16px' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[64px] bg-[#4E8DFF] hover:bg-blue-600 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98]"
            style={{ marginBottom: '24px', boxShadow: '0 10px 15px -3px rgba(78, 141, 255, 0.2)' }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="flex justify-between items-center text-[14px] text-slate-400 px-2" style={{ marginBottom: '64px' }}>
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <input 
                type="checkbox" 
                checked={saveId}
                onChange={(e) => setSaveId(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-500 cursor-pointer" 
              />
              <span className="font-bold group-hover:text-slate-500 transition-colors">아이디 저장</span>
            </label>
            <button type="button" onClick={() => setShowFindPw(true)} className="font-bold hover:text-slate-500 transition-colors">비밀번호 찾기</button>
          </div>
        </form>

        <p className="text-slate-300 font-black uppercase tracking-[0.3em] select-none" style={{ marginTop: '80px', fontSize: '10px' }}>
          ⓒPIXELCONNECT SYSTEMS
        </p>
      </div>

      {showFindPw && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" style={{ zIndex: 9999 }}>
          <div 
            className="bg-white rounded-3xl w-full max-w-[420px] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{ padding: '40px 32px' }}
          >
            <h3 className="text-2xl font-black text-slate-800 text-left tracking-tight" style={{ marginBottom: '16px' }}>비밀번호 찾기</h3>
            <p className="text-[15px] text-slate-500 font-bold text-left leading-relaxed break-keep" style={{ marginBottom: '32px' }}>
              등록된 관리자 아이디를 입력하시면,<br/>
              <span className="text-blue-500">최고 관리자(대표 이메일)</span>로 임시 비밀번호가 발송됩니다.
            </p>
            <form onSubmit={onFindPassword}>
              <div style={{ marginBottom: '32px' }}>
                <input
                  type="text"
                  placeholder="관리자 아이디를 입력하세요"
                  required
                  value={findUsername}
                  autoFocus
                  onChange={(e) => setFindUsername(e.target.value)}
                  className="w-full h-14 bg-slate-100/80 border border-slate-200 rounded-2xl px-5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFindPw(false)}
                  className="flex-[1] h-14 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all text-[15px]"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={findLoading}
                  className="flex-[2] h-14 bg-[#4E8DFF] hover:bg-blue-600 text-white font-black rounded-2xl transition-all text-[15px] shadow-[0_8px_15px_-4px_rgba(78,141,255,0.3)] disabled:opacity-50 disabled:shadow-none hover:shadow-[0_12px_20px_-6px_rgba(78,141,255,0.4)] active:scale-[0.98]"
                >
                  {findLoading ? "발송 중..." : "발송하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
