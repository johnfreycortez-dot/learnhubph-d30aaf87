import { useMemo, useState } from "react";
import { AlertTriangle, Award, TrendingUp, Users } from "lucide-react";
import { Drawer } from "@/components/Drawer";
import {
  AdminStat, EmptyState, ExportButton, InitialsAvatar, LastUpdated, LoadState, PAGE_SIZE, Pagination,
  SearchInput, SectionHeading, TableShell, exportToCsv, rowCls, tdCls, thCls, useAdminQuery,
} from "./shared";

function parseDate(value: unknown) {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function ProgressTab() {
  const q = useAdminQuery("adminGetProgress");
  const rows: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.rows || [];
  // Shares the "adminGetUsers" cache with Students/Pending — used here only
  // to pull signupDate so we can flag students who signed up a while ago but
  // still have near-zero progress. adminGetProgress doesn't carry dates.
  const usersQ = useAdminQuery("adminGetUsers");
  const users: any[] = Array.isArray(usersQ.data) ? usersQ.data : (usersQ.data as any)?.users || [];
  const [drawer, setDrawer] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const summary = useMemo(() => {
    const total = rows.length;
    const avg = total ? Math.round(rows.reduce((s, r) => s + (r.completionPct || 0), 0) / total) : 0;
    const certs = rows.reduce((s, r) => s + (r.certificates || 0), 0);
    return { total, avg, certs };
  }, [rows]);

  // Verified students, signed up 7+ days ago, still under 15% complete —
  // a simple, honest signal for who needs a nudge. This only surfaces the
  // list for you to act on manually (email/message); it doesn't send
  // anything automatically since that would need a scheduled trigger on
  // the Apps Script side.
  const stalled = useMemo(() => {
    if (!users.length || !rows.length) return [];
    const signupByEmail = new Map<string, Date>();
    for (const u of users) {
      if (!u.verified) continue;
      const d = parseDate(u.signupDate);
      if (d) signupByEmail.set(u.email, d);
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return rows
      .filter((r) => {
        const signup = signupByEmail.get(r.email);
        return signup && signup < cutoff && (r.completionPct || 0) < 15;
      })
      .map((r) => ({ ...r, signupDate: signupByEmail.get(r.email) }))
      .sort((a, b) => (a.signupDate?.getTime() || 0) - (b.signupDate?.getTime() || 0))
      .slice(0, 8);
  }, [users, rows]);

  const filtered = useMemo(
    () =>
      !search
        ? rows
        : rows.filter(
            (r) => r.name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()),
          ),
    [rows, search],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleExport() {
    exportToCsv(
      `progress-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "completionPct", label: "Completion %" },
        { key: "certificates", label: "Certs" },
        { key: "lessonsCompleted", label: "Lessons Completed" },
        { key: "totalLessons", label: "Total Lessons" },
      ],
    );
  }

  return (
    <div>
      <SectionHeading
        title="Progress"
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="w-full sm:w-56"><SearchInput value={search} onChange={handleSearch} placeholder="Search students…" /></div>
            <ExportButton onClick={handleExport} disabled={filtered.length === 0} />
          </div>
        }
      />
      <LastUpdated ts={q.updatedAt} />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <AdminStat icon={<Users size={22} />} label="Total Students" value={summary.total} tone="purple" />
            <AdminStat icon={<TrendingUp size={22} />} label="Avg Completion" value={`${summary.avg}%`} tone="blue" />
            <AdminStat icon={<Award size={22} />} label="Total Certificates" value={summary.certs} tone="amber" />
          </div>
          {stalled.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                <h2 className="font-black text-amber-900">Needs a Nudge</h2>
              </div>
              <p className="mt-1 text-xs font-medium text-amber-700">
                Verified 7+ days ago, still under 15% complete. Worth a check-in message.
              </p>
              <ul className="mt-3 divide-y divide-amber-100">
                {stalled.map((s) => (
                  <li key={s.email} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <InitialsAvatar name={s.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="truncate text-xs text-gray-500">{s.email}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-700">
                      {s.completionPct || 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {rows.length === 0 ? (
            <TableShell>
              <EmptyState icon={<TrendingUp size={26} />} title="No progress data yet" />
            </TableShell>
          ) : filtered.length === 0 ? (
            <TableShell>
              <EmptyState icon={<TrendingUp size={26} />} title="No matches" subtitle="Try a different search term." />
            </TableShell>
          ) : (
            <TableShell>
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    {["Name", "Email", "Completion", "Certs", "Lessons"].map((h) => (
                      <th key={h} className={thCls}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.email} onClick={() => setDrawer(r)} className={`${rowCls} cursor-pointer`}>
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={r.name} />
                          <span className="font-semibold text-gray-900">{r.name}</span>
                        </div>
                      </td>
                      <td className={`${tdCls} text-gray-600`}>{r.email}</td>
                      <td className={tdCls}>
                        <div className="flex min-w-[160px] items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
                              style={{ width: `${r.completionPct || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{r.completionPct || 0}%</span>
                        </div>
                      </td>
                      <td className={`${tdCls} font-semibold text-gray-900`}>{r.certificates || 0}</td>
                      <td className={`${tdCls} text-gray-600`}>{r.lessonsCompleted}/{r.totalLessons}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </TableShell>
          )}
        </>
      )}
      <Drawer isOpen={!!drawer} onClose={() => setDrawer(null)} title={`${drawer?.name || ""} — Progress`}>
        {drawer?.nicheBreakdown && (
          <ul className="space-y-4">
            {drawer.nicheBreakdown.map((n: any) => (
              <li key={n.title || n.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">{n.title || n.name}</span>
                  <span className="font-black text-gray-900">{n.pct || 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
                    style={{ width: `${n.pct || 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </div>
  );
}
