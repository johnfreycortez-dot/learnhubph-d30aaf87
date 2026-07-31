import { type ReactNode } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { useGasQuery } from "@/hooks/useGasQuery";
import type { UseQueryOptions } from "@tanstack/react-query";

/**
 * Same {data, loading, error, reload} shape the old local `useAsync` hook
 * returned, so every tab below barely changed — but the fetch itself now
 * goes through react-query, which means: shared cache across tabs that hit
 * the same action (e.g. the topbar unread badge and the Overview tab both
 * read "adminGetStats" and now share one request), automatic retries on a
 * flaky connection, and background refetch instead of a fresh network call
 * on every mount.
 *
 * `options` passes straight through to react-query — e.g. pass
 * `{ refetchInterval: 5000 }` for a tab that needs to poll (Live Support).
 */
export function useAdminQuery<T = any>(
  action: string,
  params: any[] = [],
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  const q = useGasQuery<T>(action, params, options);
  return {
    data: (q.data ?? null) as T | null,
    loading: q.isLoading,
    error: q.isError ? "Failed to load data." : "",
    reload: () => q.refetch(),
    updatedAt: q.dataUpdatedAt,
  };
}

/** "2m ago" / "Just now" style relative time for a "last updated" label. */
export function relativeTime(ts: number) {
  if (!ts) return "";
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function LastUpdated({ ts }: { ts: number }) {
  if (!ts) return null;
  return <p className="mt-1 text-xs font-medium text-gray-400">Last updated {relativeTime(ts)}</p>;
}

export function LoadState({ loading, error, onRetry }: { loading: boolean; error: string; onRetry: () => void }) {
  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center py-20">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={28} />
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-700">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-800"
        >
          Try Again
        </button>
      </div>
    );
  return null;
}

export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gray-50 text-gray-300">{icon}</div>
      <p className="mt-3 text-sm font-bold text-gray-700">{title}</p>
      {subtitle && <p className="mt-1 max-w-xs text-xs font-medium text-gray-400">{subtitle}</p>}
    </div>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-black text-gray-900 sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-shadow focus:border-transparent focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
}

export function InitialsAvatar({ name }: { name?: string }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-100 text-xs font-black text-purple-700">
      {initials || "?"}
    </span>
  );
}

export function StatusPill({ label, tone }: { label: string; tone: "green" | "amber" | "gray" }) {
  const cls =
    tone === "green"
      ? "bg-green-50 text-green-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-gray-100 text-gray-600";
  const dot = tone === "green" ? "bg-green-500" : tone === "amber" ? "bg-amber-500" : "bg-gray-400";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {label}
    </span>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const thCls = "px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500";
export const tdCls = "px-4 py-3.5";
export const rowCls = "border-t border-gray-100 transition-colors hover:bg-purple-50/40";
export const inpCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition-shadow focus:border-transparent focus:ring-2 focus:ring-purple-500";

const STAT_TONES: Record<string, string> = {
  purple: "bg-purple-50 text-purple-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
};

/** Rows to a downloaded CSV file. `columns` controls column order/labels; defaults to the keys of the first row. */
export function exportToCsv(filename: string, rows: Record<string, any>[], columns?: { key: string; label: string }[]) {
  if (!rows.length) return;
  const cols = columns || Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
  const escape = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.map((c) => escape(c.label)).join(",");
  const body = rows.map((r) => cols.map((c) => escape(r[c.key])).join(",")).join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportButton({ onClick, label = "Export CSV", disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:border-purple-200 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download size={16} /> {label}
    </button>
  );
}

export const PAGE_SIZE = 10;

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={14} /> Previous
      </button>
      <span className="text-xs font-semibold text-gray-500">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}

export function AdminStat({
  icon,
  label,
  value,
  tone = "purple",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone?: "purple" | "green" | "amber" | "blue";
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${STAT_TONES[tone]}`}>{icon}</span>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-gray-400">{label}</div>
          <div className="truncate text-xl font-black text-gray-900 sm:text-2xl">{value}</div>
        </div>
      </div>
    </div>
  );
}
