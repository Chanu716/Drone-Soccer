"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/lib/site";
import { Menu, X, Compass, Award, Calendar, Users, ShieldCheck } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/#rules", label: "Rules", icon: ShieldCheck },
    { href: "/fixtures", label: "Fixtures", icon: Calendar },
    { href: "/standings", label: "Standings", icon: Award },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/training", label: "Training", icon: Compass },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50 max-w-6xl mx-auto">
      <nav className="flex items-center justify-between px-6 py-3.5 rounded-full bg-[#f5ead8]/85 backdrop-blur-md border border-[#201e1d]/10 shadow-[0_8px_30px_rgb(32,30,29,0.06)]">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#c67139] flex items-center justify-center text-[#f5ead8] font-bold text-xs shadow-inner">
            DS
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-[#201e1d] group-hover:text-[#c67139] transition-colors">
            Drone Soccer <span className="font-sans font-normal text-xs text-[#6b635c] ml-1">/ SRM AP</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#c67139] ${
                  isActive ? "text-[#c67139] font-semibold" : "text-[#6b635c]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Action button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/register"
            className="btn-pill px-5 py-2 text-sm bg-[#c67139] text-[#f5ead8] hover:bg-[#a95629] shadow-sm font-medium"
          >
            Register Team
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-full hover:bg-black/5 text-[#201e1d]"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 p-5 rounded-2xl bg-[#f5ead8] border border-[#201e1d]/10 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#201e1d] hover:bg-[#c67139]/10 font-medium text-sm"
            >
              <link.icon size={16} className="text-[#c67139]" />
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#201e1d]/10">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="btn-pill w-full py-2.5 text-center text-sm bg-[#c67139] text-[#f5ead8] hover:bg-[#a95629] font-medium"
            >
              Register Team (₹{siteConfig.registrationFee})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
