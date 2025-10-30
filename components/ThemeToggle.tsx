"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "anubis.theme";

function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

type ThemeToggleProps = {
  className?: string;
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = (() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  })();
  if (isTheme(stored)) return stored;
  const datasetTheme = document.documentElement.dataset.theme;
  if (isTheme(datasetTheme)) return datasetTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function hasStoredPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return isTheme(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [hasPreference, setHasPreference] = useState<boolean>(() => hasStoredPreference());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (document.body) {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    try {
      if (hasPreference) {
        window.localStorage.setItem(STORAGE_KEY, theme);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [theme, hasPreference]);

  useEffect(() => {
    if (hasPreference) return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "light" : "dark");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [hasPreference]);

  const toggleTheme = useCallback(() => {
    setHasPreference(true);
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const targetTheme = theme === "light" ? "dark" : "light";
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
