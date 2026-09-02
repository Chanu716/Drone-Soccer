import { RULES_LIST } from "@/content/rules";
import { Shield, Target, Award, AlertTriangle } from "lucide-react";

export function RulesSection() {
  const categoryIcons = {
    match: Shield,
    scoring: Target,
    safety: AlertTriangle,
    fouls: Award,
  };

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#c67139]">
            Campus Regulations
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#201e1d]">
            Essential Match Rules
          </h2>
        </div>
        <p className="max-w-md text-sm text-[#6b635c]">
          Designed for fair play, quick battery resets, and maximum safety inside SRM AP&apos;s academic building atriums.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {RULES_LIST.slice(0, 6).map((rule) => {
          const Icon = categoryIcons[rule.category] || Shield;
          return (
            <div
              key={rule.id}
              className="card-organic p-6 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#efe1cb] flex items-center justify-center flex-shrink-0 text-[#c67139]">
                <Icon size={20} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#c67139] data">
                    RULE {rule.number}
                  </span>
                  <span className="text-xs text-[#201e1d]/20">·</span>
                  <h3 className="font-heading text-base font-bold text-[#201e1d]">
                    {rule.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6b635c] leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
