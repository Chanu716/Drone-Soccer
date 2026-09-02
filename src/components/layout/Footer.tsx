import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#201e1d]/10 bg-[#efe1cb]/50 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: University & League info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#c67139] flex items-center justify-center text-[#f5ead8] font-bold text-xs">
                DS
              </div>
              <span className="font-heading font-bold text-lg text-[#201e1d]">Drone Soccer</span>
            </div>
            <p className="text-xs text-[#6b635c] leading-relaxed">
              Official campus drone sports tournament of {siteConfig.university}. Matches held across campus every Wednesday and Thursday.
            </p>
            <div className="pt-2 text-xs text-[#6b635c]">
              <span className="font-semibold text-[#201e1d]">Faculty Advisor:</span><br />
              {siteConfig.facultyAdvisor.name}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#201e1d]">Compete</h4>
            <ul className="space-y-2 text-sm text-[#6b635c]">
              <li><Link href="/register" className="hover:text-[#c67139] transition-colors">Team Registration (₹100)</Link></li>
              <li><Link href="/fixtures" className="hover:text-[#c67139] transition-colors">Match Fixtures</Link></li>
              <li><Link href="/standings" className="hover:text-[#c67139] transition-colors">League Standings</Link></li>
              <li><Link href="/teams" className="hover:text-[#c67139] transition-colors">Team Rosters</Link></li>
            </ul>
          </div>

          {/* Col 3: Block Venues */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#201e1d]">Campus Arenas</h4>
            <ul className="space-y-2 text-sm text-[#6b635c]">
              {siteConfig.blockRotation.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#201e1d]">{b.name}</span>
                  <span className="text-[#6b635c]/70">{b.tag}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Safety & Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#201e1d]">Safety & Info</h4>
            <ul className="space-y-2 text-sm text-[#6b635c]">
              <li><Link href="/#rules" className="hover:text-[#c67139] transition-colors">Official Game Rules</Link></li>
              <li><Link href="/training" className="hover:text-[#c67139] transition-colors">Beginner Bootcamp</Link></li>
              <li><a href="mailto:dronesoccer@srmap.edu.in" className="hover:text-[#c67139] transition-colors">{siteConfig.contactEmail}</a></li>
              <li><span className="text-xs text-[#6b635c]">Instagram: {siteConfig.instagram}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#201e1d]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b635c]">
          <p>© 2026 Drone Soccer @ SRM AP. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Requires signed safety waiver</span>
            <span>·</span>
            <span>@srmap.edu.in verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
