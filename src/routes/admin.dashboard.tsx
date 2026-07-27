import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Clock, Users, TrendingUp, Award, MessageSquare, BookOpen, Settings,
  LogOut, CheckCircle, XCircle, AlertTriangle, Search, Trash2, Send, Save,
  ClipboardList, AlertCircle, X, Plus,
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

const NAV: { key: Tab; label: string; icon: ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { key: "pending", label: "Pending Payments", icon: <Clock size={20} /> },
  { key: "students", label: "All Students", icon: <Users size={20} /> },
  { key: "progress", label: "Progress", icon: <TrendingUp size={20} /> },
  { key: "certs", label: "Certificates", icon: <Award size={20} /> },
  { key: "messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { key: "courses", label: "Courses", icon: <BookOpen size={20} /> },
  { key: "settings", label: "Settings", icon: <Settings size={20} /> },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  function logout() {
    if (typeof window !== "undefined") window.sessionStorage.removeItem("lhph_admin");
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="fixed top-0 left-0 h-screen w-[240px] bg-[#1a1a2e] text-white overflow-y-auto">
        <div className="p-5 border-b border-white/10">
          <h1 className="font-extrabold">LearnHub PH</h1>
          <p className="text-xs text-white/50">Admin</p>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                tab === n.key ? "bg-purple-700 text-white" : "text-white/70 hover:bg-white/5"
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5"
          >
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>

      <main className="ml-[240px] flex-1 p-6 lg:p-8">
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
        <AlertCircle className="text-red-500" size={48} />
        <p className="mt-3 text-gray-700">{error}</p>
        <button onClick={onRetry} className="mt-3 rounded-xl bg-purple-700 text-white px-5 py-2.5 text-sm font-semibold">
          Try Again
        </button>
      </div>
    );
  return null;
}

// ── OVERVIEW ──
function OverviewTab() {
  const q = useAsync(() => gasCall("adminGetStats"));
  const stats = q.data as any;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Overview</h1>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {stats && (
        <>
          {stats.unrepliedMsgs > 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <AlertTriangle className="text-amber-500" size={24} />
              <p className="text-sm text-amber-800">
                You have {stats.unrepliedMsgs} unreplied message(s). Go to the Messages tab.
              </p>
            </div>
          )}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStat icon={<Users size={24} />} label="Total Students" value={stats.total} />
            <AdminStat icon={<CheckCircle size={24} />} label="Verified Students" value={stats.verified} />
            <AdminStat icon={<Clock size={24} />} label="Pending Payments" value={stats.pending} />
            <AdminStat icon={<TrendingUp size={24} />} label="Total Revenue" value={`₱${Number(stats.revenue || 0).toLocaleString()}`} />
          </div>
          {stats.nicheCount && (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-bold text-gray-900">Niche Enrollment</h2>
              <NicheEnrollmentList data={stats.nicheCount} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminStat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="bg-purple-100 text-purple-600 rounded-full p-2 inline-flex">{icon}</span>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-xl font-bold">{value}</div>
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
    <ul className="mt-3 space-y-2">
      {entries.map(([name, count]) => (
        <li key={name}>
          <div className="flex justify-between text-sm">
            <span>{name}</span>
            <span className="font-semibold">{count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-purple-600" style={{ width: `${(count / max) * 100}%` }} />
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
      <h1 className="text-2xl font-extrabold text-gray-900">Pending Payments</h1>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && pending.length === 0 && (
        <div className="mt-10 text-center">
          <CheckCircle size={48} className="text-green-300 mx-auto" />
          <p className="mt-2 text-gray-500">No pending payments</p>
        </div>
      )}
      {pending.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Method", "Ref #", "Amount", "Signup", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.email} className="border-t border-gray-100">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.payMethod}</td>
                  <td className="px-4 py-3">{u.refNumber}</td>
                  <td className="px-4 py-3">₱{u.amountPaid}</td>
                  <td className="px-4 py-3">{u.signupDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirm({ email: u.email, action: "verify" })}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5"
                      >
                        <CheckCircle size={16} /> Verify
                      </button>
                      <button
                        onClick={() => setConfirm({ email: u.email, action: "reject" })}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <div className="flex justify-between items-center gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900">All Students</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9 rounded-xl border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Signup", "Status", "Amount", "Niche", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const status = u.verified
                  ? { label: "Verified", cls: "bg-green-100 text-green-700" }
                  : u.refNumber !== "—"
                    ? { label: "Pending", cls: "bg-yellow-100 text-yellow-700" }
                    : { label: "Unverified", cls: "bg-gray-100 text-gray-600" };
                return (
                  <tr
                    key={u.email}
                    onClick={() => setDrawer(u)}
                    className="border-t border-gray-100 cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.signupDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">₱{u.amountPaid}</td>
                    <td className="px-4 py-3">{u.enrolledNiche || "—"}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDel(u.email)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Drawer isOpen={!!drawer} onClose={() => setDrawer(null)} title={drawer?.name || ""}>
        {drawer && (
          <dl className="space-y-3 text-sm">
            {[
              ["Email", drawer.email],
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
              <div key={k as string}>
                <dt className="text-xs font-semibold text-gray-500 uppercase">{k}</dt>
                <dd className="mt-0.5 text-gray-900">{v as ReactNode}</dd>
              </div>
            ))}
          </dl>
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
      <h1 className="text-2xl font-extrabold text-gray-900">Progress</h1>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && (
        <>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminStat icon={<Users size={24} />} label="Total Students" value={summary.total} />
            <AdminStat icon={<TrendingUp size={24} />} label="Avg Completion" value={`${summary.avg}%`} />
            <AdminStat icon={<Award size={24} />} label="Total Certificates" value={summary.certs} />
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Email", "Completion", "Certs", "Lessons"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.email} onClick={() => setDrawer(r)} className="border-t border-gray-100 cursor-pointer hover:bg-gray-50">
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[160px]">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600" style={{ width: `${r.completionPct || 0}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{r.completionPct || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{r.certificates || 0}</td>
                    <td className="px-4 py-3">{r.lessonsCompleted}/{r.totalLessons}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Drawer isOpen={!!drawer} onClose={() => setDrawer(null)} title={`${drawer?.name || ""} — Progress`}>
        {drawer?.nicheBreakdown && (
          <ul className="space-y-3">
            {drawer.nicheBreakdown.map((n: any) => (
              <li key={n.title || n.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{n.title || n.name}</span>
                  <span className="font-semibold">{n.pct || 0}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: `${n.pct || 0}%` }} />
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Certificates</h1>
        <button
          onClick={() => setTestOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold px-4 py-2"
        >
          <Send size={16} /> Send Test Certificate
        </button>
      </div>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {data?.summary && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminStat icon={<Award size={24} />} label="Total Issued" value={data.summary.totalCertsIssued} />
          <AdminStat icon={<Users size={24} />} label="Students with Any Cert" value={data.summary.studentsWithAnyCert} />
          <AdminStat icon={<CheckCircle size={24} />} label="Fully Complete" value={data.summary.studentsFullyComplete} />
        </div>
      )}
      {data?.students && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Certs Earned", "Progress"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.students.map((s: any) => {
                const total = s.totalNiches || data.summary?.totalNiches || 9;
                const pct = total ? Math.round((s.certsEarned / total) * 100) : 0;
                return (
                  <tr key={s.email} className="border-t border-gray-100">
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3">{s.certsEarned} / {total}</td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {testOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setTestOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Send Test Certificate</h3>
              <button onClick={() => setTestOpen(false)}><X size={18} /></button>
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
                className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5">
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
      <h1 className="text-2xl font-extrabold text-gray-900">Messages</h1>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && (
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
  const border = replied ? "border-l-4 border-green-400 bg-white" : "border-l-4 border-amber-400 bg-amber-50";

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
    <div className={`rounded-xl p-5 shadow-sm ${border}`}>
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className="font-bold">{m.name} <span className="text-xs text-gray-500 font-normal">{m.email}</span></p>
          <p className="mt-1 font-semibold">{m.subject}</p>
        </div>
        <span className="text-xs text-gray-400">{m.sentAt}</span>
      </div>
      <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{m.body}</p>
      {replied ? (
        <div className="mt-3 rounded-xl bg-purple-50 border border-purple-200 p-3">
          <p className="text-xs font-semibold text-purple-700">Your reply · {m.repliedAt}</p>
          <p className="mt-1 text-sm text-gray-800 whitespace-pre-line">{m.adminReply}</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 min-h-[80px] outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={send}
            disabled={sending || !reply.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white font-semibold px-4 py-2 text-sm"
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
      <h1 className="text-2xl font-extrabold text-gray-900">Courses</h1>
      <div className="mt-4 inline-flex rounded-full bg-gray-100 p-1">
        <button onClick={() => setSub("lessons")}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${sub === "lessons" ? "bg-purple-600 text-white" : "text-gray-600"}`}>
          <BookOpen size={16} /> Lessons
        </button>
        <button onClick={() => setSub("quizzes")}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${sub === "quizzes" ? "bg-purple-600 text-white" : "text-gray-600"}`}>
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
      <div className="mb-4 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lessons..."
          className="w-full pl-9 rounded-xl border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500" />
      </div>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Lesson ID", "Module", "Title", "Video URL", ""].map((h) => (
                <th key={h} className="text-left px-3 py-3 font-semibold text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((r) => <LessonRow key={r.rowIndex} r={r} showToast={showToast} />)}
            </tbody>
          </table>
        </div>
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

  return (
    <tr className="border-t border-gray-100">
      <td className="px-3 py-2 whitespace-nowrap">{r.lessonId}</td>
      <td className="px-3 py-2 whitespace-nowrap">{r.moduleName}</td>
      <td className="px-3 py-2"><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm" /></td>
      <td className="px-3 py-2"><input value={video} onChange={(e) => setVideo(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm" /></td>
      <td className="px-3 py-2">
        <button onClick={save} disabled={saving}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${saved ? "bg-green-600" : "bg-purple-700 hover:bg-purple-800"}`}>
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
      <div className="mb-4 flex justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quizzes..."
            className="w-full pl-9 rounded-xl border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <button onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold px-4 py-2">
          <Plus size={16} /> Add Question
        </button>
      </div>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>{["Quiz ID", "Lesson", "Question", "A", "B", "C", "D", "Correct", ""].map((h) => (
                <th key={h} className="text-left px-2 py-3 font-semibold text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((r) => <QuizRow key={r.rowIndex} r={r} showToast={showToast} onDelete={() => setDel(r.rowIndex)} />)}
            </tbody>
          </table>
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

  const inp = "w-full rounded border border-gray-200 px-2 py-1";

  return (
    <tr className="border-t border-gray-100">
      <td className="px-2 py-2 whitespace-nowrap">{r.quizId}</td>
      <td className="px-2 py-2 whitespace-nowrap">{r.lessonId}</td>
      <td className="px-2 py-2 min-w-[220px]"><input value={q} onChange={(e) => setQ(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={a} onChange={(e) => setA(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={b} onChange={(e) => setB(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={c} onChange={(e) => setC(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={d} onChange={(e) => setD(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={correct} onChange={(e) => setCorrect(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex gap-1">
          <button onClick={save} className={`rounded px-2 py-1 text-white ${saved ? "bg-green-600" : "bg-purple-700"}`}>{saved ? "✓" : "Save"}</button>
          <button onClick={onDelete} className="rounded bg-red-600 text-white px-2 py-1"><Trash2 size={14} /></button>
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Add Question</h3>
          <button onClick={onClose}><X size={18} /></button>
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
            className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5">
            {busy ? "Adding..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS ──
function SettingsTab() {
  const { showToast } = useToast();
  const q = useAsync(() => gasCall("adminGetConfig"));
  const cfg = q.data as any;
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cfg) setForm(cfg);
  }, [cfg]);

  async function save() {
    setSaving(true);
    try {
      const res = await gasCall("adminSaveConfig", form);
      if (res.ok) showToast("Settings saved!", "success");
      else showToast(res.msg || "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {cfg && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm space-y-4">
          {[
            ["Site Name", "siteName", "text"],
            ["Course Price", "coursePrice", "number"],
            ["GCash Name", "gcashName", "text"],
            ["GCash Number", "gcashNumber", "text"],
            ["BPI Account Name", "bpiName", "text"],
            ["BPI Account Number", "bpiNumber", "text"],
            ["Verification Wait Hours", "accessHours", "number"],
          ].map(([label, key, type]) => (
            <div key={key as string}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label as string}</label>
              <input
                type={type as string}
                value={form[key as string] ?? ""}
                onChange={(e) => setForm({ ...form, [key as string]: type === "number" ? Number(e.target.value) : e.target.value })}
                className={inp}
              />
            </div>
          ))}
          <button
            onClick={save}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-70 text-white font-semibold px-5 py-2.5"
          >
            {saving ? <Spinner size="sm" className="border-white" /> : <Save size={18} />} Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
