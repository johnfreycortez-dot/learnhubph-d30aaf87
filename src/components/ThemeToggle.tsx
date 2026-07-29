import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme";

// Floating theme toggle. Cycles Auto → Light → Dark → Auto.
// Position: fixed bottom-LEFT. The chat widget bubble already owns the
// bottom-right corner (see ChatWidget.tsx) — keeping this on the opposite
// side avoids the two floating buttons stacking on top of each other.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, resolved, toggle } = useTheme();

  const label: Record<ThemeMode, string> = {
    auto: `Auto (${resolved === "dark" ? "Dark" : "Light"})`,
    light: "Light",
    dark: "Dark",
  };

  const Icon = mode === "auto" ? Sparkles : resolved === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Theme: ${label[mode]}. Click to change.`}
      title={`Theme: ${label[mode]}. Click to change.`}
      className={
        "fixed bottom-5 left-5 z-[100] inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-lg backdrop-blur-xl transition hover:scale-105 hover:text-purple-700 dark:border-white/10 dark:bg-gray-900/80 dark:text-gray-100 dark:hover:text-purple-300 " +
        className
      }
    >
      <Icon size={16} className="text-purple-600 dark:text-purple-300" />
      <span className="hidden sm:inline">{label[mode]}</span>
    </button>
  );
}

export default ThemeToggle;
