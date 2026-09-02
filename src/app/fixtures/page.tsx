export default function FixturesPage() {
  const venues = ["C V Raman Block", "SR Block", "X Lab", "Admin Block"];
  const start = new Date(2026, 8, 1);
  const end = new Date(2026, 11, 31);
  const slots = [];
  let vi = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 3 || day === 4) {
      slots.push({
        date: d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }),
        monthKey: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        time: "4:00 PM – 6:00 PM",
        venue: venues[vi % venues.length],
      });
      vi++;
    }
  }

  const map = new Map<string, typeof slots>();
  slots.forEach((s) => {
    if (!map.has(s.monthKey)) map.set(s.monthKey, []);
    map.get(s.monthKey)!.push(s);
  });
  const months = Array.from(map.entries()).map(([month, items]) => ({ month, items }));

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "160px 48px 120px" }}>
        <div className="cine" style={{ textAlign: "center", marginBottom: 40 }}>
          <span className="tag">Match schedule</span>
          <h1 className="h1" style={{ fontSize: "clamp(36px,6vw,60px)", margin: "16px 0 12px" }}>
            Fixtures
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "56ch", margin: "0 auto" }}>
            Sep 1 – Dec 31, every Wednesday and Thursday, rotating across four venues. Matchups fill in once team registration closes.
          </p>
        </div>

        {months.map((m) => (
          <div key={m.month}>
            <div className="cine" style={{ margin: "48px 0 16px" }}>
              <span className="tag">{m.month}</span>
            </div>
            <div className="card">
              {m.items.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "130px 1fr 1fr auto",
                    gap: 16,
                    alignItems: "center",
                    padding: "18px 32px",
                    borderBottom: idx === m.items.length - 1 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <div className="data" style={{ color: "var(--muted)", fontSize: 13 }}>
                    {slot.date}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    TBD <span style={{ color: "var(--muted)", fontWeight: 400 }}>vs</span> TBD
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 14 }}>
                    {slot.venue} · {slot.time}
                  </div>
                  <span className="tag">Open</span>
                </div>
              ))}
            </div>
          </div>
        ))}
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
