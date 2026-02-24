"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { LeadStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

type LeadRow = {
  id: string;
  businessName: string;
  phoneRaw: string;
  addressRoad: string;
  addressDetail: string | null;
  industry: string;
  desiredAmountText: string | null;
  status: LeadStatus;
  createdAt: string;
};

const statusLabel: Record<LeadStatus, string> = {
  NEW: "상담 진행중",
  CONTACTED: "상담 완료",
  QUALIFIED: "상담 진행중",
  CONVERTED: "상담 완료",
  CLOSED: "상담 완료",
  SPAM: "제외",
};

const industryLabel: Record<string, string> = {
  MANUFACTURING: "제조업",
  RETAIL: "도·소매업",
  SERVICE: "서비스업",
  FOOD: "요식업",
  OTHER: "기타",
};

export default function AdminDashboard({ initialLeads }: { initialLeads: LeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const counters = useMemo(() => {
    const inProgress = leads.filter((row) => row.status === "NEW").length;
    const done = leads.filter((row) => row.status === "CONTACTED").length;
    return { inProgress, done, total: leads.length };
  }, [leads]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/consultations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      setLeads((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                status,
              }
            : row
        )
      );
    } catch (error) {
      console.error(error);
      alert("상태 변경에 실패했습니다.");
    } finally {
      setLoadingId(null);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f4f6fa", padding: "24px 18px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>상담 신청 관리</h1>
          <button
            type="button"
            onClick={logout}
            style={{ border: "1px solid #d1d5db", background: "#fff", padding: "10px 14px", borderRadius: 8, cursor: "pointer" }}
          >
            로그아웃
          </button>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 14 }}>전체: <b>{counters.total}</b></div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 14 }}>진행중: <b>{counters.inProgress}</b></div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 14 }}>완료: <b>{counters.done}</b></div>
        </section>

        <div style={{ overflowX: "auto", border: "1px solid #dfe3ea", borderRadius: 12, background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr style={{ background: "#0f4fa8", color: "#fff" }}>
                <th style={th}>신청일</th>
                <th style={th}>사업자명</th>
                <th style={th}>휴대폰</th>
                <th style={th}>주소</th>
                <th style={th}>업종</th>
                <th style={th}>희망 금액</th>
                <th style={th}>상태</th>
                <th style={th}>관리</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((row) => (
                <tr key={row.id} style={{ borderTop: "1px solid #edf2f7" }}>
                  <td style={td}>{new Date(row.createdAt).toLocaleString("ko-KR")}</td>
                  <td style={td}>{row.businessName}</td>
                  <td style={td}>{row.phoneRaw}</td>
                  <td style={td}>{row.addressRoad}{row.addressDetail ? ` ${row.addressDetail}` : ""}</td>
                  <td style={td}>{industryLabel[row.industry] || row.industry}</td>
                  <td style={td}>{row.desiredAmountText || "-"}</td>
                  <td style={td}>{statusLabel[row.status] || row.status}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        disabled={loadingId === row.id || row.status === "NEW"}
                        onClick={() => updateStatus(row.id, "NEW")}
                        style={actionBtn(row.status === "NEW")}
                      >
                        진행중
                      </button>
                      <button
                        type="button"
                        disabled={loadingId === row.id || row.status === "CONTACTED"}
                        onClick={() => updateStatus(row.id, "CONTACTED")}
                        style={actionBtn(row.status === "CONTACTED")}
                      >
                        완료
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

const th: CSSProperties = {
  fontWeight: 700,
  textAlign: "left",
  fontSize: 13,
  padding: "12px 10px",
};

const td: CSSProperties = {
  padding: "12px 10px",
  fontSize: 13,
  color: "#1f2937",
  verticalAlign: "top",
};

function actionBtn(active: boolean): CSSProperties {
  return {
    border: active ? "1px solid #2563eb" : "1px solid #cbd5e1",
    background: active ? "#dbeafe" : "#fff",
    color: active ? "#1d4ed8" : "#334155",
    borderRadius: 7,
    padding: "6px 10px",
    fontSize: 12,
    cursor: "pointer",
  };
}
