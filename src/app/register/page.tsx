"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Zap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "payment">("form");
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pilots, setPilots] = useState([
    { name: "", role: "Striker" },
    { name: "", role: "Defender" },
    { name: "", role: "Defender" },
  ]);
  const [training, setTraining] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [confirmedData, setConfirmedData] = useState<{
    teamName: string;
    captainEmail: string;
    transactionId: string;
    amount: number;
    teamId?: string;
  } | null>(null);

  const total = 100 + (training ? 100 : 0);
  const upiId = "srmap.dronesoccer@upi";
  const payeeName = "Drone Soccer SRM AP";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR&tn=${encodeURIComponent(
    `DroneSoccer-${teamName || "Team"}`
  )}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(
    upiUrl
  )}`;

  const addPilot = () => {
    if (pilots.length < 5) {
      setPilots([...pilots, { name: "", role: "Defender" }]);
    }
  };

  const removePilot = (idx: number) => {
    if (pilots.length > 3) {
      setPilots(pilots.filter((_, i) => i !== idx));
    }
  };

  const setPilotName = (idx: number, val: string) => {
    setPilots(pilots.map((p, i) => (i === idx ? { ...p, name: val } : p)));
  };

  const setPilotRole = (idx: number, val: string) => {
    setPilots(pilots.map((p, i) => (i === idx ? { ...p, role: val } : p)));
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleProceedToPayment = () => {
    if (!teamName.trim() || !captainName.trim() || !captainEmail.trim()) {
      setError("Please enter team name, captain name, and captain email.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Please create an account password with at least 6 characters.");
      return;
    }
    if (pilots.some((p) => !p.name.trim())) {
      setError("Every pilot in the roster must have a valid name.");
      return;
    }
    setError("");
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    if (!transactionId.trim()) {
      setError("Please enter your 12-digit UPI Reference / UTR Number after completing payment.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          captainName: captainName.trim(),
          captainPhone: captainPhone.trim(),
          captainEmail: captainEmail.trim(),
          password,
          pilots,
          training,
          transactionId: transactionId.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete registration.");
      }

      setConfirmedData({
        teamName,
        captainEmail,
        transactionId: data.transactionId || transactionId.trim().toUpperCase(),
        amount: total,
        teamId: data.team?.id,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration submission failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setTeamName("");
    setCaptainName("");
    setCaptainPhone("");
    setCaptainEmail("");
    setPilots([
      { name: "", role: "Striker" },
      { name: "", role: "Defender" },
      { name: "", role: "Defender" },
    ]);
    setTraining(false);
    setTransactionId("");
    setSubmitted(false);
    setConfirmedData(null);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      <main style={{ maxWidth: 840, margin: "0 auto", padding: "140px 32px 100px" }}>
        {/* Header */}
        <div className="cine" style={{ textAlign: "center", marginBottom: 44 }}>
          <span className="tag" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Zap size={14} color="#c8ff00" /> Drone Soccer League · Registration
          </span>
          <h1 className="h1" style={{ fontSize: "clamp(32px,5.5vw,56px)", margin: "8px 0 12px" }}>
            Register your team
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "56ch", margin: "0 auto", fontSize: 15 }}>
            ₹100 entry fee per team. 3 to 5 pilots per roster. Scan the QR code to pay with any UPI app; registrations are automatically confirmed upon submission.
          </p>
        </div>

        {/* Success Screen */}
        {submitted && confirmedData ? (
          <div className="card cine" style={{ textAlign: "center", padding: "52px 36px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "2px solid #c8ff00",
                background: "rgba(200, 255, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "#c8ff00",
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div
              className="tag"
              style={{
                background: "rgba(200, 255, 0, 0.15)",
                color: "#c8ff00",
                border: "1px solid #c8ff00",
                marginBottom: 12,
              }}
            >
              Payment Recorded · Confirmed
            </div>

            <h2 className="h2" style={{ fontSize: 34, margin: "0 0 10px" }}>
              Registration Successful!
            </h2>
            <p style={{ color: "var(--muted)", maxWidth: "50ch", margin: "0 auto 28px", fontSize: 15 }}>
              Your team <strong style={{ color: "var(--text)" }}>{confirmedData.teamName}</strong> has been successfully registered and approved into the league.
            </p>

            {/* Receipt Summary Card */}
            <div
              style={{
                maxWidth: 480,
                margin: "0 auto 32px",
                padding: "20px 24px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Status</span>
                <span style={{ color: "#c8ff00", fontWeight: 700 }}>Confirmed ✓</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Payment Method</span>
                <span>UPI QR</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>UPI Reference / UTR</span>
                <span className="data" style={{ fontWeight: 700, color: "var(--text)" }}>
                  {confirmedData.transactionId}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Amount Paid</span>
                <span className="data" style={{ color: "#c8ff00", fontWeight: 700 }}>
                  ₹{confirmedData.amount}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Captain Email</span>
                <span>{confirmedData.captainEmail}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/login"
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                Sign In to Team Dashboard <ArrowRight size={16} />
              </Link>
              <Link
                href="/teams"
                className="btn btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                View Registered Teams
              </Link>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Register Another Team
              </button>
            </div>
          </div>
        ) : step === "form" ? (
          /* STEP 1: Team & Pilot Form */
          <div className="card cine">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#c8ff00", fontWeight: 700 }}>
                Step 1 of 2: Team Roster
              </div>
              <span className="tag" style={{ fontSize: 12 }}>Base Fee: ₹100</span>
            </div>

            <div className="field">
              <label>Team Name *</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Falcon Squadron"
                disabled={loading}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              <div className="field">
                <label>Captain Name *</label>
                <input
                  type="text"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  placeholder="Full name"
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label>Captain Phone (WhatsApp)</label>
                <input
                  type="tel"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              <div className="field">
                <label>Captain Email *</label>
                <input
                  type="email"
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                  placeholder="name@srmap.edu.in"
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label>Account Password (for Dashboard Login) *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  disabled={loading}
                />
              </div>
            </div>

            <div
              style={{
                margin: "32px 0 16px",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border)",
                paddingBottom: 8,
              }}
            >
              <div className="h3" style={{ margin: 0, fontSize: 22 }}>
                Pilots ({pilots.length} / 5)
              </div>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>3 to 5 pilots required</span>
            </div>

            {pilots.map((pilot, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: 12,
                  alignItems: "end",
                  marginBottom: 14,
                }}
              >
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Pilot {i + 1} Name *</label>
                  <input
                    type="text"
                    value={pilot.name}
                    onChange={(e) => setPilotName(i, e.target.value)}
                    placeholder="Pilot full name"
                    disabled={loading}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Role</label>
                  <select
                    value={pilot.role}
                    onChange={(e) => setPilotRole(i, e.target.value)}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="Striker">Striker</option>
                    <option value="Defender">Defender</option>
                    <option value="Keeper">Keeper</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => removePilot(i)}
                  disabled={pilots.length <= 3 || loading}
                  style={{ padding: "12px 16px" }}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={addPilot}
              disabled={pilots.length >= 5 || loading}
              style={{ marginBottom: 20 }}
            >
              + Add Pilot (Max 5)
            </button>

            {/* Training Add-on */}
            <div
              style={{
                margin: "24px 0 0",
                padding: 20,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Arena Training Access</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  +₹100 weekly high-bay practice slots & coaching
                </div>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => setTraining(!training)}
                disabled={loading}
                style={{
                  background: training ? "#c8ff00" : "transparent",
                  color: training ? "#000" : "var(--text)",
                  border: training ? "1px solid #c8ff00" : "1px solid var(--border)",
                  fontWeight: training ? 700 : 500,
                  padding: "8px 16px",
                }}
              >
                {training ? "✓ Training Included (+₹100)" : "+ Add Training (+₹100)"}
              </button>
            </div>

            {/* Price Total */}
            <div
              style={{
                margin: "24px 0 20px",
                padding: 16,
                background: "rgba(200,255,0,0.04)",
                border: "1px solid rgba(200,255,0,0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 16 }}>Payable Amount</span>
              <span className="data" style={{ color: "#c8ff00", fontSize: 24, fontWeight: 900 }}>
                ₹{total}
              </span>
            </div>

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,77,77,0.1)",
                  border: "1px solid rgba(255,77,77,0.3)",
                  color: "#ff6b6b",
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleProceedToPayment}
              style={{
                width: "100%",
                padding: 16,
                fontSize: 17,
                fontWeight: 700,
                background: "#c8ff00",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              Proceed to QR Payment (₹{total}) <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* STEP 2: QR Payment Screen */
          <div className="card cine">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep("form")}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px" }}
              >
                <ArrowLeft size={14} /> Back to Roster
              </button>
              <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#c8ff00", fontWeight: 700 }}>
                Step 2 of 2: Scan & Pay
              </div>
            </div>

            {/* Payment instructions */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div className="tag" style={{ background: "rgba(200,255,0,0.1)", color: "#c8ff00", border: "1px solid #c8ff00", marginBottom: 10 }}>
                <QrCode size={13} style={{ display: "inline", marginRight: 4 }} /> UPI QR Payment
              </div>
              <h2 className="h2" style={{ fontSize: 28, margin: "0 0 6px" }}>
                Scan to Pay ₹{total}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
                Pay using Google Pay, PhonePe, Paytm, or any UPI app.
              </p>
            </div>

            {/* QR Code Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                width: "fit-content",
                margin: "0 auto 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                width={240}
                height={240}
                style={{ display: "block", borderRadius: 4 }}
              />
              <div style={{ color: "#000", fontWeight: 800, fontSize: 18, marginTop: 12, textAlign: "center" }}>
                ₹{total}
              </div>
              <div style={{ color: "#555", fontSize: 12, marginTop: 2, textAlign: "center" }}>
                {payeeName}
              </div>
            </div>

            {/* UPI ID Copy Block */}
            <div
              style={{
                maxWidth: 440,
                margin: "0 auto 28px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>UPI ID</div>
                <div className="data" style={{ fontSize: 14, fontWeight: 700 }}>{upiId}</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopyUpi}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px" }}
              >
                {copiedUpi ? <Check size={14} color="#c8ff00" /> : <Copy size={14} />}
                {copiedUpi ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Instructions */}
            <div
              style={{
                maxWidth: 520,
                margin: "0 auto 28px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                padding: 16,
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Instructions:</div>
              <div>1. Scan the QR code with your UPI app and pay <strong>₹{total}</strong>.</div>
              <div>2. Once the payment succeeds, locate the <strong>12-digit UPI Reference / UTR Number</strong> in your payment receipt.</div>
              <div>3. Enter the reference number below to complete your team registration.</div>
            </div>

            {/* Transaction ID / UTR Input */}
            <div style={{ maxWidth: 520, margin: "0 auto 20px" }}>
              <div className="field">
                <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  UPI Reference / UTR / Transaction ID *
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 425188291034"
                  disabled={loading}
                  style={{
                    fontSize: 16,
                    letterSpacing: "0.05em",
                    borderColor: transactionId.trim() ? "#c8ff00" : "var(--border)",
                  }}
                />
                <span style={{ color: "var(--muted)", fontSize: 12, marginTop: 4, display: "block" }}>
                  Registration is confirmed only after entering the completed payment reference.
                </span>
              </div>
            </div>

            {error && (
              <div
                style={{
                  maxWidth: 520,
                  margin: "0 auto 16px",
                  padding: "12px 16px",
                  background: "rgba(255,77,77,0.1)",
                  border: "1px solid rgba(255,77,77,0.3)",
                  color: "#ff6b6b",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinalSubmit}
                disabled={loading || !transactionId.trim()}
                style={{
                  width: "100%",
                  padding: 16,
                  fontSize: 17,
                  fontWeight: 700,
                  background: "#c8ff00",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  opacity: !transactionId.trim() ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Submitting Registration & Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Complete Registration (₹{total})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer
        style={{
          maxWidth: 1521,
          margin: "0 auto",
          padding: "24px 32px 80px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        Drone Soccer SRM AP · Official League Registration with UPI QR Payment.
      </footer>
    </div>
  );
}