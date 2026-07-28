import { useMemo, useState } from "react";
import { Award, TrendingUp, Users } from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { AdminStat, EmptyState, InitialsAvatar, LoadState, SectionHeading, TableShell, rowCls, tdCls, thCls, useAdminQuery } from "./shared";

export default function ProgressTab() {
  const q = useAdminQuery("adminGetProgress");
  const rows: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.rows || [];
  const [drawer, setDrawer] = useState<any | null>(null);

  const summary = useMemo(() => {
    const total = rows.length;
    const avg = total ? Math.round(rows.reduce((s, r) => s + (r.completionPct || 0), 0) / total) : 0;
    const certs = rows.reduce((s, r) => s + (r.certificates || 0), 0);
    return { total, avg, certs };
  }, [rows]);

  return (
    <div>
      <SectionHeading title="Progress" />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <AdminStat icon={<Users size={22} />} label="Total Students" value={summary.total} tone="purple" />
            <AdminStat icon={<TrendingUp size={22} />} label="Avg Completion" value={`${summary.avg}%`} tone="blue" />
            <AdminStat icon={<Award size={22} />} label="Total Certificates" value={summary.certs} tone="amber" />
          </div>
          {rows.length === 0 ? (
            <TableShell>
              <EmptyState icon={<TrendingUp size={26} />} title="No progress data yet" />
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
                  {rows.map((r) => (
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
