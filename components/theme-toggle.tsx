"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? resolvedTheme ?? "dark" : "dark";

  return (
    <div className="theme-toggle" aria-label="Theme switcher">
      <button
        type="button"
        onClick={() => setTheme("light")}
        data-active={activeTheme === "light"}
        aria-pressed={activeTheme === "light"}
      >
        light
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        data-active={activeTheme === "dark"}
        aria-pressed={activeTheme === "dark"}
      >
        dark
      </button>
    </div>
  );
}
