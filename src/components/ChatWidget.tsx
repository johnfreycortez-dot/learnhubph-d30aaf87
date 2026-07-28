import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Send, X, Sparkles, Headphones, Loader2, MessageSquareText, Mail } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { isLiveSupportOpen } from "@/lib/businessHours";

// ---- Knowledge base loading (module-scope cache) -----------------------
// Same pattern as useStudentIdentity.ts: fetch getChatbotKnowledgeBase()
// once per browser session and share it across every mount of the widget,
// instead of re-fetching every time the bubble opens or a page remounts it.
type FaqEntry = { question: string; keywords: string; answer: string };

let kbCache: FaqEntry[] | null = null;
let kbInflight: Promise<FaqEntry[]> | null = null;

async function loadKnowledgeBase(): Promise<FaqEntry[]> {
  if (kbCache) return kbCache;
  if (!kbInflight) {
    kbInflight = gasCall("getChatbotKnowledgeBase")
      .then((res) => {
        const rows: FaqEntry[] = Array.isArray(res) ? res : res?.rows || [];
        kbCache = rows;
        return rows;
      })
      .catch((err) => {
        kbInflight = null; // allow a retry on next open attempt
        throw err;
      });
  }
  return kbInflight;
}

// ---- Matching ------------------------------------------------------------
// Entirely client-side: lowercase + strip punctuation, tokenize, then score
// each FAQ row by token overlap against its Keywords column (weighted
// highest), falling back to overlap against the row's own Question text.
// No external API, no per-message cost.
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "am",
  "i", "im", "my", "me", "you", "your", "yours", "it", "its", "this", "that",
  "do", "does", "did", "can", "could", "will", "would", "should",
  "how", "what", "when", "where", "why", "who", "which",
  "to", "for", "of", "in", "on", "at", "and", "or", "but", "with", "about",
  "please", "need", "want", "have", "has", "had", "get", "got", "so", "if",
]);

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  return normalizeText(s)
    .split(" ")
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

// Minimum score for a match to be considered "confident enough" to answer.
// Tune this up if the bot starts guessing wrong; tune it down if it's
// falling back to "I'm not sure" too often on questions that are clearly
// covered by a FAQ row.
const CONFIDENCE_THRESHOLD = 2;

function scoreEntry(queryTokens: string[], queryNormalized: string, entry: FaqEntry): number {
  const keywordPhrases = (entry.keywords || "")
    .split(",")
    .map((k) => normalizeText(k))
    .filter(Boolean);
  const keywordTokens = new Set(
    keywordPhrases.flatMap((p) => p.split(" ").filter((t) => t.length > 0 && !STOPWORDS.has(t))),
  );
  const questionTokens = new Set(tokenize(entry.question || ""));

  let score = 0;

  // Strong signal: a whole keyword phrase (e.g. "how much") appears verbatim
  // in the user's message.
  for (const phrase of keywordPhrases) {
    if (phrase.length > 2 && queryNormalized.includes(phrase)) score += 3;
  }

  // Weaker signal: individual token overlap — keywords weighted above the
  // row's own question text.
  for (const token of queryTokens) {
    if (keywordTokens.has(token)) score += 2;
    else if (questionTokens.has(token)) score += 1;
  }

  return score;
}

function findBestMatch(message: string, kb: FaqEntry[]): FaqEntry | null {
  const queryNormalized = normalizeText(message);
  const queryTokens = tokenize(message);
  if (queryTokens.length === 0 || kb.length === 0) return null;

  let best: FaqEntry | null = null;
  let bestScore = 0;
  for (const entry of kb) {
    const s = scoreEntry(queryTokens, queryNormalized, entry);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  return bestScore >= CONFIDENCE_THRESHOLD ? best : null;
}

// ---- Widget ---------------------------------------------------------------
type ChatMessage = { id: number; role: "bot" | "user"; content: ReactNode; typing?: boolean };

const FALLBACK_TEXT =
  "I'm not sure about that — please contact LearnHub PH for help: johnfreycortez@gmail.com";

// Two-stage "alive" effect: a brief bouncing-dots "thinking" pause, then the
// reply is revealed character-by-character like it's being typed live.
// Tune these if it feels too slow/fast — MIN/MAX_THINK_MS is randomized so
// every reply doesn't pause for an identical amount of time.
const MIN_THINK_MS = 500;
const MAX_THINK_MS = 1100;
const TYPE_MS_PER_CHAR = 16;
const MAX_TYPE_MS = 1800; // cap so long answers don't take forever to appear

let nextId = 1;

// ---- Live support ----------------------------------------------------------
// "off"         — normal FAQ chat, no live session in play.
// "waiting"     — requestLiveSupport succeeded, session is "pending" server-side.
// "active"      — an admin accepted the session; two-way chat is live (polling).
// "closed"      — the admin ended the conversation; one-time notice, then back to "off".
// "unavailable" — admin clicked "I am Busy" on this request, or 2 minutes
//                 passed with nobody accepting it; one-time notice, then off.
type LiveSupportPhase = "off" | "waiting" | "active" | "closed" | "unavailable";
type LiveMessage = { sender: "student" | "admin"; body: string; sentAt: string };

const LIVE_SUPPORT_STORAGE_KEY = "lhph_live_support_session";
const WAITING_POLL_MS = 4000;
const ACTIVE_POLL_MS = 3000;
// If nobody accepts a pending request within this window, stop waiting and
// show the "no live support available" message instead of spinning forever.
const WAITING_TIMEOUT_MS = 2 * 60 * 1000;

function readStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(LIVE_SUPPORT_STORAGE_KEY);
}

function persistSessionId(sessionId: string | null) {
  if (typeof window === "undefined") return;
  if (sessionId) window.sessionStorage.setItem(LIVE_SUPPORT_STORAGE_KEY, sessionId);
  else window.sessionStorage.removeItem(LIVE_SUPPORT_STORAGE_KEY);
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId++,
      role: "bot",
      content: "Hi! 👋 Ask me anything about pricing, courses, certificates, or payments.",
    },
  ]);
  const [input, setInput] = useState("");
  const [kbLoading, setKbLoading] = useState(false);
  const [kbError, setKbError] = useState(false);
  // "thinking" = dots bubble showing, before we've committed to a reply.
  // "typing" = a reply bubble exists and is being revealed char-by-char.
  const [phase, setPhase] = useState<"idle" | "thinking" | "typing">("idle");
  const listRef = useRef<HTMLDivElement>(null);
  const kbRef = useRef<FaqEntry[] | null>(kbCache);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const busy = phase !== "idle";

  // ---- Live support state ----
  const [livePhase, setLivePhase] = useState<LiveSupportPhase>("off");
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [liveInput, setLiveInput] = useState("");
  const [liveStarting, setLiveStarting] = useState(false);
  const [liveSending, setLiveSending] = useState(false);
  const liveListRef = useRef<HTMLDivElement>(null);

  // Restore an in-progress waiting/active conversation on mount (e.g. after
  // a page refresh) — sessionStorage only, so it doesn't outlive the tab.
  useEffect(() => {
    const stored = readStoredSessionId();
    if (!stored) return;
    setLiveSessionId(stored);
    setLivePhase("waiting"); // provisional, corrected by the fetch below
    gasCall("getLiveSupportStatus", stored, getToken())
      .then((res) => {
        if (!mountedRef.current) return;
        if (res?.ok) {
          setLiveMessages(res.messages || []);
          if (res.status === "active") setLivePhase("active");
          else if (res.status === "closed") {
            setLivePhase("closed");
            persistSessionId(null);
          } else if (res.status === "declined") {
            setLivePhase("unavailable");
            persistSessionId(null);
          } else {
            setLivePhase("waiting");
          }
        } else {
          persistSessionId(null);
          setLiveSessionId(null);
          setLivePhase("off");
        }
      })
      .catch(() => {
        // Leave it — the polling effect below will retry once the widget
        // is opened and connectivity is back.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll status while waiting/active — only while the widget is actually
  // open, and always torn down on close/unmount/phase change.
  useEffect(() => {
    if (!open || !liveSessionId) return;
    if (livePhase !== "waiting" && livePhase !== "active") return;

    let cancelled = false;
    async function poll() {
      try {
        const res = await gasCall("getLiveSupportStatus", liveSessionId, getToken());
        if (cancelled || !mountedRef.current) return;
        if (res?.ok) {
          setLiveMessages(res.messages || []);
          if (res.status === "active") setLivePhase("active");
          else if (res.status === "closed") {
            setLivePhase("closed");
            persistSessionId(null);
          } else if (res.status === "declined") {
            setLivePhase("unavailable");
            persistSessionId(null);
          }
        }
      } catch {
        // transient network hiccup — next tick will retry
      }
    }

    poll(); // immediate refresh (covers reopening the widget)
    const intervalMs = livePhase === "waiting" ? WAITING_POLL_MS : ACTIVE_POLL_MS;
    const id = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [open, liveSessionId, livePhase]);

  // 2-minute "nobody's picking this up" timeout. Starts counting the moment
  // a session enters "waiting" and is cleared the moment it leaves that
  // phase for any reason (accepted, declined, closed, widget reset). This is
  // a client-side fallback only — it changes what THIS student sees, but
  // doesn't remove the request from the admin's pending list server-side.
  // Ideally the backend also expires pending sessions after 2 minutes so
  // stale requests don't pile up in the admin panel.
  useEffect(() => {
    if (livePhase !== "waiting") return;
    const timer = window.setTimeout(() => {
      setLivePhase((current) => (current === "waiting" ? "unavailable" : current));
      persistSessionId(null);
    }, WAITING_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [livePhase, liveSessionId]);

  useEffect(() => {
    liveListRef.current?.scrollTo({ top: liveListRef.current.scrollHeight, behavior: "smooth" });
  }, [liveMessages, livePhase]);

  async function handleTalkToHuman(question?: string) {
    if (livePhase === "waiting" || livePhase === "active") return;

    if (!isLiveSupportOpen()) {
      pushMessage(
        "bot",
        <>
          Live support is available Monday–Friday, 9am–9pm (Philippine time).
          We're outside those hours right now — please send us a message
          instead and we'll get back to you.
          <div className="mt-2.5">
            <Link
              to="/messages"
              className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-purple-800"
            >
              <MessageSquareText size={14} /> Go to Messages
            </Link>
          </div>
        </>,
      );
      return;
    }

    setLiveStarting(true);
    try {
      const res = await gasCall("requestLiveSupport", question || "", getToken());
      if (!mountedRef.current) return;
      if (res?.ok) {
        setLiveSessionId(res.sessionId);
        persistSessionId(res.sessionId);
        setLivePhase(res.status === "active" ? "active" : "waiting");
        if (res.status === "active") {
          const statusRes = await gasCall("getLiveSupportStatus", res.sessionId, getToken());
          if (mountedRef.current && statusRes?.ok) setLiveMessages(statusRes.messages || []);
        }
      } else {
        pushMessage("bot", res?.msg || "Please log in to request live support.");
      }
    } catch {
      if (mountedRef.current) {
        pushMessage("bot", "Something went wrong requesting live support — please try again.");
      }
    } finally {
      if (mountedRef.current) setLiveStarting(false);
    }
  }

  async function handleLiveSend(e?: React.FormEvent) {
    e?.preventDefault();
    const body = liveInput.trim();
    if (!body || !liveSessionId || liveSending) return;
    setLiveInput("");
    setLiveSending(true);
    setLiveMessages((prev) => [...prev, { sender: "student", body, sentAt: new Date().toISOString() }]);
    try {
      await gasCall("sendLiveSupportMessage", liveSessionId, body, getToken());
    } catch {
      // next poll tick will reconcile either way
    } finally {
      if (mountedRef.current) setLiveSending(false);
    }
  }

  function backToFaq() {
    setLivePhase("off");
    setLiveSessionId(null);
    setLiveMessages([]);
    persistSessionId(null);
  }

  // Load the knowledge base once, the first time the widget is opened.
  useEffect(() => {
    if (!open || kbRef.current || kbLoading) return;
    setKbLoading(true);
    setKbError(false);
    loadKnowledgeBase()
      .then((rows) => {
        kbRef.current = rows;
      })
      .catch(() => setKbError(true))
      .finally(() => setKbLoading(false));
  }, [open, kbLoading]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  function pushMessage(role: ChatMessage["role"], content: ReactNode, typing = false) {
    const id = nextId++;
    setMessages((prev) => [...prev, { id, role, content, typing }]);
    return id;
  }

  // Reveals `text` into the message with the given id, a chunk of characters
  // at a time, then swaps in `finalContent` once fully revealed (so links —
  // like the mailto in the fallback — become clickable only at the end).
  async function typeOutMessage(id: number, text: string, finalContent: ReactNode) {
    const totalMs = Math.min(text.length * TYPE_MS_PER_CHAR, MAX_TYPE_MS);
    const stepMs = Math.max(12, totalMs / Math.max(text.length, 1));
    for (let i = 1; i <= text.length; i++) {
      if (!mountedRef.current) return;
      await new Promise((r) => setTimeout(r, stepMs));
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: text.slice(0, i) } : m)));
    }
    if (!mountedRef.current) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: finalContent, typing: false } : m)));
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    pushMessage("user", question);
    setPhase("thinking");

    // Brief "reading the question" pause before the bot starts replying.
    const thinkMs = MIN_THINK_MS + Math.random() * (MAX_THINK_MS - MIN_THINK_MS);
    await new Promise((r) => setTimeout(r, thinkMs));
    if (!mountedRef.current) return;

    const kb = kbRef.current || [];
    const noKb = kbError && kb.length === 0;
    const match = noKb ? null : findBestMatch(question, kb);

    if (!match && !noKb) {
      // Fire-and-forget — don't block the UI on this, and the backend
      // already fails silently if it can't resolve the token to an email.
      void gasCall("logUnmatchedQuestion", question, getToken()).catch(() => {});
    }

    const answerText = match ? match.answer : FALLBACK_TEXT;
    const finalContent = match ? (
      match.answer
    ) : (
      <>
        I'm not sure about that — please contact LearnHub PH for help:{" "}
        <a href="mailto:johnfreycortez@gmail.com" className="font-semibold text-purple-700 underline">
          johnfreycortez@gmail.com
        </a>
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => handleTalkToHuman(question)}
            className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-purple-800"
          >
            <Headphones size={14} /> Talk to a Human
          </button>
        </div>
      </>
    );

    setPhase("typing");
    const id = pushMessage("bot", "", true);
    await typeOutMessage(id, answerText, finalContent);
    if (mountedRef.current) setPhase("idle");
  }

  const showFaqView = livePhase === "off";
  const liveButtonDisabled = liveStarting || livePhase === "waiting" || livePhase === "active";

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-[70] flex h-[520px] max-h-[75vh] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:right-6">
          <div className="bg-purple-700 px-4 py-3.5 text-white">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15">
                  <Sparkles size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-tight">LearnHub PH Support</p>
                  <p className="truncate text-[11px] font-medium text-purple-100">
                    {livePhase === "active" ? "Live with a team member" : "Usually replies instantly"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-purple-100 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Persistent "Talk to a Human" affordance — always visible under
                the header, so a student never has to hunt for a way out of
                the FAQ bot. Collapses into a status line once a session
                exists. */}
            <div className="mt-2.5 border-t border-white/10 pt-2.5">
              {livePhase === "off" || livePhase === "closed" || livePhase === "unavailable" ? (
                <button
                  type="button"
                  onClick={() => handleTalkToHuman()}
                  disabled={liveButtonDisabled}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {liveStarting ? <Loader2 size={13} className="animate-spin" /> : <Headphones size={13} />}
                  Talk to a Human
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-100">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${livePhase === "active" ? "bg-green-400" : "animate-pulse bg-amber-300"}`}
                  />
                  {livePhase === "active" ? "Connected to a team member" : "Waiting for a team member…"}
                </div>
              )}
            </div>
          </div>

          {showFaqView && (
            <>
              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3.5 py-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "rounded-br-sm bg-purple-700 text-white"
                          : "rounded-bl-sm border border-gray-100 bg-white text-gray-700 shadow-sm"
                      }`}
                    >
                      {m.content}
                      {m.typing && (
                        <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-purple-400 align-middle" />
                      )}
                    </div>
                  </div>
                ))}
                {(phase === "thinking" || kbLoading) && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-3.5 py-3 shadow-sm">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-700 text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}

          {livePhase === "waiting" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-purple-100 text-purple-700">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <p className="text-sm font-bold text-gray-800">We're finding an available team member for you…</p>
              <p className="text-xs font-medium text-gray-400">
                This usually takes just a few minutes during business hours.
              </p>
            </div>
          )}

          {livePhase === "active" && (
            <>
              <div ref={liveListRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3.5 py-4">
                {liveMessages.length === 0 && (
                  <p className="pt-6 text-center text-xs font-medium text-gray-400">
                    You're connected — say hello!
                  </p>
                )}
                {liveMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "student" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.sender === "student"
                          ? "rounded-br-sm bg-purple-700 text-white"
                          : "rounded-bl-sm border border-gray-100 bg-white text-gray-700 shadow-sm"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleLiveSend} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
                <input
                  type="text"
                  value={liveInput}
                  onChange={(e) => setLiveInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!liveInput.trim() || liveSending}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-700 text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}

          {livePhase === "closed" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-green-50 text-green-600">
                <Headphones size={24} />
              </div>
              <p className="text-sm font-bold text-gray-800">
                This conversation has ended — thanks for chatting with us!
              </p>
              <button
                type="button"
                onClick={backToFaq}
                className="mt-1 rounded-full bg-purple-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-purple-800"
              >
                Back to FAQ
              </button>
            </div>
          )}

          {livePhase === "unavailable" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-600">
                <Headphones size={24} />
              </div>
              <p className="text-sm font-bold text-gray-800">No live support available at the moment.</p>
              <p className="text-xs font-medium text-gray-400">
                Please send us a message via email, or tap the message icon at the top right of your dashboard.
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <a
                  href="mailto:johnfreycortez@gmail.com"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <Mail size={13} /> Email us
                </a>
                <Link
                  to="/messages"
                  onClick={backToFaq}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-purple-800"
                >
                  <MessageSquareText size={14} /> Go to Messages
                </Link>
              </div>
              <button
                type="button"
                onClick={backToFaq}
                className="mt-1 text-xs font-bold text-gray-400 underline hover:text-gray-600"
              >
                Back to FAQ
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-6 right-4 z-[70] grid h-14 w-14 place-items-center rounded-full bg-purple-700 text-white shadow-xl shadow-purple-900/20 transition-transform hover:scale-105 hover:bg-purple-800 sm:right-6"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}

export default ChatWidget;
