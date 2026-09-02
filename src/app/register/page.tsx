"use client";

import { useState } from "react";

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

  const handleSubmit = async () => {
    if (!teamName.trim() || !captainName.trim() || !captainEmail.trim()) {
      setError("Fill in team name and captain details.");
      return;
    }
    if (pilots.some((p) => !p.name.trim())) {
      setError("Every pilot needs a name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/register", {
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register team.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
    setError("");
  };

  const total = 100 + (training ? 100 : 0);

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      <main style={{ maxWidth: 840, margin: "0 auto", padding: "160px 48px 120px" }}>
        <div className="cine" style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="tag">Team registration</span>
          <h1 className="h1" style={{ fontSize: "clamp(36px,6vw,60px)", margin: "16px 0 12px" }}>
            Register your team
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "56ch", margin: "0 auto" }}>
            ₹100 per team for the league. 3 to 5 pilots per team. Add training access for ₹100 more — a weekly recharge, active only for that week.
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
              <div className="h3" style={{ margin: 0, fontSize: 26 }}>Pilots</div>
              <span className="data" style={{ color: "var(--muted)", fontSize: 13 }}>
                {pilots.length} / 5
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
                  <input
                    type="text"
                    value={pilot.role}
                    onChange={(e) => setPilotRole(i, e.target.value)}
                    placeholder="Striker / Defender"
                    disabled={loading}
                  />
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
                <div style={{ color: "var(--muted)", fontSize: 14 }}>+₹100 this week</div>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => setTraining(!training)}
                disabled={loading}
                style={{
                  background: training ? "var(--white)" : "transparent",
                  color: training ? "var(--bg)" : "var(--text)",
                  border: "1px solid var(--border)",
                }}
              >
                {training ? "Added" : "Add training"}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 0 8px", color: "var(--muted)" }}>
              <span>League registration</span>
              <span className="data">₹100</span>
            </div>
            {training && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 8px", color: "var(--muted)" }}>
                <span>Training add-on</span>
                <span className="data">₹100</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderTop: "1px solid var(--border)",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              <span>Total</span>
              <span className="data">₹{total}</span>
            </div>

            {error && <p style={{ color: "var(--red)", fontSize: 14, margin: "16px 0 0" }}>{error}</p>}

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: "100%", padding: 16, fontSize: 17, marginTop: 24 }}
            >
              {loading ? "Submitting registration..." : "Submit registration"}
            </button>
            <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", margin: "16px 0 0" }}>
              Payment is collected after your slot is confirmed — instructions go to the captain&apos;s email.
            </p>
          </div>
        ) : (
          <div className="card cine" style={{ textAlign: "center", padding: "64px 48px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "2px solid var(--white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 24,
              }}
            >
              ✓
            </div>
            <h2 className="h2" style={{ fontSize: 32, margin: "0 0 12px" }}>
              Registration received
            </h2>
            <p style={{ color: "var(--muted)", maxWidth: "48ch", margin: "0 auto 24px" }}>
              {teamName} is on the list. Payment instructions and slot confirmation will be emailed to {captainEmail} once organisers review the entry.
            </p>
            <button className="btn btn-secondary" onClick={handleReset}>
              Register another team
            </button>
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
        Drone Soccer SRM AP · A student league at SRM University, Andhra Pradesh.
      </footer>
    </div>
  );
}
