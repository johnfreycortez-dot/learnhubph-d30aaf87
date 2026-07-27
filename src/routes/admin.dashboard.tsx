import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Clock, Users, TrendingUp, Award, MessageSquare, BookOpen, Settings,
  LogOut, CheckCircle, XCircle, AlertTriangle, Search, Trash2, Send, Save,
  ClipboardList, AlertCircle, X, Plus, Menu, Bell, ChevronDown, ShieldCheck,
  Globe, Wallet, Landmark, Timer, Inbox,
} from "lucide-react";
import { gasCall } from "@/lib/api";
import { AdminGuard } from "@/components/AdminGuard";
import { Spinner } from "@/components/Spinner";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Drawer } from "@/components/Drawer";
import { useToast } from "@/components/Toast";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — LearnHub PH" },
      { name: "description", content: "Admin dashboard." },
      { property: "og:title", content: "Admin Dashboard — LearnHub PH" },
      { property: "og:description", content: "Admin dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  ),
});

type Tab = "overview" | "pending" | "students" | "progress" | "certs" | "messages" | "courses" | "settings";

type NavItem = { key: Tab; label: string; icon: ReactNode };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ key: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> }],
  },
  {
    label: "Manage",
    items: [
      { key: "pending", label: "Pending Payments", icon: <Clock size={18} /> },
      { key: "students", label: "All Students", icon: <Users size={18} /> },
      { key: "progress", label: "Progress", icon: <TrendingUp size={18} /> },
      { key: "certs", label: "Certificates", icon: <Award size={18} /> },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
      { key: "courses", label: "Courses", icon: <BookOpen size={18} /> },
    ],
  },
  {
    label: "System",
    items: [{ key: "settings", label: "Settings", icon: <Settings size={18} /> }],
  },
];

const NAV_FLAT: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // Lightweight fetch just to surface an unread-messages badge in the topbar.
  const badge = useAsync(() => gasCall("adminGetStats"));
  const unread = Number((badge.data as any)?.unrepliedMsgs || 0);

  function logout() {
    if (typeof window !== "undefined") window.sessionStorage.removeItem("lhph_admin");
    navigate({ to: "/login" });
  }

  const activeLabel = NAV_FLAT.find((n) => n.key === tab)?.label || "Overview";

  function go(key: Tab) {
    setTab(key);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-950">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-100 bg-white shadow-sm transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-gray-100 px-5 py-6">
          <div className="min-w-0">
            <p className="truncate text-lg font-black leading-none">
              LearnHub <span className="learnhub-ph-glow">PH</span>
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
              <ShieldCheck size={11} /> Admin Panel
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((n) => {
                  const active = tab === n.key;
                  const showDot = n.key === "messages" && unread > 0;
                  return (
                    <button
                      key={n.key}
                      onClick={() => go(n.key)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                          : "text-gray-500 hover:bg-gray-50 hover:text-purple-700"
                      }`}
                    >
                      {n.icon}
                      <span className="flex-1 text-left">{n.label}</span>
                      {showDot && (
                        <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-red-500"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-4 py-5">
          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gray-50 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black sm:text-2xl">{activeLabel}</h1>
                <p className="hidden truncate text-xs font-medium text-gray-400 sm:block">
                  Manage your LearnHub PH platform
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => go("messages")}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700"
                aria-label="Messages"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex min-w-0 items-center gap-2 rounded-full p-1 hover:bg-gray-50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-sm font-black text-white shadow-sm">
                    AD
                  </span>
                  <span className="hidden max-w-[120px] truncate text-sm font-bold text-gray-700 sm:inline">
                    Admin
                  </span>
                  <ChevronDown size={16} className="hidden text-gray-400 sm:block" />
                </button>
                {menuOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40"
                      aria-label="Close menu"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          go("settings");
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                      >
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmingLogout(true);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {tab === "overview" && <OverviewTab />}
          {tab === "pending" && <PendingTab />}
          {tab === "students" && <StudentsTab />}
          {tab === "progress" && <ProgressTab />}
          {tab === "certs" && <CertsTab />}
          {tab === "messages" && <MessagesTab />}
          {tab === "courses" && <CoursesTab />}
          {tab === "settings" && <SettingsTab />}
        </main>
      </div>

      <ConfirmModal
        isOpen={confirmingLogout}
        title="Log out?"
        message="You'll need to enter your admin PIN again to get back in."
        confirmLabel="Log Out"
        confirmVariant="danger"
        onConfirm={logout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}

function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = () => {
    setLoading(true);
    setError("");
    fn()
      .then(setData)
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error, reload, setData };
}

function LoadState({ loading, error, onRetry }: { loading: boolean; error: string; onRetry: () => void }) {
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

function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gray-50 text-gray-300">{icon}</div>
      <p className="mt-3 text-sm font-bold text-gray-700">{title}</p>
      {subtitle && <p className="mt-1 max-w-xs text-xs font-medium text-gray-400">{subtitle}</p>}
    </div>
  );
}

function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-black text-gray-900 sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
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

function InitialsAvatar({ name }: { name?: string }) {
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

function StatusPill({ label, tone }: { label: string; tone: "green" | "amber" | "gray" }) {
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

function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

const thCls = "px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500";
const tdCls = "px-4 py-3.5";
const rowCls = "border-t border-gray-100 transition-colors hover:bg-purple-50/40";

// ── OVERVIEW ──
function OverviewTab() {
  const q = useAsync(() => gasCall("adminGetStats"));
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

const STAT_TONES: Record<string, string> = {
  purple: "bg-purple-50 text-purple-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
};

function AdminStat({
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

// ── PENDING ──
function PendingTab() {
  const { showToast } = useToast();
  const q = useAsync(() => gasCall("adminGetUsers"));
  const users: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.users || [];
  const pending = users.filter((u) => u.refNumber !== "—" && !u.verified);
  const [confirm, setConfirm] = useState<{ email: string; action: "verify" | "reject" } | null>(null);
  const [busy, setBusy] = useState(false);

  async function doAction() {
    if (!confirm) return;
    setBusy(true);
    try {
      const fn = confirm.action === "verify" ? "adminVerifyUser" : "adminRejectUser";
      const res = await gasCall(fn, confirm.email);
      if (res.ok) {
        showToast(confirm.action === "verify" ? "Student verified!" : "Payment rejected.", confirm.action === "verify" ? "success" : "info");
        q.reload();
      } else showToast(res.msg || "Failed", "error");
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  return (
    <div>
      <SectionHeading title="Pending Payments" />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && pending.length === 0 && (
        <TableShell>
          <EmptyState
            icon={<CheckCircle size={26} />}
            title="No pending payments"
            subtitle="You're all caught up — new submissions will show up here."
          />
        </TableShell>
      )}
      {pending.length > 0 && (
        <TableShell>
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                {["Name", "Email", "Method", "Ref #", "Amount", "Signup", "Actions"].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.email} className={rowCls}>
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={u.name} />
                      <span className="font-semibold text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className={`${tdCls} text-gray-600`}>{u.email}</td>
                  <td className={`${tdCls} text-gray-600`}>{u.payMethod}</td>
                  <td className={`${tdCls} text-gray-600`}>{u.refNumber}</td>
                  <td className={`${tdCls} font-semibold text-gray-900`}>₱{u.amountPaid}</td>
                  <td className={`${tdCls} text-gray-600`}>{u.signupDate}</td>
                  <td className={tdCls}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirm({ email: u.email, action: "verify" })}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-green-700"
                      >
                        <CheckCircle size={14} /> Verify
                      </button>
                      <button
                        onClick={() => setConfirm({ email: u.email, action: "reject" })}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}
      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.action === "verify" ? "Verify Payment" : "Reject Payment"}
        message={
          confirm?.action === "verify"
            ? "Are you sure you want to verify this student's payment and give them full access?"
            : "This will send a rejection email to the student. Continue?"
        }
        confirmLabel={confirm?.action === "verify" ? "Verify" : "Reject"}
        confirmVariant={confirm?.action === "verify" ? "primary" : "danger"}
        onConfirm={doAction}
        onCancel={() => setConfirm(null)}
        loading={busy}
      />
    </div>
  );
}

// ── STUDENTS ──
function StudentsTab() {
  const { showToast } = useToast();
  const q = useAsync(() => gasCall("adminGetUsers"));
  const users: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.users || [];
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<any | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          !search ||
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  async function doDelete() {
    if (!del) return;
    setBusy(true);
    try {
      const res = await gasCall("adminDeleteUser", del);
      if (res.ok) {
        showToast("Student deleted.", "info");
        q.reload();
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setBusy(false);
      setDel(null);
    }
  }

  return (
    <div>
      <SectionHeading
        title="All Students"
        action={<div className="w-full sm:w-64"><SearchInput value={search} onChange={setSearch} placeholder="Search students…" /></div>}
      />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && filtered.length === 0 && (
        <TableShell>
          <EmptyState icon={<Users size={26} />} title="No students found" subtitle="Try a different search term." />
        </TableShell>
      )}
      {!q.loading && filtered.length > 0 && (
        <TableShell>
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                {["Name", "Email", "Signup", "Status", "Amount", "Niche", "Actions"].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const status: { label: string; tone: "green" | "amber" | "gray" } = u.verified
                  ? { label: "Verified", tone: "green" }
                  : u.refNumber !== "—"
                    ? { label: "Pending", tone: "amber" }
                    : { label: "Unverified", tone: "gray" };
                return (
                  <tr key={u.email} onClick={() => setDrawer(u)} className={`${rowCls} cursor-pointer`}>
                    <td className={tdCls}>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={u.name} />
                        <span className="font-semibold text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className={`${tdCls} text-gray-600`}>{u.email}</td>
                    <td className={`${tdCls} text-gray-600`}>{u.signupDate}</td>
                    <td className={tdCls}>
                      <StatusPill label={status.label} tone={status.tone} />
                    </td>
                    <td className={`${tdCls} font-semibold text-gray-900`}>₱{u.amountPaid}</td>
                    <td className={`${tdCls} text-gray-600`}>{u.enrolledNiche || "—"}</td>
                    <td className={tdCls} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDel(u.email)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      )}

      <Drawer isOpen={!!drawer} onClose={() => setDrawer(null)} title={drawer?.name || ""}>
        {drawer && (
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <InitialsAvatar name={drawer.name} />
              <div className="min-w-0">
                <p className="truncate font-black text-gray-900">{drawer.name}</p>
                <p className="truncate text-xs font-medium text-gray-400">{drawer.email}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Signup Date", drawer.signupDate],
                ["Payment Method", drawer.payMethod],
                ["Reference #", drawer.refNumber],
                ["Amount Paid", `₱${drawer.amountPaid}`],
                ["Email Confirmed", drawer.emailConfirmed ? "Yes" : "No"],
                ["Verified", drawer.verified ? "Yes" : "No"],
                ["Verified Date", drawer.verifiedDate || "—"],
                ["Enrolled Niche", drawer.enrolledNiche || "—"],
                ["T&C Accepted", drawer.tncAccepted ? "Yes" : "No"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-center justify-between gap-3 border-b border-gray-50 pb-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">{k}</dt>
                  <dd className="text-right font-semibold text-gray-900">{v as ReactNode}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Drawer>

      <ConfirmModal
        isOpen={!!del}
        title="Delete Student"
        message="This permanently deletes the student's account. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={doDelete}
        onCancel={() => setDel(null)}
        loading={busy}
      />
    </div>
  );
}

// ── PROGRESS ──
function ProgressTab() {
  const q = useAsync(() => gasCall("adminGetProgress"));
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

// ── CERTIFICATES ──
function CertsTab() {
  const { showToast } = useToast();
  const q = useAsync(() => gasCall("adminGetCertStats"));
  const data = q.data as any;
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [testNiche, setTestNiche] = useState("");
  const [sending, setSending] = useState(false);

  async function sendTest() {
    setSending(true);
    try {
      const res = await gasCall("adminTestCertificate", testEmail, testName, testNiche);
      if (res.ok) {
        showToast("Test certificate sent!", "success");
        setTestOpen(false);
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <SectionHeading
        title="Certificates"
        action={
          <button
            onClick={() => setTestOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-800"
          >
            <Send size={16} /> Send Test Certificate
          </button>
        }
      />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {data?.summary && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminStat icon={<Award size={22} />} label="Total Issued" value={data.summary.totalCertsIssued} tone="purple" />
          <AdminStat icon={<Users size={22} />} label="Students with Any Cert" value={data.summary.studentsWithAnyCert} tone="blue" />
          <AdminStat icon={<CheckCircle size={22} />} label="Fully Complete" value={data.summary.studentsFullyComplete} tone="green" />
        </div>
      )}
      {data?.students && (
        data.students.length === 0 ? (
          <TableShell>
            <EmptyState icon={<Award size={26} />} title="No certificates issued yet" />
          </TableShell>
        ) : (
        <TableShell>
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                {["Name", "Email", "Certs Earned", "Progress"].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.students.map((s: any) => {
                const total = s.totalNiches || data.summary?.totalNiches || 9;
                const pct = total ? Math.round((s.certsEarned / total) * 100) : 0;
                return (
                  <tr key={s.email} className={rowCls}>
                    <td className={tdCls}>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={s.name} />
                        <span className="font-semibold text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className={`${tdCls} text-gray-600`}>{s.email}</td>
                    <td className={`${tdCls} font-semibold text-gray-900`}>{s.certsEarned} / {total}</td>
                    <td className={tdCls}>
                      <div className="min-w-[160px]">
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
        )
      )}

      {testOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setTestOpen(false)} />
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl duration-150">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">Send Test Certificate</h3>
              <button onClick={() => setTestOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input placeholder="Recipient Email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500" />
              <input placeholder="Recipient Name" value={testName} onChange={(e) => setTestName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500" />
              <select value={testNiche} onChange={(e) => setTestNiche(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select Niche</option>
                {(data?.niches || []).map((n: any) => (
                  <option key={n.id} value={n.title}>{n.title}</option>
                ))}
              </select>
              <button onClick={sendTest} disabled={sending || !testEmail || !testName || !testNiche}
                className="w-full rounded-xl bg-purple-700 px-5 py-2.5 font-bold text-white shadow-sm transition-colors hover:bg-purple-800 disabled:opacity-60">
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MESSAGES ──
function MessagesTab() {
  const { showToast } = useToast();
  const q = useAsync(() => gasCall("adminGetMessages"));
  const rows: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.rows || [];

  return (
    <div>
      <SectionHeading title="Messages" />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && rows.length === 0 && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <EmptyState icon={<Inbox size={26} />} title="No messages yet" subtitle="Student messages will appear here." />
        </div>
      )}
      {!q.loading && rows.length > 0 && (
        <div className="mt-6 space-y-4">
          {rows.map((m) => (
            <MessageCard key={m.msgId || m.idx} m={m} onReplied={q.reload} showToast={showToast} />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageCard({ m, onReplied, showToast }: { m: any; onReplied: () => void; showToast: (msg: string, v?: any) => void }) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const replied = m.adminReply && m.adminReply !== "";
  const border = replied
    ? "border border-gray-100 border-l-4 border-l-green-400 bg-white"
    : "border border-amber-100 border-l-4 border-l-amber-400 bg-amber-50/40";

  async function send() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await gasCall("adminReplyToMessage", m.msgId, reply);
      if (res.ok) {
        showToast("Reply sent!", "success");
        onReplied();
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`rounded-2xl p-5 shadow-sm ${border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <InitialsAvatar name={m.name} />
          <div>
            <p className="font-black text-gray-900">
              {m.name} <span className="ml-1 text-xs font-normal text-gray-400">{m.email}</span>
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-700">{m.subject}</p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium text-gray-400">{m.sentAt}</span>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm text-gray-600">{m.body}</p>
      {replied ? (
        <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50 p-3.5">
          <p className="text-xs font-bold text-purple-700">Your reply · {m.repliedAt}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-gray-800">{m.adminReply}</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply..."
            className="min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={send}
            disabled={sending || !reply.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-800 disabled:opacity-60"
          >
            <Send size={16} /> Send Reply
          </button>
        </div>
      )}
    </div>
  );
}

// ── COURSES ──
function CoursesTab() {
  const [sub, setSub] = useState<"lessons" | "quizzes">("lessons");
  return (
    <div>
      <SectionHeading title="Courses" />
      <div className="mt-4 inline-flex rounded-full border border-gray-100 bg-white p-1 shadow-sm">
        <button onClick={() => setSub("lessons")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${sub === "lessons" ? "bg-purple-700 text-white shadow-sm" : "text-gray-500 hover:text-purple-700"}`}>
          <BookOpen size={16} /> Lessons
        </button>
        <button onClick={() => setSub("quizzes")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${sub === "quizzes" ? "bg-purple-700 text-white shadow-sm" : "text-gray-500 hover:text-purple-700"}`}>
          <ClipboardList size={16} /> Quizzes
        </button>
      </div>
      <div className="mt-6">{sub === "lessons" ? <LessonsSub /> : <QuizzesSub />}</div>
    </div>
  );
}

function LessonsSub() {
  const { showToast } = useToast();
  const q = useAsync(() => gasCall("adminGetAllLessons"));
  const rows: any[] = (q.data as any)?.rows || [];
  const [search, setSearch] = useState("");
  const filtered = rows.filter((r) =>
    !search ||
    r.lessonId?.toLowerCase().includes(search.toLowerCase()) ||
    r.moduleName?.toLowerCase().includes(search.toLowerCase()) ||
    r.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="max-w-sm"><SearchInput value={search} onChange={setSearch} placeholder="Search lessons..." /></div>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && filtered.length === 0 && (
        <TableShell>
          <EmptyState icon={<BookOpen size={26} />} title="No lessons found" />
        </TableShell>
      )}
      {!q.loading && filtered.length > 0 && (
        <TableShell>
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>{["Lesson ID", "Module", "Title", "Video URL", ""].map((h) => (
                <th key={h} className={`${thCls} px-3`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((r) => <LessonRow key={r.rowIndex} r={r} showToast={showToast} />)}
            </tbody>
          </table>
        </TableShell>
      )}
    </div>
  );
}

function LessonRow({ r, showToast }: { r: any; showToast: (m: string, v?: any) => void }) {
  const [title, setTitle] = useState(r.title || "");
  const [video, setVideo] = useState(r.videoUrl || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await gasCall("adminSaveLessonEdit", r.rowIndex, title, video);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500";

  return (
    <tr className={rowCls}>
      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-gray-900">{r.lessonId}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">{r.moduleName}</td>
      <td className="px-3 py-2.5"><input value={title} onChange={(e) => setTitle(e.target.value)} className={inp} /></td>
      <td className="px-3 py-2.5"><input value={video} onChange={(e) => setVideo(e.target.value)} className={inp} /></td>
      <td className="px-3 py-2.5">
        <button onClick={save} disabled={saving}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors ${saved ? "bg-green-600" : "bg-purple-700 hover:bg-purple-800"}`}>
          {saved ? "✓ Saved" : "Save"}
        </button>
      </td>
    </tr>
  );
}

function QuizzesSub() {
  const { showToast } = useToast();
  const q = useAsync(() => gasCall("adminGetAllQuizzes"));
  const lessonsQ = useAsync(() => gasCall("adminGetAllLessons"));
  const rows: any[] = (q.data as any)?.rows || [];
  const lessons: any[] = (lessonsQ.data as any)?.rows || [];
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [del, setDel] = useState<number | null>(null);

  const filtered = rows.filter((r) =>
    !search ||
    r.lessonId?.toLowerCase().includes(search.toLowerCase()) ||
    r.question?.toLowerCase().includes(search.toLowerCase()),
  );

  async function doDelete() {
    if (del === null) return;
    const res = await gasCall("adminDeleteQuiz", del);
    if (res.ok) {
      showToast("Question deleted.", "info");
      q.reload();
    } else showToast(res.msg || "Failed", "error");
    setDel(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-between gap-3">
        <div className="max-w-sm flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search quizzes..." /></div>
        <button onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-800">
          <Plus size={16} /> Add Question
        </button>
      </div>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && filtered.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <EmptyState icon={<ClipboardList size={26} />} title="No quiz questions found" />
        </div>
      )}
      {!q.loading && filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50/80">
                <tr>{["Quiz ID", "Lesson", "Question", "A", "B", "C", "D", "Correct", ""].map((h) => (
                  <th key={h} className={`${thCls} px-2 normal-case`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map((r) => <QuizRow key={r.rowIndex} r={r} showToast={showToast} onDelete={() => setDel(r.rowIndex)} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {addOpen && <AddQuizModal lessons={lessons} onClose={() => setAddOpen(false)} onAdded={() => { q.reload(); setAddOpen(false); }} />}
      <ConfirmModal isOpen={del !== null} title="Delete Question" message="Delete this quiz question?" confirmLabel="Delete" confirmVariant="danger" onConfirm={doDelete} onCancel={() => setDel(null)} />
    </div>
  );
}

function QuizRow({ r, showToast, onDelete }: { r: any; showToast: (m: string, v?: any) => void; onDelete: () => void }) {
  const [q, setQ] = useState(r.question || "");
  const [a, setA] = useState(r.optionA || "");
  const [b, setB] = useState(r.optionB || "");
  const [c, setC] = useState(r.optionC || "");
  const [d, setD] = useState(r.optionD || "");
  const [correct, setCorrect] = useState(r.correctAnswer || "");
  const [saved, setSaved] = useState(false);

  async function save() {
    const res = await gasCall("adminSaveQuizEdit", r.rowIndex, q, a, b, c, d, correct);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } else showToast(res.msg || "Failed", "error");
  }

  const inp = "w-full rounded-md border border-gray-200 px-2 py-1 outline-none transition-shadow focus:ring-2 focus:ring-purple-500";

  return (
    <tr className={rowCls}>
      <td className="whitespace-nowrap px-2 py-2 font-semibold text-gray-900">{r.quizId}</td>
      <td className="whitespace-nowrap px-2 py-2 text-gray-600">{r.lessonId}</td>
      <td className="min-w-[220px] px-2 py-2"><input value={q} onChange={(e) => setQ(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={a} onChange={(e) => setA(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={b} onChange={(e) => setB(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={c} onChange={(e) => setC(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={d} onChange={(e) => setD(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={correct} onChange={(e) => setCorrect(e.target.value)} className={inp} /></td>
      <td className="whitespace-nowrap px-2 py-2">
        <div className="flex gap-1">
          <button onClick={save} className={`rounded-md px-2 py-1 font-bold text-white shadow-sm ${saved ? "bg-green-600" : "bg-purple-700 hover:bg-purple-800"}`}>{saved ? "✓" : "Save"}</button>
          <button onClick={onDelete} className="rounded-md bg-red-600 px-2 py-1 text-white shadow-sm hover:bg-red-700"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function AddQuizModal({ lessons, onClose, onAdded }: { lessons: any[]; onClose: () => void; onAdded: () => void }) {
  const { showToast } = useToast();
  const [lessonId, setLessonId] = useState("");
  const [question, setQuestion] = useState("");
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [c, setC] = useState(""); const [d, setD] = useState("");
  const [correct, setCorrect] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try {
      const res = await gasCall("adminAddQuiz", lessonId, question, a, b, c, d, correct);
      if (res.ok) {
        showToast("Question added!", "success");
        onAdded();
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  const inp = "w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg animate-in fade-in zoom-in-95 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl duration-150">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">Add Question</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={inp}>
            <option value="">Select Lesson</option>
            {lessons.map((l) => <option key={l.rowIndex} value={l.lessonId}>{l.lessonId} — {l.title}</option>)}
          </select>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" className={`${inp} min-h-[80px]`} />
          <input value={a} onChange={(e) => setA(e.target.value)} placeholder="Option A" className={inp} />
          <input value={b} onChange={(e) => setB(e.target.value)} placeholder="Option B" className={inp} />
          <input value={c} onChange={(e) => setC(e.target.value)} placeholder="Option C" className={inp} />
          <input value={d} onChange={(e) => setD(e.target.value)} placeholder="Option D" className={inp} />
          <input value={correct} onChange={(e) => setCorrect(e.target.value)} placeholder="Correct Answer (must match one option)" className={inp} />
          <button onClick={add} disabled={busy || !lessonId || !question || !correct}
            className="w-full rounded-xl bg-purple-700 px-5 py-2.5 font-bold text-white shadow-sm transition-colors hover:bg-purple-800 disabled:opacity-60">
            {busy ? "Adding..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS ──
const inpCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition-shadow focus:border-transparent focus:ring-2 focus:ring-purple-500";

function SettingsField({ label, value, type, onChange }: { label: string; value: any; type: string; onChange: (v: any) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className={inpCls}
      />
    </div>
  );
}

function SettingsCard({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600">{icon}</span>
        <div>
          <h3 className="font-black text-gray-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs font-medium text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function SettingsTab() {
  const { showToast } = useToast();
  const q = useAsync(() => gasCall("adminGetConfig"));
  const cfg = q.data as any;
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (cfg) setForm(cfg);
  }, [cfg]);

  function set(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await gasCall("adminSaveConfig", form);
      if (res.ok) {
        showToast("Settings saved!", "success");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <SectionHeading title="Settings" />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {cfg && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <SettingsCard icon={<Globe size={18} />} title="Site Info" description="General platform settings">
              <SettingsField label="Site Name" value={form.siteName} type="text" onChange={(v) => set("siteName", v)} />
              <SettingsField label="Course Price (₱)" value={form.coursePrice} type="number" onChange={(v) => set("coursePrice", v)} />
            </SettingsCard>

            <SettingsCard icon={<Timer size={18} />} title="Access" description="Verification timing">
              <SettingsField label="Verification Wait Hours" value={form.accessHours} type="number" onChange={(v) => set("accessHours", v)} />
            </SettingsCard>

            <SettingsCard icon={<Wallet size={18} />} title="GCash" description="Payment details shown to students">
              <SettingsField label="GCash Name" value={form.gcashName} type="text" onChange={(v) => set("gcashName", v)} />
              <SettingsField label="GCash Number" value={form.gcashNumber} type="text" onChange={(v) => set("gcashNumber", v)} />
            </SettingsCard>

            <SettingsCard icon={<Landmark size={18} />} title="BPI Bank Transfer" description="Payment details shown to students">
              <SettingsField label="BPI Account Name" value={form.bpiName} type="text" onChange={(v) => set("bpiName", v)} />
              <SettingsField label="BPI Account Number" value={form.bpiNumber} type="text" onChange={(v) => set("bpiNumber", v)} />
            </SettingsCard>
          </div>

          <div className="sticky bottom-4 mt-6 flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-colors hover:bg-purple-800 disabled:opacity-70"
            >
              {saving ? <Spinner size="sm" className="border-white" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
