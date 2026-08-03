import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from "lucide-react";
import { AdminStat, LastUpdated, LoadState, SectionHeading, useAdminQuery } from "./shared";

export default function OverviewTab() {
  const q = useAdminQuery("adminGetStats");
  const stats = q.data as any;
  // Reuses the "adminGetUsers" cache key — StudentsTab and PendingTab already
  // fetch this, so if either has loaded this session it's an instant cache
  // hit here instead of a second network round trip.
  const usersQ = useAdminQuery("adminGetUsers");
  const users: any[] = Array.isArray(usersQ.data) ? usersQ.data : (usersQ.data as any)?.users || [];

  return (
    <div>
      
      <LastUpdated ts={q.updatedAt} />
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

          {!usersQ.loading && users.length > 0 && <SignupTrend users={users} />}

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

function parseDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 14-day signup trend + week-over-week comparison, built entirely from the
 * per-user `signupDate` field already returned by adminGetUsers — no backend
 * change needed. (Revenue/completion trends would need a real historical
 * snapshot on the Apps Script side since we only get current totals for those.)
 */
function SignupTrend({ users }: { users: any[] }) {
  const { days, thisWeek, lastWeek, hasAnyDates } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = new Map<string, number>();
    const dayList: { key: string; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      buckets.set(key, 0);
      dayList.push({ key, label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count: 0 });
    }

    let found = false;
    for (const u of users) {
      const d = parseDate(u.signupDate);
      if (!d) continue;
      found = true;
      d.setHours(0, 0, 0, 0);
      const key = dateKey(d);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    for (const day of dayList) day.count = buckets.get(day.key) || 0;

    const thisWeekCount = dayList.slice(7, 14).reduce((s, d) => s + d.count, 0);
    const lastWeekCount = dayList.slice(0, 7).reduce((s, d) => s + d.count, 0);

    return { days: dayList, thisWeek: thisWeekCount, lastWeek: lastWeekCount, hasAnyDates: found };
  }, [users]);

  if (!hasAnyDates) return null;

  const max = Math.max(1, ...days.map((d) => d.count));
  const delta = thisWeek - lastWeek;
  const pct = lastWeek > 0 ? Math.round((delta / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;
  const trendUp = delta >= 0;

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-black text-gray-900">Signups — Last 14 Days</h2>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
            trendUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          <TrendingUp size={12} className={trendUp ? "" : "rotate-180"} />
          {trendUp ? "+" : ""}
          {pct}% vs prior week
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-gray-400">
        {thisWeek} signups this week vs {lastWeek} the week before
      </p>
      <div className="mt-5 flex items-end gap-1.5" style={{ height: 96 }}>
        {days.map((d) => (
          <div key={d.key} className="group relative flex flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.count}`}>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-purple-600 to-indigo-500 transition-all"
              style={{ height: `${Math.max(4, (d.count / max) * 88)}px` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-gray-400">
        <span>{days[0].label}</span>
        <span>{days[days.length - 1].label}</span>
      </div>
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
