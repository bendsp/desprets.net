"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark";

const storageKey = "theme";
const defaultTheme: ThemePreference = "light";

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const storedTheme = window.localStorage.getItem(storageKey);
  return storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : defaultTheme;
}

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function useThemePreference() {
  const [theme, setThemeState] = useState<ThemePreference>(defaultTheme);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    window.localStorage.setItem(storageKey, nextTheme);
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  }, []);

  return { theme, setTheme };
}
