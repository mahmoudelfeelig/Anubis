"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "anubis.theme";

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [hasPreference, setHasPreference] = useState(false);

  const systemMedia = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return null;
    return window.matchMedia("(prefers-color-scheme: light)");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    if (document.body) {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (hasPreference) {
        window.localStorage.setItem(STORAGE_KEY, theme);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage failures
    }
  }, [theme, hasPreference]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored: Theme | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "dark" || raw === "light") stored = raw;
    } catch {
      stored = null;
    }
    if (stored) {
      Promise.resolve().then(() => {
        setTheme(stored);
        setHasPreference(true);
      });
      return;
    }
    if (systemMedia) {
      Promise.resolve().then(() => {
        setTheme(systemMedia.matches ? "light" : "dark");
      });
      const handle = (event: MediaQueryListEvent) => {
        setTheme(event.matches ? "light" : "dark");
      };
      systemMedia.addEventListener("change", handle);
      return () => systemMedia.removeEventListener("change", handle);
    }
  }, [systemMedia]);

  const toggleTheme = useCallback(() => {
    setHasPreference(true);
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const targetTheme: Theme = theme === "light" ? "dark" : "light";
  const dataEcho = targetTheme === "dark" ? "Dark Mode" : "Light Mode";
  const classes = ["btn", "nav-theme", className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={classes}
      data-echo={dataEcho}
      data-theme-state={theme}
      aria-pressed={theme === "light"}
      aria-label={`Switch to ${targetTheme} mode`}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <span className="theme-toggle-icon__glyph theme-toggle-icon__glyph--sun">☀</span>
        <span className="theme-toggle-icon__glyph theme-toggle-icon__glyph--moon">☾</span>
      </span>
    </button>
  );
}
