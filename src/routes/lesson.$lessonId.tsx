import { createFileRoute, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, CheckCircle, XCircle, Lock, ClipboardList, ChevronRight,
  RefreshCw, PanelLeftClose, PanelLeftOpen, AlertCircle,
} from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lesson — LearnHub PH" },
      { name: "description", content: "Watch the lesson and take the quiz." },
      { property: "og:title", content: "Lesson — LearnHub PH" },
      { property: "og:description", content: "Watch the lesson and take the quiz." },
    ],
  }),
  component: () => (
    <SessionGuard>
      <LessonPage />
    </SessionGuard>
  ),
});

function getYouTubeId(url: string): string | null {
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

type QuizItem = { QuizID: string; Question: string; Options: string[] };

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState<any>(null);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [modules, setModules] = useState<any[]>((loc.state as any)?.modules || []);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const promises: Promise<any>[] = [
        gasCall("getLesson", token, lessonId),
        gasCall("getQuiz", token, lessonId),
      ];
      if (modules.length === 0) promises.push(gasCall("getCourseAndProgress", token));
      const [lessonRes, quizRes, courseRes] = await Promise.all(promises);
      if (!lessonRes?.ok) throw new Error(lessonRes?.msg || "Lesson unavailable");
      setLesson(lessonRes.lesson);
      setQuiz(Array.isArray(quizRes) ? quizRes : quizRes?.items || []);
      setAnswers(new Array((Array.isArray(quizRes) ? quizRes : quizRes?.items || []).length).fill(""));
      if (courseRes) setModules(courseRes.modules || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load lesson.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setResult(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const flatLessons = useMemo(
    () =>
      modules.flatMap((n: any) =>
        n.courses.flatMap((c: any) => c.modules.flatMap((m: any) => m.lessons.map((l: any) => ({ ...l, niche: n.NicheTitle, module: m.Title })))),
      ),
    [modules],
  );

  const currentIdx = flatLessons.findIndex((l) => l.LessonID === lessonId);
  const currentLesson = flatLessons[currentIdx];
  const nextLesson = flatLessons[currentIdx + 1];

  const videoId = lesson?.VideoURL ? getYouTubeId(lesson.VideoURL) : null;
  const allAnswered = quiz.length > 0 && answers.every((a) => a);

  async function submitQuiz() {
    setSubmitting(true);
    try {
      const res = await gasCall("submitQuiz", getToken(), lessonId, answers);
      setResult(res);
    } catch {
      setError("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500">Loading lesson...</p>
        </div>
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
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <aside className="fixed lg:static top-0 left-0 z-40 h-screen w-[280px] bg-[#1a1a2e] text-white flex-shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-white/60">
              <PanelLeftClose size={18} />
            </button>
          </div>
          <nav className="p-3 space-y-3">
            {modules.map((n: any) => (
              <div key={n.NicheID}>
                <div className="text-[11px] font-bold uppercase text-white/50 px-2">{n.NicheTitle}</div>
                {n.courses.flatMap((c: any) =>
                  c.modules.map((m: any) => (
                    <div key={m.ModuleID} className="mt-1">
                      <div className="text-[10px] text-white/40 px-2">{m.Title}</div>
                      <ul>
                        {m.lessons.map((l: any) => {
                          const isCurrent = l.LessonID === lessonId;
                          return (
                            <li key={l.LessonID}>
                              <button
                                onClick={() =>
                                  navigate({
                                    to: "/lesson/$lessonId",
                                    params: { lessonId: l.LessonID },
                                    state: { modules } as any,
                                  })
                                }
                                className={`w-full text-left text-xs px-2 py-1.5 rounded-md flex items-center gap-2 ${
                                  isCurrent ? "bg-purple-700 text-white" : "text-white/70 hover:bg-white/5"
                                }`}
                              >
                                <CheckCircle className="text-white/30" size={14} />
                                {l.Title}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )),
                )}
              </div>
            ))}
          </nav>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-purple-700"
          >
            <PanelLeftOpen size={18} /> Show lessons
          </button>
        )}
        {currentLesson && (
          <p className="text-xs text-gray-500">
            {currentLesson.niche} <span className="mx-1">›</span> {currentLesson.module} <span className="mx-1">›</span>{" "}
            {currentLesson.Title}
          </p>
        )}
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">{lesson?.Title}</h1>

        {videoId && (
          <div className="mt-6 aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {lesson?.ContentHTML && (
          <div
            className="prose prose-lg max-w-none mt-6 mb-8"
            dangerouslySetInnerHTML={{ __html: lesson.ContentHTML }}
          />
        )}

        {quiz.length > 0 && !result && (
          <div className="mt-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <ClipboardList size={20} /> Lesson Quiz
            </h2>
            <div className="mt-4 space-y-4">
              {quiz.map((q, qi) => (
                <div key={q.QuizID} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-bold text-gray-900">
                    {qi + 1}. {q.Question}
                  </p>
                  <div className="mt-3 space-y-2">
                    {q.Options.map((opt) => {
                      const selected = answers[qi] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            const next = answers.slice();
                            next[qi] = opt;
                            setAnswers(next);
                          }}
                          className={`w-full text-left rounded-xl p-3 border transition-colors ${
                            selected
                              ? "border-2 border-purple-600 bg-purple-50 text-purple-700"
                              : "border-gray-200 hover:border-purple-400"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={submitQuiz}
              disabled={!allAnswered || submitting}
              className="mt-4 w-full rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold px-5 py-3 inline-flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" className="border-white" />} Submit Quiz
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6">
            {result.passed ? (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
                <CheckCircle className="text-green-500 mx-auto" size={48} />
                <p className="mt-2 text-lg font-bold text-green-800">
                  Passed! Score: {result.score}/{result.total}
                </p>
                {nextLesson ? (
                  <button
                    onClick={() =>
                      navigate({
                        to: "/lesson/$lessonId",
                        params: { lessonId: nextLesson.LessonID },
                        state: { modules } as any,
                      })
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold px-5 py-2.5"
                  >
                    Next Lesson <ChevronRight size={18} />
                  </button>
                ) : (
                  <Link
                    to="/dashboard"
                    className="mt-4 inline-block rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold px-5 py-2.5"
                  >
                    Back to Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
                <XCircle className="text-red-500 mx-auto" size={48} />
                <p className="mt-2 text-lg font-bold text-red-800">
                  Score: {result.score}/{result.total} — You need 70% to pass
                </p>
                <p className="text-xs text-red-700 mt-1">Attempts so far: {result.attempts}</p>
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers(new Array(quiz.length).fill(""));
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold px-5 py-2.5"
                >
                  <RefreshCw size={18} /> Try Again
                </button>
              </div>
            )}

            {result.review && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-2">Answer Review</h3>
                <div className="space-y-3">
                  {result.review.map((r: any, i: number) => (
                    <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                      <p className="font-semibold">{r.question || r.Question}</p>
                      <p className={`mt-2 text-sm inline-flex items-center gap-1.5 ${r.correct ? "text-green-600" : "text-red-600"}`}>
                        {r.correct ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        Your answer: {r.yourAnswer || r.your_answer}
                      </p>
                      <p className="mt-1 text-sm inline-flex items-center gap-1.5 text-green-600">
                        <CheckCircle size={16} /> Correct: {r.correctAnswer || r.correct_answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
