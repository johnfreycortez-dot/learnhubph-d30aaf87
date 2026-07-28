import { useEffect, useRef, useState, type ReactNode } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";

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
type ChatMessage = { id: number; role: "bot" | "user"; content: ReactNode };

const FALLBACK_MESSAGE: ReactNode = (
  <>
    I'm not sure about that — please contact LearnHub PH for help:{" "}
    <a href="mailto:johnfreycortez@gmail.com" className="font-semibold text-purple-700 underline">
      johnfreycortez@gmail.com
    </a>
  </>
);

let nextId = 1;

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
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const kbRef = useRef<FaqEntry[] | null>(kbCache);

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
  }, [messages, thinking]);

  function pushMessage(role: ChatMessage["role"], content: ReactNode) {
    setMessages((prev) => [...prev, { id: nextId++, role, content }]);
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;
    setInput("");
    pushMessage("user", question);
    setThinking(true);

    // Small delay so the reply doesn't feel like it's just teleporting in —
    // matching itself is instant since it's all client-side.
    await new Promise((r) => setTimeout(r, 350));

    const kb = kbRef.current || [];
    if (kbError && kb.length === 0) {
      pushMessage("bot", FALLBACK_MESSAGE);
      setThinking(false);
      return;
    }

    const match = findBestMatch(question, kb);
    if (match) {
      pushMessage("bot", match.answer);
    } else {
      pushMessage("bot", FALLBACK_MESSAGE);
      // Fire-and-forget — don't block the UI on this, and the backend
      // already fails silently if it can't resolve the token to an email.
      void gasCall("logUnmatchedQuestion", question, getToken()).catch(() => {});
    }
    setThinking(false);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-[70] flex h-[520px] max-h-[75vh] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:right-6">
          <div className="flex items-center justify-between gap-2 bg-purple-700 px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15">
                <Sparkles size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">LearnHub PH Support</p>
                <p className="truncate text-[11px] font-medium text-purple-100">Usually replies instantly</p>
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
                </div>
              </div>
            ))}
            {(thinking || kbLoading) && (
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
              disabled={!input.trim() || thinking}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-700 text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
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
