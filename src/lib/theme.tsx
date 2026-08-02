// Dark mode has been removed from the app (no more toggle, no auto PHT
// switching). This stub is kept only so existing `useTheme()` call sites
// (e.g. the admin progress chart, which picks SVG text colors per theme)
// keep compiling without a rewrite — it always resolves to "light".
export type ThemeMode = "light";
export type ResolvedTheme = "light";

export function useTheme() {
  return {
    mode: "light" as ThemeMode,
    resolved: "light" as ResolvedTheme,
    setMode: () => {},
    toggle: () => {},
    isLightLocked: true,
  };
}
