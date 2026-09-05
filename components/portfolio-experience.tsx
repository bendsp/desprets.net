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

  useEffect(() => {
    const embedded = window.self !== window.top;
    const flat = new URLSearchParams(window.location.search).has("flat");
    const canvas = document.createElement("canvas");
    const context = !embedded && !flat ? canvas.getContext("webgl2") : null;
    const showPage = embedded || flat || !context;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    document.documentElement.dataset.portfolio = showPage ? "page" : "scene";
    if (embedded) document.documentElement.dataset.embedded = "true";
    setMode(showPage ? "page" : "scene");
    return () => {
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

  if (mode === "loading") return <><div className="sp-loading" aria-label="Loading portfolio"><span /></div><noscript>{children}</noscript></>;
  if (mode === "page") return children;
  return <GameboyScene initialPath={pathname} />;
}
