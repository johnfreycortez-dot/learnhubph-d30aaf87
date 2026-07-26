import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, TrendingUp, Award, ClipboardList, ChevronDown, ChevronUp,
  CheckCircle, PlayCircle, Lock, GraduationCap, AlertCircle,
} from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LearnHub PH" },
      { name: "description", content: "Your LearnHub PH student dashboard." },
      { property: "og:title", content: "Dashboard — LearnHub PH" },
      { property: "og:description", content: "Your LearnHub PH student dashboard." },
    ],
  }),
  component: () => (
    <SessionGuard>
      <DashboardPage />
    </SessionGuard>
  ),
});

type Lesson = { LessonID: string; Title: string; VideoURL?: string; Order: number };
type Module = { ModuleID: string; Title: string; lessons: Lesson[] };
type Course = { CourseID: string; Title: string; modules: Module[] };
type Niche = { NicheID: string; NicheTitle: string; NicheIcon?: string; courses: Course[] };

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<Niche[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [studentName, setStudentName] = useState("");
  const [unread, setUnread] = useState(0);
  const [finalUnlocked, setFinalUnlocked] = useState(false);
  const [tab, setTab] = useState<"overview" | "courses">("overview");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const [courseRes, notifRes, unlockRes, userRes] = await Promise.all([
        gasCall("getCourseAndProgress", token),
        gasCall("getNotifications", token),
        gasCall("checkFinalLessonUnlock", token),
        gasCall("getUserByTokenPublic", token),
      ]);
      setModules(courseRes.modules || []);
      setProgress(courseRes.progress || {});
      setUnread(notifRes?.unread || 0);
      setFinalUnlocked(!!unlockRes?.unlocked);
      setStudentName(userRes?.user?.name || "");
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const lessonList = modules.flatMap((n) => n.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons)));
    const total = lessonList.length;
    const completed = lessonList.filter((l) => progress[l.LessonID]).length;
    const certs = modules.filter((n) => {
      const ll = n.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
      return ll.length > 0 && ll.every((l) => progress[l.LessonID]);
    }).length;
    return { total, completed, certs, pct: total ? Math.round((completed / total) * 100) : 0 };
  }, [modules, progress]);

  if (loading) {
    return (
      <StudentShell studentName={studentName} unread={unread}>
        <div className="flex justify-center py-20">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-gray-500">Loading your courses...</p>
          </div>
        </div>
      </StudentShell>
    );
  }

  if (error) {
    return (
      <StudentShell studentName={studentName} unread={unread}>
        <div className="flex flex-col items-center py-20">
          <AlertCircle className="text-red-500" size={48} />
          <p className="mt-3 text-gray-700">Failed to load data.</p>
          <button
            onClick={load}
            className="mt-3 rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell studentName={studentName} unread={unread}>
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {(["overview", "courses"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold ${
              tab === t ? "border-b-2 border-purple-600 text-purple-700" : "text-gray-500"
            }`}
          >
            {t === "overview" ? "Overview" : "My Courses"}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, {studentName || "Student"}!</h1>
            <p className="mt-1 text-sm text-gray-500">Here's your learning progress at a glance.</p>
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<BookOpen size={24} />} label="Lessons Completed" value={stats.completed} />
            <StatCard icon={<TrendingUp size={24} />} label="Overall Progress" value={`${stats.pct}%`} />
            <StatCard icon={<Award size={24} />} label="Certificates Earned" value={stats.certs} />
            <StatCard icon={<ClipboardList size={24} />} label="Quizzes Passed" value={stats.completed} />
          </div>

          <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span className="text-gray-700">Overall Course Progress</span>
              <span className="text-purple-700">{stats.pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-purple-600 transition-all" style={{ width: `${stats.pct}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((n) => (
              <NicheCard key={n.NicheID} niche={n} progress={progress} navigate={navigate} modules={modules} />
            ))}
          </div>

          <FinalLessonCard unlocked={finalUnlocked} navigate={navigate} modules={modules} />
        </div>
      )}
    </StudentShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="bg-purple-100 text-purple-600 rounded-full p-2 inline-flex items-center justify-center">
          {icon}
        </span>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

function NicheCard({
  niche,
  progress,
  navigate,
  modules,
}: {
  niche: Niche;
  progress: Record<string, boolean>;
  navigate: ReturnType<typeof useNavigate>;
  modules: Niche[];
}) {
  const [open, setOpen] = useState(false);
  const lessons = niche.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
  const done = lessons.filter((l) => progress[l.LessonID]).length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <BookOpen size={20} className="text-purple-600" />
        <h3 className="font-bold text-gray-900">{niche.NicheTitle}</h3>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {done} / {lessons.length} lessons
      </p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full bg-purple-600" style={{ width: `${pct}%` }} />
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold px-4 py-2"
      >
        Continue {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {niche.courses.flatMap((c) =>
            c.modules.map((m) => (
              <div key={m.ModuleID}>
                <div className="text-xs font-bold text-gray-600 uppercase">{m.Title}</div>
                <ul className="mt-1 space-y-1">
                  {m.lessons
                    .slice()
                    .sort((a, b) => a.Order - b.Order)
                    .map((l, idx, arr) => {
                      const passed = progress[l.LessonID];
                      const prevPassed = idx === 0 || progress[arr[idx - 1].LessonID];
                      const isCurrent = !passed && prevPassed;
                      const locked = !passed && !prevPassed;
                      return (
                        <li key={l.LessonID}>
                          <button
                            disabled={locked}
                            onClick={() =>
                              navigate({
                                to: "/lesson/$lessonId",
                                params: { lessonId: l.LessonID },
                                state: { modules } as any,
                              })
                            }
                            className={`flex items-center gap-2 w-full text-left text-sm py-1.5 px-2 rounded-lg ${
                              locked
                                ? "text-gray-400 cursor-not-allowed"
                                : isCurrent
                                  ? "bg-purple-50 text-purple-700 font-semibold"
                                  : passed
                                    ? "text-gray-500 hover:bg-gray-50"
                                    : "hover:bg-gray-50"
                            }`}
                          >
                            {passed ? (
                              <CheckCircle className="text-green-500" size={16} />
                            ) : isCurrent ? (
                              <PlayCircle className="text-purple-600" size={16} />
                            ) : (
                              <Lock className="text-gray-400" size={16} />
                            )}
                            <span className={passed ? "line-through" : ""}>{l.Title}</span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )),
          )}
        </div>
      )}
    </div>
  );
}

function FinalLessonCard({
  unlocked,
  navigate,
  modules,
}: {
  unlocked: boolean;
  navigate: ReturnType<typeof useNavigate>;
  modules: Niche[];
}) {
  if (unlocked) {
    return (
      <div
        className="mt-6 rounded-2xl p-6 text-white shadow-xl cursor-pointer"
        style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}
        onClick={() =>
          navigate({ to: "/lesson/$lessonId", params: { lessonId: "FinalLes" }, state: { modules } as any })
        }
      >
        <div className="flex items-start gap-4">
          <GraduationCap size={32} />
          <div>
            <span className="inline-block bg-yellow-300 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              BONUS UNLOCKED
            </span>
            <h3 className="mt-1 text-lg font-extrabold">Final Lesson: Build Your Portfolio & Apply</h3>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center">
      <Lock className="text-gray-400 mx-auto" size={32} />
      <h3 className="mt-2 font-bold text-gray-700">Final Bonus Lesson</h3>
      <p className="mt-1 text-sm text-gray-500">Complete all 9 niches to unlock this bonus lesson.</p>
    </div>
  );
}
