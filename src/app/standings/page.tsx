"use client";

import { useState, useEffect } from "react";

interface StandingRow {
  team_id: string;
  team_name: string;
  team_slug: string;
  captain_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/standings")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.standings) {
          setStandings(data.standings);
        }
      })
      .catch((err) => console.error("Error loading standings:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "160px 48px 120px" }}>
        <div className="cine" style={{ textAlign: "center", marginBottom: 40 }}>
          <span className="tag">League standings</span>
          <h1 className="h1" style={{ fontSize: "clamp(36px,6vw,60px)", margin: "16px 0 12px" }}>
            Standings
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "56ch", margin: "0 auto" }}>
            Computed live from PostgreSQL match records and tiebreaker rules.
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
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: "64px 32px", textAlign: "center", color: "var(--muted)" }}>
                    Loading standings from database...
                  </td>
                </tr>
              ) : standings.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: "64px 32px", textAlign: "center", color: "var(--muted)" }}>
                    No completed matches recorded yet. Standings will automatically calculate once matches are played.
                  </td>
                </tr>
              ) : (
                standings.map((row, idx) => (
                  <tr key={row.team_id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "16px 32px", fontWeight: 700 }} className="data">{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{row.team_name}</td>
                    <td className="data">{row.played}</td>
                    <td className="data">{row.won}</td>
                    <td className="data">{row.drawn}</td>
                    <td className="data">{row.lost}</td>
                    <td className="data">{row.goals_for}</td>
                    <td className="data">{row.goals_against}</td>
                    <td className="data">{row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}</td>
                    <td style={{ paddingRight: 32, fontWeight: 700, color: "var(--accent)" }} className="data">{row.points}</td>
                  </tr>
                ))
              )}
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
