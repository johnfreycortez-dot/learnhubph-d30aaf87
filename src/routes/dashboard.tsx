import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Play,
  Search,
  Settings,
  X,
} from "lucide-react";
import { clearToken, gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LearnHub PH" },
      { name: "description", content: "Your LearnHub PH student dashboard." },
      { property: "og:title", content: "Dashboard — LearnHub PH" },
      { property: "og:description", content: "Your LearnHub PH student dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SessionGuard>
      <DashboardPage />
    </SessionGuard>
  ),
});

type Lesson = {
  LessonID: string;
  Title: string;
  VideoURL?: string;
  Order?: number;
  AssignmentCount?: number;
  TestCount?: number;
  QuizCount?: number;
  HasAssignment?: boolean;
  HasTest?: boolean;
  HasQuiz?: boolean;
  DueDate?: string;
  Deadline?: string;
  [key: string]: unknown;
};
type Module = { ModuleID: string; Title: string; lessons: Lesson[]; [key: string]: unknown };
type Course = { CourseID: string; Title: string; modules: Module[]; [key: string]: unknown };
type Niche = { NicheID: string; NicheTitle: string; NicheIcon?: string; courses: Course[]; [key: string]: unknown };
type Notif = { notifId?: string; type?: string; title?: string; body?: string; createdAt?: string; read?: boolean };

type CourseRow = {
  id: string;
  title: string;
  niche: Niche;
  tint: string;
  lessons: Lesson[];
  lessonCount: number;
  completedLessons: number;
  assignmentCount: number;
  completedAssignments: number;
  testCount: number;
  completedTests: number;
  pct: number;
  firstOpenLesson: Lesson | null;
};

const NICHE_TINT = [
  "#7c3aed",
  "#0d7377",
  "#3d6b4f",
  "#9b2d4f",
  "#1e4d78",
  "#8a4a10",
  "#1e3a7a",
  "#8a2020",
  "#4a2080",
];

function thumbUrl(id?: string) {
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w400` : null;
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function countFrom(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value.length;
    if (typeof value === "number" || typeof value === "string") return asNumber(value);
    if (typeof value === "boolean") return value ? 1 : 0;
  }
  return 0;
}

function lessonMetaCount(lessons: Lesson[], keys: string[]) {
  return lessons.reduce((sum, lesson) => sum + countFrom(lesson, keys), 0);
}

function initials(name: string) {
  return (name || "Student")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if ((loc.state as { tab?: string } | undefined)?.tab === "courses") setTab("active");
  }, [loc.state]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const [courseRes, notifRes, userRes] = await Promise.all([
        gasCall("getCourseAndProgress", token),
        gasCall("getNotifications", token),
        gasCall("getUserByTokenPublic", token),
      ]);
      setModules(courseRes?.modules || []);
      setProgress(courseRes?.progress || {});
      setThumbMap(courseRes?.thumbnailMap || {});
      setUnread(notifRes?.unread || 0);
      setNotifications(notifRes?.items || []);
      setStudentName(userRes?.user?.name || "Student");
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo<CourseRow[]>(
    () =>
      modules.map((niche, index) => {
        const lessons = niche.courses
          .flatMap((course) => course.modules.flatMap((module) => module.lessons || []))
          .slice()
          .sort((a, b) => asNumber(a.Order) - asNumber(b.Order));
        const completedLessons = lessons.filter((lesson) => progress[lesson.LessonID]).length;
        const assignmentCount =
          countFrom(niche, ["assignmentCount", "assignments", "Assignments", "AssignmentCount"]) ||
          niche.courses.reduce(
            (sum, course) => sum + countFrom(course, ["assignmentCount", "assignments", "Assignments", "AssignmentCount"]),
            0,
          ) ||
          lessonMetaCount(lessons, ["AssignmentCount", "assignmentCount", "HasAssignment", "hasAssignment"]);
        const testCount =
          countFrom(niche, ["testCount", "quizCount", "tests", "quizzes", "Tests", "Quizzes", "TestCount", "QuizCount"]) ||
          niche.courses.reduce(
            (sum, course) =>
              sum + countFrom(course, ["testCount", "quizCount", "tests", "quizzes", "Tests", "Quizzes", "TestCount", "QuizCount"]),
            0,
          ) ||
          lessonMetaCount(lessons, ["TestCount", "QuizCount", "testCount", "quizCount", "HasTest", "HasQuiz", "hasTest", "hasQuiz"]);
        const completedAssignments = Math.min(
          assignmentCount,
          lessonMetaCount(
            lessons.filter((lesson) => progress[lesson.LessonID]),
            ["AssignmentCount", "assignmentCount", "HasAssignment", "hasAssignment"],
          ),
        );
        const completedTests = Math.min(
          testCount,
          lessonMetaCount(
            lessons.filter((lesson) => progress[lesson.LessonID]),
            ["TestCount", "QuizCount", "testCount", "quizCount", "HasTest", "HasQuiz", "hasTest", "hasQuiz"],
          ),
        );
        const firstOpenLesson = lessons.find((lesson) => !progress[lesson.LessonID]) || lessons[0] || null;
        const pct = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;
        return {
          id: niche.NicheID,
          title: niche.NicheTitle,
          niche,
          tint: NICHE_TINT[index % NICHE_TINT.length],
          lessons,
          lessonCount: lessons.length,
          completedLessons,
          assignmentCount,
          completedAssignments,
          testCount,
          completedTests,
          pct,
          firstOpenLesson,
        };
      }),
    [modules, progress],
  );

  const totals = useMemo(() => {
    const lessonCount = rows.reduce((sum, row) => sum + row.lessonCount, 0);
    const completedLessons = rows.reduce((sum, row) => sum + row.completedLessons, 0);
    const assignmentCount = rows.reduce((sum, row) => sum + row.assignmentCount, 0);
    const completedAssignments = rows.reduce((sum, row) => sum + row.completedAssignments, 0);
    const testCount = rows.reduce((sum, row) => sum + row.testCount, 0);
    const completedTests = rows.reduce((sum, row) => sum + row.completedTests, 0);
    return {
      lessonCount,
      completedLessons,
      lessonPct: pct(completedLessons, lessonCount),
      assignmentCount,
      completedAssignments,
      assignmentPct: pct(completedAssignments, assignmentCount),
      testCount,
      completedTests,
      testPct: pct(completedTests, testCount),
    };
  }, [rows]);

  const featured = rows.find((row) => row.pct < 100 && row.firstOpenLesson) || rows[0] || null;
  const visibleRows = rows.filter((row) => (tab === "active" ? row.pct < 100 : row.pct >= 100));
  const upcoming = useMemo(() => buildUpcoming(notifications, rows), [notifications, rows]);

  function logout() {
    clearToken();
    navigate({ to: "/" });
  }

  function resume(row: CourseRow | null = featured) {
    if (!row?.firstOpenLesson) return;
    navigate({
      to: "/lesson/$lessonId",
      params: { lessonId: row.firstOpenLesson.LessonID },
      state: { modules, niche: row.title, tab: "courses" } as any,
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">
        <Spinner size="lg" />
        <span className="ml-3 text-sm font-medium text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f7fb] p-4 text-center">
        <AlertCircle className="text-red-500" size={48} />
        <p className="mt-3 text-gray-700">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-950">
      {mobileOpen && <button className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[246px] flex-col border-r border-gray-100 bg-white shadow-sm transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-700 text-sm font-black text-white">LH</span>
            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-none">LearnHub PH</p>
              <p className="truncate text-[11px] font-semibold text-gray-400">Student LMS</p>
            </div>
          </div>
          <button type="button" onClick={() => setMobileOpen(false)} className="lg:hidden" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <SideButton active icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setTab("active")} />
          <SideButton icon={<BookOpen size={18} />} label="Courses" onClick={() => setTab("active")} />
          <SideButton icon={<FileCheck2 size={18} />} label="Chapter" onClick={() => setTab("active")} />
          <Link to="/messages" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-purple-700">
            <HelpCircle size={18} /> Help
          </Link>
          <Link to="/notifications" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-purple-700">
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="space-y-2 border-t border-gray-100 px-4 py-5">
          <a href="/#faq" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-purple-700">
            <MessageSquare size={18} /> FAQ
          </a>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[246px]">
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[220px_minmax(240px,1fr)_auto]">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-gray-50 lg:hidden" aria-label="Open menu">
                <Menu size={20} />
              </button>
              <h1 className="truncate text-xl font-black sm:text-2xl">Dashboard</h1>
            </div>
            <label className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-gray-400 md:flex">
              <Search size={18} className="shrink-0 text-purple-500" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400" placeholder="Search here..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <Link to="/messages" className="hidden h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700 sm:grid" aria-label="Messages">
                <MessageSquare size={18} />
              </Link>
              <Link to="/notifications" className="relative grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700" aria-label="Notifications">
                <Bell size={18} />
                {unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
              </Link>
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-100 text-sm font-black text-purple-700">{initials(studentName)}</span>
                <span className="hidden max-w-[120px] truncate text-sm font-bold text-gray-700 sm:inline">{studentName || "Student"}</span>
                <ChevronDown size={16} className="hidden text-gray-400 sm:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:p-8">
          <section className="min-w-0 space-y-6">
            <FeaturedCourse row={featured} thumbMap={thumbMap} onResume={() => resume(featured)} />

            <section>
              <h2 className="text-lg font-black">Status</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <StatusCard
                  icon={<BookOpen size={20} />}
                  title="Lessons"
                  value={totals.completedLessons}
                  total={totals.lessonCount}
                  pct={totals.lessonPct}
                  tone="bg-amber-50 text-orange-500"
                />
                <StatusCard
                  icon={<ClipboardCheck size={20} />}
                  title="Assignments"
                  value={totals.completedAssignments}
                  total={totals.assignmentCount}
                  pct={totals.assignmentPct}
                  tone="bg-rose-50 text-rose-500"
                />
                <StatusCard
                  icon={<FileCheck2 size={20} />}
                  title="Tests"
                  value={totals.completedTests}
                  total={totals.testCount}
                  pct={totals.testPct}
                  tone="bg-emerald-50 text-emerald-500"
                />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <h2 className="truncate text-lg font-black">My Courses</h2>
                <div className="flex rounded-xl bg-gray-50 p-1 text-xs font-bold">
                  <button type="button" onClick={() => setTab("active")} className={`rounded-lg px-3 py-2 ${tab === "active" ? "bg-purple-100 text-purple-700" : "text-gray-400"}`}>
                    Active
                  </button>
                  <button type="button" onClick={() => setTab("completed")} className={`rounded-lg px-3 py-2 ${tab === "completed" ? "bg-purple-100 text-purple-700" : "text-gray-400"}`}>
                    Completed
                  </button>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="text-[11px] font-bold text-gray-300">
                      <th className="w-8 px-2 py-3">#</th>
                      <th className="px-2 py-3">Course Name</th>
                      <th className="px-2 py-3">Completed</th>
                      <th className="px-2 py-3">Status</th>
                      <th className="px-2 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visibleRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-2 py-10 text-center text-sm text-gray-400">
                          No {tab} courses found.
                        </td>
                      </tr>
                    ) : (
                      visibleRows.map((row, index) => (
                        <CourseTableRow key={row.id} index={index + 1} row={row} thumbMap={thumbMap} onResume={() => resume(row)} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <CalendarWidget weekStart={weekStart} onPrev={() => setWeekStart(addDays(weekStart, -7))} onNext={() => setWeekStart(addDays(weekStart, 7))} />
            <UpcomingWidget items={upcoming} />
          </aside>
        </main>
      </div>
    </div>
  );
}

function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

function SideButton({ active, icon, label, onClick }: { active?: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-purple-700 text-white shadow-lg shadow-purple-200" : "text-gray-500 hover:bg-gray-50 hover:text-purple-700"}`}
    >
      {icon} {label}
    </button>
  );
}

function CourseIcon({ row, thumbMap, size = "md" }: { row: CourseRow; thumbMap: Record<string, string>; size?: "sm" | "md" | "lg" }) {
  const firstThumb = row.lessons.map((lesson) => thumbMap[lesson.LessonID]).find(Boolean);
  const src = thumbUrl(firstThumb);
  const dims = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-10 w-10" : "h-11 w-11";
  return (
    <span className={`grid ${dims} shrink-0 place-items-center overflow-hidden rounded-xl text-xs font-black text-white`} style={{ background: row.tint }}>
      {src ? <img src={src} alt={`${row.title} thumbnail`} loading="lazy" className="h-full w-full object-cover" /> : row.title.slice(0, 2).toUpperCase()}
    </span>
  );
}

function FeaturedCourse({ row, thumbMap, onResume }: { row: CourseRow | null; thumbMap: Record<string, string>; onResume: () => void }) {
  if (!row) {
    return <div className="rounded-2xl bg-white p-5 text-sm text-gray-400 shadow-sm">No courses available yet.</div>;
  }
  return (
    <section className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <div className="flex min-w-0 items-center gap-4">
        <CourseIcon row={row} thumbMap={thumbMap} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-700">{row.title}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${row.pct}%` }} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
        <Meta icon={<BookOpen size={14} />} value={row.lessonCount} />
        <Meta icon={<ClipboardCheck size={14} />} value={row.assignmentCount} />
        <Meta icon={<FileCheck2 size={14} />} value={row.testCount} />
        <button type="button" onClick={onResume} className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700 hover:bg-purple-100">
          <Play size={16} /> Resume
        </button>
      </div>
    </section>
  );
}

function Meta({ icon, value }: { icon: ReactNode; value: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
      {icon} {value}
    </span>
  );
}

function StatusCard({ icon, title, value, total, pct, tone }: { icon: ReactNode; title: string; value: number; total: number; pct: number; tone: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>{icon}</div>
      <div className="mt-4 text-3xl font-black text-gray-900">{String(value).padStart(2, "0")}</div>
      <p className="text-sm font-bold text-gray-600">{title}</p>
      <p className="mt-1 text-xs text-gray-400">of {total} completed</p>
      <div className="absolute right-5 top-5">
        <MiniDonut pct={pct} />
      </div>
    </div>
  );
}

function MiniDonut({ pct }: { pct: number }) {
  const size = 46;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[46px] w-[46px]">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f3e8ff" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#c084fc" strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-black text-purple-500">{pct}%</span>
    </div>
  );
}

function CourseTableRow({ index, row, thumbMap, onResume }: { index: number; row: CourseRow; thumbMap: Record<string, string>; onResume: () => void }) {
  return (
    <tr className="text-sm">
      <td className="px-2 py-4 text-xs font-bold text-gray-300">{index}</td>
      <td className="px-2 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <CourseIcon row={row} thumbMap={thumbMap} size="sm" />
          <span className="max-w-[240px] truncate font-bold text-gray-700">{row.title}</span>
        </div>
      </td>
      <td className="px-2 py-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-36 overflow-hidden rounded-full bg-sky-100">
            <div className="h-full rounded-full bg-purple-600" style={{ width: `${row.pct}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-400">{row.pct}%</span>
        </div>
      </td>
      <td className="px-2 py-4">
        <div className="flex items-center gap-3">
          <Meta icon={<BookOpen size={13} />} value={row.lessonCount} />
          <Meta icon={<ClipboardCheck size={13} />} value={row.assignmentCount} />
          <Meta icon={<FileCheck2 size={13} />} value={row.testCount} />
        </div>
      </td>
      <td className="px-2 py-4 text-right">
        <button type="button" onClick={onResume} className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50">
          Resume
        </button>
      </td>
    </tr>
  );
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function CalendarWidget({ weekStart, onPrev, onNext }: { weekStart: Date; onPrev: () => void; onNext: () => void }) {
  const days = Array.from({ length: 35 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  const month = weekStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="text-lg font-black">Status</h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onPrev} className="grid h-8 w-8 place-items-center rounded-full text-purple-600 hover:bg-purple-50" aria-label="Previous week">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={onNext} className="grid h-8 w-8 place-items-center rounded-full text-purple-600 hover:bg-purple-50" aria-label="Next week">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <p className="mt-1 text-xs font-bold text-gray-300">{month}</p>
      <div className="mt-5 grid grid-cols-7 gap-y-4 text-center text-xs font-bold text-gray-400">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
        {days.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          return (
            <span key={day.toISOString()} className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${isToday ? "bg-purple-700 text-white" : "text-gray-400"}`}>
              {day.getDate()}
            </span>
          );
        })}
      </div>
    </section>
  );
}

type UpcomingItem = { id: string; title: string; label: string; date: Date; tone: string };

function buildUpcoming(notifications: Notif[], rows: CourseRow[]): UpcomingItem[] {
  const fromNotifications = notifications
    .map((n, index) => {
      const date = parseDate(n.createdAt || "");
      if (!date) return null;
      const type = (n.type || "lesson").toLowerCase();
      return {
        id: n.notifId || `notif-${index}`,
        title: n.title || "Learning update",
        label: labelFor(type),
        date,
        tone: toneFor(type),
      } satisfies UpcomingItem;
    })
    .filter((item): item is UpcomingItem => Boolean(item));

  const fromLessons = rows.flatMap((row) =>
    row.lessons
      .map((lesson) => {
        const date = parseDate(String(lesson.DueDate || lesson.Deadline || ""));
        if (!date) return null;
        return {
          id: lesson.LessonID,
          title: lesson.Title,
          label: "Lessons",
          date,
          tone: "bg-purple-500",
        } satisfies UpcomingItem;
      })
      .filter((item): item is UpcomingItem => Boolean(item)),
  );

  return [...fromLessons, ...fromNotifications]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function labelFor(type: string) {
  if (type.includes("assign")) return "Assignment";
  if (type.includes("quiz") || type.includes("test")) return "Test";
  if (type.includes("payment")) return "Payment";
  if (type.includes("reply")) return "Message";
  return "Lessons";
}

function toneFor(type: string) {
  if (type.includes("assign")) return "bg-rose-500";
  if (type.includes("quiz") || type.includes("test")) return "bg-emerald-500";
  if (type.includes("payment")) return "bg-amber-500";
  if (type.includes("reply")) return "bg-sky-500";
  return "bg-purple-500";
}

function UpcomingWidget({ items }: { items: UpcomingItem[] }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Upcoming</h2>
      {items.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm font-medium text-gray-400">No upcoming deadlines from your backend yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-50">
          {items.map((item) => (
            <li key={item.id} className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 py-3">
              <div className="rounded-xl bg-gray-50 py-2 text-center">
                <div className="text-sm font-black text-gray-700">{item.date.getDate()}</div>
                <div className="text-[10px] font-bold text-gray-400">{item.date.toLocaleDateString(undefined, { month: "short" })}</div>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-700">{item.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${item.tone}`} /> {item.label}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}