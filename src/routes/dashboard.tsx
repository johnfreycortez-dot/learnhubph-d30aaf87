import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Award, ChevronDown, ChevronUp, CheckCircle, PlayCircle, Lock,
  GraduationCap, AlertCircle, Flame, Target, ArrowRight,
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

const NICHE_TINT = [
  "#7c3aed", "#0d7377", "#3d6b4f", "#9b2d4f", "#1e4d78",
  "#8a4a10", "#1e3a7a", "#8a2020", "#4a2080",
];

function thumbUrl(id?: string) {
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w400` : null;
}

function Donut({ pct, size = 132 }: { pct: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#ede9fe" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#7c3aed"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
        style={{ transition: "stroke-dashoffset 900ms ease" }}
      />
    </svg>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<Niche[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [thumbMap, setThumbMap] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState("");
  const [unread, setUnread] = useState(0);
  const [finalUnlocked, setFinalUnlocked] = useState(false);
  const [tab, setTab] = useState<"overview" | "courses">(
    ((loc.state as any)?.tab === "courses" ? "courses" : "overview"),
  );

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
      setThumbMap(courseRes.thumbnailMap || {});
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

  const nextLesson = useMemo(() => {
    for (const n of modules) {
      const lessons = n.courses
        .flatMap((c) => c.modules.flatMap((m) => m.lessons))
        .slice()
        .sort((a, b) => a.Order - b.Order);
      const found = lessons.find((l) => !progress[l.LessonID]);
      if (found) return { lesson: found, niche: n };
    }
    return null;
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
      <div className="mb-5 flex gap-2 border-b border-gray-200">
        {(["overview", "courses"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold ${
              tab === t ? "border-b-2 border-purple-600 text-purple-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "overview" ? "Overview" : "My Courses"}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <div
              className="rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Welcome back</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold">{studentName || "Student"} 👋</h1>
              <p className="mt-2 text-sm text-white/80 max-w-md">
                You've completed {stats.completed} of {stats.total} lessons. Keep the momentum going!
              </p>
              {nextLesson && (
                <button
                  onClick={() =>
                    navigate({
                      to: "/lesson/$lessonId",
                      params: { lessonId: nextLesson.lesson.LessonID },
                      state: { modules, niche: nextLesson.niche.NicheTitle } as any,
                    })
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white text-purple-800 font-bold text-sm px-5 py-2.5 hover:bg-purple-50"
                >
                  Continue: {nextLesson.lesson.Title} <ArrowRight size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<BookOpen size={20} />} label="Lessons Done" value={stats.completed} />
              <StatCard icon={<Target size={20} />} label="Total Lessons" value={stats.total} />
              <StatCard icon={<Award size={20} />} label="Certificates" value={stats.certs} />
              <StatCard icon={<Flame size={20} />} label="Progress" value={`${stats.pct}%`} />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Progress by Niche</h2>
              <div className="mt-4 space-y-3">
                {modules.map((n, i) => {
                  const lessons = n.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
                  const done = lessons.filter((l) => progress[l.LessonID]).length;
                  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
                  return (
                    <div key={n.NicheID}>
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>{n.NicheTitle}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: NICHE_TINT[i % NICHE_TINT.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-6 shadow-sm text-center">
              <h2 className="text-base font-bold text-gray-900">Overall Completion</h2>
              <div className="relative mt-4 inline-flex items-center justify-center">
                <Donut pct={stats.pct} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-gray-900">{stats.pct}%</span>
                  <span className="text-[11px] text-gray-400">complete</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                {stats.total - stats.completed} lessons left to finish everything.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Your Certificates</h2>
              <p className="mt-1 text-sm text-gray-500">
                {stats.certs} of {modules.length} niches completed.
              </p>
              <button
                onClick={() => navigate({ to: "/certificates" })}
                className="mt-4 w-full rounded-xl border-2 border-purple-600 text-purple-700 hover:bg-purple-50 font-semibold text-sm px-4 py-2.5"
              >
                View Certificates
              </button>
            </div>

            <FinalLessonCard unlocked={finalUnlocked} navigate={navigate} modules={modules} />
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((n, i) => (
              <NicheCard
                key={n.NicheID}
                niche={n}
                tint={NICHE_TINT[i % NICHE_TINT.length]}
                progress={progress}
                thumbMap={thumbMap}
                navigate={navigate}
                modules={modules}
              />
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
    <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <span className="bg-purple-100 text-purple-600 rounded-xl p-2 inline-flex items-center justify-center">
        {icon}
      </span>
      <div className="mt-3 text-xl font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function NicheCard({
  niche,
  tint,
  progress,
  thumbMap,
  navigate,
  modules,
}: {
  niche: Niche;
  tint: string;
  progress: Record<string, boolean>;
  thumbMap: Record<string, string>;
  navigate: ReturnType<typeof useNavigate>;
  modules: Niche[];
}) {
  const [open, setOpen] = useState(false);
  const lessons = niche.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
  const done = lessons.filter((l) => progress[l.LessonID]).length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <span className="rounded-lg p-1.5 text-white" style={{ background: tint }}>
          <BookOpen size={16} />
        </span>
        <h3 className="font-bold text-gray-900">{niche.NicheTitle}</h3>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {done} / {lessons.length} lessons
      </p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tint }} />
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold px-4 py-2"
      >
        {open ? "Hide Lessons" : "Continue"} {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {niche.courses.flatMap((c) =>
            c.modules.map((m) => (
              <div key={m.ModuleID}>
                <div className="text-xs font-bold text-gray-600 uppercase">{m.Title}</div>
                <ul className="mt-2 space-y-2">
                  {m.lessons
                    .slice()
                    .sort((a, b) => a.Order - b.Order)
                    .map((l, idx, arr) => {
                      const passed = progress[l.LessonID];
                      const prevPassed = idx === 0 || progress[arr[idx - 1].LessonID];
                      const isCurrent = !passed && prevPassed;
                      const locked = !passed && !prevPassed;
                      const thumb = thumbUrl(thumbMap[l.LessonID]);
                      return (
                        <li key={l.LessonID}>
                          <button
                            disabled={locked}
                            onClick={() =>
                              navigate({
                                to: "/lesson/$lessonId",
                                params: { lessonId: l.LessonID },
                                state: { modules, niche: niche.NicheTitle } as any,
                              })
                            }
                            className={`flex items-center gap-3 w-full text-left text-sm p-2 rounded-xl transition-colors ${
                              locked
                                ? "text-gray-400 cursor-not-allowed"
                                : isCurrent
                                  ? "bg-purple-50 text-purple-700 font-semibold"
                                  : "hover:bg-gray-50"
                            }`}
                          >
                            <span className="relative h-11 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={l.Title}
                                  loading="lazy"
                                  className={`h-full w-full object-cover ${locked ? "opacity-40 grayscale" : ""}`}
                                />
                              ) : (
                                <span
                                  className="flex h-full w-full items-center justify-center text-white text-[10px] font-bold"
                                  style={{ background: tint }}
                                >
                                  {niche.NicheTitle.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                              <span className="absolute bottom-0.5 right-0.5">
                                {passed ? (
                                  <CheckCircle className="text-green-400" size={14} />
                                ) : isCurrent ? (
                                  <PlayCircle className="text-white drop-shadow" size={14} />
                                ) : (
                                  <Lock className="text-white drop-shadow" size={12} />
                                )}
                              </span>
                            </span>
                            <span className={passed ? "line-through text-gray-500" : ""}>{l.Title}</span>
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
            <h3 className="mt-1 text-lg font-extrabold">Final Lesson: Build Your Portfolio &amp; Apply</h3>
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
