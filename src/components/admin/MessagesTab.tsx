import { useMemo, useState } from "react";
import { ArrowLeft, Clock, Inbox, Send } from "lucide-react";
import { gasCall } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { EmptyState, InitialsAvatar, LoadState, SearchInput, SectionHeading, useAdminQuery } from "./shared";

interface Conversation {
  email: string;
  name: string;
  messages: any[];
  lastAt: string;
  lastPreview: string;
  hasUnreplied: boolean;
}

function groupIntoConversations(rows: any[]): Conversation[] {
  const byEmail = new Map<string, any[]>();
  for (const m of rows) {
    const list = byEmail.get(m.email) || [];
    list.push(m);
    byEmail.set(m.email, list);
  }
  const conversations: Conversation[] = [];
  for (const [email, msgs] of byEmail) {
    const sorted = msgs.slice().sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1));
    const last = sorted[sorted.length - 1];
    conversations.push({
      email,
      name: last.name,
      messages: sorted,
      lastAt: last.sentAt,
      lastPreview: last.body,
      hasUnreplied: sorted.some((m) => !m.adminReply),
    });
  }
  // Unreplied conversations first, then by most recent activity.
  conversations.sort((a, b) => {
    if (a.hasUnreplied !== b.hasUnreplied) return a.hasUnreplied ? -1 : 1;
    return a.lastAt < b.lastAt ? 1 : -1;
  });
  return conversations;
}

export default function MessagesTab() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetMessages");
  const rows: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.rows || [];
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const conversations = useMemo(() => groupIntoConversations(rows), [rows]);
  const filtered = useMemo(() => {
    if (!search) return conversations;
    const s = search.toLowerCase();
    return conversations.filter((c) => c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s));
  }, [conversations, search]);

  const selected = conversations.find((c) => c.email === selectedEmail) || null;

  return (
    <div>
      <SectionHeading title="Messages" />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && !q.error && conversations.length === 0 && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <EmptyState icon={<Inbox size={26} />} title="No messages yet" subtitle="Student messages will appear here." />
        </div>
      )}
      {!q.loading && conversations.length > 0 && (
        <div className="mt-6 flex min-h-[560px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Conversation list — hidden on mobile once a thread is open */}
          <div className={`w-full shrink-0 border-gray-100 lg:block lg:w-[320px] lg:border-r ${selected ? "hidden lg:block" : "block"}`}>
            <div className="border-b border-gray-100 p-3">
              <SearchInput value={search} onChange={setSearch} placeholder="Search students…" />
            </div>
            <ul className="max-h-[500px] overflow-y-auto">
              {filtered.map((c) => {
                const active = c.email === selectedEmail;
                return (
                  <li key={c.email}>
                    <button
                      type="button"
                      onClick={() => setSelectedEmail(c.email)}
                      className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors ${
                        active ? "bg-purple-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <InitialsAvatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold text-gray-900">{c.name}</span>
                          <span className="shrink-0 text-[10px] font-medium text-gray-400">
                            {new Date(c.lastAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="truncate text-xs text-gray-500">{c.lastPreview}</p>
                      </div>
                      {c.hasUnreplied && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && <p className="p-4 text-sm text-gray-400">No matches.</p>}
            </ul>
          </div>

          {/* Thread view */}
          <div className={`flex-1 flex-col ${selected ? "flex" : "hidden lg:flex"}`}>
            {!selected ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <Inbox size={40} className="text-gray-200" />
                <p className="mt-3 text-sm text-gray-500">Select a conversation to view the thread</p>
              </div>
            ) : (
              <ConversationThread conversation={selected} onBack={() => setSelectedEmail(null)} onReplied={q.reload} showToast={showToast} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationThread({
  conversation,
  onBack,
  onReplied,
  showToast,
}: {
  conversation: Conversation;
  onBack: () => void;
  onReplied: () => void;
  showToast: (msg: string, v?: any) => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const pending = conversation.messages.find((m) => !m.adminReply);

  async function send() {
    if (!reply.trim() || !pending) return;
    setSending(true);
    try {
      const res = await gasCall("adminReplyToMessage", pending.msgId, reply);
      if (res.ok) {
        showToast("Reply sent!", "success");
        setReply("");
        onReplied();
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Thread header */}
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
        <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-700 lg:hidden" aria-label="Back to conversations">
          <ArrowLeft size={20} />
        </button>
        <InitialsAvatar name={conversation.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-gray-900">{conversation.name}</p>
          <p className="truncate text-xs text-gray-400">{conversation.email}</p>
        </div>
      </div>

      {/* Bubble history — Messenger-style: student left (gray), admin right (purple) */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {conversation.messages.map((m, i) => (
          <div key={m.msgId || i}>
            {/* First message in a subject group shows its topic as a small label above the bubble,
                the way a chat app shows what a thread is "about" rather than repeating the sender's name. */}
            {m.subject && (i === 0 || conversation.messages[i - 1]?.subject !== m.subject) && (
              <p className="mb-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-gray-400">{m.subject}</p>
            )}
            <div className="flex flex-col items-start">
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
                {m.body}
              </div>
              <span className="mt-1 text-[10px] text-gray-400">{new Date(m.sentAt).toLocaleString()}</span>
            </div>
            {m.adminReply && (
              <div className="mt-2 flex flex-col items-end">
                <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-purple-600 px-4 py-2.5 text-sm text-white">
                  {m.adminReply}
                </div>
                <span className="mt-1 text-[10px] text-gray-400">{new Date(m.repliedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-100 p-4">
        {pending ? (
          <div className="flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply…"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              className="min-h-[44px] max-h-32 flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || !reply.trim()}
              aria-label="Send reply"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-purple-700 text-white shadow-sm transition-colors hover:bg-purple-800 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
            <Clock size={14} /> All caught up — no pending replies in this conversation.
          </div>
        )}
      </div>
    </>
  );
}
