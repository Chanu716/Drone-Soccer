"use client";

import { useState, useEffect } from "react";
import { SIMULATION_STEPS } from "@/content/rules";
import { Play, Pause, RotateCcw, Target, Shield, CheckCircle2 } from "lucide-react";

export function MatchSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % SIMULATION_STEPS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = SIMULATION_STEPS[activeStep];

  return (
    <section id="rules" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#c67139]/15 text-[#c67139] border border-[#c67139]/30">
          Arena Mechanics
        </span>
        <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#201e1d]">
          How The Match Is Played
        </h2>
        <p className="text-sm sm:text-base text-[#6b635c]">
          Watch the aerial maneuver: Team A (terracotta) striker penetrating defenses to score through Team B&apos;s (sage) goal ring.
        </p>
      </div>

      {/* Simulator Card */}
      <div className="rounded-3xl border border-[#201e1d]/10 bg-[#fbf1e4] p-6 sm:p-10 shadow-lg space-y-8">
        {/* Step Selector Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#201e1d]/10">
          <div className="flex flex-wrap items-center gap-2">
            {SIMULATION_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => {
                  setActiveStep(idx);
                  setIsPlaying(false);
                }}
                className={`btn-pill px-4 py-2 text-xs font-semibold transition-all ${
                  activeStep === idx
                    ? "bg-[#c67139] text-[#f5ead8] shadow-sm"
                    : "bg-[#efe1cb] text-[#6b635c] hover:bg-[#efe1cb]/80"
                }`}
              >
                <span>{s.step}</span>
                <span className="hidden sm:inline">· {s.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-[#efe1cb] text-[#201e1d] hover:bg-[#efe1cb]/80 transition-colors"
              title={isPlaying ? "Pause simulation" : "Play simulation"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={() => {
                setActiveStep(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-full bg-[#efe1cb] text-[#201e1d] hover:bg-[#efe1cb]/80 transition-colors"
              title="Reset simulation"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* 2D Court Interactive Canvas View */}
        <div className="relative aspect-[21/9] min-h-[260px] w-full rounded-2xl bg-[#efe1cb]/90 border-2 border-[#201e1d]/20 overflow-hidden shadow-inner flex items-center justify-center p-4">
          {/* Pitch Markings */}
          <div className="absolute inset-4 border-2 border-[#201e1d]/30 rounded-lg">
            {/* Midfield line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#201e1d]/30 -translate-x-1/2"></div>
            {/* Center Circle */}
            <div className="absolute left-1/2 top-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#201e1d]/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#201e1d]/40"></div>
            </div>

            {/* Team A Goal Ring (Left) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-28 rounded-full border-4 border-[#c67139] shadow-[0_0_20px_rgba(198,113,57,0.4)] flex items-center justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#c67139] rotate-90">
                Team A Ring
              </span>
            </div>

            {/* Team B Goal Ring (Right) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-28 rounded-full border-4 border-[#7a8a5e] shadow-[0_0_20px_rgba(122,138,94,0.4)] flex items-center justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#7a8a5e] -rotate-90">
                Team B Ring
              </span>
            </div>

            {/* Defenders (Team B Sage) */}
            <div className="absolute left-[70%] top-[30%] w-4 h-4 rounded-full bg-[#7a8a5e] border-2 border-[#333a29] opacity-80 animate-bounce"></div>
            <div className="absolute left-[74%] top-[65%] w-4 h-4 rounded-full bg-[#7a8a5e] border-2 border-[#333a29] opacity-80 animate-pulse"></div>
            <div className="absolute left-[82%] top-[50%] -translate-y-1/2 w-4 h-4 rounded-full bg-[#7a8a5e] border-2 border-[#333a29] opacity-90 shadow-md"></div>

            {/* Defenders (Team A Terracotta) */}
            <div className="absolute left-[24%] top-[35%] w-4 h-4 rounded-full bg-[#c67139] border-2 border-[#582b18] opacity-80"></div>
            <div className="absolute left-[22%] top-[65%] w-4 h-4 rounded-full bg-[#c67139] border-2 border-[#582b18] opacity-80"></div>

            {/* Team A Striker Drone (Animated Position) */}
            <div
              className="absolute w-8 h-8 rounded-full bg-[#c67139] border-2 border-white shadow-[0_0_24px_rgba(198,113,57,0.9)] flex items-center justify-center transition-all duration-1000 ease-out z-20"
              style={{
                left: `${current.teamAPos.x}%`,
                top: `${current.teamAPos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
            </div>

            {/* Trajectory line hint */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <path
                d="M 220 150 Q 550 80 720 150"
                fill="none"
                stroke="#c67139"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Goal beacon flash on step 03 */}
          {activeStep === 2 && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-[#c67139] text-white font-bold text-xs shadow-lg animate-pulse z-30">
              GOAL SCORED! (+1)
            </div>
          )}
        </div>

        {/* Step Explanation Card */}
        <div className="p-6 rounded-2xl bg-[#efe1cb]/60 border border-[#201e1d]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-[#c67139]">
                {current.step} · {current.title}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#c67139]/15 text-[#c67139] font-medium">
                {current.tag}
              </span>
            </div>
            <p className="text-sm text-[#6b635c] leading-relaxed">{current.description}</p>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#6b635c] border-t md:border-t-0 md:border-l border-[#201e1d]/10 pt-3 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#c67139]"></span>
              <span>Team A (Striker)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#7a8a5e]"></span>
              <span>Team B (Keeper/Defenders)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
