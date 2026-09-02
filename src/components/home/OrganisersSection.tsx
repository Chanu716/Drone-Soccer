import { siteConfig } from "@/lib/site";
import { GraduationCap, Shield } from "lucide-react";

export function OrganisersSection() {
  const { organisers, facultyAdvisor } = siteConfig;

  return (
    <section id="organisers" className="py-16 px-6 max-w-6xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#c67139]">
          Leadership & Operations
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#201e1d]">
          Behind The League
        </h2>
        <p className="text-sm text-[#6b635c]">
          Student engineers, pilots, and safety marshals driving collegiate drone sports at SRM AP.
        </p>
      </div>

      {/* Faculty Advisor Feature Card */}
      <div className="card-organic p-6 sm:p-8 bg-gradient-to-r from-[#faede0] via-[#fbf1e4] to-[#faede0] flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#c67139] flex items-center justify-center text-[#f5ead8] font-bold text-xl flex-shrink-0 shadow-md">
          {facultyAdvisor.initials}
        </div>
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c67139]/15 text-[#c67139] text-xs font-semibold">
            <GraduationCap size={14} />
            {facultyAdvisor.role}
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#201e1d]">
            {facultyAdvisor.name}
          </h3>
          <p className="text-xs sm:text-sm text-[#6b635c] leading-relaxed">
            {facultyAdvisor.title}
          </p>
        </div>
      </div>

      {/* 10 Organisers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {organisers.map((person, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#fbf1e4] border border-[#201e1d]/10 text-center space-y-2 hover:border-[#c67139]/30 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#efe1cb] border border-[#201e1d]/10 mx-auto flex items-center justify-center font-heading font-bold text-sm text-[#201e1d]">
              {person.initial}
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#201e1d] truncate">
                {person.name}
              </div>
              <div className="text-[11px] text-[#6b635c] truncate mt-0.5">
                {person.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
