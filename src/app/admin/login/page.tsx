"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("root");
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
        throw new Error(data.message || "Login failed.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f7fb", padding: 24 }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 24,
          borderRadius: 14,
          border: "1px solid #dbe2ea",
          background: "#fff",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 16, fontWeight: 800 }}>Admin Login</h1>
        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ fontSize: 13, marginBottom: 6, color: "#475569" }}>ID</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ fontSize: 13, marginBottom: 6, color: "#475569" }}>Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
        </label>
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: 42,
            borderRadius: 8,
            border: "none",
            background: "#0f4fa8",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </main>
  );
}
