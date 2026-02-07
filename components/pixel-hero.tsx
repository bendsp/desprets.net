"use client";

import { useEffect, useRef, useCallback } from "react";

interface PixelHeroProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
}

// Font variant CSS classes (mapped to tailwind font families)
const FONT_VARIANTS = [
  "font-pixel-grid",     // Grid (default)
  "font-pixel-circle",
  "font-pixel-triangle",
  "font-pixel",          // Square
  "font-pixel-line",
] as const;

// Background symbols: mix of Geist Pixel decorative glyphs and classic characters
const BG_SYMBOLS = ["▲", "•", "∆", "→", "↓", "+", "·", "−", "↗", "↘", "0", "1", "*"];
const NUM_BG = BG_SYMBOLS.length;

// Bayer 8x8 ordered dither matrix (normalized 0-1)
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((v) => v / 64));

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + 1013904223) | 0;
  h = ((h >> 13) ^ h) * 1274126177;
  h = (h >> 16) ^ h;
  return (h & 0x7fffffff) / 0x7fffffff;
}

// ---- Pixel Text (DOM) ----
// Each character is a <span> that switches font variant on hover proximity
function PixelText({
  text,
  mouseRef,
}: {
  text: string;
  mouseRef: React.RefObject<{ x: number; y: number } | null>;
}) {
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef<number>(0);
  const charPositions = useRef<{ cx: number; cy: number }[]>([]);

  // Split into characters, preserving spaces
  const chars = text.split("");

  // Cache character center positions
  const updatePositions = useCallback(() => {
    charPositions.current = charRefs.current.map((el) => {
      if (!el) return { cx: 0, cy: 0 };
      const rect = el.getBoundingClientRect();
      return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
    });
  }, []);

  useEffect(() => {
    const EFFECT_R = 120;
    // Track previous variant per char to avoid redundant className writes
    const prevVariant = new Array<number>(chars.length).fill(0);

    // Update positions initially and on resize/scroll
    const schedulePositionUpdate = () => requestAnimationFrame(updatePositions);
    schedulePositionUpdate();
    window.addEventListener("resize", schedulePositionUpdate);
    window.addEventListener("scroll", schedulePositionUpdate, { passive: true });

    const animate = () => {
      const mouse = mouseRef.current;
      const now = performance.now();

      for (let i = 0; i < charRefs.current.length; i++) {
        const el = charRefs.current[i];
        if (!el || chars[i] === " ") continue;

        const pos = charPositions.current[i];
        let targetVariant = 0; // default: square

        if (mouse && pos) {
          const dx = mouse.x - pos.cx;
          const dy = mouse.y - pos.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const prox = Math.max(0, 1 - dist / EFFECT_R);

          if (prox > 0.15) {
            const seed = hash(i, Math.floor(now * 0.003));
            const variantPool = [1, 2, 1, 2, 3, 4];
            targetVariant = variantPool[Math.floor(seed * variantPool.length)];
          }
        }

        // Only write to DOM if variant changed
        if (prevVariant[i] !== targetVariant) {
          prevVariant[i] = targetVariant;
          const variantClass = FONT_VARIANTS[targetVariant];
          const duration = targetVariant === 0 ? "duration-300" : "duration-150";
          el.className = `${variantClass} inline-block transition-[font-family] ${duration}`;
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", schedulePositionUpdate);
      window.removeEventListener("scroll", schedulePositionUpdate);
    };
  }, [chars, mouseRef, updatePositions]);

  return (
    <div
      className="font-pixel-grid text-[clamp(3rem,10vw,11rem)] leading-tight text-foreground select-none text-center"
      aria-hidden="true"
    >
      {chars.map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            charRefs.current[i] = el;
          }}
          className="font-pixel-grid inline-block transition-[font-family] duration-300"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}

// ---- Canvas Background ----
function useCanvasBackground(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  mouseRef: React.RefObject<{ x: number; y: number } | null>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d")!;

    const CELL = 20;
    const EFFECT_R = 160;
    const AMBIENT_BASE = 4; // seconds per ambient symbol cycle
    const ANIM_MS = 2200;

    let animStart: number | null = null;
    let frameId = 0;
    let canvasRect = canvas.getBoundingClientRect();

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

      for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
          const i = r * totalCols + c;
          const rnd = hash(c, r);
          rands[i] = rnd;
          symBase[i] = (rnd * NUM_BG) | 0;
        }
      }

      return { totalCols, totalRows, canvasW, canvasH, dpr, rands, symBase };
    };

    let S = setup();

    const onResize = () => {
      S = setup();
      canvasRect = canvas.getBoundingClientRect();
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
      const progress = 1 - (1 - t) * (1 - t) * (1 - t); // ease-out cubic
      const timeSec = now * 0.001;

      const { totalCols, totalRows, canvasW, canvasH, dpr, rands, symBase } = S;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasW, canvasH);

      const mouse = mouseRef.current;
      let mx = -9999, my = -9999;
      if (mouse) {
        mx = mouse.x - canvasRect.left;
        my = mouse.y - canvasRect.top;
      }

      ctx.font = symFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
          const i = r * totalCols + c;

          // Dither gate
          if (progress <= BAYER[r & 7][c & 7]) continue;

          const rnd = rands[i];
          const x = c * CELL;
          const y = r * CELL;
          const cx = x + CELL * 0.5;
          const cy = y + CELL * 0.5;

          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const prox = Math.max(0, 1 - dist / EFFECT_R);

          // Ambient cycle
          const cellRate = AMBIENT_BASE + rnd * 2.5;
          const ambIdx = Math.floor((timeSec + rnd * cellRate * 3) / cellRate);

          let sIdx: number;
          if (prox > 0.05) {
            const speed = 1.5 + prox * 5;
            const cursorOff = Math.floor((timeSec + rnd * 10) * speed);
            sIdx = (symBase[i] + ambIdx + cursorOff) % NUM_BG;
          } else {
            sIdx = (symBase[i] + ambIdx) % NUM_BG;
          }

          const baseA = 0.06 + rnd * 0.05;
          const a = baseA + prox * 0.3;

          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fillText(BG_SYMBOLS[sIdx], cx, cy);
        }
      }

      frameId = requestAnimationFrame(draw);
    };

    const timer = setTimeout(() => {
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

// ---- Main Component ----
export default function PixelHero({
  text,
  children,
  className = "",
}: PixelHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useCanvasBackground(canvasRef, containerRef, mouseRef);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
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

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      aria-label={text}
      role="heading"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <PixelText text={text} mouseRef={mouseRef} />
        {children}
      </div>
    </div>
  );
}
