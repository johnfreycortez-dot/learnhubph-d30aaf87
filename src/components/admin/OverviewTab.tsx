import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from "lucide-react";
import { AdminStat, LoadState, SectionHeading, useAdminQuery } from "./shared";

export default function OverviewTab() {
  const q = useAdminQuery("adminGetStats");
  const stats = q.data as any;

  return (
    <div>
      <SectionHeading title="Overview" />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {stats && (
        <>
          {stats.unrepliedMsgs > 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <AlertTriangle size={18} />
              </span>
              <p className="mt-1 text-sm font-semibold text-amber-800">
                You have {stats.unrepliedMsgs} unreplied message{stats.unrepliedMsgs === 1 ? "" : "s"}. Go to the Messages tab.
              </p>
            </div>
          )}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <AdminStat icon={<Users size={22} />} label="Total Students" value={stats.total} tone="purple" />
            <AdminStat icon={<CheckCircle size={22} />} label="Verified Students" value={stats.verified} tone="green" />
            <AdminStat icon={<Clock size={22} />} label="Pending Payments" value={stats.pending} tone="amber" />
            <AdminStat
              icon={<TrendingUp size={22} />}
              label="Total Revenue"
              value={`₱${Number(stats.revenue || 0).toLocaleString()}`}
              tone="blue"
            />
          </div>
          {stats.nicheCount && (
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="font-black text-gray-900">Niche Enrollment</h2>
              <NicheEnrollmentList data={stats.nicheCount} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NicheEnrollmentList({ data }: { data: any }) {
  const entries: [string, number][] = Array.isArray(data)
    ? data.map((d: any) => [d.name || d.niche || d.title, Number(d.count || d.value || 0)])
    : Object.entries(data).map(([k, v]) => [k, Number(v)]);
  entries.sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map((e) => e[1]));
  return (
    <ul className="mt-4 space-y-4">
      {entries.map(([name, count]) => (
        <li key={name}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-semibold text-gray-700">{name}</span>
            <span className="font-black text-gray-900">{count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
