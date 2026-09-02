import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ArrowRight, Trophy } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto text-center">
      <div className="card-organic p-10 sm:p-16 bg-gradient-to-b from-[#fbf1e4] to-[#efe1cb] border border-[#201e1d]/10 space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#c67139]/15 border border-[#c67139]/30 mx-auto flex items-center justify-center text-[#c67139]">
          <Trophy size={28} />
        </div>

        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#201e1d]">
            Ready To Fly For Your Block?
          </h2>
          <p className="text-sm sm:text-base text-[#6b635c] leading-relaxed">
            Assemble 3 to 5 pilots, designate your Striker, and register your team for the inaugural Drone Soccer season at SRM AP.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="btn-pill px-8 py-3.5 bg-[#c67139] text-[#f5ead8] hover:bg-[#a95629] text-base font-semibold shadow-md transition-all flex items-center gap-2"
          >
            Register Your Team (₹{siteConfig.registrationFee}) <ArrowRight size={18} />
          </Link>
          <Link
            href="/fixtures"
            className="btn-pill px-8 py-3.5 bg-transparent border border-[#201e1d]/20 text-[#201e1d] hover:bg-[#201e1d]/5 text-base font-medium transition-all"
          >
            Check Schedule
          </Link>
        </div>
      </div>
    </section>
  );
}
