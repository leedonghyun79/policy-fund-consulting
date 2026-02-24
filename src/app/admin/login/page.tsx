"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white font-sans">
      <div className="w-full max-w-[420px] p-8 text-center animate-in fade-in duration-500">

        {/* Logo/Header */}
        <div style={{ marginBottom: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '100%',
            backgroundColor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }}>
            <span className="text-white font-black text-2xl italic select-none">P</span>
          </div>
          <h1 className="text-slate-800 flex items-center gap-3" style={{ margin: 0 }}>
            <span style={{ fontWeight: 900, fontSize: '30px', letterSpacing: '-0.05em' }}>ADMIN</span>
            <div style={{ width: '1.5px', height: '20px', backgroundColor: '#cbd5e1' }}></div>
            <span style={{ fontWeight: 600, fontSize: '20px', color: '#94a3b8' }}>포털 관리자</span>
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
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 cursor-pointer" />
              <span className="font-bold group-hover:text-slate-500 transition-colors">아이디 저장</span>
            </label>
            <button type="button" className="font-bold hover:text-slate-500 transition-colors">비밀번호 찾기</button>
          </div>
        </form>

        <p className="text-slate-300 font-black uppercase tracking-[0.3em] select-none" style={{ marginTop: '80px', fontSize: '10px' }}>
          ⓒPIXELCONNECT SYSTEMS
        </p>
      </div>
    </main>
  );
}
