import Link from "next/link";
import { SAMPLE_FIXTURES, SAMPLE_TEAMS } from "@/content/sample-data";
import { ArrowRight, Calendar, Award } from "lucide-react";

export function FixturesStandingsTeaser() {
  const topTeams = [...SAMPLE_TEAMS].sort((a, b) => b.stats.points - a.stats.points).slice(0, 4);
  const upcomingFixtures = SAMPLE_FIXTURES.slice(0, 3);

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Upcoming Fixtures */}
        <div className="lg:col-span-6 card-organic p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#201e1d]/10">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#c67139]" />
                <h3 className="font-heading text-xl font-bold text-[#201e1d]">This Week&apos;s Matchups</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#c67139]/15 text-[#c67139] font-semibold uppercase">
                Week 01
              </span>
            </div>

            <div className="space-y-3">
              {upcomingFixtures.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-[#efe1cb]/60 border border-[#201e1d]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-[#201e1d]">
                      {f.teamA || "TBD"} <span className="text-[#c67139]">vs</span> {f.teamB || "TBD"}
                    </div>
                    <div className="text-[11px] text-[#6b635c]">{f.block} · {f.venue}</div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div className="text-xs text-[#6b635c] data">{f.date}</div>
                    {f.status === "completed" ? (
                      <span className="text-xs font-bold text-[#c67139] data px-2 py-0.5 rounded bg-[#c67139]/15">
                        {f.scoreA} - {f.scoreB}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#7a8a5e]/20 text-[#7a8a5e] uppercase">
                        {f.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#201e1d]/10 mt-6 flex justify-end">
            <Link
              href="/fixtures"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c67139] hover:underline"
            >
              View Full 17-Week Calendar <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Col: Standings Table Snapshot */}
        <div className="lg:col-span-6 card-organic p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#201e1d]/10">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#7a8a5e]" />
                <h3 className="font-heading text-xl font-bold text-[#201e1d]">League Standings</h3>
              </div>
              <span className="text-xs text-[#6b635c]">Top 4 Qualifiers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#201e1d]/10 text-[#6b635c] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">#</th>
                    <th className="pb-3">Team</th>
                    <th className="pb-3 text-center">P</th>
                    <th className="pb-3 text-center">W</th>
                    <th className="pb-3 text-center">GD</th>
                    <th className="pb-3 text-right pr-2">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#201e1d]/5">
                  {topTeams.map((team, idx) => {
                    const gd = team.stats.goalsFor - team.stats.goalsAgainst;
                    return (
                      <tr key={team.id} className="hover:bg-[#efe1cb]/40 transition-colors">
                        <td className="py-3 pl-2 font-bold text-[#201e1d] data">{idx + 1}</td>
                        <td className="py-3">
                          <div className="font-semibold text-[#201e1d]">{team.name}</div>
                          <div className="text-[10px] text-[#6b635c]">{team.captain}</div>
                        </td>
                        <td className="py-3 text-center text-[#6b635c] data">{team.stats.played}</td>
                        <td className="py-3 text-center text-[#6b635c] data">{team.stats.won}</td>
                        <td className="py-3 text-center text-[#6b635c] data">{gd > 0 ? `+${gd}` : gd}</td>
                        <td className="py-3 text-right pr-2 font-bold text-[#c67139] data text-sm">
                          {team.stats.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-6 border-t border-[#201e1d]/10 mt-6 flex justify-end">
            <Link
              href="/standings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7a8a5e] hover:underline"
            >
              Full League Table & Tiebreakers <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
