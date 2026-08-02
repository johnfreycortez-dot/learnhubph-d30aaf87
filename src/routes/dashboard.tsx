import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  Play,
  Plus,
  Search,
  Trash2,
  X,
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

// ── To-do list (stored locally per browser — there's no backend endpoint for
// this yet, so items won't sync across devices until one is added) ──
type TodoItem = { id: string; text: string; done?: boolean };
type TodoMap = Record<string, TodoItem[]>; // key: YYYY-MM-DD

const TODO_STORAGE_KEY = "lhph_todos";

function loadTodos(): TodoMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(TODO_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveTodos(todos: TodoMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}

function dateKey(d: Date) {
  // Build the key from LOCAL date parts, not toISOString() (which converts to
  // UTC and rolls the date back a day for anyone ahead of UTC, e.g. Manila
  // UTC+8). This was causing a to-do added for "Tue, Jul 28" to be stored
  // and shown under "Jul 27" instead.
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ── Dashboard data cache so returning to /dashboard renders instantly with
// last-known data instead of a full-screen spinner every single time; a
// fresh copy is still fetched quietly in the background on every mount. ──
type DashboardData = {
  modules: Niche[];
  progress: Record<string, boolean>;
  thumbMap: Record<string, string>;
  studentName: string;
  photoUrl: string;
  unread: number;
  notifications: Notif[];
};
let dashboardCache: DashboardData | null = null;

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!dashboardCache);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<Niche[]>(dashboardCache?.modules || []);
  const [progress, setProgress] = useState<Record<string, boolean>>(dashboardCache?.progress || {});
  const [thumbMap, setThumbMap] = useState<Record<string, string>>(dashboardCache?.thumbMap || {});
  const [studentName, setStudentName] = useState(dashboardCache?.studentName || "");
  const [photoUrl, setPhotoUrl] = useState(dashboardCache?.photoUrl || "");
  const [unread, setUnread] = useState(dashboardCache?.unread || 0);
  const [notifications, setNotifications] = useState<Notif[]>(dashboardCache?.notifications || []);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [search, setSearch] = useState("");
  const [todos, setTodos] = useState<TodoMap>(() => loadTodos());
  const [activeDate, setActiveDate] = useState<Date | null>(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  function addTodo(date: Date, text: string) {
    const key = dateKey(date);
    const item: TodoItem = { id: `${Date.now()}`, text };
    setTodos((prev) => ({ ...prev, [key]: [...(prev[key] || []), item] }));
  }

  function toggleTodo(key: string, id: string) {
    setTodos((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }

  function removeTodo(key: string, id: string) {
    setTodos((prev) => ({ ...prev, [key]: (prev[key] || []).filter((t) => t.id !== id) }));
  }

  async function load() {
    // Only block the whole page with a spinner if we have nothing cached yet.
    if (!dashboardCache) setLoading(true);
    setError("");
    try {
      const token = getToken();
      const [courseRes, notifRes, userRes] = await Promise.all([
        gasCall("getCourseAndProgress", token),
        gasCall("getNotifications", token),
        gasCall("getUserByTokenPublic", token),
      ]);
      const fresh: DashboardData = {
        modules: courseRes?.modules || [],
        progress: courseRes?.progress || {},
        thumbMap: courseRes?.thumbnailMap || {},
        unread: notifRes?.unread || 0,
        notifications: notifRes?.items || [],
        studentName: userRes?.user?.name || "Student",
        photoUrl: userRes?.user?.profilePhotoUrl || "",
      };
      dashboardCache = fresh;
      setModules(fresh.modules);
      setProgress(fresh.progress);
      setThumbMap(fresh.thumbMap);
      setUnread(fresh.unread);
      setNotifications(fresh.notifications);
      setStudentName(fresh.studentName);
      setPhotoUrl(fresh.photoUrl);
    } catch {
      if (!dashboardCache) setError("Failed to load dashboard data.");
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
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.title.toLowerCase().includes(q));
  }, [rows, search]);
  const { upcoming, recent } = useMemo(() => buildUpcoming(notifications, rows, todos), [notifications, rows, todos]);

  function openLesson(lessonId: string, nicheTitle?: string) {
    navigate({
      to: "/lesson/$lessonId",
      params: { lessonId },
      state: { modules, niche: nicheTitle, tab: "courses" } as any,
    });
  }

  function handleUpcomingOpen(id: string) {
    if (id.startsWith("todo::")) {
      const [, key, todoId] = id.split("::");
      toggleTodo(key, todoId);
      return;
    }
    openLesson(id);
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
    <StudentShell studentName={studentName} photoUrl={photoUrl} unread={unread} title="Dashboard">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div />
            <label className="flex w-full items-center gap-2 rounded-2xl bg-white px-4 py-3 text-gray-400 shadow-sm sm:w-80">
              <Search size={18} className="shrink-0 text-purple-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                placeholder="Search courses..."
              />
            </label>
          </div>

          <FeaturedCourse row={featured} thumbMap={thumbMap} onResume={() => resume(featured)} />

          <section>
            <h2 className="text-lg font-black">Status</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <StatusCard icon={<BookOpen size={20} />} title="Lessons" value={totals.completedLessons} total={totals.lessonCount} pct={totals.lessonPct} tone="bg-amber-50 text-orange-500" />
              <StatusCard icon={<ClipboardCheck size={20} />} title="Assignments" value={totals.completedAssignments} total={totals.assignmentCount} pct={totals.assignmentPct} tone="bg-rose-50 text-rose-500" />
              <StatusCard icon={<FileCheck2 size={20} />} title="Tests" value={totals.completedTests} total={totals.testCount} pct={totals.testPct} tone="bg-emerald-50 text-emerald-500" />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <h2 className="truncate text-lg font-black">My Progress</h2>
            <p className="mt-1 text-xs font-semibold text-gray-400">
              A quick read on where you stand across every niche you're enrolled in.
            </p>
            {filteredRows.length === 0 ? (
              <p className="mt-6 py-10 text-center text-sm text-gray-400">No courses found.</p>
            ) : (
              <ProgressBarChart rows={filteredRows} />
            )}
          </section>
        </section>

        <aside className="space-y-6">
          <CalendarWidget
            weekStart={weekStart}
            onPrev={() => setWeekStart(addDays(weekStart, -7))}
            onNext={() => setWeekStart(addDays(weekStart, 7))}
            todos={todos}
            onDayClick={(day) => setActiveDate(day)}
          />
          <UpcomingWidget upcoming={upcoming} recent={recent} onOpen={handleUpcomingOpen} />
        </aside>
      </div>

      {activeDate && (
        <DayTodoModal
          date={activeDate}
          items={todos[dateKey(activeDate)] || []}
          onAdd={(text) => addTodo(activeDate, text)}
          onToggle={(id) => toggleTodo(dateKey(activeDate), id)}
          onRemove={(id) => removeTodo(dateKey(activeDate), id)}
          onClose={() => setActiveDate(null)}
        />
      )}
    </StudentShell>
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

function ProgressBarChart({ rows }: { rows: CourseRow[] }) {
  const data = rows.map((row) => ({
    name: row.title,
    pct: row.pct,
    fill: row.tint,
    detail: `${row.completedLessons}/${row.lessonCount} lessons · ${row.completedAssignments}/${row.assignmentCount} assignments · ${row.completedTests}/${row.testCount} tests`,
  }));

  return (
    <div className="mt-4 space-y-4">
      {data.map((d) => (
        <div key={d.name} className="group relative">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-bold text-gray-700">{d.name}</span>
            <span className="shrink-0 text-xs font-bold text-gray-500">{d.pct}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-purple-50">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max(2, d.pct)}%`, backgroundColor: d.fill }}
            />
          </div>
          {/* Same detail Recharts used to show in its tooltip, now a simple hover title */}
          <p className="pointer-events-none absolute -top-7 left-0 z-10 hidden whitespace-nowrap rounded-lg border border-purple-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-md group-hover:block">
            {d.detail}
          </p>
        </div>
      ))}
    </div>
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

function CalendarWidget({
  weekStart,
  onPrev,
  onNext,
  todos,
  onDayClick,
}: {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  todos: TodoMap;
  onDayClick: (day: Date) => void;
}) {
  const days = Array.from({ length: 35 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  const month = weekStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="text-lg font-black">Calendar</h2>
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
      <p className="mt-1 text-[11px] font-semibold text-gray-300">Tap a date to add a to-do</p>
      <div className="mt-5 grid grid-cols-7 gap-y-4 text-center text-xs font-bold text-gray-400">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
        {days.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          const hasTodos = (todos[dateKey(day)] || []).length > 0;
          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className="relative mx-auto grid h-8 w-8 place-items-center"
              aria-label={`Add to-do for ${day.toLocaleDateString()}`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
                  isToday ? "bg-purple-700 text-white" : "text-gray-400 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {day.getDate()}
              </span>
              {hasTodos && (
                <span className={`absolute bottom-0.5 h-1.5 w-1.5 rounded-full ${isToday ? "bg-white" : "bg-indigo-500"}`} />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DayTodoModal({
  date,
  items,
  onAdd,
  onToggle,
  onRemove,
  onClose,
}: {
  date: Date;
  items: TodoItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  }

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900">
              {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            <p className="text-xs font-semibold text-gray-400">Add a to-do for this date</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Finish Module 2 quiz"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
          />
          <button type="button" onClick={submit} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-700 text-white hover:bg-purple-800" aria-label="Add to-do">
            <Plus size={18} />
          </button>
        </div>

        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No to-dos for this date yet.</p>
          ) : (
            items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                <input type="checkbox" checked={!!item.done} onChange={() => onToggle(item.id)} className="h-4 w-4 accent-purple-700" />
                <span className={`flex-1 text-sm font-medium ${item.done ? "text-gray-400 line-through" : "text-gray-700"}`}>{item.text}</span>
                <button type="button" onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500" aria-label="Remove to-do">
                  <Trash2 size={15} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

type UpcomingItem = { id: string; title: string; label: string; date: Date; tone: string };

function buildUpcoming(
  notifications: Notif[],
  rows: CourseRow[],
  todos: TodoMap,
): { upcoming: UpcomingItem[]; recent: UpcomingItem[] } {
  const fromTodos = Object.entries(todos).flatMap(([key, items]) =>
    items
      .filter((item) => !item.done)
      .map((item) => {
        const date = parseDateKey(key);
        if (!date) return null;
        return {
          id: `todo::${key}::${item.id}`,
          title: item.text,
          label: "To-do",
          date,
          tone: "bg-indigo-500",
        } satisfies UpcomingItem;
      })
      .filter((item): item is UpcomingItem => Boolean(item)),
  );

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

  const all = [...fromTodos, ...fromLessons, ...fromNotifications];

  // Anything from today onward is "upcoming"; anything before today is "recent".
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcoming = all
    .filter((item) => item.date.getTime() >= startOfToday.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const recent = all
    .filter((item) => item.date.getTime() < startOfToday.getTime())
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return { upcoming, recent };
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Parses a "YYYY-MM-DD" key (as produced by dateKey) back into a LOCAL Date
// at midnight. `new Date("YYYY-MM-DD")` parses as UTC midnight, which rolls
// the day back for anyone west of UTC — this avoids that.
function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
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

function UpcomingWidget({
  upcoming,
  recent,
  onOpen,
}: {
  upcoming: UpcomingItem[];
  recent: UpcomingItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Upcoming</h2>
      <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
        {upcoming.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 p-4 text-sm font-medium text-gray-400">Nothing upcoming right now.</p>
        ) : (
          <UpcomingList items={upcoming} onOpen={onOpen} />
        )}

        {recent.length > 0 && (
          <div className="mt-6 border-t border-gray-50 pt-4">
            <h3 className="text-xs font-black uppercase tracking-wide text-gray-400">Recent</h3>
            <UpcomingList items={recent} onOpen={onOpen} className="mt-2" muted />
          </div>
        )}
      </div>
    </section>
  );
}

function UpcomingList({
  items,
  onOpen,
  className = "",
  muted = false,
}: {
  items: UpcomingItem[];
  onOpen: (id: string) => void;
  className?: string;
  muted?: boolean;
}) {
  return (
    <ul className={`divide-y divide-gray-50 ${className}`}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpen(item.id)}
            className="grid w-full grid-cols-[42px_minmax(0,1fr)] gap-3 rounded-xl py-3 text-left hover:bg-purple-50/60"
          >
            <div className={`rounded-xl py-2 text-center ${muted ? "bg-gray-50/60" : "bg-gray-50"}`}>
              <div className={`text-sm font-black ${muted ? "text-gray-500" : "text-gray-700"}`}>{item.date.getDate()}</div>
              <div className="text-[10px] font-bold text-gray-400">{item.date.toLocaleDateString(undefined, { month: "short" })}</div>
            </div>
            <div className="min-w-0">
              <p className={`truncate text-sm font-bold ${muted ? "text-gray-500" : "text-gray-700"}`}>{item.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                <span className={`h-1.5 w-1.5 rounded-full ${item.tone} ${muted ? "opacity-60" : ""}`} /> {item.label}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
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
