import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Compass, CheckCircle2, Shield, Calendar, ArrowRight } from "lucide-react";

export function TrainingPage() {
  const curriculum = [
    {
      week: "Week 01",
      title: "Transmitter & Simulator Basics",
      desc: "Getting comfortable with dual-stick radio transmitters, throttle balance, roll, pitch, and yaw on campus simulators.",
    },
    {
      week: "Week 02",
      title: "Caged Drone Flight Dynamics",
      desc: "Live cage flights: hovering stability, obstacle avoidance, and cage boundary recovery inside the netted arena.",
    },
    {
      week: "Week 03",
      title: "Offense & Striker Ring Alignment",
      desc: "Speed passes through the suspended goal ring, banking at high speed, and understanding electronic optical sensor triggers.",
    },
    {
      week: "Week 04",
      title: "Defensive Interception & Team Tactics",
      desc: "Corridor blocking, physical drone-to-drone cage deflections, and practicing the mandatory retreat reset rule.",
    },
  ];

  return (
    <div className="py-12 px-6 max-w-5xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#7a8a5e]/15 text-[#7a8a5e] border border-[#7a8a5e]/30">
          <Compass size={14} />
          Pre-Season Bootcamp
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#201e1d]">
          Pilot Training Program
        </h1>
        <p className="text-sm text-[#6b635c]">
          Designed for students with zero prior drone piloting experience. Learn to fly safely before stepping into competitive league matches.
        </p>
      </div>

      {/* Pricing and Recharge Notice */}
      <div className="card-organic p-8 bg-gradient-to-r from-[#faede0] via-[#fbf1e4] to-[#faede0] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#7a8a5e]">
            Weekly Practice Recharge
          </div>
          <h3 className="font-heading text-2xl font-bold text-[#201e1d]">
            ₹{siteConfig.trainingRechargeFee} / Team / Week
          </h3>
          <p className="text-xs sm:text-sm text-[#6b635c] max-w-lg">
            Active exclusively for that calendar week. Grants access to booked cage time, safety gear, loaner training drones, and mentor supervision.
          </p>
        </div>
        <Link
          href="/register"
          className="btn-pill px-6 py-3 bg-[#c67139] text-[#f5ead8] hover:bg-[#a95629] text-sm font-semibold shadow-md transition-all flex items-center gap-2 flex-shrink-0"
        >
          Register With Training <ArrowRight size={16} />
        </Link>
      </div>

      {/* Curriculum Breakdown */}
      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-bold text-[#201e1d]">
          4-Week Bootcamp Curriculum
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curriculum.map((item, idx) => (
            <div key={idx} className="card-organic p-6 space-y-2">
              <span className="text-xs font-bold text-[#c67139] data">{item.week}</span>
              <h3 className="font-heading text-lg font-bold text-[#201e1d]">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#6b635c] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrainingPage;
