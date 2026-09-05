"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  CreditCard,
  DollarSign,
  UserCheck,
  RotateCcw,
} from "lucide-react";

interface Pilot {
  id?: string;
  name: string;
  role: string;
  jersey_no?: number;
}

interface PaymentRecord {
  id: string;
  amount_paise: number;
  currency: string;
  status: "created" | "pending" | "paid" | "failed" | "refunded";
  method: string | null;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  razorpay_signature?: string | null;
  transaction_id?: string | null;
  paid_at?: string | null;
  created_at: string;
  notes?: string | null;
}

interface TeamRegistration {
  id: string;
  name: string;
  slug: string;
  regNumber: string;
  captain_name: string;
  captain_email: string;
  captain_phone: string | null;
  training_addon: boolean;
  status: "pending" | "approved" | "rejected" | "cancelled";
  expectedAmount: number;
  paidAmount: number;
  derivedPaymentStatus: "paid" | "pending" | "failed" | "refunded";
  isAutoVerified?: boolean;
  created_at: string;
  admin_notes?: string | null;
  team_members?: Pilot[];
  payments?: PaymentRecord[];
}

interface FinancialStats {
  totalRegistrations: number;
  confirmedCount: number;
  pendingCount: number;
  rejectedCount: number;
  cancelledCount: number;
  autoVerifiedCount: number;
  pendingPaymentCount: number;
  expectedRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  refundedRevenue: number;
  failedPaymentsCount: number;
}

export default function AdminRegistrationsPage() {
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalRegistrations: 0,
    confirmedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    cancelledCount: 0,
    autoVerifiedCount: 0,
    pendingPaymentCount: 0,
    expectedRevenue: 0,
    receivedRevenue: 0,
    pendingRevenue: 0,
    refundedRevenue: 0,
    failedPaymentsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "auto_verified" | "pending_payment" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<TeamRegistration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [manualAmount, setManualAmount] = useState("100");
  const [manualMethod, setManualMethod] = useState("razorpay");
  const [manualTxId, setManualTxId] = useState("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/registrations");
      const data = await res.json();
      if (res.ok) {
        setTeams(data.teams || []);
        if (data.stats) setStats(data.stats);
        if (selectedTeam) {
          const updatedSelected = (data.teams || []).find((t: TeamRegistration) => t.id === selectedTeam.id);
          if (updatedSelected) setSelectedTeam(updatedSelected);
        }
      } else {
        showToast(data.error || "Failed to load registrations", "error");
      }
    } catch {
      showToast("Network error fetching registrations", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab & Search filtered list
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Tab filter
      if (activeTab === "auto_verified" && team.derivedPaymentStatus !== "paid" && team.status !== "approved") {
        return false;
      }
      if (activeTab === "pending_payment" && (team.derivedPaymentStatus === "paid" || team.status === "approved")) {
        return false;
      }
      if (activeTab === "rejected" && team.status !== "rejected" && team.status !== "cancelled") {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const teamMatch = team.name.toLowerCase().includes(q);
        const captainMatch = team.captain_name.toLowerCase().includes(q);
        const emailMatch = team.captain_email.toLowerCase().includes(q);
        const regMatch = team.regNumber?.toLowerCase().includes(q);
        const txMatch = team.payments?.some(
          (p) =>
            p.transaction_id?.toLowerCase().includes(q) ||
            p.razorpay_payment_id?.toLowerCase().includes(q) ||
            p.razorpay_order_id?.toLowerCase().includes(q)
        );
        if (!teamMatch && !captainMatch && !emailMatch && !regMatch && !txMatch) return false;
      }

      return true;
    });
  }, [teams, activeTab, search]);

  // Handle Team Status Update
  const updateTeamStatus = async (teamId: string, newStatus: string, reason?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          status: newStatus,
          rejectionReason: reason,
          adminNotes: reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update registration status");

      showToast(`Team ${newStatus === "approved" ? "approved" : "status updated to " + newStatus}`);
      setRejectModalOpen(false);
      setRejectionReason("");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Record Payment / Override
  const recordPayment = async () => {
    if (!selectedTeam) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          amountPaise: Math.round(parseFloat(manualAmount) * 100),
          method: manualMethod,
          transactionId: manualTxId,
          status: "paid",
          notes: "Recorded by Admin",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");

      showToast("Payment recorded & team marked as verified");
      setRecordPaymentModalOpen(false);
      setManualTxId("");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error recording payment";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Issue Refund Action
  const handleRefund = async (paymentId: string) => {
    if (!confirm("Are you sure you want to refund this payment? The team will be disqualified.")) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "refund",
          paymentId,
          notes: "Refunded by admin",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process refund");

      showToast("Payment refunded successfully");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing refund";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)", background: "var(--bg)" }}>
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: toastMessage.type === "success" ? "#c8ff00" : "#ff4d4d",
            color: toastMessage.type === "success" ? "#000" : "#fff",
            padding: "12px 24px",
            borderRadius: 4,
            fontWeight: 700,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toastMessage.text}
        </div>
      )}

      {/* Top Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(18,21,14,0.8)",
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
            Drone Soccer <span style={{ color: "#c8ff00" }}>Admin</span>
          </Link>
          <span style={{ color: "var(--border)" }}>|</span>
          <span className="tag" style={{ background: "rgba(200,255,0,0.1)", color: "#c8ff00", border: "1px solid #c8ff00" }}>
            <Zap size={12} style={{ display: "inline", marginRight: 4 }} /> Razorpay Auto-Verify Active
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/admin/registrations/export"
            download
            className="btn btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 13 }}
          >
            <Download size={14} /> Export CSV
          </Link>
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="btn btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 13 }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <Link href="/teams" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>
            Public Teams View →
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1521, margin: "0 auto", padding: "40px 48px 100px" }}>
        {/* Page Title & Automated Overview Banner */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="h1" style={{ fontSize: 38, margin: "0 0 8px" }}>
            Registrations & Payment Management
          </h1>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 15, maxWidth: "75ch" }}>
            Real-time Razorpay telemetry and automated team verification. When participants pay the registration fee, cryptographic signatures (HMAC-SHA256) are validated automatically and teams are instantly approved without manual UTR checking.
          </p>
        </div>

        {/* Financial & Registration KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 36,
          }}
        >
          {/* Card 1: Total Registrations */}
          <div className="card cine" style={{ padding: "20px 24px" }}>
            <div style={{ color: "var(--muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Total Teams
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 900 }}>
              {stats.totalRegistrations}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>Registered participant rosters</div>
          </div>

          {/* Card 2: Auto-Verified & Approved (Razorpay) */}
          <div
            className="card cine"
            style={{
              padding: "20px 24px",
              borderColor: "rgba(200,255,0,0.4)",
              background: "rgba(200,255,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ color: "#c8ff00", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                Auto-Verified & Approved
              </div>
              <ShieldCheck size={16} color="#c8ff00" />
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 900, color: "#c8ff00" }}>
              {stats.confirmedCount}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>100% verified via Razorpay</div>
          </div>

          {/* Card 3: Pending Checkout / Unpaid */}
          <div className="card cine" style={{ padding: "20px 24px" }}>
            <div style={{ color: "var(--muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Pending Payment
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 900, color: stats.pendingCount > 0 ? "#ffd166" : "var(--text)" }}>
              {stats.pendingCount}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>Rosters awaiting checkout</div>
          </div>

          {/* Card 4: Rejected / Disqualified */}
          <div className="card cine" style={{ padding: "20px 24px" }}>
            <div style={{ color: "var(--muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Rejected / Disqualified
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 900, color: stats.rejectedCount > 0 ? "#ff6b6b" : "var(--muted)" }}>
              {stats.rejectedCount}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>Rosters flagged or refunded</div>
          </div>

          {/* Card 5: Revenue Collected */}
          <div
            className="card cine"
            style={{
              padding: "20px 24px",
              borderColor: "rgba(200,255,0,0.2)",
            }}
          >
            <div style={{ color: "var(--muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Revenue Collected
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 900, color: "#c8ff00" }}>
              ₹{stats.receivedRevenue.toLocaleString()}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
              of ₹{stats.expectedRevenue.toLocaleString()} expected total
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("all")}
              className="btn"
              style={{
                background: activeTab === "all" ? "#c8ff00" : "rgba(255,255,255,0.03)",
                color: activeTab === "all" ? "#000" : "var(--text)",
                border: "1px solid var(--border)",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: activeTab === "all" ? 700 : 500,
              }}
            >
              All Teams ({stats.totalRegistrations})
            </button>
            <button
              onClick={() => setActiveTab("auto_verified")}
              className="btn"
              style={{
                background: activeTab === "auto_verified" ? "#c8ff00" : "rgba(255,255,255,0.03)",
                color: activeTab === "auto_verified" ? "#000" : "var(--text)",
                border: "1px solid var(--border)",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: activeTab === "auto_verified" ? 700 : 500,
              }}
            >
              Auto-Verified & Approved ({stats.confirmedCount})
            </button>
            <button
              onClick={() => setActiveTab("pending_payment")}
              className="btn"
              style={{
                background: activeTab === "pending_payment" ? "#c8ff00" : "rgba(255,255,255,0.03)",
                color: activeTab === "pending_payment" ? "#000" : "var(--text)",
                border: "1px solid var(--border)",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: activeTab === "pending_payment" ? 700 : 500,
              }}
            >
              Pending Payment ({stats.pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className="btn"
              style={{
                background: activeTab === "rejected" ? "#c8ff00" : "rgba(255,255,255,0.03)",
                color: activeTab === "rejected" ? "#000" : "var(--text)",
                border: "1px solid var(--border)",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: activeTab === "rejected" ? 700 : 500,
              }}
            >
              Rejected ({stats.rejectedCount})
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", minWidth: 280 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search team, captain, ID, pay_..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px 10px 40px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* Main Teams Table */}
        <div className="card cine" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "16px 20px" }}>Reg / Team Name</th>
                  <th style={{ padding: "16px 20px" }}>Captain Details</th>
                  <th style={{ padding: "16px 20px" }}>Pilots</th>
                  <th style={{ padding: "16px 20px" }}>Fee / Add-on</th>
                  <th style={{ padding: "16px 20px" }}>Payment & Telemetry</th>
                  <th style={{ padding: "16px 20px" }}>Status</th>
                  <th style={{ padding: "16px 20px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "64px 20px", textAlign: "center", color: "var(--muted)" }}>
                      {loading ? "Loading live database records..." : "No registrations matching the selected criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => {
                    const latestPayment = (team.payments || [])[0];
                    const isPaid = team.derivedPaymentStatus === "paid" || team.status === "approved";

                    return (
                      <tr
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          cursor: "pointer",
                          background: selectedTeam?.id === team.id ? "rgba(200,255,0,0.05)" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* Team Name & Reg Number */}
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{team.name}</div>
                          <div className="data" style={{ color: "var(--muted)", fontSize: 12 }}>
                            {team.regNumber} · {team.slug}
                          </div>
                        </td>

                        {/* Captain */}
                        <td style={{ padding: "16px 20px" }}>
                          <div>{team.captain_name}</div>
                          <div style={{ color: "var(--muted)", fontSize: 12 }}>{team.captain_email}</div>
                          {team.captain_phone && <div style={{ color: "var(--muted)", fontSize: 11 }}>{team.captain_phone}</div>}
                        </td>

                        {/* Pilots */}
                        <td style={{ padding: "16px 20px" }}>
                          <span className="tag" style={{ fontSize: 12, padding: "2px 8px" }}>
                            {team.team_members?.length || 0} Pilots
                          </span>
                        </td>

                        {/* Fee & Add-on */}
                        <td style={{ padding: "16px 20px" }}>
                          <div className="data" style={{ fontWeight: 700 }}>₹{team.expectedAmount}</div>
                          {team.training_addon ? (
                            <span style={{ fontSize: 11, color: "#c8ff00" }}>+ Training</span>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>Standard</span>
                          )}
                        </td>

                        {/* Payment & Razorpay Telemetry */}
                        <td style={{ padding: "16px 20px" }}>
                          {isPaid ? (
                            <div>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  background: "rgba(200,255,0,0.12)",
                                  color: "#c8ff00",
                                  border: "1px solid rgba(200,255,0,0.3)",
                                  padding: "3px 8px",
                                  borderRadius: 3,
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                <CheckCircle2 size={12} /> Auto-Verified (Razorpay)
                              </span>
                              {latestPayment?.razorpay_payment_id && (
                                <div className="data" style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                                  {latestPayment.razorpay_payment_id}
                                </div>
                              )}
                            </div>
                          ) : team.derivedPaymentStatus === "failed" ? (
                            <span style={{ color: "#ff6b6b", fontSize: 12, fontWeight: 700 }}>Payment Failed</span>
                          ) : (
                            <span style={{ color: "#ffd166", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Clock size={12} /> Awaiting Payment
                            </span>
                          )}
                        </td>

                        {/* Registration Status */}
                        <td style={{ padding: "16px 20px" }}>
                          {team.status === "approved" ? (
                            <span style={{ color: "#c8ff00", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={13} /> Approved ✓
                            </span>
                          ) : team.status === "rejected" ? (
                            <span style={{ color: "#ff6b6b", fontWeight: 700, fontSize: 13 }}>Rejected</span>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: 13 }}>Pending</span>
                          )}
                        </td>

                        {/* Action */}
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeam(team);
                            }}
                            style={{ padding: "6px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            Details <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-over Team Details Drawer */}
      {selectedTeam && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 200,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedTeam(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 580,
              background: "#161914",
              borderLeft: "1px solid var(--border)",
              height: "100vh",
              overflowY: "auto",
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div className="tag" style={{ marginBottom: 8 }}>{selectedTeam.regNumber}</div>
                <h2 className="h2" style={{ fontSize: 28, margin: 0 }}>{selectedTeam.name}</h2>
                <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
                  Registered on {new Date(selectedTeam.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Automated Verification Telemetry Box */}
            <div
              style={{
                background: selectedTeam.status === "approved" ? "rgba(200,255,0,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedTeam.status === "approved" ? "#c8ff00" : "var(--border)"}`,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ShieldCheck size={18} color={selectedTeam.status === "approved" ? "#c8ff00" : "var(--muted)"} />
                <h3 className="h3" style={{ margin: 0, fontSize: 16 }}>
                  Razorpay Verification Telemetry
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Gateway Protocol</div>
                  <div>Razorpay UPI / Cards</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>HMAC Signature</div>
                  <div style={{ color: selectedTeam.status === "approved" ? "#c8ff00" : "var(--muted)", fontWeight: 700 }}>
                    {selectedTeam.status === "approved" ? "Verified (SHA-256) ✓" : "Awaiting Payment"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Payment ID</div>
                  <div className="data" style={{ fontSize: 12 }}>
                    {selectedTeam.payments?.[0]?.razorpay_payment_id || selectedTeam.payments?.[0]?.transaction_id || "None"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Order Reference</div>
                  <div className="data" style={{ fontSize: 12 }}>
                    {selectedTeam.payments?.[0]?.razorpay_order_id || "N/A"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--muted)" }}>
                {selectedTeam.status === "approved" ? (
                  <span style={{ color: "#c8ff00" }}>
                    ✓ Automatic approval: The team was automatically accepted into the league upon verified Razorpay payment capture. No manual intervention was required.
                  </span>
                ) : (
                  <span>Awaiting payment from participant. Team will be automatically approved upon payment capture.</span>
                )}
              </div>
            </div>

            {/* Captain & Team Roster */}
            <div style={{ marginBottom: 24 }}>
              <h3 className="h3" style={{ fontSize: 18, marginBottom: 12 }}>Captain & Contact</h3>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, border: "1px solid var(--border)", fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Captain Name:</span>
                  <span>{selectedTeam.captain_name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Email:</span>
                  <span>{selectedTeam.captain_email}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Phone:</span>
                  <span>{selectedTeam.captain_phone || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Pilot Roster */}
            <div style={{ marginBottom: 24 }}>
              <h3 className="h3" style={{ fontSize: 18, marginBottom: 12 }}>Pilots Roster</h3>
              <div style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                {(selectedTeam.team_members || []).map((pilot, idx) => (
                  <div
                    key={pilot.id || idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      borderBottom: idx === (selectedTeam.team_members?.length || 0) - 1 ? "none" : "1px solid var(--border)",
                      fontSize: 13,
                    }}
                  >
                    <span>Pilot {idx + 1}: <strong>{pilot.name}</strong></span>
                    <span className="tag" style={{ fontSize: 11, padding: "2px 6px" }}>{pilot.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Override Controls */}
            <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Admin Controls & Exceptions
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {selectedTeam.status !== "approved" && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={actionLoading}
                    onClick={() => updateTeamStatus(selectedTeam.id, "approved")}
                    style={{ background: "#c8ff00", color: "#000", fontWeight: 700, padding: "10px 16px", fontSize: 13 }}
                  >
                    Manual Override: Approve Team
                  </button>
                )}

                {selectedTeam.status !== "rejected" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={actionLoading}
                    onClick={() => setRejectModalOpen(true)}
                    style={{ borderColor: "#ff4d4d", color: "#ff6b6b", padding: "10px 16px", fontSize: 13 }}
                  >
                    Reject / Disqualify
                  </button>
                )}

                {selectedTeam.payments?.[0]?.status === "paid" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={actionLoading}
                    onClick={() => handleRefund(selectedTeam.payments![0].id)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", fontSize: 13 }}
                  >
                    <RotateCcw size={14} /> Issue Refund
                  </button>
                )}

                {selectedTeam.derivedPaymentStatus !== "paid" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setRecordPaymentModalOpen(true)}
                    style={{ padding: "10px 16px", fontSize: 13 }}
                  >
                    + Record Cash / Venue Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject / Disqualify Modal */}
      {rejectModalOpen && selectedTeam && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div className="card cine" style={{ maxWidth: 480, width: "100%", padding: 32, background: "#161914" }}>
            <h3 className="h3" style={{ margin: "0 0 12px", color: "#ff6b6b" }}>Reject / Disqualify Team</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
              Provide a reason for rejecting {selectedTeam.name} (e.g. invalid student enrollment, duplicate roster):
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              style={{
                width: "100%",
                padding: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                marginBottom: 20,
              }}
            />
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => updateTeamStatus(selectedTeam.id, "rejected", rejectionReason)}
                disabled={!rejectionReason.trim() || actionLoading}
                style={{ background: "#ff4d4d", color: "#fff", fontWeight: 700 }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Manual Payment Modal */}
      {recordPaymentModalOpen && selectedTeam && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div className="card cine" style={{ maxWidth: 480, width: "100%", padding: 32, background: "#161914" }}>
            <h3 className="h3" style={{ margin: "0 0 12px" }}>Record Venue / Cash Payment</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
              Record an offline or in-person cash payment for {selectedTeam.name}:
            </p>
            <div className="field">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Method</label>
              <select
                value={manualMethod}
                onChange={(e) => setManualMethod(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <option value="cash">Cash at Venue</option>
                <option value="venue_upi">Venue UPI QR</option>
                <option value="razorpay">Razorpay Manual</option>
              </select>
            </div>
            <div className="field">
              <label>Reference / Receipt Note</label>
              <input
                type="text"
                value={manualTxId}
                onChange={(e) => setManualTxId(e.target.value)}
                placeholder="e.g. Receipt #4092 or Cash Counter"
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRecordPaymentModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={recordPayment}
                disabled={actionLoading}
                style={{ background: "#c8ff00", color: "#000", fontWeight: 700 }}
              >
                Save Payment & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
