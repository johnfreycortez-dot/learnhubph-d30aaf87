import { useState } from "react";
import { Inbox, Send } from "lucide-react";
import { gasCall } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { EmptyState, InitialsAvatar, LoadState, SectionHeading, useAdminQuery } from "./shared";

export default function MessagesTab() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetMessages");
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
