"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

// Lazy load Canvas to avoid SSR issues
const Canvas = lazy(() =>
  import("@react-three/fiber").then((mod) => ({ default: mod.Canvas }))
);
const HoopCamScene = lazy(() =>
  import("./HoopCamScene").then((mod) => ({ default: mod.HoopCamScene }))
);

function PosterFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#f5ead8] via-[#efe1cb] to-[#f5ead8]">
      {/* Decorative SVG Arena Diagram */}
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full max-w-2xl opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="400" cy="300" r="220" fill="none" stroke="#201e1d" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="400" cy="300" r="140" fill="none" stroke="#c67139" strokeWidth="3" />
        <circle cx="400" cy="300" r="70" fill="none" stroke="#7a8a5e" strokeWidth="2" />
        <line x1="100" y1="300" x2="700" y2="300" stroke="#201e1d" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="400" y1="100" x2="400" y2="500" stroke="#201e1d" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="340" cy="260" r="16" fill="#c67139" opacity="0.8" />
        <circle cx="480" cy="340" r="16" fill="#7a8a5e" opacity="0.8" />
      </svg>
    </div>
  );
}

export function HoopCamHero() {
  const [canRender3D, setCanRender3D] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Performance budget checks (reduced motion, low core count, saveData)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLowCore = (navigator.hardwareConcurrency || 8) <= 2;
    // @ts-expect-error connection may not be typed in all browsers
    const isSaveData = navigator.connection?.saveData === true;

    if (!prefersReducedMotion && !isLowCore && !isSaveData) {
      setCanRender3D(true);
    }
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-8 pb-16 px-6">
      {/* 3D Canvas / Poster Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {mounted && canRender3D ? (
          <Suspense fallback={<PosterFallback />}>
            <Canvas
              camera={{ position: [0, 0, 3.2], fov: 50 }}
              dpr={[1, 1.5]}
              gl={{ powerPreference: "high-performance", antialias: true }}
            >
              <HoopCamScene />
            </Canvas>
          </Suspense>
        ) : (
          <PosterFallback />
        )}
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Live Strip Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fbf1e4]/90 border border-[#201e1d]/10 backdrop-blur-sm shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#c67139] animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6b635c]">
            {siteConfig.season.start} · {siteConfig.season.matchDays}
          </span>
          <span className="text-xs text-[#201e1d]/30">|</span>
          <span className="text-xs font-bold text-[#c67139]">Registration Open</span>
        </div>

        {/* Main Display Headline */}
        <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-[#201e1d] leading-[0.95]">
          Drone Soccer
          <span className="block text-3xl sm:text-5xl md:text-6xl text-[#c67139] mt-2 font-normal font-sans tracking-normal">
            SRM University AP
          </span>
        </h1>

        {/* Tagline / Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#6b635c] leading-relaxed font-normal">
          3–5 pilots. One designated striker. One elevated ring. An aerial team clash inside caged campus arenas across C V Raman Block, SR Block, X Lab, and Admin Block.
        </p>

        {/* CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="btn-pill w-full sm:w-auto px-8 py-3.5 bg-[#c67139] text-[#f5ead8] hover:bg-[#a95629] text-base font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Register Your Team (₹{siteConfig.registrationFee})
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/#rules"
            className="btn-pill w-full sm:w-auto px-8 py-3.5 bg-[#fbf1e4] text-[#201e1d] border border-[#201e1d]/20 hover:bg-[#efe1cb] text-base font-medium shadow-sm transition-all"
          >
            How A Match Works
          </Link>
        </div>

        {/* Live Campus Schedule Bar */}
        <div className="pt-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#fbf1e4]/85 border border-[#201e1d]/10 backdrop-blur-sm text-left">
            {siteConfig.blockRotation.map((b, idx) => (
              <div key={b.id} className="space-y-0.5">
                <div className="text-[10px] uppercase tracking-wider text-[#6b635c] font-semibold">
                  Block 0{idx + 1}
                </div>
                <div className="text-xs font-bold text-[#201e1d] truncate">{b.name}</div>
                <div className="text-[11px] text-[#7a8a5e] font-medium data">Wed & Thu</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
