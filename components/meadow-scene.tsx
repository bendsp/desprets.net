"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { capturePosition, offsetInView } from "./meadow/reading-position";
import type { enterReadingView } from "./meadow/reading-view";
import "./meadow-scene.css";

type Phase = "plain" | "loading" | "scene";
type Connection = { saveData?: boolean; effectiveType?: string };
const preferenceKey = "meadow-view";

function initialScene() {
  const connection = (navigator as Navigator & { connection?: Connection })
    .connection;
  const navigation = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  if (
    location.pathname !== "/" ||
    location.hash ||
    scrollY > 1 ||
    document.hidden ||
    navigation?.type === "back_forward" ||
    performance.now() > 2200 ||
    document.activeElement?.closest("a,button,input") ||
    performance.getEntriesByType("first-input").length ||
    matchMedia(
      "(prefers-reduced-motion: reduce), (prefers-reduced-data: reduce)",
    ).matches ||
    connection?.saveData ||
    ["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "")
  )
    return false;
  try {
    const saved = localStorage.getItem(preferenceKey);
    if (saved) return saved === "scene";
  } catch {
    /* Private storage is optional. */
  }
  return matchMedia("(min-width: 800px) and (hover: hover) and (pointer: fine)")
    .matches;
}

function remember(view: "plain" | "scene") {
  try {
    localStorage.setItem(preferenceKey, view);
  } catch {
    /* Use the choice for this visit. */
  }
}

export function MeadowScene({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const toggle = useRef<() => void>();
  const navigate = useRef<() => void>();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("plain");
  const [message, setMessage] = useState("");
  const pathname = usePathname();
  useLayoutEffect(() => {
    navigate.current?.();
  }, [pathname]);

  useEffect(() => {
    const track = root.current!,
      surface = screen.current!,
      backdrop = stage.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let attempt: AbortController | undefined;
    let view: ReturnType<typeof enterReadingView> | undefined;
    let canvas: HTMLCanvasElement | undefined;
    let context: WebGLRenderingContext | null = null;
    let picture: HTMLPictureElement | undefined;
    let timeout = 0;
    let phase: Phase = "plain";
    let transition: { skipTransition(): void } | undefined;
    function update(next: Phase, status = "") {
      phase = next;
      track.dataset.phase = next;
      setPhase(next);
      setMessage(status);
    }
    async function dissolve(change: () => void) {
      transition?.skipTransition();
      if (reduced.matches || !document.startViewTransition || document.hidden) {
        change();
        return;
      }
      const current = document.startViewTransition(change);
      transition = current;
      // A rotation or a background tab can skip the animation midway.
      current.ready.catch(() => {});
      try {
        await current.finished;
      } finally {
        if (transition === current) transition = undefined;
      }
    }
    function tintBrowser() {
      const color = view
        ? "#a8c9db"
        : getComputedStyle(document.documentElement)
            .getPropertyValue("--background")
            .trim();
      for (const meta of document.querySelectorAll<HTMLMetaElement>(
        'meta[name="theme-color"]',
      ))
        meta.content = color;
    }
    function leave(status = "") {
      clearTimeout(timeout);
      attempt?.abort();
      attempt = undefined;
      const framed = !!view;
      const position = framed ? capturePosition(surface) : null;
      view?.stop();
      view = undefined;
      if (canvas) {
        if (context && !context.isContextLost())
          context.getExtension("WEBGL_lose_context")?.loseContext();
        context = null;
        canvas.remove();
        canvas = undefined;
      }
      picture?.remove();
      picture = undefined;
      delete document.documentElement.dataset.meadow;
      tintBrowser();
      update("plain", status);
      if (status) timeout = window.setTimeout(() => setMessage(""), 6000);
      if (framed)
        window.scrollTo({
          top: position ? window.scrollY + offsetInView(position, surface) : 0,
          behavior: "instant",
        });
    }
    function begin(explicit: boolean) {
      clearTimeout(timeout);
      const request = new AbortController();
      attempt = request;
      const { signal } = request;
      update("loading", "Loading the meadow.");
      const unavailable = () => {
        if (!signal.aborted)
          leave("The meadow couldn’t load. You can keep reading or try again.");
      };
      timeout = window.setTimeout(unavailable, 16000);
      async function load() {
        picture = document.createElement("picture");
        picture.className = "meadow-poster";
        picture.setAttribute("aria-hidden", "true");
        const portrait = document.createElement("source");
        portrait.media = "(orientation: portrait)";
        portrait.srcset = "/scene/opening-tall.webp";
        const poster = new Image();
        poster.alt = "";
        picture.append(portrait, poster);
        poster.src = "/scene/opening-wide.webp";
        backdrop.prepend(picture);
        const [{ enterReadingView }] = await Promise.all([
          import("./meadow/reading-view"),
          poster.decode(),
        ]);
        if (signal.aborted) return;
        if (
          !explicit &&
          (performance.now() > 2200 || window.scrollY > 1 || location.hash)
        ) {
          leave();
          return;
        }
        const layer = document.createElement("canvas");
        layer.setAttribute("aria-hidden", "true");
        canvas = layer;
        backdrop.insertBefore(layer, surface);
        layer.addEventListener("webglcontextlost", unavailable, { signal });
        const gl = layer.getContext("webgl", {
          alpha: false,
          antialias: true,
          powerPreference: "low-power",
        });
        context = gl;
        if (!gl?.getExtension("OES_standard_derivatives")) {
          unavailable();
          return;
        }
        // Frame the real document once. Only the scenery dissolves when WebGL is ready.
        await dissolve(() => {
          if (signal.aborted) return;
          view = enterReadingView(
            track,
            surface,
            backdrop,
            poster,
            capturePosition(surface),
          );
          document.documentElement.dataset.meadow = "active";
          tintBrowser();
        });
        if (signal.aborted) return;
        const { createMeadowRenderer } = await import("./meadow/renderer");
        if (signal.aborted) return;
        const renderer = await createMeadowRenderer(gl, signal);
        if (signal.aborted) return;
        if (!view) {
          unavailable();
          return;
        }
        view.showRenderer(renderer);
        if (gl.isContextLost() || gl.getError() !== gl.NO_ERROR) {
          unavailable();
          return;
        }
        clearTimeout(timeout);
        update("scene", "3D view active.");
        if (explicit) remember("scene");
        timeout = window.setTimeout(() => {
          picture?.remove();
          picture = undefined;
        }, 650);
      }
      load().catch(unavailable);
    }
    function keepReading(event: Event) {
      if (
        phase !== "loading" ||
        view ||
        (event.target instanceof Element &&
          event.target.closest(".meadow-controls"))
      )
        return;
      leave();
    }
    const listeners = new AbortController();
    const options = { capture: true, passive: true, signal: listeners.signal };
    for (const type of [
      "pointerdown",
      "wheel",
      "touchmove",
      "focusin",
      "keydown",
      "hashchange",
      "popstate",
    ])
      window.addEventListener(type, keepReading, options);
    reduced.addEventListener(
      "change",
      () => {
        if (reduced.matches && phase !== "plain") leave();
      },
      { signal: listeners.signal },
    );
    navigate.current = () => {
      if (view) view.routeChanged();
      else if (phase === "loading") leave();
    };
    toggle.current = () => {
      if (phase === "plain") begin(true);
      else {
        remember("plain");
        if (view) void dissolve(() => leave()).catch(() => leave());
        else leave();
      }
    };
    const themeObserver = new MutationObserver(tintBrowser);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    tintBrowser();
    setMounted(true);
    if (initialScene()) begin(false);
    return () => {
      themeObserver.disconnect();
      listeners.abort();
      transition?.skipTransition();
      leave();
      navigate.current = undefined;
      toggle.current = undefined;
    };
  }, []);

  return (
    <div ref={root} className="meadow">
      {mounted && (
        <div className="meadow-controls">
          <button type="button" onClick={() => toggle.current?.()}>
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              {phase === "plain" ? (
                <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5m-9 5L3 7m9 5v10" />
              ) : (
                <path d="M5 4h14v16H5zM8 9h8M8 12h8M8 15h5" />
              )}
            </svg>
            {phase === "plain" ? "Explore in 3D" : "Plain site"}
          </button>
          <span className="meadow-feedback" role="status">
            {message}
          </span>
        </div>
      )}
      <div ref={stage} className="meadow-stage">
        <div ref={screen} className="monitor-document">
          {children}
        </div>
      </div>
    </div>
  );
}
