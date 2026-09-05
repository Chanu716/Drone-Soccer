"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

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
  status: "created" | "pending" | "verification_required" | "paid" | "failed" | "refunded";
  method: string | null;
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
  derivedPaymentStatus: "paid" | "verification_required" | "pending" | "failed" | "refunded";
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
  expectedRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  refundedRevenue: number;
  verificationRequiredCount: number;
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
    expectedRevenue: 0,
    receivedRevenue: 0,
    pendingRevenue: 0,
    refundedRevenue: 0,
    verificationRequiredCount: 0,
    failedPaymentsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "verif_required" | "payments">("all");
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
  const [manualMethod, setManualMethod] = useState("upi");
  const [manualTxId, setManualTxId] = useState("");
  const [manualStatus, setManualStatus] = useState("paid");

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
      if (activeTab === "pending" && team.status !== "pending") return false;
      if (activeTab === "confirmed" && team.status !== "approved") return false;
      if (activeTab === "verif_required" && team.derivedPaymentStatus !== "verification_required") return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const teamMatch = team.name.toLowerCase().includes(q);
        const captainMatch = team.captain_name.toLowerCase().includes(q);
        const emailMatch = team.captain_email.toLowerCase().includes(q);
        const regMatch = team.regNumber?.toLowerCase().includes(q);
        const txMatch = team.payments?.some((p) => p.transaction_id?.toLowerCase().includes(q));
        if (!teamMatch && !captainMatch && !emailMatch && !regMatch && !txMatch) return false;
      }

      return true;
    });
  }, [teams, activeTab, search]);

  // Handle Team Status Change
  const handleUpdateStatus = async (teamId: string, newStatus: string, reason?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          status: newStatus,
          rejectionReason: reason,
          adminNotes: adminNoteInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Registration marked as ${newStatus.toUpperCase()}`);
        setRejectModalOpen(false);
        setRejectionReason("");
        setAdminNoteInput("");
        await loadData();
      } else {
        showToast(data.error || "Failed to update registration", "error");
      }
    } catch {
      showToast("Network error updating status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Verify Payment
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", paymentId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Payment verified successfully!");
        await loadData();
      } else {
        showToast(data.error || "Failed to verify payment", "error");
      }
    } catch {
      showToast("Network error verifying payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Payment
  const handleRejectPayment = async (paymentId: string) => {
    const reason = prompt("Enter reason for rejecting this payment:", "UTR not matching or payment receipt not recognized");
    if (reason === null) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", paymentId, rejectionReason: reason }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Payment marked as failed/rejected.");
        await loadData();
      } else {
        showToast(data.error || "Failed to reject payment", "error");
      }
    } catch {
      showToast("Network error rejecting payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Record Manual Payment
  const handleRecordManualPayment = async () => {
    if (!selectedTeam) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record",
          teamId: selectedTeam.id,
          amount: Number(manualAmount),
          method: manualMethod,
          transactionId: manualTxId.trim() || undefined,
          status: manualStatus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Payment record saved.");
        setRecordPaymentModalOpen(false);
        setManualTxId("");
        await loadData();
      } else {
        showToast(data.error || "Failed to record payment", "error");
      }
    } catch {
      showToast("Network error recording payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Percent collected calculation
  const collectionPercent = stats.expectedRevenue > 0
    ? Math.min(100, Math.round((stats.receivedRevenue / stats.expectedRevenue) * 100))
    : 0;

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: "14px 22px",
            borderRadius: 12,
            background: toastMessage.type === "success" ? "#19351C" : "#3B141C",
            color: toastMessage.type === "success" ? "#4ADE80" : "#F87171",
            border: `1px solid ${toastMessage.type === "success" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            fontFamily: "var(--font-heading)",
            fontSize: 14,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>{toastMessage.type === "success" ? "✓" : "⚠"}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      <main style={{ maxWidth: 1521, margin: "0 auto", padding: "140px 32px 100px" }}>
        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className="tag" style={{ background: "rgba(255,176,32,0.15)", color: "var(--accent)", border: "1px solid rgba(255,176,32,0.3)" }}>
                Administrative Portal
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Real PostgreSQL Database Live</span>
            </div>
            <h1 className="h1" style={{ fontSize: "clamp(32px,4.5vw,52px)", margin: 0 }}>
              Registrations & Payments
            </h1>
            <p style={{ color: "var(--muted)", maxWidth: "60ch", margin: "8px 0 0", fontSize: 15 }}>
              Manage participant team entries, manual UPI/UTR verification workflows, fee collection, and financial reconciliation.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: "12px 18px", fontSize: 14 }}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
            <a
              href="/api/admin/registrations/export"
              download
              className="btn btn-primary"
              style={{ padding: "12px 22px", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span>⬇</span>
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Financial & Operational Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 16,
            marginBottom: 36,
          }}
        >
          {/* Card 1: Total Registrations */}
          <div className="card cine" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
                Total Registrations
              </span>
              <span style={{ fontSize: 16 }}>📋</span>
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 700, color: "var(--text)" }}>
              {stats.totalRegistrations}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              {stats.confirmedCount} confirmed · {stats.pendingCount} pending
            </div>
          </div>

          {/* Card 2: Expected Revenue */}
          <div className="card cine" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
                Expected Revenue
              </span>
              <span style={{ fontSize: 16 }}>💰</span>
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 700, color: "var(--accent)" }}>
              ₹{stats.expectedRevenue}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              Valid team entries & add-ons
            </div>
          </div>

          {/* Card 3: Total Received */}
          <div className="card cine" style={{ padding: "22px 24px", borderColor: "rgba(74,222,128,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.1em", color: "#4ADE80" }}>
                Total Received
              </span>
              <span style={{ fontSize: 16 }}>✓</span>
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 700, color: "#4ADE80" }}>
              ₹{stats.receivedRevenue}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              {collectionPercent}% collected of expected
            </div>
          </div>

          {/* Card 4: Pending Payments */}
          <div className="card cine" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
                Pending Balance
              </span>
              <span style={{ fontSize: 16 }}>⏳</span>
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 700, color: stats.pendingRevenue > 0 ? "var(--red)" : "var(--muted)" }}>
              ₹{stats.pendingRevenue}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              Awaiting student payment
            </div>
          </div>

          {/* Card 5: Verification Required */}
          <div className="card cine" style={{ padding: "22px 24px", borderColor: stats.verificationRequiredCount > 0 ? "rgba(46,123,255,0.4)" : "var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--blue)" }}>
                Verification Required
              </span>
              <span style={{ fontSize: 16 }}>🔍</span>
            </div>
            <div className="data" style={{ fontSize: 36, fontWeight: 700, color: "var(--blue)" }}>
              {stats.verificationRequiredCount}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              Student submitted UTR / receipt
            </div>
          </div>
        </div>

        {/* Collection Progress Bar */}
        <div className="card cine" style={{ padding: "18px 24px", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Fee Collection Progress</span>
            <span className="data" style={{ fontSize: 13, color: "var(--muted)" }}>
              ₹{stats.receivedRevenue} / ₹{stats.expectedRevenue} ({collectionPercent}%)
            </span>
          </div>
          <div style={{ width: "100%", height: 8, background: "rgba(237,239,230,0.08)", borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                width: `${collectionPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--blue), #4ADE80)",
                borderRadius: 999,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* Navigation Tabs & Search Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="btn"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                borderRadius: 999,
                background: activeTab === "all" ? "var(--white)" : "transparent",
                color: activeTab === "all" ? "var(--bg)" : "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              All ({stats.totalRegistrations})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className="btn"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                borderRadius: 999,
                background: activeTab === "pending" ? "var(--white)" : "transparent",
                color: activeTab === "pending" ? "var(--bg)" : "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              Pending ({stats.pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("confirmed")}
              className="btn"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                borderRadius: 999,
                background: activeTab === "confirmed" ? "var(--white)" : "transparent",
                color: activeTab === "confirmed" ? "var(--bg)" : "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              Confirmed ({stats.confirmedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("verif_required")}
              className="btn"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                borderRadius: 999,
                background: activeTab === "verif_required" ? "var(--blue)" : "transparent",
                color: activeTab === "verif_required" ? "#fff" : "var(--blue)",
                border: "1px solid rgba(46,123,255,0.4)",
              }}
            >
              Verify Needed ({stats.verificationRequiredCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payments")}
              className="btn"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                borderRadius: 999,
                background: activeTab === "payments" ? "var(--white)" : "transparent",
                color: activeTab === "payments" ? "var(--bg)" : "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              Payments Ledger
            </button>
          </div>

          {/* Search Box */}
          <div style={{ minWidth: 320, flex: "1 1 300px", maxWidth: 450 }}>
            <input
              type="text"
              placeholder="Search by team, captain, email, or UTR/Tx ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "10px 16px", fontSize: 14 }}
            />
          </div>
        </div>

        {/* Main Table View */}
        <div className="card cine" style={{ padding: 0, overflowX: "auto" }}>
          {filteredTeams.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 32px", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>No registration records found</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Try clearing your search query or switching tabs.</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(28,32,22,0.4)" }}>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 12, textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 12, textTransform: "uppercase" }}>Team & Captain</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 12, textTransform: "uppercase" }}>Pilots</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 12, textTransform: "uppercase" }}>Fee</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 12, textTransform: "uppercase" }}>Reg Status</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 12, textTransform: "uppercase" }}>Payment Status</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 12, textTransform: "uppercase" }}>Transaction Reference</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 12, textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team, idx) => {
                  const pilots = team.team_members || [];
                  const latestPayment = (team.payments || [])[0];

                  return (
                    <tr
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      style={{
                        borderBottom: idx < filteredTeams.length - 1 ? "1px solid var(--border)" : "none",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,239,230,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* ID */}
                      <td style={{ padding: "16px 20px" }}>
                        <span className="data" style={{ fontWeight: 600, fontSize: 13, color: "var(--accent)" }}>
                          {team.regNumber}
                        </span>
                      </td>

                      {/* Team & Captain */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{team.name}</div>
                        <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
                          {team.captain_name} · <span style={{ opacity: 0.8 }}>{team.captain_email}</span>
                        </div>
                      </td>

                      {/* Pilots */}
                      <td style={{ padding: "16px 20px" }}>
                        <span className="data" style={{ fontWeight: 600 }}>{pilots.length} pilots</span>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          {pilots.slice(0, 2).map((p) => p.name).join(", ")}
                          {pilots.length > 2 && "..."}
                        </div>
                      </td>

                      {/* Fee */}
                      <td style={{ padding: "16px 20px" }}>
                        <div className="data" style={{ fontWeight: 700 }}>₹{team.expectedAmount}</div>
                        {team.training_addon && (
                          <span style={{ fontSize: 11, color: "var(--accent)" }}>+Training</span>
                        )}
                      </td>

                      {/* Reg Status */}
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          className="tag"
                          style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            background:
                              team.status === "approved"
                                ? "rgba(74,222,128,0.12)"
                                : team.status === "pending"
                                ? "rgba(255,176,32,0.12)"
                                : team.status === "rejected"
                                ? "rgba(255,46,99,0.12)"
                                : "rgba(237,239,230,0.06)",
                            color:
                              team.status === "approved"
                                ? "#4ADE80"
                                : team.status === "pending"
                                ? "var(--accent)"
                                : team.status === "rejected"
                                ? "var(--red)"
                                : "var(--muted)",
                            border: `1px solid ${
                              team.status === "approved"
                                ? "rgba(74,222,128,0.3)"
                                : team.status === "pending"
                                ? "rgba(255,176,32,0.3)"
                                : "rgba(255,46,99,0.3)"
                            }`,
                          }}
                        >
                          {team.status === "approved" ? "Confirmed" : team.status}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          className="tag"
                          style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            background:
                              team.derivedPaymentStatus === "paid"
                                ? "rgba(74,222,128,0.12)"
                                : team.derivedPaymentStatus === "verification_required"
                                ? "rgba(46,123,255,0.15)"
                                : team.derivedPaymentStatus === "failed"
                                ? "rgba(255,46,99,0.12)"
                                : "rgba(255,176,32,0.1)",
                            color:
                              team.derivedPaymentStatus === "paid"
                                ? "#4ADE80"
                                : team.derivedPaymentStatus === "verification_required"
                                ? "var(--blue)"
                                : team.derivedPaymentStatus === "failed"
                                ? "var(--red)"
                                : "var(--accent)",
                            border: `1px solid ${
                              team.derivedPaymentStatus === "paid"
                                ? "rgba(74,222,128,0.3)"
                                : team.derivedPaymentStatus === "verification_required"
                                ? "rgba(46,123,255,0.4)"
                                : "rgba(255,176,32,0.3)"
                            }`,
                          }}
                        >
                          {team.derivedPaymentStatus === "verification_required" ? "Verify Needed" : team.derivedPaymentStatus}
                        </span>
                      </td>

                      {/* Transaction Ref */}
                      <td style={{ padding: "16px 20px" }}>
                        <div className="data" style={{ fontSize: 12, color: latestPayment?.transaction_id ? "var(--text)" : "var(--muted)" }}>
                          {latestPayment?.transaction_id || "No reference submitted"}
                        </div>
                        {latestPayment?.method && (
                          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginTop: 2 }}>
                            {latestPayment.method}
                          </div>
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
                          style={{ padding: "6px 14px", fontSize: 12 }}
                        >
                          Manage ➔
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Slide-over Registration Details Drawer */}
      {selectedTeam && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSelectedTeam(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 580,
              height: "100%",
              background: "#161A12",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-10px 0 40px rgba(0,0,0,0.8)",
              padding: "32px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <span className="data" style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>
                  {selectedTeam.regNumber}
                </span>
                <h2 className="h2" style={{ fontSize: 28, margin: "6px 0 4px" }}>
                  {selectedTeam.name}
                </h2>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  Registered on {new Date(selectedTeam.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedTeam(null)}
                style={{ padding: "8px 12px", fontSize: 14 }}
              >
                ✕ Close
              </button>
            </div>

            {/* Quick Status Bar */}
            <div style={{ display: "flex", gap: 12, padding: "16px 20px", background: "rgba(28,32,22,0.7)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Registration</div>
                <div style={{ fontWeight: 700, fontSize: 15, textTransform: "capitalize", color: selectedTeam.status === "approved" ? "#4ADE80" : "var(--accent)" }}>
                  {selectedTeam.status === "approved" ? "Confirmed" : selectedTeam.status}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Payment Status</div>
                <div style={{ fontWeight: 700, fontSize: 15, textTransform: "capitalize", color: selectedTeam.derivedPaymentStatus === "paid" ? "#4ADE80" : "var(--accent)" }}>
                  {selectedTeam.derivedPaymentStatus === "verification_required" ? "Verification Needed" : selectedTeam.derivedPaymentStatus}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Total Balance</div>
                <div className="data" style={{ fontWeight: 700, fontSize: 15, color: selectedTeam.paidAmount >= selectedTeam.expectedAmount ? "#4ADE80" : "var(--red)" }}>
                  ₹{selectedTeam.paidAmount} / ₹{selectedTeam.expectedAmount}
                </div>
              </div>
            </div>

            {/* Participant Information */}
            <div>
              <h3 className="h3" style={{ fontSize: 18, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                Captain Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Name:</span>
                  <div style={{ fontWeight: 600 }}>{selectedTeam.captain_name}</div>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Phone:</span>
                  <div style={{ fontWeight: 600 }}>{selectedTeam.captain_phone || "Not provided"}</div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Official Email:</span>
                  <div style={{ fontWeight: 600 }}>{selectedTeam.captain_email}</div>
                </div>
              </div>
            </div>

            {/* Pilots Roster */}
            <div>
              <h3 className="h3" style={{ fontSize: 18, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                Pilot Roster ({selectedTeam.team_members?.length || 0})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(selectedTeam.team_members || []).map((pilot, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 14px",
                      background: "rgba(28,32,22,0.4)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{pilot.name}</span>
                      <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: 8 }}>#{pilot.jersey_no || pIdx + 1}</span>
                    </div>
                    <span
                      className="tag"
                      style={{
                        fontSize: 11,
                        background: pilot.role === "Striker" ? "rgba(46,123,255,0.15)" : "transparent",
                        color: pilot.role === "Striker" ? "var(--blue)" : "var(--muted)",
                      }}
                    >
                      {pilot.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Verification Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                <h3 className="h3" style={{ fontSize: 18, margin: 0 }}>Payment Verification</h3>
                <button
                  type="button"
                  onClick={() => setRecordPaymentModalOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: 11 }}
                >
                  + Record Payment
                </button>
              </div>

              {selectedTeam.payments && selectedTeam.payments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selectedTeam.payments.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: "16px",
                        background: "rgba(28,32,22,0.6)",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>₹{p.amount_paise / 100}</div>
                        <span
                          className="tag"
                          style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            background: p.status === "paid" ? "rgba(74,222,128,0.12)" : "rgba(46,123,255,0.15)",
                            color: p.status === "paid" ? "#4ADE80" : "var(--blue)",
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 4 }}>
                        <div>Method: <span style={{ color: "var(--text)", textTransform: "uppercase" }}>{p.method || "UPI"}</span></div>
                        <div>Transaction / UTR Ref: <span className="data" style={{ color: "var(--accent)" }}>{p.transaction_id || "None"}</span></div>
                        <div>Recorded: {new Date(p.created_at).toLocaleString("en-IN")}</div>
                      </div>

                      {/* Verification Actions */}
                      {p.status !== "paid" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button
                            type="button"
                            onClick={() => handleVerifyPayment(p.id)}
                            disabled={actionLoading}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: "8px 12px", fontSize: 12, background: "#4ADE80", color: "#12150E" }}
                          >
                            ✓ Verify & Mark Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectPayment(p.id)}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: "8px 12px", fontSize: 12, color: "var(--red)" }}
                          >
                            ✕ Reject Payment
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "20px", background: "rgba(28,32,22,0.4)", borderRadius: 12, border: "1px dashed var(--border)", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  No payments recorded for this team yet.
                </div>
              )}
            </div>

            {/* Registration Actions (Approve / Reject / Cancel) */}
            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <h3 className="h3" style={{ fontSize: 16, marginBottom: 10 }}>Registration Actions</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedTeam.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedTeam.id, "approved")}
                    disabled={actionLoading}
                    className="btn btn-primary"
                    style={{ flex: "1 1 140px", padding: "10px 16px", fontSize: 13 }}
                  >
                    ✓ Confirm Registration
                  </button>
                )}
                {selectedTeam.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="btn btn-secondary"
                    style={{ flex: "1 1 140px", padding: "10px 16px", fontSize: 13, color: "var(--red)" }}
                  >
                    ✕ Reject Registration
                  </button>
                )}
                {selectedTeam.status !== "pending" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedTeam.id, "pending")}
                    disabled={actionLoading}
                    className="btn btn-secondary"
                    style={{ flex: "1 1 120px", padding: "10px 16px", fontSize: 13 }}
                  >
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && selectedTeam && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            padding: 20,
          }}
        >
          <div className="card cine" style={{ maxWidth: 460, width: "100%", padding: 32 }}>
            <h3 className="h3" style={{ fontSize: 22, margin: "0 0 12px" }}>
              Reject Team Registration
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 20px" }}>
              Are you sure you want to reject <strong>{selectedTeam.name}</strong>? Please provide a reason for the record.
            </p>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Reason for Rejection</label>
              <input
                type="text"
                placeholder="e.g. Duplicate team registration, invalid roll numbers"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: "var(--red)", color: "#fff" }}
                onClick={() => handleUpdateStatus(selectedTeam.id, "rejected", rejectionReason)}
                disabled={actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            padding: 20,
          }}
        >
          <div className="card cine" style={{ maxWidth: 460, width: "100%", padding: 32 }}>
            <h3 className="h3" style={{ fontSize: 22, margin: "0 0 8px" }}>
              Record Payment
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px" }}>
              Add a manual UPI, cash, or bank transfer entry for <strong>{selectedTeam.name}</strong>.
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
              <label>Payment Method</label>
              <select
                value={manualMethod}
                onChange={(e) => setManualMethod(e.target.value)}
                style={{ width: "100%", padding: 12, background: "rgba(28,32,22,0.8)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
              >
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="cash">Cash / Venue Collection</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="razorpay">Razorpay Gateway</option>
              </select>
            </div>

            <div className="field">
              <label>Transaction Reference / UTR</label>
              <input
                type="text"
                placeholder="e.g. 4482019941 or cash slip no."
                value={manualTxId}
                onChange={(e) => setManualTxId(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Initial Status</label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value)}
                style={{ width: "100%", padding: 12, background: "rgba(28,32,22,0.8)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
              >
                <option value="paid">Paid (Verified immediately)</option>
                <option value="verification_required">Verification Required</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRecordPaymentModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRecordManualPayment}
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
