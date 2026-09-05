"use client";

import { useState, useEffect } from "react";

interface TeamMember {
  name: string;
  role: string;
  jersey_no?: number;
}

interface TeamItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  captain_name: string;
  captain_email: string;
  status: string;
  team_members?: TeamMember[];
}

export default function TeamsPage() {
  const [query, setQuery] = useState("");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.teams) {
          setTeams(data.teams);
        }
      })
      .catch((err) => console.error("Error loading teams:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.captain_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      <main style={{ maxWidth: 840, margin: "0 auto", padding: "160px 48px 120px" }}>
        <div className="cine" style={{ textAlign: "center", marginBottom: 40 }}>
          <span className="tag">Teams</span>
          <h1 className="h1" style={{ fontSize: "clamp(36px,6vw,60px)", margin: "16px 0 12px" }}>
            Team details
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "56ch", margin: "0 auto" }}>
            Search any registered team for its roster, captain contact and match record.
          </p>
        </div>

        <div className="cine" style={{ maxWidth: 420, margin: "0 auto 40px" }}>
          <input
            type="text"
            placeholder="Search by team name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Live teams list from Supabase */}
        {loading ? (
          <div className="card cine" style={{ textAlign: "center", padding: "64px 48px", marginBottom: 32 }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>Loading teams from database...</p>
          </div>
        ) : filteredTeams.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            {filteredTeams.map((team) => {
              const initials = team.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const pilots = team.team_members || [];

              return (
                <div
                  key={team.id}
                  className="card cine"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 24,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: 24,
                      background: "var(--bg)",
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 20 }}>{team.name}</div>
                      <span className="tag" style={{ textTransform: "capitalize", fontSize: 11 }}>
                        {team.status}
                      </span>
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
                      Captain: {team.captain_name} ({team.captain_email}) · {pilots.length} pilots
                    </div>
                    {pilots.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                        {pilots.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            style={{
                              fontSize: 12,
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: "rgba(237,239,230,0.06)",
                              border: "1px solid var(--border)",
                              color: p.role === "Striker" ? "var(--blue)" : "var(--muted)",
                            }}
                          >
                            {p.name} ({p.role})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card cine" style={{ textAlign: "center", padding: "64px 48px", marginBottom: 32 }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              No matching teams found in the database.
            </p>
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
