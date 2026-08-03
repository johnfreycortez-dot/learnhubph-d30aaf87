import { useMemo, useState, type ReactNode } from "react";
import { Trash2, Users } from "lucide-react";
import { gasCall } from "@/lib/api";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Drawer } from "@/components/Drawer";
import { useToast } from "@/components/Toast";
import {
  EmptyState, ExportButton, InitialsAvatar, LastUpdated, LoadState, PAGE_SIZE, Pagination,
  SearchInput, SectionHeading, StatusPill, TableShell, exportToCsv, rowCls, tdCls, thCls, useAdminQuery,
} from "./shared";

export default function StudentsTab() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetUsers");
  const users: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.users || [];
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleExport() {
    exportToCsv(
      `students-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "signupDate", label: "Signup" },
        { key: "verified", label: "Verified" },
        { key: "amountPaid", label: "Amount Paid" },
        { key: "enrolledNiche", label: "Niche" },
      ],
    );
  }

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
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="w-full sm:w-64"><SearchInput value={search} onChange={handleSearch} placeholder="Search students…" /></div>
            <ExportButton onClick={handleExport} disabled={filtered.length === 0} />
          </div>
        }
      />
      <LastUpdated ts={q.updatedAt} />
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
              {pageRows.map((u) => {
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
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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
