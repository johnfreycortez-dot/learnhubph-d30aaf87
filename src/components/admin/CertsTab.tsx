import { useMemo, useState } from "react";
import { Award, CheckCircle, Send, Users, X } from "lucide-react";
import { gasCall } from "@/lib/api";
import { useToast } from "@/components/Toast";
import {
  AdminStat, EmptyState, ExportButton, InitialsAvatar, LastUpdated, LoadState, PAGE_SIZE, Pagination,
  SearchInput, SectionHeading, TableShell, exportToCsv, rowCls, tdCls, thCls, useAdminQuery,
} from "./shared";

export default function CertsTab() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetCertStats");
  const data = q.data as any;
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [testNiche, setTestNiche] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const allStudents: any[] = data?.students || [];
  const filtered = useMemo(
    () =>
      !search
        ? allStudents
        : allStudents.filter(
            (s) => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()),
          ),
    [allStudents, search],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleExport() {
    exportToCsv(
      `certificates-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "certsEarned", label: "Certs Earned" },
      ],
    );
  }

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
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="w-full sm:w-56"><SearchInput value={search} onChange={handleSearch} placeholder="Search students…" /></div>
            <ExportButton onClick={handleExport} disabled={filtered.length === 0} />
            <button
              onClick={() => setTestOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-800"
            >
              <Send size={16} /> Send Test Certificate
            </button>
          </div>
        }
      />
      <LastUpdated ts={q.updatedAt} />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {data?.summary && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminStat icon={<Award size={22} />} label="Total Issued" value={data.summary.totalCertsIssued} tone="purple" />
          <AdminStat icon={<Users size={22} />} label="Students with Any Cert" value={data.summary.studentsWithAnyCert} tone="blue" />
          <AdminStat icon={<CheckCircle size={22} />} label="Fully Complete" value={data.summary.studentsFullyComplete} tone="green" />
        </div>
      )}
      {data?.students && (
        allStudents.length === 0 ? (
          <TableShell>
            <EmptyState icon={<Award size={26} />} title="No certificates issued yet" />
          </TableShell>
        ) : filtered.length === 0 ? (
          <TableShell>
            <EmptyState icon={<Award size={26} />} title="No matches" subtitle="Try a different search term." />
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
              {pageRows.map((s: any) => {
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
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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
