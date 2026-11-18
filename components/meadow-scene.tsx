"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { startMeadowWind } from "./meadow-wind";
import "./meadow-scene.css";

// The inside edge of each photographed CRT, in source-image pixels.
const landscape = { width: 1672, height: 941, x: 659, y: 245, w: 344, h: 254 };
const portrait = { width: 941, height: 1672, x: 366, y: 676, w: 214, h: 161 };

export function MeadowScene({ children }: { children: ReactNode }) {
  const scene = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const stage = scene.current!;
    const frame = camera.current!;
    const upright = matchMedia("(max-aspect-ratio: 4/5)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let played = false;
    let stopWind: (() => void) | undefined;
    let movement: Animation | undefined;

    function settle() {
      if (movement?.playState === "running") movement.finish();
      stopWind?.();
      stopWind = undefined;
      stage.dataset.ready = "true";
    }

    function compose() {
      const p = upright.matches ? portrait : landscape;
      const { clientWidth: w, clientHeight: h } = stage;
      const cover = Math.max(w / p.width, h / p.height);
      const finalHeight = Math.min(h * (upright.matches ? 0.84 : 0.79),
        upright.matches ? Infinity : w * 0.88 * p.h / p.w);
      const finalWidth = finalHeight * p.w / p.h;
      const x = (p.x + p.w / 2 - p.width / 2) * cover;
      const y = (p.y + p.h / 2 - p.height / 2) * cover;
      frame.style.width = finalWidth + "px";
      frame.style.height = finalHeight + "px";
      frame.style.setProperty("--plate-width", (100 * p.width / p.w) + "%");
      frame.style.setProperty("--plate-height", (100 * p.height / p.h) + "%");
      frame.style.setProperty("--plate-left", (-100 * p.x / p.w) + "%");
      frame.style.setProperty("--plate-top", (-100 * p.y / p.h) + "%");

      stage.dataset.composed = "true";
      if (played || reduced.matches || location.pathname !== "/" || location.hash) {
        settle();
      } else {
        const start = 'translate(' + x + 'px,' + y + 'px) scale(' + (cover * p.w / finalWidth) + ')';
        movement = frame.animate([
          { transform: start, offset: 0 },
          { transform: start, offset: 0.26, easing: "cubic-bezier(.43,.03,.19,1)" },
          { transform: "none", offset: 1 },
        ], { duration: 4600 });
        movement.onfinish = settle;
        stopWind = startMeadowWind(frame.querySelector(".meadow-land")!, plate, upright.matches);
        stage.dataset.arriving = "true";
      }
      played = true;
    }

    // Keep the establishing shot visible while the image decodes.
    const plate = new Image();
    plate.src = upright.matches ? "/scene/meadow-portrait.webp" : "/scene/meadow.webp";
    plate.decode().then(() => {
      if (!disposed) compose();
    }).catch(() => {
      if (!disposed) stage.dataset.fallback = "true";
    });

    const resize = () => { if (played) compose(); };
    window.addEventListener("resize", resize);
    reduced.addEventListener("change", resize);
    stage.addEventListener("pointerdown", settle);
    stage.addEventListener("focusin", settle);
    return () => {
      disposed = true;
      movement?.cancel();
      stopWind?.();
      window.removeEventListener("resize", resize);
      reduced.removeEventListener("change", resize);
      stage.removeEventListener("pointerdown", settle);
      stage.removeEventListener("focusin", settle);
    };
  }, []);

  useEffect(() => {
    const sectionId = location.hash.slice(1);
    if (!sectionId) return;
    // A direct section link can arrive before the CRT has its final height.
    const scroller = scene.current?.querySelector(".crt-document");
    if (!scroller) return;
    const observer = new ResizeObserver(() => {
      if (!scene.current?.dataset.composed) return;
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant" });
      observer.disconnect();
    });
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div ref={scene} className="meadow">
      <noscript><style>{".meadow .meadow-camera,.meadow .crt-glass{visibility:visible;opacity:1}.meadow .meadow-camera{width:100%;height:100%}"}</style></noscript>
      <div ref={camera} className="meadow-camera">
        <div className="meadow-land" aria-hidden="true" />
        <div className="crt-glass">
          <div className="crt-document" key={pathname}>{children}</div>
        </div>
      </div>
    </div>
  );
}
