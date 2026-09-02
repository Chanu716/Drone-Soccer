import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Compass, CheckCircle2, ArrowRight } from "lucide-react";

export function TrainingTeaser() {
  const highlights = [
    "Zero flying experience required — simulator & dual-stick flight training",
    "Cage navigation, throttle management, and defensive hovering drills",
    "Tactical striker corridor creation and electronic ring sensor aiming",
  ];

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <div className="card-organic p-8 sm:p-12 bg-gradient-to-br from-[#faede0] via-[#fbf1e4] to-[#faede0] border border-[#201e1d]/10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#7a8a5e]/15 text-[#7a8a5e] border border-[#7a8a5e]/30">
            <Compass size={14} />
            Beginner Pilot Program
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#201e1d]">
            Never Flown Before? Training Starts First.
          </h2>

          <p className="text-sm sm:text-base text-[#6b635c] leading-relaxed">
            All teams have access to official practice cages before competitive match days. Access is structured as an affordable weekly recharge of{" "}
            <span className="font-bold text-[#201e1d]">₹{siteConfig.trainingRechargeFee}/team</span>, active for that calendar week.
          </p>

          <ul className="space-y-2.5 pt-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#201e1d]">
                <CheckCircle2 size={16} className="text-[#7a8a5e] flex-shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-3 flex-shrink-0">
          <div className="text-center sm:text-right">
            <div className="text-xs uppercase tracking-wider text-[#6b635c] font-semibold">Weekly Recharge</div>
            <div className="font-heading text-3xl sm:text-4xl font-bold text-[#c67139]">
              ₹{siteConfig.trainingRechargeFee}
              <span className="text-xs font-normal text-[#6b635c] font-sans"> / team / week</span>
            </div>
          </div>
          <Link
            href="/training"
            className="btn-pill px-6 py-3 bg-[#7a8a5e] text-[#f5ead8] hover:bg-[#5e6c46] text-sm font-semibold shadow-md transition-all flex items-center gap-2"
          >
            Explore Training Bootcamp <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
