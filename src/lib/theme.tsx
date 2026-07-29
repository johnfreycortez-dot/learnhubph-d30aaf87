import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

// Theme modes:
// - "auto"  : follow Philippine time (6AM–5:59PM = light, 6PM–5:59AM = dark)
// - "light" : force light regardless of time
// - "dark"  : force dark regardless of time
export type ThemeMode = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "learnhub-theme-mode";

// The public marketing/landing page ("/") is always presented in light mode,
// regardless of the visitor's saved preference or the current PHT time — no
// dark mode there at all.
const LIGHT_ONLY_PATHS = new Set(["/"]);

function getPhtHour(): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
}

// 6AM (06:00) inclusive → 6PM (18:00) exclusive is light. Otherwise dark.
export function resolveAutoTheme(): ResolvedTheme {
  const hour = getPhtHour();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "auto") return resolveAutoTheme();
  return mode;
}

function applyThemeClass(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.dataset.theme = theme;
}

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  /** True while the current route is pinned to light mode (the landing page). */
  isLightLocked: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLightLocked = LIGHT_ONLY_PATHS.has(pathname);

  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // Load persisted preference on mount.
  useEffect(() => {
    let initial: ThemeMode = "auto";
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === "auto" || saved === "light" || saved === "dark") initial = saved;
    } catch {}
    setModeState(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply whenever the mode or the route's light-lock status changes, so
  // navigating to/from the landing page immediately flips the theme.
  useEffect(() => {
    const r = isLightLocked ? "light" : resolveTheme(mode);
    setResolved(r);
    applyThemeClass(r);
  }, [mode, isLightLocked]);

  // When in auto mode (and not light-locked), re-check PHT every minute so
  // the theme flips at 6AM/6PM.
  useEffect(() => {
    if (mode !== "auto" || isLightLocked) return;
    const tick = () => {
      const r = resolveAutoTheme();
      setResolved(r);
      applyThemeClass(r);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [mode, isLightLocked]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    const r = isLightLocked ? "light" : resolveTheme(next);
    setResolved(r);
    applyThemeClass(r);
  };

  const toggle = () => {
    // Cycle: auto → light → dark → auto
    setMode(mode === "auto" ? "light" : mode === "light" ? "dark" : "auto");
  };

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle, isLightLocked }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback if used outside provider (e.g. during SSR/prerender).
    return {
      mode: "auto" as ThemeMode,
      resolved: "light" as ResolvedTheme,
      setMode: () => {},
      toggle: () => {},
      isLightLocked: false,
    };
  }
  return ctx;
}
