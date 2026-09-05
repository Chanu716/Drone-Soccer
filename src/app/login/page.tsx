"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Loader2, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Route according to user role or original redirect
      const destination = redirectParam || data.destination || "/dashboard";
      router.push(destination);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(18,21,14,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-barlow)",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          Drone Soccer <span style={{ color: "#c8ff00" }}>SRM AP</span>
        </Link>
        <Link
          href="/"
          className="btn btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px" }}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px 80px",
        }}
      >
        <div style={{ maxWidth: 440, width: "100%" }}>
          <div className="cine" style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              className="tag"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(200,255,0,0.1)",
                color: "#c8ff00",
                border: "1px solid #c8ff00",
                marginBottom: 12,
              }}
            >
              <ShieldCheck size={14} /> Secure Access Portal
            </div>
            <h1 className="h1" style={{ fontSize: 36, margin: "0 0 8px" }}>
              Sign in to League
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
              Access team standings, match schedules, or administrator control center.
            </p>
          </div>

          <div className="card cine" style={{ padding: 32 }}>
            <form onSubmit={handleLogin}>
              <div className="field">
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={14} color="#c8ff00" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@srmap.edu.in"
                  required
                  disabled={loading}
                />
              </div>

              <div className="field">
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock size={14} color="#c8ff00" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "rgba(255,77,77,0.1)",
                    border: "1px solid rgba(255,77,77,0.3)",
                    color: "#ff6b6b",
                    fontSize: 13,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 18,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 16,
                  fontWeight: 700,
                  background: "#c8ff00",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
                textAlign: "center",
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              Haven&apos;t registered your team yet?{" "}
              <Link href="/register" style={{ color: "#c8ff00", fontWeight: 700, textDecoration: "none" }}>
                Register Team →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer
        style={{
          padding: "20px 48px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 12,
        }}
      >
        Drone Soccer SRM AP · Role-Based Secure Gateway.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <LoginForm />
    </Suspense>
  );
}
