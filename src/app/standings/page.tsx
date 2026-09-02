export default function StandingsPage() {
  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "160px 48px 120px" }}>
        <div className="cine" style={{ textAlign: "center", marginBottom: 40 }}>
          <span className="tag">League standings</span>
          <h1 className="h1" style={{ fontSize: "clamp(36px,6vw,60px)", margin: "16px 0 12px" }}>
            Standings
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "56ch", margin: "0 auto" }}>
            Updated after every match once the season starts.
          </p>
        </div>

        <div className="card cine" style={{ marginBottom: 32 }}>
          <div className="tag" style={{ marginBottom: 12 }}>How points work</div>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Win a match: 3 points. Draw: 1 point each. Loss: 0 points. Ties on points are broken by goal difference, then head-to-head result.
          </p>
        </div>

        <div className="card cine" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "var(--muted)", fontSize: 13, textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "16px 32px" }}>#</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th style={{ paddingRight: 32 }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={10} style={{ padding: "64px 32px", textAlign: "center", color: "var(--muted)" }}>
                  No teams registered yet. Standings populate once the season begins in September.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
