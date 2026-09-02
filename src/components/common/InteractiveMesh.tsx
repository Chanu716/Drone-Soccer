"use client";

import { useEffect, useRef } from "react";

export function InteractiveMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const meshReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let verts = new Map<string, { x: number; y: number; ox: number; oy: number; vx: number; vy: number; tint: number; tintColor: string | null }>();
    let hexCenters: [number, number][] = [];
    let hexR = 34;
    let meshW = window.innerWidth;
    let meshH = window.innerHeight;
    let meshRaf: number | null = null;
    let tintTimer: NodeJS.Timeout | null = null;

    const buildMeshGrid = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      meshW = w;
      meshH = h;

      const r = w < 768 ? 52 : 34;
      hexR = r;
      const dx = r * 1.5;
      const dy = r * Math.sqrt(3);
      const newVerts = new Map();
      const centers: [number, number][] = [];
      const key = (x: number, y: number) => Math.round(x) + "," + Math.round(y);

      for (let cx = -r, col = 0; cx < w + r * 2; cx += dx, col++) {
        const yOff = col % 2 ? dy / 2 : 0;
        for (let cy = -r * 2 + yOff; cy < h + r * 2; cy += dy) {
          centers.push([cx, cy]);
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const vx = cx + r * Math.cos(a);
            const vy = cy + r * Math.sin(a);
            const k = key(vx, vy);
            if (!newVerts.has(k)) {
              newVerts.set(k, { x: vx, y: vy, ox: 0, oy: 0, vx: 0, vy: 0, tint: 0, tintColor: null });
            }
          }
        }
      }
      verts = newVerts;
      hexCenters = centers;
    };

    const meshImpulse = (px: number, py: number, radius: number, strength: number) => {
      verts.forEach((v) => {
        const dxp = v.x - px;
        const dyp = v.y - py;
        const dist = Math.hypot(dxp, dyp);
        if (dist < radius && dist > 0.01) {
          const f = (1 - dist / radius) * strength;
          v.vx += (dxp / dist) * f;
          v.vy += (dyp / dist) * f;
        }
      });
    };

    const wakeMesh = () => {
      if (meshReduced) return;
      if (!meshRaf) meshRaf = requestAnimationFrame(meshLoop);
    };

    const scoreRipple = (team: "a" | "b", px?: number, py?: number) => {
      if (meshReduced || !verts) return;
      const color = team === "a" ? "46,123,255" : "255,46,99";
      const x = px != null ? px : meshW / 2;
      const y = py != null ? py : meshH / 2;
      meshImpulse(x, y, 420, 18);
      verts.forEach((v) => {
        const dist = Math.hypot(v.x - x, v.y - y);
        if (dist < 420) {
          v.tint = 1;
          v.tintColor = color;
        }
      });
      wakeMesh();
      if (tintTimer) clearTimeout(tintTimer);
      tintTimer = setTimeout(() => {
        verts.forEach((v) => {
          v.tint = 0;
        });
      }, 800);
    };

    const stepMesh = () => {
      const k = 0.06;
      const damping = 0.9;
      let maxV = 0;
      verts.forEach((v) => {
        const ax = -k * v.ox;
        const ay = -k * v.oy;
        v.vx = (v.vx + ax) * damping;
        v.vy = (v.vy + ay) * damping;
        v.ox += v.vx;
        v.oy += v.vy;
        maxV = Math.max(maxV, Math.abs(v.vx), Math.abs(v.vy));
      });
      return maxV > 0.02;
    };

    const drawMeshFrame = (idle: boolean) => {
      ctx.clearRect(0, 0, meshW, meshH);
      ctx.fillStyle = "#12150E";
      ctx.fillRect(0, 0, meshW, meshH);
      const r = hexR;
      ctx.lineWidth = 1;

      hexCenters.forEach(([cx, cy]) => {
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const a = (Math.PI / 3) * (i % 6);
          const vx = cx + r * Math.cos(a);
          const vy = cy + r * Math.sin(a);
          const key = Math.round(vx) + "," + Math.round(vy);
          const v = verts.get(key);
          const px = v ? v.x + v.ox : vx;
          const py = v ? v.y + v.oy : vy;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "rgba(237,239,230,0.04)";
        ctx.stroke();
      });

      if (!idle) {
        verts.forEach((v) => {
          if (v.tint > 0.01) {
            ctx.beginPath();
            ctx.arc(v.x + v.ox, v.y + v.oy, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${v.tintColor},${v.tint * 0.5})`;
            ctx.fill();
          }
        });
      }
    };

    const meshLoop = () => {
      const active = stepMesh();
      drawMeshFrame(false);
      if (active && !document.hidden) {
        meshRaf = requestAnimationFrame(meshLoop);
      } else {
        meshRaf = null;
      }
    };

    buildMeshGrid();
    drawMeshFrame(true);

    const onPointerMove = (e: PointerEvent) => {
      meshImpulse(e.clientX, e.clientY, 140, 6);
      wakeMesh();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onResize = () => {
      buildMeshGrid();
      wakeMesh();
    };
    window.addEventListener("resize", onResize, { passive: true });

    const scoreInterval = setInterval(() => {
      const r = canvas.getBoundingClientRect();
      scoreRipple(Math.random() < 0.5 ? "a" : "b", r.width * (0.3 + Math.random() * 0.4), r.height * 0.5);
    }, 6500);

    wakeMesh();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      if (meshRaf) cancelAnimationFrame(meshRaf);
      if (scoreInterval) clearInterval(scoreInterval);
      if (tintTimer) clearTimeout(tintTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
