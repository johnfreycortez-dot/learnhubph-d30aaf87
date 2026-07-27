import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, Lock } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";

export const Route = createFileRoute("/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lesson — LearnHub PH" },
      { name: "description", content: "Study your LearnHub PH lesson." },
      { property: "og:title", content: "Lesson — LearnHub PH" },
      { property: "og:description", content: "Study your LearnHub PH lesson." },
    ],
  }),
  component: () => (
    <SessionGuard>
      <LessonPage />
    </SessionGuard>
  ),
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const nicheName = (loc.state as any)?.niche || lesson?.NicheTitle || lesson?.Niche || "";

  async function load() {
    setLoading(true);
    setError("");
    setLocked(false);
    try {
      const res = await gasCall("getLesson", getToken(), lessonId);
      console.info("[LearnHub PH] getLesson response", { lessonId, res });
      if (res?.locked) {
        setLocked(true);
        setError(res.error || "Complete the previous lesson first.");
        return;
      }
      if (res?.error) throw new Error(res.error);
      if (!res?.lesson) throw new Error("Lesson unavailable. Please try again.");
      setLesson(res.lesson);
    } catch (e: any) {
      setError(e?.message || "Couldn't reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    if (lesson?.ContentHTML) {
      const blob = new Blob([lesson.ContentHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBlobUrl(null);
  }, [lesson?.ContentHTML]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.action === "lessonComplete") {
        gasCall("submitQuiz", getToken(), lessonId, [])
          .then(() => showToast("Lesson completed! Great work!", "success"))
          .catch(() => showToast("Couldn't save your progress. Please try again.", "error"));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [lessonId, showToast]);

  if (locked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <Lock className="text-gray-400" size={48} />
        <p className="mt-3 max-w-sm text-gray-700">{error}</p>
        <button
          onClick={() => navigate({ to: "/courses" })}
          className="mt-3 rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="mt-3 text-gray-700">{error}</p>
        <button
          onClick={load}
          className="mt-3 rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#1a1a2e] flex items-center justify-between gap-3 px-3 sm:px-5">
        <button
          onClick={() => navigate({ to: "/dashboard", state: { tab: "courses" } as any })}
          className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white flex-shrink-0"
        >
          <ArrowLeft size={20} className="text-white" />
          <span className="hidden sm:inline">Back to My Courses</span>
        </button>
        <h1 className="text-sm font-semibold text-white truncate text-center flex-1">{lesson?.Title || "Lesson"}</h1>
        <span className="hidden sm:inline-block flex-shrink-0 rounded-full bg-purple-600 text-white text-[11px] font-semibold px-3 py-1">
          {nicheName}
        </span>
      </header>

      <div className="pt-14">
        {loading || !blobUrl ? (
          <div className="flex items-center justify-center" style={{ height: "calc(100vh - 56px)" }}>
            <Spinner size="lg" />
            <span className="ml-3 text-gray-500">Loading lesson...</span>
          </div>
        ) : (
          <iframe
            src={blobUrl}
            className="w-full border-0"
            style={{ height: "calc(100vh - 56px)" }}
            sandbox="allow-scripts allow-same-origin allow-forms"
            title={lesson?.Title || "Lesson"}
          />
        )}
      </div>
    </div>
  );
}
