"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Zap, ArrowRight, Loader2, CreditCard, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RegisterPage() {
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [pilots, setPilots] = useState([
    { name: "", role: "Striker" },
    { name: "", role: "Defender" },
    { name: "", role: "Defender" },
  ]);
  const [training, setTraining] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  // Razorpay Checkout & verification details
  const [verifiedDetails, setVerifiedDetails] = useState<{
    teamName: string;
    captainEmail: string;
    paymentId: string;
    orderId: string;
    amount: number;
    approvedAt: string;
  } | null>(null);

  // Simulated modal for test gateway mode
  const [simulatingModal, setSimulatingModal] = useState<{
    orderId: string;
    teamId: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    // Load official Razorpay Checkout SDK dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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

  const total = 100 + (training ? 100 : 0);

  // Complete verification handler
  const completeVerification = async (payload: {
    orderId: string;
    paymentId: string;
    signature: string;
    teamId: string;
    amount: number;
  }) => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      setVerifiedDetails({
        teamName,
        captainEmail,
        paymentId: payload.paymentId,
        orderId: payload.orderId,
        amount: payload.amount,
        approvedAt: new Date().toLocaleTimeString(),
      });
      setSimulatingModal(null);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!teamName.trim() || !captainName.trim() || !captainEmail.trim()) {
      setError("Please fill in team name and captain details.");
      return;
    }
    if (pilots.some((p) => !p.name.trim())) {
      setError("Every pilot needs a valid name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Create order on backend (computes fee server-side, saves team in Supabase)
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          captainName,
          captainPhone,
          captainEmail,
          pilots,
          training,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initialize payment.");
      }

      // 2. Check if live Razorpay SDK is available and live credentials are set
      const isLiveRazorpay =
        typeof window !== "undefined" &&
        window.Razorpay &&
        orderData.keyId &&
        !orderData.isSimulated &&
        orderData.keyId.startsWith("rzp_");

      if (isLiveRazorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "Drone Soccer League · SRM AP",
          description: `Team Registration Fee · ${teamName}`,
          image: "https://placehold.co/128x128/12150E/c8ff00?text=DS",
          order_id: orderData.orderId,
          prefill: {
            name: captainName,
            email: captainEmail,
            contact: captainPhone || "",
          },
          theme: {
            color: "#c8ff00",
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError("Payment was cancelled. You can retry whenever you're ready.");
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            await completeVerification({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              teamId: orderData.teamId,
              amount: total,
            });
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          setError(response?.error?.description || "Payment failed at Razorpay.");
          setLoading(false);
        });
        rzp.open();
        setLoading(false);
      } else {
        // Fallback / Simulator Mode for local dev without live keys
        setLoading(false);
        setSimulatingModal({
          orderId: orderData.orderId,
          teamId: orderData.teamId,
          amount: total,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
      setLoading(false);
    }
  };

  const handleSimulatedPay = async () => {
    if (!simulatingModal) return;
    const simPaymentId = `pay_sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const simSignature = `sig_sim_${Date.now()}`;

    await completeVerification({
      orderId: simulatingModal.orderId,
      paymentId: simPaymentId,
      signature: simSignature,
      teamId: simulatingModal.teamId,
      amount: simulatingModal.amount,
    });
  };

  const handleReset = () => {
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
    setSubmitted(false);
    setVerifiedDetails(null);
    setSimulatingModal(null);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      <main style={{ maxWidth: 840, margin: "0 auto", padding: "160px 48px 120px" }}>
        <div className="cine" style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="tag" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Zap size={14} color="#c8ff00" /> Automated Registration & Payment
          </span>
          <h1 className="h1" style={{ fontSize: "clamp(36px,6vw,60px)", margin: "16px 0 12px" }}>
            Register your team
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "56ch", margin: "0 auto" }}>
            ₹100 per team. 3 to 5 pilots per roster. Secure payment via Razorpay with instant cryptographic verification and automatic registration acceptance.
          </p>
        </div>

        {!submitted ? (
          <div className="card cine">
            <div className="field">
              <label>Team name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Falcon Squadron"
                disabled={loading}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              <div className="field">
                <label>Captain name</label>
                <input
                  type="text"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  placeholder="Full name"
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label>Captain phone</label>
                <input
                  type="tel"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  placeholder="10-digit number"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field">
              <label>Captain email</label>
              <input
                type="email"
                value={captainEmail}
                onChange={(e) => setCaptainEmail(e.target.value)}
                placeholder="name@srmap.edu.in"
                disabled={loading}
              />
            </div>

            <div style={{ margin: "32px 0 16px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div className="h3" style={{ margin: 0, fontSize: 26 }}>Active Pilots</div>
              <span className="data" style={{ color: "var(--muted)", fontSize: 13 }}>
                {pilots.length} / 5 pilots
              </span>
            </div>

            {pilots.map((pilot, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: 12,
                  alignItems: "end",
                  marginBottom: 16,
                }}
              >
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Pilot {i + 1} name</label>
                  <input
                    type="text"
                    value={pilot.name}
                    onChange={(e) => setPilotName(i, e.target.value)}
                    placeholder="Full name"
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
              style={{ marginBottom: 8 }}
            >
              + Add pilot
            </button>

            <div
              style={{
                margin: "32px 0 0",
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>Training access</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>+₹100 this week (arena flight practice)</div>
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
                }}
              >
                {training ? "✓ Training Included" : "+ Add training"}
              </button>
            </div>

            {/* Price Breakdown */}
            <div style={{ margin: "24px 0 16px", background: "rgba(255,255,255,0.02)", padding: 20, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 8px", color: "var(--muted)" }}>
                <span>League Team Registration</span>
                <span className="data">₹100</span>
              </div>
              {training && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 8px", color: "var(--muted)" }}>
                  <span>Weekly Arena Training Access</span>
                  <span className="data">₹100</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0 0",
                  borderTop: "1px solid var(--border)",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                <span>Total Amount</span>
                <span className="data" style={{ color: "#c8ff00" }}>₹{total}</span>
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.3)", color: "#ff6b6b", fontSize: 14, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: 16,
                fontSize: 18,
                fontWeight: 700,
                background: "#c8ff00",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connecting to Razorpay...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Pay ₹{total} & Register Team
                </>
              )}
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16, color: "var(--muted)", fontSize: 12 }}>
              <ShieldCheck size={16} color="#c8ff00" />
              <span>Automated Razorpay verification — No manual UTR entry needed. Instant approval!</span>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="card cine" style={{ textAlign: "center", padding: "56px 40px" }}>
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
                margin: "0 auto 24px",
                color: "#c8ff00",
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div className="tag" style={{ background: "rgba(200, 255, 0, 0.15)", color: "#c8ff00", border: "1px solid #c8ff00", marginBottom: 12 }}>
              Auto-Verified · Approved
            </div>

            <h2 className="h2" style={{ fontSize: 36, margin: "0 0 12px" }}>
              Registration & Payment Confirmed!
            </h2>
            <p style={{ color: "var(--muted)", maxWidth: "52ch", margin: "0 auto 24px" }}>
              Your team <strong style={{ color: "var(--text)" }}>{verifiedDetails?.teamName}</strong> has been automatically reviewed and accepted into the Drone Soccer League.
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Payment Status</span>
                <span style={{ color: "#c8ff00", fontWeight: 700 }}>Auto-Verified (Captured)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Razorpay Payment ID</span>
                <span className="data" style={{ fontSize: 12 }}>{verifiedDetails?.paymentId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Order Reference</span>
                <span className="data" style={{ fontSize: 12 }}>{verifiedDetails?.orderId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Amount Paid</span>
                <span className="data" style={{ fontWeight: 700 }}>₹{verifiedDetails?.amount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>Captain Email</span>
                <span>{verifiedDetails?.captainEmail}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/teams" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                View All Teams <ArrowRight size={16} />
              </Link>
              <button className="btn btn-secondary" onClick={handleReset}>
                Register Another Team
              </button>
            </div>
          </div>
        )}

        {/* Razorpay Test Gateway Simulator Modal */}
        {simulatingModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 24,
            }}
          >
            <div
              className="card cine"
              style={{
                maxWidth: 460,
                width: "100%",
                background: "#161914",
                border: "1px solid #c8ff00",
                padding: 32,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <CreditCard size={24} color="#c8ff00" />
                <h3 className="h3" style={{ margin: 0, fontSize: 22 }}>Razorpay Gateway</h3>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
                Development Gateway mode is active. Choose your preferred test method to verify payment signature and trigger immediate backend team approval:
              </p>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, border: "1px solid var(--border)", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "var(--muted)" }}>Order ID:</span>
                  <span className="data" style={{ fontSize: 13 }}>{simulatingModal.orderId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Amount Due:</span>
                  <span className="data" style={{ color: "#c8ff00", fontWeight: 700 }}>₹{simulatingModal.amount}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSimulatedPay}
                  disabled={loading}
                  style={{
                    background: "#c8ff00",
                    color: "#000",
                    fontWeight: 700,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Verifying Signature...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Simulate Successful Payment (UPI / Card)
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSimulatingModal(null)}
                  disabled={loading}
                  style={{ padding: 12 }}
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer
        style={{
          maxWidth: 1521,
          margin: "0 auto",
          padding: "24px 48px 80px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        Drone Soccer SRM AP · Official League Registration with Automated Razorpay Verification.
      </footer>
    </div>
  );
}
