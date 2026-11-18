"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import "./meadow-scene.css";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (t: number) => t * t * (3 - 2 * t);

export function MeadowScene({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const track = root.current!,
      surface = screen.current!,
      layer = canvas.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function start() {
      const { createMeadowRenderer } = await import("./meadow/renderer");
      if (disposed) return;
      let dirty = true,
        lastApproach = -1,
        lastExit = -1;
      const touch = matchMedia("(any-pointer: coarse)");
      function invalidate() {
        dirty = true;
        requestDraw();
      }
      const renderer = createMeadowRenderer(layer, invalidate);
      if (!renderer) return;
      let intro = 0,
        read = 0,
        outro = 0,
        frame = 0,
        timer = 0;
      function requestDraw() {
        clearTimeout(timer);
        if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
      }
      let lastWidth = 0,
        lastHeight = 0;
      function draw(now: number) {
        frame = 0;
        const y = window.scrollY;
        const approach = intro ? ease(clamp(y / intro)) : 1;
        const exit = outro ? clamp((y - intro - read) / outro) : 0;
        const reading = y >= intro && y <= intro + read;
        const off =
          y + window.innerHeight >= document.documentElement.scrollHeight - 1;
        if (surface.classList.contains("monitor-off") !== off)
          surface.classList.toggle("monitor-off", off);
        const ambient = !touch.matches && !reduced.matches && !reading && !off;
        if (
          dirty ||
          approach !== lastApproach ||
          exit !== lastExit ||
          ambient
        ) {
          const view = renderer!.camera(
            approach,
            reduced.matches ? 0 : ease(exit),
          );
          surface.style.transform = `translate3d(${view.left}px, ${view.top}px, 0) scale(${view.scale})`;
          renderer!.paint(view, exit, reduced.matches ? 0 : now * 0.001);
          dirty = false;
          lastApproach = approach;
          lastExit = exit;
        }
        surface.scrollTop = Math.min(read, Math.max(0, y - intro));
        if (ambient) timer = window.setTimeout(requestDraw, 80);
      }
      const about = surface.querySelector<HTMLElement>("#about");
      const photo = surface.querySelector<HTMLElement>(
        "#about .prose-figure img",
      );
      const caption = surface.querySelector<HTMLElement>(
        "#about .prose-figure figcaption",
      );
      function measure() {
        const width = document.documentElement.clientWidth,
          height = layer.parentElement!.clientHeight;
        if (width !== lastWidth || height !== lastHeight) {
          dirty = true;
          renderer!.resize(width, height);
          lastWidth = width;
          lastHeight = height;
          const { w, h, closeScale } = renderer!.framing();
          surface.style.width = w * closeScale + "px";
          surface.style.height = h * closeScale + "px";
        }
        // offsetTop is in layout pixels, independent of camera zoom and scroll.
        if (about && photo && caption) {
          surface.style.setProperty(
            "--about-room",
            Math.max(0, surface.clientHeight - about.offsetTop) + "px",
          );
          let top = 0;
          for (
            let node: HTMLElement | null = photo;
            node && node !== surface;
            node = node.offsetParent as HTMLElement | null
          )
            top += node.offsetTop;
          const room =
            surface.clientHeight -
            top -
            caption.offsetHeight -
            parseFloat(getComputedStyle(caption).marginTop) -
            12;
          surface.style.setProperty(
            "--portrait-room",
            Math.max(64, Math.floor(room)) + "px",
          );
        }
        intro =
          reduced.matches || pathname !== "/" ? 0 : Math.round(height * 0.88);
        read = Math.max(0, surface.scrollHeight - surface.clientHeight);
        outro = Math.round(height * 1.14);
        track.style.height = window.innerHeight + intro + read + outro + "px";
        requestDraw();
      }
      function goTo(target: HTMLElement, behavior: ScrollBehavior) {
        const scale =
          surface.getBoundingClientRect().width / surface.offsetWidth;
        const offset =
          (target.getBoundingClientRect().top -
            surface.getBoundingClientRect().top) /
            scale +
          surface.scrollTop -
          (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
        window.scrollTo({
          top: intro + Math.min(read, Math.max(0, offset)),
          behavior,
        });
      }
      function anchor(ev: Event) {
        const link = (ev.target as Element).closest<HTMLAnchorElement>(
          "a[href]",
        );
        if (
          !link ||
          ev.defaultPrevented ||
          (ev instanceof MouseEvent &&
            (ev.metaKey || ev.ctrlKey || ev.altKey || ev.shiftKey))
        )
          return;
        const url = new URL(link.href);
        if (
          url.origin !== location.origin ||
          url.pathname !== location.pathname ||
          !url.hash
        )
          return;
        const target = document.getElementById(url.hash.slice(1));
        if (!target) return;
        ev.preventDefault();
        ev.stopPropagation();
        history.pushState(null, "", url.hash);
        goTo(target, reduced.matches ? "instant" : "smooth");
      }
      function hash() {
        const target = document.getElementById(location.hash.slice(1));
        if (target) goTo(target, "instant");
      }
      function focus(ev: FocusEvent) {
        const target = ev.target as HTMLElement;
        if (target.matches(":focus-visible")) goTo(target, "instant");
      }
      function stop() {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
        window.removeEventListener("scroll", requestDraw);
        document.removeEventListener("visibilitychange", requestDraw);
        observer.disconnect();
        reduced.removeEventListener("change", measure);
        window.removeEventListener("resize", measure);
        window.removeEventListener("hashchange", hash);
        surface.removeEventListener("click", anchor, true);
        surface.removeEventListener("focusin", focus);
        layer.removeEventListener("webglcontextlost", stop);
        renderer!.dispose();
        track.removeAttribute("data-ready");
        track.removeAttribute("style");
        surface.removeAttribute("style");
        surface.classList.remove("monitor-off");
      }
      const observer = new ResizeObserver(measure);
      cleanup = stop;
      track.dataset.ready = "true";
      measure();
      cancelAnimationFrame(frame);
      draw(performance.now());
      window.addEventListener("scroll", requestDraw, { passive: true });
      document.addEventListener("visibilitychange", requestDraw);
      if (location.hash) hash();
      observer.observe(surface.firstElementChild!);
      observer.observe(layer.parentElement!);
      window.addEventListener("resize", measure);
      reduced.addEventListener("change", measure);
      window.addEventListener("hashchange", hash);
      surface.addEventListener("click", anchor, true);
      surface.addEventListener("focusin", focus);
      layer.addEventListener("webglcontextlost", stop);
    }
    start().catch(() => cleanup?.());
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [pathname]);

  return (
    <div ref={root} className="meadow">
      <div className="meadow-stage">
        <canvas ref={canvas} aria-hidden="true" />
        <div ref={screen} className="monitor-document">
          {children}
        </div>
      </div>
    </div>
  );
}
