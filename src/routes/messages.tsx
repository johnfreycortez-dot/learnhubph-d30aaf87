import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, CheckCheck, Clock, MessageSquare, Plus, Send, X } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { EmojiPicker } from "@/components/EmojiPicker";
import { ImageAttach } from "@/components/ImageAttach";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — LearnHub PH" },
      { name: "description", content: "Send messages to your instructor and read replies." },
      { property: "og:title", content: "Messages — LearnHub PH" },
      { property: "og:description", content: "Send messages to your instructor and read replies." },
    ],
  }),
  component: () => (
    <SessionGuard>
      <MessagesPage />
    </SessionGuard>
  ),
});

interface SentMessage {
  msgId: string;
  subject: string;
  body: string;
  sentAt: string;
  adminReply: string;
  repliedAt: string;
  imageUrl: string;
  replyImageUrl: string;
  adminSeenAt: string;
  studentSeenAt: string;
}

function fmt(d: string) {
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleString();
}

function MessagesPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load(preserveSelection = true) {
    try {
      const res = await gasCall("getMyMessages", getToken());
      if (res?.ok) {
        const list: SentMessage[] = res.messages || [];
        setMessages(list);
        if (!preserveSelection || !list.some((m) => m.msgId === selectedId)) {
          setSelectedId(list[0]?.msgId ?? null);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opening the page marks every reply as seen — drives the double-check
  // that shows up on the *admin's* side of their own reply bubbles.
  useEffect(() => {
    gasCall("markRepliesSeenByStudent", getToken());
  }, []);

  const sorted = useMemo(() => messages.slice().sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1)), [messages]);
  const selected = sorted.find((m) => m.msgId === selectedId) || null;

  function onSent() {
    setModalOpen(false);
    load(false);
    showToast("Message sent! We'll reply to your email.", "success");
  }

  return (
    <StudentShell>
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[520px]">
        <div className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h1 className="text-lg font-extrabold">Messages</h1>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold px-3 py-2"
            >
              <Plus size={16} /> New Message
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : sorted.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No messages yet</p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto">
              {sorted.map((m) => {
                const active = m.msgId === selectedId;
                return (
                  <li key={m.msgId}>
                    <button
                      onClick={() => setSelectedId(m.msgId)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left border-b border-gray-50 ${
                        active ? "border-l-4 border-l-purple-600 bg-purple-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-100 text-xs font-black text-purple-700">
                        {m.subject.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-sm text-gray-900 truncate">{m.subject}</span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {new Date(m.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{m.body || "📷 Photo"}</p>
                        <span
                          className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            m.adminReply ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {m.adminReply ? "Replied" : "Awaiting Reply"}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex-1 p-6">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <MessageSquare size={48} className={sorted.length ? "text-gray-200" : "text-gray-300"} />
              {sorted.length ? (
                <p className="mt-3 text-sm text-gray-500">Select a message to view the thread</p>
              ) : (
                <>
                  <p className="mt-3 text-sm font-semibold text-gray-600">No messages yet</p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold px-5 py-2.5"
                  >
                    Send your first message
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
              <p className="text-xs text-gray-400">{fmt(selected.sentAt)}</p>

              <div className="mt-6 space-y-6">
                <div className="flex items-end justify-end gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 mb-1">You</span>
                    <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm max-w-lg overflow-hidden text-sm">
                      {selected.imageUrl && (
                        <img src={selected.imageUrl} alt="Photo you attached" className="max-h-72 w-full object-cover" />
                      )}
                      {selected.body && <p className="px-4 py-3 whitespace-pre-wrap">{selected.body}</p>}
                    </div>
                    {/* Double-check: admin has viewed this message (WhatsApp-style seen receipt) */}
                    <span className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                      {selected.adminSeenAt ? (
                        <>
                          Seen <CheckCheck size={12} className="text-purple-500" />
                        </>
                      ) : (
                        <>
                          Sent <Check size={12} className="text-gray-300" />
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {selected.adminReply || selected.replyImageUrl ? (
                  <div className="flex items-end gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-purple-100 text-[10px] font-black text-purple-700">
                      LH
                    </span>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-400 mb-1">LearnHub PH Support · {fmt(selected.repliedAt)}</span>
                      <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm max-w-lg overflow-hidden text-sm">
                        {selected.replyImageUrl && (
                          <img src={selected.replyImageUrl} alt="Photo sent by support" className="max-h-72 w-full object-cover" />
                        )}
                        {selected.adminReply && <p className="px-4 py-3 whitespace-pre-wrap">{selected.adminReply}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto max-w-sm rounded-2xl bg-gray-50 border border-gray-100 p-5 text-center">
                    <Clock size={20} className="text-amber-400 mx-auto" />
                    <p className="mt-2 text-sm font-semibold text-gray-700">Waiting for a reply...</p>
                    <p className="text-xs text-gray-500">We usually reply within 24 hours.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && <NewMessageModal onClose={() => setModalOpen(false)} onSent={onSent} />}
    </StudentShell>
  );
}

function NewMessageModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await gasCall("sendMessage", getToken(), subject, body, imageUrl || "");
      if (res?.ok) onSent();
      else setError(res?.msg || "Failed to send message");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">New Message</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
            <div className="relative">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required={!imageUrl}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 min-h-[120px] outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="absolute bottom-2 right-2">
                <EmojiPicker onSelect={(e) => setBody((b) => b + e)} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ImageAttach
              token={getToken()}
              imageUrl={imageUrl}
              onUploaded={setImageUrl}
              onClear={() => setImageUrl(null)}
              onError={setError}
            />
            {!imageUrl && <span className="text-xs text-gray-400">Attach a screenshot or photo (optional)</span>}
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-70 text-white font-semibold px-4 py-2.5 text-sm inline-flex items-center gap-2"
          >
            {loading ? <Spinner size="sm" className="border-white" /> : <Send size={16} />} Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
