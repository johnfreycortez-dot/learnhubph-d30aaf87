import { useMemo, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { gasCall } from "@/lib/api";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import {
  EmptyState, ExportButton, InitialsAvatar, LastUpdated, LoadState, PAGE_SIZE, Pagination,
  SearchInput, SectionHeading, TableShell, exportToCsv, rowCls, tdCls, thCls, useAdminQuery,
} from "./shared";

export default function PendingTab() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetUsers");
  const users: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.users || [];
  const allPending = users.filter((u) => u.refNumber !== "—" && !u.verified);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ email: string; action: "verify" | "reject" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirming, setBulkConfirming] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const pending = useMemo(() => {
    if (!search) return allPending;
    const s = search.toLowerCase();
    return allPending.filter(
      (u) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.refNumber?.toLowerCase().includes(s),
    );
  }, [allPending, search]);

  const totalPages = Math.max(1, Math.ceil(pending.length / PAGE_SIZE));
  const pageRows = pending.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageEmails = pageRows.map((u) => u.email);
  const allPageSelected = pageEmails.length > 0 && pageEmails.every((e) => selected.has(e));

  function changePage(p: number) {
    setPage(p);
  }

  function toggleOne(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageEmails.forEach((e) => next.delete(e));
      else pageEmails.forEach((e) => next.add(e));
      return next;
    });
  }

  async function doBulkVerify() {
    const emails = Array.from(selected);
    setBulkBusy(true);
    setBulkProgress({ done: 0, total: emails.length });
    let failCount = 0;
    // Sequential, not parallel — GAS backends generally serialize Sheets writes,
    // so firing all requests at once risks race conditions on the same sheet.
    for (const email of emails) {
      try {
        const res = await gasCall("adminVerifyUser", email);
        if (!res.ok) failCount++;
      } catch {
        failCount++;
      }
      setBulkProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setBulkBusy(false);
    setBulkConfirming(false);
    setSelected(new Set());
    q.reload();
    if (failCount === 0) {
      showToast(`${emails.length} student${emails.length === 1 ? "" : "s"} verified!`, "success");
    } else {
      showToast(`${emails.length - failCount} verified, ${failCount} failed. Check and retry those.`, "error");
    }
  }

  function handleExport() {
    exportToCsv(
      `pending-payments-${new Date().toISOString().slice(0, 10)}.csv`,
      pending,
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "payMethod", label: "Method" },
        { key: "refNumber", label: "Ref #" },
        { key: "amountPaid", label: "Amount" },
        { key: "signupDate", label: "Signup" },
      ],
    );
  }

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
      <SectionHeading
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="w-full sm:w-56"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search pending…" /></div>
            <ExportButton onClick={handleExport} disabled={pending.length === 0} />
          </div>
        }
      />
      <LastUpdated ts={q.updatedAt} />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && allPending.length === 0 && (
        <TableShell>
          <EmptyState
            icon={<CheckCircle size={26} />}
            title="No pending payments"
            subtitle="You're all caught up — new submissions will show up here."
          />
        </TableShell>
      )}
      {!q.loading && !q.error && allPending.length > 0 && pending.length === 0 && (
        <TableShell>
          <EmptyState icon={<CheckCircle size={26} />} title="No matches" subtitle="Try a different search term." />
        </TableShell>
      )}
      {pending.length > 0 && (
        <TableShell>
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 bg-purple-50 px-4 py-3">
              <p className="text-sm font-bold text-purple-900">{selected.size} selected</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setBulkConfirming(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-green-700"
                >
                  <CheckCircle size={14} /> Verify Selected
                </button>
              </div>
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                <th className={thCls}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAllOnPage}
                    className="h-4 w-4 rounded accent-purple-700"
                    aria-label="Select all on page"
                  />
                </th>
                {["Name", "Email", "Method", "Ref #", "Amount", "Signup", "Actions"].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((u) => (
                <tr key={u.email} className={rowCls}>
                  <td className={tdCls}>
                    <input
                      type="checkbox"
                      checked={selected.has(u.email)}
                      onChange={() => toggleOne(u.email)}
                      className="h-4 w-4 rounded accent-purple-700"
                      aria-label={`Select ${u.name}`}
                    />
                  </td>
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
          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
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
      <ConfirmModal
        isOpen={bulkConfirming}
        title={`Verify ${selected.size} student${selected.size === 1 ? "" : "s"}?`}
        message={
          bulkBusy
            ? `Verifying ${bulkProgress.done} of ${bulkProgress.total}…`
            : `This gives full access to ${selected.size} student${selected.size === 1 ? "" : "s"} at once. This cannot be undone in bulk.`
        }
        confirmLabel="Verify All"
        confirmVariant="primary"
        onConfirm={doBulkVerify}
        onCancel={() => setBulkConfirming(false)}
        loading={bulkBusy}
      />
    </div>
  );
}
