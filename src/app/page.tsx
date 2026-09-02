"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const RULES = [
  "Each team has 3 to 5 active players, set by the organiser before the event.",
  "Every player flies a drone ball. One player is the Striker — only they can score. The rest guide the Striker or defend their own goal.",
  "Each team names a captain to speak with the match referee and scoring referees.",
  "The field has a caged flying zone and two pilots' areas, one per team, outside the cage on the short sides. No one enters the cage during play.",
  "Each team defends one goal ring in the flying zone. Rings may carry a sensor for electronic scoring.",
  "A match has three 3-minute sets, for 30 minutes total.",
  "A coin toss decides sides. The winner picks a side and both teams keep it for the whole match.",
  "A goal counts only when the Striker's drone ball crosses the opponent's ring. A non-Striker crossing it does not score, and carries no penalty.",
  "After scoring, a team must return all players to their own side before attacking again. Skipping this voids a following goal and gives the other team a penalty shot.",
  "The team with more goals wins the set; equal goals is a tie. Winning two sets wins the match.",
];

const ORGANISERS = [
  { name: "Manikanta", initial: "M" },
  { name: "Ajit Kumar", initial: "A" },
  { name: "Sai Sankar", initial: "S" },
  { name: "Aswith", initial: "A" },
  { name: "Ch Manikanta", initial: "C" },
  { name: "Deekshith", initial: "D" },
  { name: "Manoj", initial: "M" },
  { name: "Ramprasad", initial: "R" },
  { name: "Sanjay", initial: "S" },
  { name: "Agastya Pandey", initial: "A" },
];

const LOADER_WORDS = [
  "Initialising arena",
  "Calibrating rings",
  "Linking pilots",
  "Arming strikers",
  "Syncing cage sensors",
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function HomePage() {
  const [loaderWordIdx, setLoaderWordIdx] = useState(0);

  // Refs for pinned hero stage
  const stageRef = useRef<HTMLElement>(null);
  const arenaGroupRef = useRef<HTMLDivElement>(null);
  const pitchLinesRef = useRef<HTMLDivElement>(null);
  const circleARef = useRef<HTMLDivElement>(null);
  const circleBRef = useRef<HTMLDivElement>(null);
  const spinARef = useRef<HTMLDivElement>(null);
  const spinBRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const t1Ref = useRef<HTMLDivElement>(null);
  const t2Ref = useRef<HTMLDivElement>(null);
  const t3Ref = useRef<HTMLDivElement>(null);

  // Refs for match simulation
  const simStageRef = useRef<HTMLElement>(null);
  const simInnerRef = useRef<HTMLDivElement>(null);
  const simStrikerRef = useRef<HTMLDivElement>(null);
  const simStrikerBRef = useRef<HTMLDivElement>(null);
  const ringBottomRef = useRef<HTMLDivElement>(null);
  const cap1Ref = useRef<HTMLDivElement>(null);
  const cap2Ref = useRef<HTMLDivElement>(null);
  const cap3Ref = useRef<HTMLDivElement>(null);

  const teamARules = RULES.map((text, i) => ({ text, no: String(i + 1).padStart(2, "0") })).filter((_, i) => i % 2 === 0);
  const teamBRules = RULES.map((text, i) => ({ text, no: String(i + 1).padStart(2, "0") })).filter((_, i) => i % 2 === 1);

  useEffect(() => {
    const loaderTimer = setInterval(() => {
      setLoaderWordIdx((prev) => (prev + 1) % LOADER_WORDS.length);
    }, 4500);

    const onScroll = () => {
      const vh = window.innerHeight;

      // Hero stage scroll calculation
      if (stageRef.current && circleARef.current && circleBRef.current) {
        const travel = stageRef.current.offsetHeight - vh;
        const p = clamp(-stageRef.current.getBoundingClientRect().top / (travel || 1), 0, 1);

        const grow = ease(range(p, 0.08, 0.34));
        const shrink = ease(range(p, 0.6, 0.76));
        const split = ease(range(p, 0.76, 0.94));
        const base = 260;
        const peak = Math.max(window.innerWidth, vh) * 1.35;
        const size = base + (peak - base) * grow * (1 - shrink);
        const finalW = 70, finalH = 200;
        const ovalWidth = size * (1 - split) + finalW * split;
        const ovalHeight = size * (1 - split) + finalH * split;
        const pw = pitchLinesRef.current ? pitchLinesRef.current.offsetWidth : Math.min(window.innerWidth * 0.7, 900);
        const offset = split * pw * 0.32;

        circleARef.current.style.width = circleBRef.current.style.width = ovalWidth + "px";
        circleARef.current.style.height = circleBRef.current.style.height = ovalHeight + "px";
        circleARef.current.style.transform = `translate(-50%, -50%) translateX(${-offset}px)`;
        circleBRef.current.style.transform = `translate(-50%, -50%) translateX(${offset}px)`;

        if (pitchLinesRef.current) pitchLinesRef.current.style.opacity = String(split * 0.9);
        if (spinARef.current) spinARef.current.style.opacity = String(1 - split);
        if (spinBRef.current) spinBRef.current.style.opacity = String(1 - split);

        circleBRef.current.style.borderColor = split > 0.05 ? "#ee3238" : "#FFFFFF";
        circleARef.current.style.borderColor = split > 0.05 ? "#33b6ff" : "#FFFFFF";

        if (loaderRef.current) loaderRef.current.style.opacity = String(1 - range(p, 0.02, 0.1));
        if (t1Ref.current) t1Ref.current.style.opacity = String(range(p, 0.13, 0.22) * (1 - range(p, 0.32, 0.4)));
        if (t2Ref.current) t2Ref.current.style.opacity = String(range(p, 0.4, 0.47) * (1 - range(p, 0.54, 0.6)));
        if (t3Ref.current) t3Ref.current.style.opacity = String(range(p, 0.6, 0.66) * (1 - range(p, 0.74, 0.8)));

        if (arenaGroupRef.current) {
          const out = ease(range(p, 0.66, 1));
          arenaGroupRef.current.style.transform = `translateY(${out * 24}vh) scale(${1 - out * 0.06})`;
          arenaGroupRef.current.style.filter = `blur(${out * 12}px)`;
        }
      }

      // Match simulation scroll calculation
      if (simStageRef.current && simStrikerRef.current) {
        const travel2 = simStageRef.current.offsetHeight - vh;
        const p2 = clamp(-simStageRef.current.getBoundingClientRect().top / (travel2 || 1), 0, 1);
        if (simInnerRef.current) simInnerRef.current.style.opacity = String(range(p2, 0.005, 0.05));

        const pts = [{ x: 25, y: 50 }, { x: 48, y: 30 }, { x: 64, y: 70 }, { x: 80, y: 50 }, { x: 90, y: 50 }];
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const alongPath = (t: number) => {
          const seg = clamp(t, 0, 1) * (pts.length - 1);
          const i = Math.min(Math.floor(seg), pts.length - 2);
          const f = seg - i;
          return { x: lerp(pts[i].x, pts[i + 1].x, f), y: lerp(pts[i].y, pts[i + 1].y, f) };
        };

        const tScore = ease(range(p2, 0.3, 0.62));
        const tReturn = ease(range(p2, 0.64, 1.0));
        const pos = tReturn > 0 ? alongPath(1 - tReturn) : alongPath(tScore);
        simStrikerRef.current.style.left = pos.x + "%";
        simStrikerRef.current.style.top = pos.y + "%";

        if (simStrikerBRef.current) {
          const ptsB = [{ x: 75, y: 50 }, { x: 52, y: 70 }, { x: 36, y: 30 }, { x: 20, y: 50 }, { x: 10, y: 50 }];
          const alongB = (t: number) => {
            const seg = clamp(t, 0, 1) * (ptsB.length - 1);
            const i = Math.min(Math.floor(seg), ptsB.length - 2);
            const f = seg - i;
            return { x: lerp(ptsB[i].x, ptsB[i + 1].x, f), y: lerp(ptsB[i].y, ptsB[i + 1].y, f) };
          };
          const posB = alongB(ease(range(p2, 0.68, 1.0)));
          simStrikerBRef.current.style.left = posB.x + "%";
          simStrikerBRef.current.style.top = posB.y + "%";
        }

        const scoreGlow = range(p2, 0.55, 0.62) * (1 - range(p2, 0.64, 0.7));
        if (ringBottomRef.current) {
          ringBottomRef.current.style.boxShadow = `0 0 ${24 + scoreGlow * 40}px rgba(255,46,99,${0.45 + scoreGlow * 0.5}), inset 0 0 ${16 + scoreGlow * 24}px rgba(255,46,99,${0.22 + scoreGlow * 0.3})`;
        }

        const caps = [
          { el: cap1Ref.current, s: 0.04, e: 0.32 },
          { el: cap2Ref.current, s: 0.28, e: 0.66 },
          { el: cap3Ref.current, s: 0.62, e: 1.0 },
        ];
        caps.forEach((c) => {
          if (!c.el) return;
          const inOp = range(p2, c.s, c.s + 0.06);
          const outOp = c.e >= 0.999 ? 1 : 1 - range(p2, c.e - 0.05, c.e);
          const op = Math.min(inOp, outOp);
          c.el.style.opacity = String(op);
          c.el.style.filter = "blur(" + (1 - op) * 10 + "px)";
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 3D card tilt effect from original prototype
    const cards = document.querySelectorAll<HTMLElement>(".card");
    const onMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const onMouseLeave = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.transform = "";
    };

    cards.forEach((card) => {
      card.addEventListener("mousemove", onMouseMove as EventListener);
      card.addEventListener("mouseleave", onMouseLeave as EventListener);
    });

    return () => {
      clearInterval(loaderTimer);
      window.removeEventListener("scroll", onScroll);
      cards.forEach((card) => {
        card.removeEventListener("mousemove", onMouseMove as EventListener);
        card.removeEventListener("mouseleave", onMouseLeave as EventListener);
      });
    };
  }, []);

  return (
    <div style={{ background: "transparent", color: "var(--text)", minHeight: "100vh" }}>
      {/* PINNED STAGE */}
      <section ref={stageRef} style={{ position: "relative", height: "420vh" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          <div ref={arenaGroupRef} style={{ position: "absolute", inset: 0, willChange: "transform" }}>
            <div
              ref={pitchLinesRef}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "min(70vw, 900px)",
                height: "min(60vh, 620px)",
                transform: "translate(-50%, -50%)",
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(255,255,255,0.6)" }}></div>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "2%",
                  bottom: "2%",
                  width: 2,
                  background: "rgba(255,255,255,0.6)",
                  transform: "translateX(-50%)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  height: "42%",
                  aspectRatio: "1",
                  transform: "translate(-50%, -50%)",
                  border: "2px solid rgba(255,255,255,0.6)",
                  borderRadius: "50%",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.7)",
                  transform: "translate(-50%, -50%)",
                }}
              ></div>

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "15%",
                  bottom: "15%",
                  width: "16%",
                  border: "2px solid rgba(255,255,255,0.6)",
                  borderLeft: "none",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "15%",
                  bottom: "15%",
                  width: "16%",
                  border: "2px solid rgba(255,255,255,0.6)",
                  borderRight: "none",
                }}
              ></div>
            </div>

            <div
              ref={circleARef}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 150,
                height: 150,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: "2px solid var(--white)",
                boxShadow: "0 0 60px rgba(255,255,255,0.5), inset 0 0 50px rgba(255,255,255,0.18)",
                willChange: "width, height, transform",
              }}
            >
              <div
                ref={spinARef}
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "rgba(255,255,255,0.9)",
                  animation: "spin 2.6s linear infinite",
                }}
              ></div>
            </div>

            <div
              ref={circleBRef}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 150,
                height: 150,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: "2px solid var(--white)",
                boxShadow: "0 0 60px rgba(255,255,255,0.5), inset 0 0 50px rgba(255,255,255,0.18)",
                transition: "border-color 0.5s var(--ease), box-shadow 0.5s var(--ease)",
                willChange: "width, height, transform",
              }}
            >
              <div
                ref={spinBRef}
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderBottomColor: "rgba(255,255,255,0.85)",
                  animation: "spin 3.4s linear infinite reverse",
                }}
              ></div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
              textAlign: "center",
              padding: "0 48px",
            }}
          >
            <div style={{ gridArea: "1/1" }} ref={loaderRef}>
              <div
                className="data"
                style={{
                  fontSize: 12,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                {LOADER_WORDS[loaderWordIdx]}
              </div>
            </div>
            <div style={{ gridArea: "1/1", opacity: 0 }} ref={t1Ref}>
              <h1 className="h1" style={{ fontSize: "clamp(48px,9vw,180px)", margin: 0 }}>
                Drone<br />Soccer
              </h1>
            </div>
            <div style={{ gridArea: "1/1", opacity: 0 }} ref={t2Ref}>
              <h2 className="h2" style={{ fontSize: "clamp(30px,5.5vw,80px)", margin: 0 }}>
                SRM University AP
              </h2>
              <p
                className="data"
                style={{
                  marginTop: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                A campus league, launching Sep 2026
              </p>
            </div>
            <div style={{ gridArea: "1/1", opacity: 0 }} ref={t3Ref}>
              <h2 className="h2" style={{ fontSize: "clamp(26px,4.6vw,64px)", margin: 0 }}>
                3–5 pilots.<br />One striker.<br />One ring.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* MATCH SIMULATION */}
      <section id="rules" ref={simStageRef} data-mesh-section="" style={{ position: "relative", height: "500vh" }}>
        <div style={{ textAlign: "center", padding: "14vh 48px 6vh" }}>
          <span className="tag">The ruleset</span>
          <h2 className="h2" style={{ fontSize: "clamp(28px,4vw,54px)", margin: "12px 0 0" }}>
            How the match is played
          </h2>
        </div>
        <div
          ref={simInnerRef}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            boxSizing: "border-box",
            padding: "96px 0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            gap: 16,
            opacity: 0,
          }}
        >
          <div style={{ position: "relative", width: "min(74vw,980px)", minHeight: 100, flex: "none" }}>
            <div
              ref={cap1Ref}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                maxWidth: "56%",
                textAlign: "right",
                opacity: 0,
                filter: "blur(10px)",
                transition: "opacity 0.5s var(--ease), filter 0.5s var(--ease)",
              }}
            >
              <div
                className="data"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}
              >
                01 · Setup
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--text)" }}>{RULES[1]}</p>
            </div>
            <div
              ref={cap3Ref}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                maxWidth: "56%",
                textAlign: "right",
                opacity: 0,
                filter: "blur(10px)",
                transition: "opacity 0.5s var(--ease), filter 0.5s var(--ease)",
              }}
            >
              <div
                className="data"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}
              >
                03 · Reset
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--text)" }}>{RULES[8]}</p>
            </div>
          </div>
          <div style={{ position: "relative", width: "min(74vw,980px)", flex: "1 1 auto", minHeight: 0, maxHeight: "min(40vh,380px)" }}>
            <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(237,239,230,0.5)" }}></div>
            <div
              style={{
                position: "absolute",
                top: "2%",
                bottom: "2%",
                left: "50%",
                width: 2,
                background: "rgba(237,239,230,0.5)",
                transform: "translateX(-50%)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                height: "42%",
                aspectRatio: "1",
                transform: "translate(-50%,-50%)",
                border: "2px solid rgba(237,239,230,0.5)",
                borderRadius: "50%",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(237,239,230,0.6)",
                transform: "translate(-50%,-50%)",
              }}
            ></div>

            <div
              style={{
                position: "absolute",
                left: 0,
                top: "15%",
                bottom: "15%",
                width: "14%",
                border: "2px solid rgba(237,239,230,0.5)",
                borderLeft: "none",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "15%",
                bottom: "15%",
                width: "14%",
                border: "2px solid rgba(237,239,230,0.5)",
                borderRight: "none",
              }}
            ></div>

            {/* Left Goal Ring (Blue) */}
            <div
              style={{
                position: "absolute",
                left: "8%",
                top: "50%",
                width: "9%",
                height: "38%",
                transform: "translate(-50%,-50%)",
                border: "3px solid var(--blue)",
                borderRadius: "50%",
                boxShadow: "0 0 24px rgba(46,123,255,0.5), inset 0 0 16px rgba(46,123,255,0.25)",
              }}
            ></div>

            {/* Right Goal Ring (Red) */}
            <div
              ref={ringBottomRef}
              style={{
                position: "absolute",
                left: "92%",
                top: "50%",
                width: "9%",
                height: "38%",
                transform: "translate(-50%,-50%)",
                border: "3px solid var(--red)",
                borderRadius: "50%",
                boxShadow: "0 0 24px rgba(255,46,99,0.45), inset 0 0 16px rgba(255,46,99,0.22)",
              }}
            ></div>

            {/* Idle Defenders (Red) */}
            <div
              style={{
                position: "absolute",
                left: "55%",
                top: "30%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--red)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(255,46,99,0.55)",
                animation: "idleBob 2.8s ease-in-out infinite",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: "48%",
                top: "70%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--red)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(255,46,99,0.55)",
                animation: "idleBob 3.1s ease-in-out infinite 0.5s",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: "82%",
                top: "50%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--red)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(255,46,99,0.55)",
                transform: "translate(-50%,-50%)",
                animation: "idleBob 2.4s ease-in-out infinite 0.3s",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: "70%",
                top: "64%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--red)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(255,46,99,0.55)",
                transform: "translate(-50%,-50%)",
                animation: "idleBob 2.9s ease-in-out infinite 1.3s",
              }}
            ></div>

            {/* Idle Defenders (Blue) */}
            <div
              style={{
                position: "absolute",
                left: "20%",
                top: "35%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--blue)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(46,123,255,0.55)",
                animation: "idleBob 3s ease-in-out infinite 0.2s",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: "16%",
                top: "65%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--blue)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(46,123,255,0.55)",
                animation: "idleBob 2.7s ease-in-out infinite 1s",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: "32%",
                top: "38%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--blue)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(46,123,255,0.55)",
                transform: "translate(-50%,-50%)",
                animation: "idleBob 3.3s ease-in-out infinite 0.7s",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                left: "30%",
                top: "64%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--blue)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(46,123,255,0.55)",
                transform: "translate(-50%,-50%)",
                animation: "idleBob 2.6s ease-in-out infinite 1.6s",
              }}
            ></div>

            {/* Blue Striker */}
            <div
              ref={simStrikerRef}
              style={{
                position: "absolute",
                left: "25%",
                top: "50%",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--blue)",
                boxShadow: "0 0 20px rgba(46,123,255,0.9)",
                transform: "translate(-50%,-50%)",
                willChange: "left, top",
              }}
            ></div>

            {/* Red Striker */}
            <div
              ref={simStrikerBRef}
              style={{
                position: "absolute",
                left: "75%",
                top: "50%",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--red)",
                boxShadow: "0 0 20px rgba(255,46,99,0.9)",
                transform: "translate(-50%,-50%)",
                willChange: "left, top",
              }}
            ></div>
          </div>
          <div style={{ position: "relative", width: "min(74vw,980px)", minHeight: 100, flex: "none" }}>
            <div
              ref={cap2Ref}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                maxWidth: "56%",
                textAlign: "left",
                opacity: 0,
                filter: "blur(10px)",
                transition: "opacity 0.5s var(--ease), filter 0.5s var(--ease)",
              }}
            >
              <div
                className="data"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}
              >
                02 · Scoring
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--text)" }}>{RULES[7]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FULL RULESET */}
      <section data-mesh-section="" style={{ maxWidth: 1180, margin: "0 auto", padding: "0 48px 160px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "8px 56px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {teamARules.map((rule) => (
              <div
                key={rule.no}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  className="data"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.15em",
                    color: "var(--blue)",
                    flex: "none",
                    paddingTop: 2,
                  }}
                >
                  {rule.no}
                </div>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55, fontSize: 14 }}>{rule.text}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {teamBRules.map((rule) => (
              <div
                key={rule.no}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  className="data"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.15em",
                    color: "var(--red)",
                    flex: "none",
                    paddingTop: 2,
                  }}
                >
                  {rule.no}
                </div>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55, fontSize: 14 }}>{rule.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIXTURES + STANDINGS */}
      <section
        style={{
          maxWidth: 1521,
          margin: "0 auto",
          padding: "0 48px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 24,
        }}
      >
        {/* Card 1: Fixtures */}
        <div className="card">
          <div className="tag" style={{ marginBottom: 12 }}>This week</div>
          <div className="h3" style={{ marginBottom: 24 }}>Sep 1 – Dec 31 · Wed/Thu</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>C V Raman Block</span>
              <span className="data" style={{ color: "var(--muted)" }}>[[TIME]]</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>SR Block</span>
              <span className="data" style={{ color: "var(--muted)" }}>[[TIME]]</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>X Lab</span>
              <span className="data" style={{ color: "var(--muted)" }}>[[TIME]]</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Admin Block</span>
              <span className="data" style={{ color: "var(--muted)" }}>[[TIME]]</span>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <Link href="/fixtures" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Book a slot
            </Link>
          </div>
        </div>

        {/* Card 2: Standings */}
        <div className="card">
          <div className="tag" style={{ marginBottom: 12 }}>League standings</div>
          <div className="h3" style={{ marginBottom: 24 }}>Opens once the season starts</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "var(--muted)", fontSize: 13, textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "8px 0" }}>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 0", color: "var(--muted)" }}>—</td>
                <td className="data">–</td>
                <td className="data">–</td>
                <td className="data">–</td>
                <td className="data">–</td>
                <td className="data">–</td>
              </tr>
              <tr>
                <td style={{ padding: "12px 0", color: "var(--muted)" }}>—</td>
                <td className="data">–</td>
                <td className="data">–</td>
                <td className="data">–</td>
                <td className="data">–</td>
                <td className="data">–</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* TRAINING */}
      <section
        id="training"
        className="card"
        style={{
          maxWidth: 1521,
          margin: "0 auto 80px",
          padding: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div>
          <span className="tag">New to flying?</span>
          <h2 className="h3" style={{ margin: "12px 0" }}>Training starts before the league does.</h2>
          <p style={{ color: "var(--muted)", maxWidth: "60ch", margin: 0 }}>
            ₹100 per team for league registration. Add training access for an extra ₹100 per team — a weekly recharge, active only for that week. Any further paid extras will be announced here first.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/register" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Reserve a training slot
          </Link>
        </div>
      </section>

      {/* ORGANISERS */}
      <section id="organisers" style={{ maxWidth: 1521, margin: "0 auto", padding: "0 48px 80px" }}>
        <h2 className="h2" style={{ fontSize: 34, margin: "0 0 8px" }}>Behind the league</h2>
        <p style={{ color: "var(--muted)", margin: "0 0 32px" }}>The organising team building and running Drone Soccer at SRM AP.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {ORGANISERS.map((person, idx) => (
            <div key={idx} className="card" style={{ padding: 24, textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  margin: "0 auto 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                {person.initial}
              </div>
              <div style={{ fontWeight: 600 }}>{person.name}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            PS
          </div>
          <div>
            <div className="tag" style={{ marginBottom: 8 }}>Faculty Advisor</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Dr. Pradyut Kumar Sanki, PhD (IIT KGP), FIETE, SMIEEE, MIET</div>
            <div style={{ color: "var(--muted)" }}>
              Associate Professor, Department of Electronics &amp; Communication Engineering, School of Engineering &amp; Sciences, SRM University AP
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="card"
        style={{
          maxWidth: 1521,
          margin: "0 auto 80px",
          padding: "80px 48px",
          textAlign: "center",
        }}
      >
        <h2 className="h2" style={{ fontSize: "clamp(30px,4vw,48px)", margin: "0 0 16px" }}>Ready to fly?</h2>
        <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>
          Registration is ₹100 per team. Slots open every Wednesday and Thursday, Sep 1 through Dec 31.
        </p>
        <Link
          href="/register"
          className="btn btn-primary"
          style={{ padding: "14px 40px", fontSize: 17, textDecoration: "none" }}
        >
          Register your team
        </Link>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          maxWidth: 1521,
          margin: "0 auto",
          padding: "24px 48px 80px",
          borderTop: "1px solid var(--border)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 24,
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, textTransform: "uppercase", fontSize: 18, marginBottom: 8 }}>
            Drone Soccer SRM AP
          </div>
          <p style={{ color: "var(--muted)", maxWidth: "32ch" }}>A student league at SRM University, Andhra Pradesh.</p>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Play</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/register">Register</Link>
            <Link href="/fixtures">Book a slot</Link>
            <Link href="/#training">Training</Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>League</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/standings">Standings</Link>
            <Link href="/teams">Teams</Link>
            <Link href="/#organisers">Organisers</Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Legal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Refund policy</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
