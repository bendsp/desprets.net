"use client";

import { useThemePreference } from "@/lib/use-theme-preference";

export function ThemeToggle() {
  const { theme, setTheme } = useThemePreference();

  return (
    <div className="theme-toggle" aria-label="Theme switcher">
      <button
        type="button"
        onClick={() => setTheme("light")}
        data-active={theme === "light"}
        aria-pressed={theme === "light"}
      >
        light
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        data-active={theme === "dark"}
        aria-pressed={theme === "dark"}
      >
        dark
      </button>
    </div>
  );
}
