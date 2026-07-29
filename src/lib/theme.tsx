import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Theme modes:
// - "auto"  : follow Philippine time (6AM–5:59PM = light, 6PM–5:59AM = dark)
// - "light" : force light regardless of time
// - "dark"  : force dark regardless of time
export type ThemeMode = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "learnhub-theme-mode";

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
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // Load persisted preference & apply immediately on mount.
  useEffect(() => {
    let initial: ThemeMode = "auto";
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === "auto" || saved === "light" || saved === "dark") initial = saved;
    } catch {}
    setModeState(initial);
    const r = resolveTheme(initial);
    setResolved(r);
    applyThemeClass(r);
  }, []);

  // When in auto mode, re-check PHT every minute so the theme flips at 6AM/6PM.
  useEffect(() => {
    if (mode !== "auto") return;
    const tick = () => {
      const r = resolveAutoTheme();
      setResolved(r);
      applyThemeClass(r);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [mode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    const r = resolveTheme(next);
    setResolved(r);
    applyThemeClass(r);
  };

  const toggle = () => {
    // Cycle: auto → light → dark → auto
    setMode(mode === "auto" ? "light" : mode === "light" ? "dark" : "auto");
  };

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>
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
    };
  }
  return ctx;
}
