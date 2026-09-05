"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const GameboyScene = dynamic(() => import("./gameboy/scene"), {
  ssr: false,
  loading: () => <div className="sp-loading" aria-label="Loading 3D portfolio"><span /></div>,
});

export function PortfolioExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<"loading" | "scene" | "page">("loading");
  const [initialHash, setInitialHash] = useState("");

  useEffect(() => {
    const embedded = window.self !== window.top;
    const syncHash = () => setInitialHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    const flat = new URLSearchParams(window.location.search).has("flat");
    const canvas = document.createElement("canvas");
    const context = !embedded && !flat ? canvas.getContext("webgl2") : null;
    const showPage = embedded || flat || !context;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    document.documentElement.dataset.portfolio = showPage ? "page" : "scene";
    if (embedded) document.documentElement.dataset.embedded = "true";
    setMode(showPage ? "page" : "scene");
    return () => {
      window.removeEventListener("hashchange", syncHash);
      delete document.documentElement.dataset.portfolio;
      delete document.documentElement.dataset.embedded;
    };
  }, []);

  useEffect(() => {
    if (window.self === window.top) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") window.parent.postMessage({ type: "sp:unfocus" }, window.location.origin);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  useEffect(() => {
    if (mode !== "page" || window.self === window.top || !window.location.hash) return;
    const section = document.getElementById(window.location.hash.slice(1));
    if (!section) return;
    const frame = window.requestAnimationFrame(() => {
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - headerHeight - 24, behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mode, pathname]);

  if (mode === "loading") return <><div className="sp-loading" aria-label="Loading portfolio"><span /></div><noscript><style>{".sp-loading { display: none !important; }"}</style>{children}</noscript></>;
  if (mode === "page") return children;
  return <GameboyScene initialPath={pathname} initialHash={initialHash} />;
}
