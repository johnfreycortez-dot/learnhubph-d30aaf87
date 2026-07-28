import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { gasCall } from "@/lib/api";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { EmptyState, InitialsAvatar, LoadState, SectionHeading, TableShell, rowCls, tdCls, thCls, useAdminQuery } from "./shared";

export default function PendingTab() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetUsers");
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
