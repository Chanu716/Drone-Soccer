"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Calendar,
  LogOut,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Zap,
} from "lucide-react";

interface Pilot {
  id?: string;
  name: string;
  role: string;
  jersey_no?: number;
}

interface TeamData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  captain_name: string;
  captain_email: string;
  captain_phone: string | null;
  training_addon: boolean;
  status: string;
  team_members?: Pilot[];
  payments?: any[];
}

interface StandingsData {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export default function TeamDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [role, setRole] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!data.authenticated) {
        router.push("/login");
        return;
      }
      if (data.role === "admin") {
        router.push("/admin/registrations");
        return;
      }
      setUser(data.user);
      setTeam(data.team);
      setStandings(data.standings);
      setRole(data.role);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          color: "var(--text)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--muted)" }}>
          <RefreshCw size={20} className="animate-spin" /> Loading team dashboard...
        </div>
      </div>
    );
  }

  const latestPayment = team?.payments?.[0];
  const utr =
    latestPayment?.razorpay_payment_id ||
    (team?.tagline?.includes("UTR:") ? team.tagline.replace("UPI UTR:", "").trim() : null);

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)", background: "var(--bg)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(18,21,14,0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
          <span style={{ color: "var(--border)" }}>|</span>
          <span className="tag" style={{ background: "rgba(200,255,0,0.1)", color: "#c8ff00", border: "1px solid #c8ff00" }}>
            Team Portal
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Signed in as <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px" }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 100px" }}>
        {/* Title & Status Banner */}
        <div style={{ marginBottom: 36 }}>
          <span className="tag" style={{ marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Zap size={13} color="#c8ff00" /> Captain Command Hub
          </span>
          <h1 className="h1" style={{ fontSize: "clamp(32px,4.5vw,48px)", margin: "8px 0 12px" }}>
            {team ? team.name : "Team Portal"}
          </h1>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 15 }}>
            Welcome back, {team?.captain_name || user?.name}. Track your team roster, standings on the leaderboard, points, and arena match rotation.
          </p>
        </div>

        {team ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
            {/* Card 1: Team Standings & League Points */}
            <div className="card cine" style={{ borderColor: "rgba(200,255,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 className="h2" style={{ fontSize: 20, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Trophy size={20} color="#c8ff00" /> Standings & Points
                </h2>
                <Link
                  href="/standings"
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  Full Table <ArrowRight size={12} />
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, border: "1px solid var(--border)" }}>
                  <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Points</div>
                  <div className="data" style={{ fontSize: 32, fontWeight: 900, color: "#c8ff00" }}>
                    {standings?.points ?? 0}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>Tournament Pts</div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, border: "1px solid var(--border)" }}>
                  <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Record</div>
                  <div className="data" style={{ fontSize: 28, fontWeight: 900 }}>
                    {standings?.won ?? 0}W - {standings?.lost ?? 0}L
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>
                    {standings?.drawn ?? 0} Draws
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, border: "1px solid var(--border)" }}>
                  <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Goal Diff</div>
                  <div className="data" style={{ fontSize: 28, fontWeight: 900 }}>
                    {(standings?.goal_difference ?? 0) >= 0
                      ? `+${standings?.goal_difference ?? 0}`
                      : standings?.goal_difference}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>
                    {standings?.goals_for ?? 0} GF : {standings?.goals_against ?? 0} GA
                  </div>
                </div>
              </div>

              <div style={{ padding: "12px 16px", background: "rgba(200,255,0,0.04)", border: "1px solid rgba(200,255,0,0.15)", fontSize: 13, color: "var(--muted)" }}>
                Matches Played: <strong>{standings?.played ?? 0}</strong>. Match results and points are updated in real-time following each block rotation match.
              </div>
            </div>

            {/* Card 2: Team Roster & Captain */}
            <div className="card cine">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 className="h2" style={{ fontSize: 20, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={20} color="#c8ff00" /> Pilot Roster
                </h2>
                <span className="tag" style={{ fontSize: 12 }}>
                  {team.team_members?.length || 0} Pilots
                </span>
              </div>

              <div style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", marginBottom: 16 }}>
                {(team.team_members || []).map((pilot, idx) => (
                  <div
                    key={pilot.id || idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 16px",
                      borderBottom:
                        idx === (team.team_members?.length || 0) - 1 ? "none" : "1px solid var(--border)",
                      fontSize: 13,
                    }}
                  >
                    <span>
                      Pilot {idx + 1}: <strong>{pilot.name}</strong>
                    </span>
                    <span className="tag" style={{ fontSize: 11, padding: "2px 6px" }}>
                      {pilot.role}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                Captain: <strong style={{ color: "var(--text)" }}>{team.captain_name}</strong> ({team.captain_email})
              </div>
            </div>

            {/* Card 3: Registration & Payment Details */}
            <div className="card cine">
              <h2 className="h2" style={{ fontSize: 20, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={20} color="#c8ff00" /> Registration & Payment
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)" }}>Team Status</span>
                  <span style={{ color: team.status === "approved" ? "#c8ff00" : "#ffd166", fontWeight: 700 }}>
                    {team.status === "approved" ? "Approved & Confirmed ✓" : "Pending Review"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)" }}>Payment Method</span>
                  <span>UPI QR</span>
                </div>

                {utr && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--muted)" }}>Payment Reference / UTR</span>
                    <span className="data" style={{ fontWeight: 700 }}>
                      {utr}
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ color: "var(--muted)" }}>Arena Training Access</span>
                  <span style={{ color: team.training_addon ? "#c8ff00" : "var(--muted)", fontWeight: 700 }}>
                    {team.training_addon ? "Included (+₹100)" : "Standard Entry"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Match Schedule & Arena Rotation */}
            <div className="card cine">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 className="h2" style={{ fontSize: 20, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={20} color="#c8ff00" /> Match Schedule
                </h2>
                <Link
                  href="/fixtures"
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  All Fixtures <ArrowRight size={12} />
                </Link>
              </div>

              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                Matches rotate weekly on Wednesday and Thursday evenings across SRM AP campus blocks: C V Raman Block, SR Block, X Lab, and Admin Block.
              </p>

              <Link
                href="/fixtures"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 14,
                  padding: 12,
                }}
              >
                View Match Schedule & Arena Slots <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="card cine" style={{ textAlign: "center", padding: "48px 24px" }}>
            <h2 className="h2" style={{ fontSize: 24, marginBottom: 12 }}>No Registered Team Found</h2>
            <p style={{ color: "var(--muted)", maxWidth: "48ch", margin: "0 auto 24px", fontSize: 14 }}>
              Your account is active, but we didn&apos;t find a team linked to your email ({user?.email}).
            </p>
            <Link href="/register" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Register a Team Now <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </main>

      <footer
        style={{
          padding: "24px 32px 80px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        Drone Soccer SRM AP · Team Dashboard & Points Hub.
      </footer>
    </div>
  );
}
