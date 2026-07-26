import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle, MessageSquare, Send } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — LearnHub PH" },
      { name: "description", content: "Send messages to your instructor." },
      { property: "og:title", content: "Messages — LearnHub PH" },
      { property: "og:description", content: "Send messages to your instructor." },
    ],
  }),
  component: () => (
    <SessionGuard>
      <MessagesPage />
    </SessionGuard>
  ),
});

function MessagesPage() {
  const [tab, setTab] = useState<"send" | "replies">("send");
  return (
    <StudentShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <MessageSquare size={24} className="text-purple-600" />
          <h1 className="text-2xl font-extrabold">Messages</h1>
        </div>
        <div className="mt-4 flex gap-2 border-b border-gray-200">
          {(["send", "replies"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold ${
                tab === t ? "border-b-2 border-purple-600 text-purple-700" : "text-gray-500"
              }`}
            >
              {t === "send" ? "Send Message" : "Replies"}
            </button>
          ))}
        </div>
        <div className="mt-6">{tab === "send" ? <SendForm /> : <RepliesInfo />}</div>
      </div>
    </StudentShell>
  );
}

function SendForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await gasCall("sendMessage", getToken(), subject, body);
      if (res.ok) setSent(true);
      else setError(res.msg || "Failed to send message");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
        <CheckCircle className="text-green-500 mx-auto" size={48} />
        <p className="mt-3 font-semibold text-green-800">Message sent!</p>
        <p className="mt-1 text-sm text-green-700">We'll reply to your registered email address.</p>
        <button
          onClick={() => {
            setSent(false);
            setSubject("");
            setBody("");
          }}
          className="mt-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold px-5 py-2.5"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
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
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 min-h-[120px] outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-70 text-white font-semibold px-5 py-2.5 inline-flex items-center justify-center gap-2"
      >
        {loading ? <Spinner size="sm" className="border-white" /> : <Send size={18} />} Send Message
      </button>
    </form>
  );
}

function RepliesInfo() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <MessageSquare size={24} className="text-purple-600" />
      <h2 className="mt-3 text-lg font-bold">How Replies Work</h2>
      <p className="mt-2 text-sm text-gray-600">
        Admin replies are sent directly to your registered email address. You'll receive an email notification when John
        Frey replies to your message.
      </p>
    </div>
  );
}
