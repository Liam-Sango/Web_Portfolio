"use client";

import { useEffect } from "react";
import { createStore } from "@/lib/createStore";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// Default snapshot is "dark"; the real value is resolved from localStorage /
// system preference in an effect after mount (and by the inline pre-paint
// script for first paint — see layout.tsx).
const themeStore = createStore<Theme>("dark");

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function resolveInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* localStorage unavailable */
  }
  try {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {
    /* matchMedia unavailable */
  }
  return "dark";
}

export function useTheme() {
  const theme = themeStore.useValue();

  // Sync the store to the real value on mount (the attribute itself was already
  // applied pre-paint by the inline script; this just aligns the store so the
  // toggle button shows the correct state).
  useEffect(() => {
    const initial = resolveInitialTheme();
    themeStore.set(initial);
    applyTheme(initial);
  }, []);

  const setTheme = (next: Theme) => {
    themeStore.set(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const toggle = () => setTheme(themeStore.get() === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}
