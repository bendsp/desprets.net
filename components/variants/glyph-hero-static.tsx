"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface GlyphHeroStaticProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
  subtitleTypingSpeed?: number;
  className?: string;
}

const BG_SYMBOLS = ["▲", "•", "∆", "→", "↓", "+", "·", "−", "↗", "↘", "0", "1", "*"];
const NUM_BG = BG_SYMBOLS.length;

const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((value) => value / 64));

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + 1013904223) | 0;
  h = ((h >> 13) ^ h) * 1274126177;
  h = (h >> 16) ^ h;
  return (h & 0x7fffffff) / 0x7fffffff;
}

function rgbTupleFromCssColor(color: string): string | null {
  const m = color.match(/rgba?\(([^)]+)\)/i);
  if (!m) return null;
  const parts = m[1].split(",").map((p) => p.trim());
  if (parts.length < 3) return null;
  return `${parts[0]} ,${parts[1]} ,${parts[2]}`.replace(/\s+/g, "");
}

function useCanvasBackground(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  mouseRef: React.RefObject<{ x: number; y: number } | null>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CELL = 28;
    const EFFECT_R = 100;
    const AMBIENT_BASE = 4;
    const ANIM_MS = 2200;
    const HOVER_RISE = 28;
    const HOVER_DECAY = 7.2;

    let animStart: number | null = null;
    let frameId = 0;
    let canvasRect = canvas.getBoundingClientRect();
    let lastNow = 0;
    let fgRgb = "255,255,255";

    const refreshForegroundColor = () => {
      const containerColor = getComputedStyle(container).color;
      const bodyColor = getComputedStyle(document.body).color;
      const parsed = rgbTupleFromCssColor(containerColor) ?? rgbTupleFromCssColor(bodyColor);
      if (parsed) {
        fgRgb = parsed;
        return;
      }
      fgRgb = document.documentElement.classList.contains("dark") ? "255,255,255" : "0,0,0";
    };

    const setup = () => {
      const rect = container.getBoundingClientRect();
      const cW = Math.ceil(rect.width);
      const cH = Math.ceil(rect.height);
      const totalCols = Math.ceil(cW / CELL);
      const totalRows = Math.ceil(cH / CELL);
      const canvasW = totalCols * CELL;
      const canvasH = totalRows * CELL;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;

      const n = totalCols * totalRows;
      const rands = new Float32Array(n);
      const symBase = new Uint8Array(n);
      const hoverHeat = new Float32Array(n);

      for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
          const i = r * totalCols + c;
          const rnd = hash(c, r);
          rands[i] = rnd;
          symBase[i] = (rnd * NUM_BG) | 0;
        }
      }

      return { totalCols, totalRows, canvasW, canvasH, dpr, rands, symBase, hoverHeat };
    };

    let state = setup();
    refreshForegroundColor();

    const onResize = () => {
      state = setup();
      canvasRect = canvas.getBoundingClientRect();
      refreshForegroundColor();
    };

    const onScroll = () => {
      canvasRect = canvas.getBoundingClientRect();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    const symFontSize = CELL - 4;
    const symFont = `${symFontSize}px monospace`;

    const draw = (now: number) => {
      if (animStart === null) animStart = now;
      const elapsed = now - animStart;
      const t = Math.min(1, elapsed / ANIM_MS);
      const progress = 1 - (1 - t) * (1 - t) * (1 - t);
      const timeSec = now * 0.001;
      const dt = Math.min(0.05, lastNow > 0 ? (now - lastNow) * 0.001 : 1 / 60);
      lastNow = now;
      if ((now | 0) % 500 < 17) refreshForegroundColor();

      const { totalCols, totalRows, canvasW, canvasH, dpr, rands, symBase, hoverHeat } = state;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasW, canvasH);

      const mouse = mouseRef.current;
      let mx = -9999;
      let my = -9999;

      if (mouse) {
        mx = mouse.x - canvasRect.left;
        my = mouse.y - canvasRect.top;
      }

      const rise = 1 - Math.exp(-HOVER_RISE * dt);
      const decay = Math.exp(-HOVER_DECAY * dt);

      ctx.font = symFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
          const i = r * totalCols + c;
          if (progress <= BAYER[r & 7][c & 7]) continue;

          const rnd = rands[i];
          const x = c * CELL;
          const y = r * CELL;
          const cx = x + CELL * 0.5;
          const cy = y + CELL * 0.5;

          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.hypot(dx, dy);
          const near = Math.max(0, 1 - dist / EFFECT_R);
          const target = near * near;

          if (target > hoverHeat[i]) {
            hoverHeat[i] += (target - hoverHeat[i]) * rise;
          } else {
            hoverHeat[i] *= decay;
          }

          const prox = hoverHeat[i];
          const cellRate = AMBIENT_BASE + rnd * 2.5;
          const ambIdx = Math.floor((timeSec + rnd * cellRate * 3) / cellRate);

          const symbolSpeed = 1.5 + prox * 8;
          const cursorOff = Math.floor((timeSec + rnd * 10) * symbolSpeed);
          const symbolIndex = prox > 0.02
            ? (symBase[i] + ambIdx + cursorOff) % NUM_BG
            : (symBase[i] + ambIdx) % NUM_BG;

          const baseA = 0.06 + rnd * 0.05;
          const alpha = Math.min(1, baseA + prox * 1.12);

          ctx.fillStyle = `rgba(${fgRgb},${alpha})`;
          ctx.fillText(BG_SYMBOLS[symbolIndex], cx, cy);
        }
      }

      frameId = requestAnimationFrame(draw);
    };

    const timer = window.setTimeout(() => {
      frameId = requestAnimationFrame(draw);
    }, 200);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [canvasRef, containerRef, mouseRef]);
}

export default function GlyphHeroStatic({
  title,
  subtitle,
  children,
  subtitleTypingSpeed = 120,
  className = "",
}: GlyphHeroStaticProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  const [subtitleComplete, setSubtitleComplete] = useState(false);
  const [firstName, ...restNameParts] = title.split(" ");
  const restName = restNameParts.join(" ");

  const renderTitleLockup = () => {
    if (!restName) {
      return title;
    }

    return (
      <>
        <span className="block md:inline">{firstName}</span>
        <span className="hidden md:inline">&nbsp;</span>
        <span className="block md:inline">{restName}</span>
      </>
    );
  };

  useCanvasBackground(canvasRef, containerRef, mouseRef);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const onLeave = () => {
      mouseRef.current = null;
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayedSubtitle(subtitle);
      setSubtitleComplete(true);
      return;
    }

    let index = 0;
    setDisplayedSubtitle("");
    setSubtitleComplete(false);

    const timer = window.setInterval(() => {
      index += 1;
      setDisplayedSubtitle(subtitle.slice(0, index));
      if (index >= subtitle.length) {
        setSubtitleComplete(true);
        window.clearInterval(timer);
      }
    }, subtitleTypingSpeed);

    return () => window.clearInterval(timer);
  }, [subtitle, subtitleTypingSpeed]);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-[min(96%,1320px)] text-center">
        <h1
          className="relative mx-auto text-[clamp(2.35rem,7.8vw,6.1rem)] leading-[1.02] select-none whitespace-normal"
          aria-label={title}
        >
          <span
            className="absolute inset-0 font-pixel text-current"
            style={{ transform: "translateX(-0.038em)", opacity: 0.35 }}
            aria-hidden="true"
          >
            {renderTitleLockup()}
          </span>
          <span className="relative font-pixel text-current">{renderTitleLockup()}</span>
        </h1>
        <p className="mt-3 text-[clamp(1.65rem,2.1vw,2.1rem)] text-current" style={{ opacity: 0.86 }}>
          {displayedSubtitle}
          <span
            className={`ml-1 inline-block h-[0.95em] w-[2px] align-middle ${
              subtitleComplete ? "animate-pulse" : "animate-blink"
            }`}
            style={{ backgroundColor: "currentColor" }}
            aria-hidden="true"
          />
        </p>
        {children}
      </div>
    </div>
  );
}
