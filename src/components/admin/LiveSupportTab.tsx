import { useState } from "react";
import { Headphones, MessageCircleMore, Send, UserX } from "lucide-react";
import { gasCall } from "@/lib/api";
import { Drawer } from "@/components/Drawer";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { EmptyState, InitialsAvatar, LoadState, SectionHeading, useAdminQuery } from "./shared";

type LiveSupportRow = {
  sessionId: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
  acceptedAt: string;
};
type LiveMsg = { sender: "student" | "admin"; body: string; sentAt: string };

export default function LiveSupportTab() {
  const { showToast } = useToast();
  // Poll every ~5s, same pattern used for other "needs to feel live"
  // admin views — this is Sheets-backed, not push, so polling is the
  // right tool here.
  const q = useAdminQuery<{ pending: LiveSupportRow[]; active: LiveSupportRow[] }>(
    "adminGetLiveSupportRequests",
    [],
    { refetchInterval: 5000 },
  );
  const pending = q.data?.pending || [];
  const active = q.data?.active || [];

  const [accepting, setAccepting] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);
  const [openThread, setOpenThread] = useState<LiveSupportRow | null>(null);

  async function accept(sessionId: string) {
    setAccepting(sessionId);
    try {
      const res = await gasCall("adminAcceptLiveSupport", sessionId);
      if (res.ok) {
        showToast("Request accepted!", "success");
        q.reload();
      } else {
        showToast(res.msg || "Failed to accept request.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setAccepting(null);
    }
  }

  // "I am Busy" — declines a single pending request. The student sees this
  // as "no live support available" right away, instead of waiting out the
  // 2-minute auto-timeout. Backend action: adminDeclineLiveSupport(sessionId)
  // should set that session's status to "declined".
  async function decline(sessionId: string) {
    setDeclining(sessionId);
    try {
      const res = await gasCall("adminDeclineLiveSupport", sessionId);
      if (res.ok) {
        showToast("Marked this request as unavailable.", "info");
        q.reload();
      } else {
        showToast(res.msg || "Failed to update request.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setDeclining(null);
    }
  }

  return (
    <div>
      <SectionHeading title="Live Support" />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />

      {!q.loading && !q.error && (
        <div className="mt-6 space-y-8">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
              Pending requests{pending.length > 0 && ` (${pending.length})`}
            </h3>
            {pending.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <EmptyState
                  icon={<Headphones size={26} />}
                  title="No pending requests"
                  subtitle='New "Talk to a Human" requests will show up here.'
                />
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((r) => (
                  <div
                    key={r.sessionId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 border-l-4 border-l-amber-400 bg-amber-50/40 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={r.name} />
                      <div>
                        <p className="font-black text-gray-900">{r.name}</p>
                        <p className="text-xs font-medium text-gray-400">
                          {r.email} · {r.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decline(r.sessionId)}
                        disabled={accepting === r.sessionId || declining === r.sessionId}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
                      >
                        <UserX size={14} /> {declining === r.sessionId ? "Updating…" : "I am Busy"}
                      </button>
                      <button
                        onClick={() => accept(r.sessionId)}
                        disabled={accepting === r.sessionId || declining === r.sessionId}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-purple-800 disabled:opacity-60"
                      >
                        <Headphones size={14} /> {accepting === r.sessionId ? "Accepting…" : "Accept"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
              Active conversations{active.length > 0 && ` (${active.length})`}
            </h3>
            {active.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <EmptyState
                  icon={<MessageCircleMore size={26} />}
                  title="No active conversations"
                  subtitle="Accepted requests show up here for chatting."
                />
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((r) => (
                  <button
                    key={r.sessionId}
                    onClick={() => setOpenThread(r)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-purple-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={r.name} />
                      <div>
                        <p className="font-black text-gray-900">{r.name}</p>
                        <p className="text-xs font-medium text-gray-400">
                          {r.email} · accepted {r.acceptedAt}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Live
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ThreadDrawer
        session={openThread}
        onClose={() => setOpenThread(null)}
        onClosedConversation={() => {
          setOpenThread(null);
          q.reload();
        }}
        showToast={showToast}
      />
    </div>
  );
}

function ThreadDrawer({
  session,
  onClose,
  onClosedConversation,
  showToast,
}: {
  session: LiveSupportRow | null;
  onClose: () => void;
  onClosedConversation: () => void;
  showToast: (msg: string, variant?: "success" | "error" | "info") => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);

  const q = useAdminQuery<{ ok: boolean; status: string; messages: LiveMsg[] }>(
    "adminGetLiveSupportMessages",
    [session?.sessionId],
    { enabled: !!session, refetchInterval: session ? 3000 : false },
  );
  const messages = q.data?.messages || [];

  async function send() {
    if (!reply.trim() || !session) return;
    setSending(true);
    try {
      const res = await gasCall("adminSendLiveSupportMessage", session.sessionId, reply);
      if (res.ok) {
        setReply("");
        q.reload();
      } else {
        showToast(res.msg || "Failed to send message.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setSending(false);
    }
  }

  async function closeConversation() {
    if (!session) return;
    setClosing(true);
    try {
      const res = await gasCall("adminCloseLiveSupport", session.sessionId);
      if (res.ok) {
        showToast("Conversation closed.", "success");
        onClosedConversation();
      } else {
        showToast(res.msg || "Failed to close conversation.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setClosing(false);
      setConfirmClose(false);
    }
  }

  return (
    <>
      <Drawer isOpen={!!session} onClose={onClose} title={session ? `Chat with ${session.name}` : "Chat"}>
        {session && (
          <div className="flex h-full flex-col">
            <p className="text-xs font-medium text-gray-400">{session.email}</p>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
              {messages.length === 0 && (
                <p className="pt-8 text-center text-xs font-medium text-gray-400">No messages yet.</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.sender === "admin"
                        ? "rounded-br-sm bg-purple-700 text-white"
                        : "rounded-bl-sm border border-gray-100 bg-gray-50 text-gray-700"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="min-h-[70px] w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={send}
                  disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-800 disabled:opacity-60"
                >
                  <Send size={16} /> Send
                </button>
                <button
                  onClick={() => setConfirmClose(true)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  Close conversation
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal
        isOpen={confirmClose}
        title="Close conversation?"
        message="The student will see this conversation has ended. This can't be undone."
        confirmLabel="Close Conversation"
        confirmVariant="danger"
        onConfirm={closeConversation}
        onCancel={() => setConfirmClose(false)}
        loading={closing}
      />
    </>
  );
}
