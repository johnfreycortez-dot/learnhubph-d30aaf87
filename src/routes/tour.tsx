import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Compass,
  Download,
  FileCheck2,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Palette,
  Play,
  PlayCircle,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NICHES, type Niche } from "../data/niches";
import { canonicalLink } from "../lib/seo";
import { ChatWidget } from "../components/ChatWidget";

export const Route = createFileRoute("/tour")({
  head: () => ({
    meta: [
      { title: "Take a Tour — LearnHub PH" },
      {
        name: "description",
        content:
          "Preview the real LearnHub PH student dashboard — browse all 9 VA niches and 81 real lesson topics, try the chatbot, and explore every page before you sign up.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Take a Tour — LearnHub PH" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonicalLink("/tour")],
  }),
  component: TourPage,
});

const goToLogin = () => {
  window.location.href = "/login";
};

type ViewKey = "dashboard" | "courses" | "certificates" | "settings" | "messages" | "notifications";

const VIEW_TITLE: Record<ViewKey, string> = {
  dashboard: "Dashboard",
  courses: "Courses",
  certificates: "My Certificates",
  settings: "Settings",
  messages: "Messages",
  notifications: "Notifications",
};

const NAV: { key: ViewKey; label: string; icon: ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "courses", label: "Courses", icon: <BookOpen size={18} /> },
  { key: "certificates", label: "My Certificates", icon: <Award size={18} /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} /> },
];

// Fake, believable-but-not-real per-student numbers. Deterministic per niche
// (based on index) so the demo looks the same on every visit instead of
// jumping around, without needing any backend.
function fakeNichePct(index: number) {
  const pattern = [65, 100, 30, 0, 0, 15, 0, 0, 0];
  return pattern[index] ?? 0;
}

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

// Same category icon per niche, in the same order, as the live /courses page.
const NICHE_ICONS: LucideIcon[] = [
  CalendarDays,
  BriefcaseBusiness,
  ShieldCheck,
  Palette,
  WalletCards,
  ShoppingCart,
  Settings2,
  Headphones,
  CalendarDays,
];

function nicheIcon(index: number): LucideIcon {
  return NICHE_ICONS[index % NICHE_ICONS.length] || BookOpen;
}

const FAKE_NAME = "Albert Johanson Jr.";
const FAKE_EMAIL = "albert.johanson@learnhub.com";
const TOTAL_LESSONS = NICHES.reduce(
  (sum, n) => sum + n.modules.reduce((s, m) => s + m.lessons.length, 0),
  0,
);

const FAKE_NOTIFICATIONS = [
  {
    id: "n1",
    type: "quiz",
    title: "Quiz passed!",
    body: 'You scored 90% on "What is Social Media Management?" — nice work.',
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n2",
    type: "reply",
    title: "New reply from support",
    body: "Hi Albert, thanks for your question — all 9 niches unlock the moment your payment is verified, no waiting per niche.",
    time: "1 day ago",
    read: false,
  },
  {
    id: "n3",
    type: "payment",
    title: "Payment verified",
    body: "Your ₱399 lifetime access has been confirmed. Welcome aboard!",
    time: "3 days ago",
    read: true,
  },
];

const FAKE_THREAD = [
  {
    sender: "student" as const,
    body: "Hi! Do I need to finish one niche before starting another?",
    time: "Jul 20, 10:14 AM",
  },
  {
    sender: "admin" as const,
    body: "Hi Juan! Nope — all 9 niches unlock right away. Learn in whichever order fits your goals.",
    time: "Jul 20, 11:02 AM",
  },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

// ── Local to-do list (same self-contained, localStorage-only pattern as the
// real dashboard — no backend involved either way, so this works exactly
// the same in the tour as it does for a real, signed-up student). ──
type TodoItem = { id: string; text: string; done?: boolean };
type TodoMap = Record<string, TodoItem[]>;
const TOUR_TODO_KEY = "lhph_tour_todos";

function loadTodos(): TodoMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(TOUR_TODO_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveTodos(todos: TodoMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOUR_TODO_KEY, JSON.stringify(todos));
}
function dateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function TourPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<ViewKey>("dashboard");
  const [coursesIndex, setCoursesIndex] = useState<number | null>(null);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedTitle, setLockedTitle] = useState("");
  const [notifs, setNotifs] = useState(FAKE_NOTIFICATIONS);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [todos, setTodos] = useState<TodoMap>(() => loadTodos());
  const [activeDate, setActiveDate] = useState<Date | null>(null);

  function openLocked(title: string) {
    setLockedTitle(title);
    setLockedModalOpen(true);
  }

  function goToView(key: ViewKey) {
    setView(key);
    setSidebarOpen(false);
    setMenuOpen(false);
  }

  function updateTodos(next: TodoMap) {
    setTodos(next);
    saveTodos(next);
  }
  function addTodo(date: Date, text: string) {
    const key = dateKey(date);
    const item: TodoItem = { id: `${Date.now()}`, text };
    updateTodos({ ...todos, [key]: [...(todos[key] || []), item] });
  }
  function toggleTodo(key: string, id: string) {
    updateTodos({
      ...todos,
      [key]: (todos[key] || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    });
  }
  function removeTodo(key: string, id: string) {
    updateTodos({ ...todos, [key]: (todos[key] || []).filter((t) => t.id !== id) });
  }

  const initials = useMemo(() => initialsOf(FAKE_NAME), []);
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-950">
      {/* Demo mode banner */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-purple-700 px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Compass size={14} /> You're previewing a demo — everything here is sample data.
        </span>
        <button
          type="button"
          onClick={goToLogin}
          className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-purple-700 hover:bg-purple-50 sm:text-xs"
        >
          Get Started — ₱399 <span className="hidden sm:inline">lifetime access</span>
        </button>
        <a
          href="/"
          className="text-[11px] font-semibold text-purple-100 underline hover:text-white sm:text-xs"
        >
          Exit Tour
        </a>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[246px] flex-col border-r border-gray-100 bg-white shadow-sm transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 top-[76px]" : "-translate-x-full top-[76px]"
        } lg:top-[38px]`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-6">
          <div className="min-w-0">
            <p className="truncate text-lg font-black leading-none">
              LearnHub <span className="learnhub-ph-glow">PH</span>
            </p>
            <p className="truncate text-[11px] font-semibold text-gray-400">Demo Dashboard</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {NAV.map((n) => (
            <button
              key={n.key}
              type="button"
              onClick={() => goToView(n.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                view === n.key
                  ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-purple-700"
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        <div className="space-y-2 border-t border-gray-100 px-4 py-5">
          <a
            href="/help"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-purple-700"
          >
            <HelpCircle size={18} /> Help
          </a>
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} /> Exit Tour
          </button>
        </div>
      </aside>

      <div className="lg:pl-[246px]">
        <header className="sticky top-[38px] z-30 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-gray-50 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <h1 className="truncate text-xl font-black sm:text-2xl">{VIEW_TITLE[view]}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => goToView("messages")}
                className="hidden h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700 sm:grid"
                aria-label="Messages"
              >
                <MessageSquare size={18} />
              </button>
              <button
                type="button"
                onClick={() => goToView("notifications")}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex min-w-0 items-center gap-2 rounded-full p-1 hover:bg-gray-50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-100 text-sm font-black text-purple-700">
                    {initials}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-sm font-bold text-gray-700 sm:inline">
                    {FAKE_NAME}
                  </span>
                  <ChevronDown size={16} className="hidden text-gray-400 sm:block" />
                </button>
                {menuOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40"
                      aria-label="Close menu"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                      <button
                        type="button"
                        onClick={() => goToView("notifications")}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                      >
                        Notifications
                      </button>
                      <button
                        type="button"
                        onClick={() => (window.location.href = "/")}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Exit Tour
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {view === "dashboard" && (
            <DashboardView
              onLockedLesson={openLocked}
              weekStart={weekStart}
              setWeekStart={setWeekStart}
              todos={todos}
              onDayClick={setActiveDate}
              notifs={notifs}
              onOpenCourses={(index) => {
                setCoursesIndex(index);
                goToView("courses");
              }}
            />
          )}
          {view === "courses" && (
            <CoursesView
              onLockedLesson={openLocked}
              activeIndex={coursesIndex}
              onSelectIndex={setCoursesIndex}
            />
          )}
          {view === "certificates" && <CertificatesView onLockedCertificate={openLocked} />}
          {view === "settings" && <SettingsView onLockedAction={openLocked} />}
          {view === "messages" && <MessagesView onLockedSend={openLocked} />}
          {view === "notifications" && <NotificationsView notifs={notifs} setNotifs={setNotifs} />}

          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-purple-700 p-6 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-base font-black">Like what you see?</p>
              <p className="text-sm text-purple-100">
                Get lifetime access to all {NICHES.length} niches and {TOTAL_LESSONS} lessons for a
                one-time ₱399.
              </p>
            </div>
            <button
              type="button"
              onClick={goToLogin}
              className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-purple-700 hover:bg-purple-50"
            >
              Get Started Now
            </button>
          </div>
        </main>
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

      {lockedModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-purple-100 text-purple-700">
              <Lock size={20} />
            </div>
            <h3 className="mt-4 text-base font-black text-gray-900">This is locked in the demo</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              {lockedTitle ? `"${lockedTitle}" is` : "This"} part of full access. Sign up for
              lifetime access (₱399 one-time) to unlock every lesson, quiz, certificate, and message
              with your instructor.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={goToLogin}
                className="rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-800"
              >
                Get Started — ₱399
              </button>
              <button
                type="button"
                onClick={() => setLockedModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50"
              >
                Keep exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real chatbot + live-support widget — fully explorable. FAQ answers
          are backed by the same public knowledge base real students use;
          "Talk to a Human" naturally requires a real account, exactly like
          it would after sign-up. */}
      <ChatWidget />
    </div>
  );
}

/* ------------------------- Dashboard view ------------------------- */

type DashRow = {
  title: string;
  index: number;
  pct: number;
  lessonCount: number;
  completedLessons: number;
  tint: string;
};

function DashboardView({
  onLockedLesson,
  weekStart,
  setWeekStart,
  todos,
  onDayClick,
  onOpenCourses,
  notifs,
}: {
  onLockedLesson: (title: string) => void;
  weekStart: Date;
  setWeekStart: (d: Date) => void;
  todos: TodoMap;
  onDayClick: (d: Date) => void;
  onOpenCourses: (index: number) => void;
  notifs: typeof FAKE_NOTIFICATIONS;
}) {
  const [search, setSearch] = useState("");

  const rows: DashRow[] = NICHES.map((n, i) => {
    const lessonCount = n.modules.reduce((s, m) => s + m.lessons.length, 0);
    const pct = fakeNichePct(i);
    return {
      title: n.title,
      index: i,
      pct,
      lessonCount,
      completedLessons: Math.round((pct / 100) * lessonCount),
      tint: NICHE_TINT[i % NICHE_TINT.length],
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      lessonCount: acc.lessonCount + r.lessonCount,
      completedLessons: acc.completedLessons + r.completedLessons,
    }),
    { lessonCount: 0, completedLessons: 0 },
  );
  const lessonPct = totals.lessonCount ? Math.round((totals.completedLessons / totals.lessonCount) * 100) : 0;

  const featured = rows.find((r) => r.pct < 100) || rows[0];
  const filteredRows = search.trim()
    ? rows.filter((r) => r.title.toLowerCase().includes(search.trim().toLowerCase()))
    : rows;

  const upcoming = useMemo(() => buildTourUpcoming(notifs, todos), [notifs, todos]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-gray-500">
            Welcome back, {FAKE_NAME.split(" ")[0]}! 👋 This is a live preview — everything on this
            page works the same way it will once you sign up.
          </p>
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

        <FeaturedCourse row={featured} onResume={() => onOpenCourses(featured.index)} />

        <section>
          <h2 className="text-lg font-black">Status</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <StatusCard
              icon={<BookOpen size={20} />}
              title="Lessons"
              value={totals.completedLessons}
              total={totals.lessonCount}
              pct={lessonPct}
              tone="bg-amber-50 text-orange-500"
            />
            <StatusCard icon={<ClipboardCheck size={20} />} title="Assignments" value={0} total={0} pct={0} tone="bg-rose-50 text-rose-500" />
            <StatusCard icon={<FileCheck2 size={20} />} title="Tests" value={0} total={0} pct={0} tone="bg-emerald-50 text-emerald-500" />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <h2 className="truncate text-lg font-black">My Progress</h2>
          <p className="mt-1 text-xs font-semibold text-gray-400">
            A quick read on where you stand across every niche you're enrolled in.
          </p>
          {filteredRows.length === 0 ? (
            <p className="mt-6 text-center text-sm text-gray-400">No niches match "{search}".</p>
          ) : (
            <ProgressBarChart rows={filteredRows.map((r) => ({ name: r.title, pct: r.pct, fill: r.tint }))} />
          )}
        </section>
      </section>

      <aside className="space-y-6">
        <CalendarWidget
          weekStart={weekStart}
          onPrev={() => setWeekStart(addDays(weekStart, -7))}
          onNext={() => setWeekStart(addDays(weekStart, 7))}
          todos={todos}
          onDayClick={onDayClick}
        />
        <UpcomingWidget items={upcoming} onOpen={(id) => onLockedLesson(id)} />
      </aside>
    </div>
  );
}

function CourseIcon({ row, size = "md" }: { row: DashRow; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-10 w-10" : "h-11 w-11";
  return (
    <span
      className={`grid ${dims} shrink-0 place-items-center overflow-hidden rounded-xl text-xs font-black text-white`}
      style={{ background: row.tint }}
    >
      {row.title.slice(0, 2).toUpperCase()}
    </span>
  );
}

function FeaturedCourse({ row, onResume }: { row: DashRow; onResume: () => void }) {
  return (
    <section className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <div className="flex min-w-0 items-center gap-4">
        <CourseIcon row={row} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-700">{row.title}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${row.pct}%` }} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
          <BookOpen size={14} /> {row.lessonCount}
        </span>
        <button
          type="button"
          onClick={onResume}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700 hover:bg-purple-100"
        >
          <Play size={16} /> Resume
        </button>
      </div>
    </section>
  );
}

function StatusCard({
  icon,
  title,
  value,
  total,
  pct,
  tone,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  total: number;
  pct: number;
  tone: string;
}) {
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#c084fc"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-black text-purple-500">{pct}%</span>
    </div>
  );
}

type UpcomingItem = { id: string; title: string; label: string; date: Date; tone: string };

function buildTourUpcoming(notifs: typeof FAKE_NOTIFICATIONS, todos: TodoMap): UpcomingItem[] {
  const fromTodos = Object.entries(todos).flatMap(([key, items]) =>
    items
      .filter((item) => !item.done)
      .map((item) => {
        const date = parseDateKey(key);
        if (!date) return null;
        return { id: `todo::${key}::${item.id}`, title: item.text, label: "To-do", date, tone: "bg-indigo-500" } satisfies UpcomingItem;
      })
      .filter((item): item is UpcomingItem => Boolean(item)),
  );

  const today = new Date();
  const fromNotifs = notifs.map((n, i) => ({
    id: `notif-${n.id}`,
    title: n.title,
    label: n.type === "payment" ? "Payment" : n.type === "quiz" ? "Test" : "Message",
    date: addDays(today, i),
    tone: n.type === "payment" ? "bg-amber-500" : n.type === "quiz" ? "bg-emerald-500" : "bg-sky-500",
  }));

  return [...fromTodos, ...fromNotifs].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
}

function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function UpcomingWidget({ items, onOpen }: { items: UpcomingItem[]; onOpen: (title: string) => void }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Upcoming</h2>
      {items.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm font-medium text-gray-400">Nothing on the horizon yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-50">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item.title)}
                className="grid w-full grid-cols-[42px_minmax(0,1fr)] gap-3 rounded-xl py-3 text-left hover:bg-purple-50/60"
              >
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
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProgressBarChart({ rows }: { rows: { name: string; pct: number; fill: string }[] }) {
  const height = Math.max(220, rows.length * 54);
  return (
    <div className="mt-4" style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 32, top: 8, bottom: 8 }}>
          <CartesianGrid horizontal={false} stroke="#f3e8ff" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 12, fontWeight: 700, fill: "#374151" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Progress"]}
            labelFormatter={(label) => label}
            contentStyle={{ borderRadius: 12, border: "1px solid #f3e8ff", fontSize: 12 }}
          />
          <Bar dataKey="pct" radius={[0, 8, 8, 0]} barSize={18}>
            {rows.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 11, fontWeight: 700, fill: "#6b7280" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
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
          <button
            type="button"
            onClick={onPrev}
            className="grid h-8 w-8 place-items-center rounded-full text-purple-600 hover:bg-purple-50"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="grid h-8 w-8 place-items-center rounded-full text-purple-600 hover:bg-purple-50"
            aria-label="Next week"
          >
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
                  isToday
                    ? "bg-purple-700 text-white"
                    : "text-gray-400 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {day.getDate()}
              </span>
              {hasTodos && (
                <span
                  className={`absolute bottom-0.5 h-1.5 w-1.5 rounded-full ${isToday ? "bg-white" : "bg-indigo-500"}`}
                />
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
              {date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <p className="text-xs font-semibold text-gray-400">Add a to-do for this date</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
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
          <button
            type="button"
            onClick={submit}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-700 text-white hover:bg-purple-800"
            aria-label="Add to-do"
          >
            <Plus size={18} />
          </button>
        </div>

        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No to-dos for this date yet.</p>
          ) : (
            items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                <input
                  type="checkbox"
                  checked={!!item.done}
                  onChange={() => onToggle(item.id)}
                  className="h-4 w-4 accent-purple-700"
                />
                <span
                  className={`flex-1 text-sm font-medium ${item.done ? "text-gray-400 line-through" : "text-gray-700"}`}
                >
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-gray-300 hover:text-red-500"
                  aria-label="Remove to-do"
                >
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

/* ------------------------- Courses view ------------------------- */

function CoursesView({
  onLockedLesson,
  activeIndex,
  onSelectIndex,
}: {
  onLockedLesson: (title: string) => void;
  activeIndex: number | null;
  onSelectIndex: (index: number | null) => void;
}) {
  const [search, setSearch] = useState("");

  if (activeIndex !== null) {
    return (
      <NicheDetail
        niche={NICHES[activeIndex]}
        index={activeIndex}
        onBack={() => onSelectIndex(null)}
        onLockedLesson={onLockedLesson}
      />
    );
  }

  const filtered = NICHES.filter(
    (n) => !search.trim() || n.title.toLowerCase().includes(search.trim().toLowerCase()) || n.short.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-black">Choose a learning path</h2>
      <p className="mt-1 text-sm text-gray-500">Explore every VA specialization and start learning at your own pace.</p>

      <div className="relative mt-5 max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((niche) => {
          const i = NICHES.indexOf(niche);
          const Icon = nicheIcon(i);
          return (
            <article key={niche.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl"
                  style={{ backgroundColor: `${niche.back}18`, color: niche.back }}
                >
                  <Icon size={24} strokeWidth={2.25} />
                </span>
                <BookOpen className="text-purple-600" />
              </div>
              <h3 className="mt-5 font-black">{niche.title}</h3>
              <p className="mt-2 min-h-10 text-sm leading-6 text-gray-500">{niche.short}</p>
              <button
                type="button"
                onClick={() => onSelectIndex(i)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-800"
              >
                View course <ChevronRight size={16} />
              </button>
            </article>
          );
        })}
        {filtered.length === 0 && <p className="col-span-full text-sm text-gray-500">No courses match "{search}".</p>}
      </div>
    </div>
  );
}

function NicheDetail({
  niche,
  index,
  onBack,
  onLockedLesson,
}: {
  niche: Niche;
  index: number;
  onBack: () => void;
  onLockedLesson: (title: string) => void;
}) {
  const [search, setSearch] = useState("");
  const pct = fakeNichePct(index);
  const allLessons = niche.modules.flatMap((m) => m.lessons);
  const lessonCount = allLessons.length;
  const completedCount = Math.min(lessonCount, Math.round((pct / 100) * lessonCount));
  // First `completedCount` lessons (in order) are done, the very next one is
  // unlocked, and everything after that is locked — same rule the real
  // course page uses (complete the previous lesson to unlock the next).
  const doneSet = new Set(allLessons.slice(0, completedCount));
  const nextLesson = allLessons[completedCount];
  const q = search.trim().toLowerCase();

  return (
    <div className="mx-auto max-w-4xl">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:underline">
        <ChevronLeft size={16} /> All courses
      </button>

      <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-purple-600">YOUR LEARNING PATH</p>
        <h2 className="mt-2 text-3xl font-black">{niche.title}</h2>
        <p className="mt-2 text-sm text-gray-500">
          {completedCount} of {lessonCount} lessons completed
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-purple-100">
          <div className="h-full rounded-full bg-purple-700" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <div className="relative mt-6 max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search lessons..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div className="mt-6 space-y-4">
        {niche.modules
          .map((module, mi) => ({
            module,
            mi,
            lessons: module.lessons.filter((l) => !q || l.toLowerCase().includes(q)),
          }))
          .filter(({ lessons }) => lessons.length > 0)
          .map(({ module, mi, lessons }) => (
            <section key={module.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-black">
                Module {mi + 1}: {module.title}
              </h3>
              <div className="mt-3 divide-y">
                {lessons.map((lesson) => {
                  const done = doneSet.has(lesson);
                  const unlocked = done || lesson === nextLesson;
                  return (
                    <button
                      key={lesson}
                      type="button"
                      title={unlocked ? undefined : "Complete the previous lesson to unlock"}
                      onClick={() => onLockedLesson(lesson)}
                      className={`flex w-full items-center gap-3 py-3 text-left ${unlocked ? "hover:text-purple-700" : "cursor-not-allowed opacity-50"}`}
                    >
                      {done ? (
                        <CheckCircle2 size={19} className="shrink-0 text-emerald-500" />
                      ) : unlocked ? (
                        <Circle size={19} className="shrink-0 text-gray-300" />
                      ) : (
                        <Lock size={17} className="shrink-0 text-gray-300" />
                      )}
                      <span
                        className="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-lg text-white"
                        style={{ background: niche.back }}
                      >
                        <PlayCircle size={18} />
                      </span>
                      <span className="flex-1 text-sm font-semibold">{lesson}</span>
                      {unlocked ? <PlayCircle size={18} className="shrink-0" /> : <Lock size={16} className="shrink-0 text-gray-300" />}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}

/* ------------------------- Certificates view ------------------------- */

function CertificatesView({
  onLockedCertificate,
}: {
  onLockedCertificate: (title: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-500">
        Complete all lessons in a niche to earn your certificate.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {NICHES.map((niche, i) => {
          const pct = fakeNichePct(i);
          const lessonCount = niche.modules.reduce((s, m) => s + m.lessons.length, 0);
          const done = Math.round((pct / 100) * lessonCount);
          const complete = pct === 100;
          return (
            <div key={niche.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-purple-600" />
                <h3 className="font-bold">{niche.title}</h3>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-purple-600" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {done} / {lessonCount} lessons completed
              </p>
              {complete ? (
                <>
                  <span className="mt-3 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    Completed
                  </span>
                  <button
                    onClick={() => onLockedCertificate(`${niche.title} Certificate`)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700"
                  >
                    <Download size={18} /> Download Certificate
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-3 text-xs text-gray-500">
                    {lessonCount - done} lessons remaining
                  </p>
                  <button
                    onClick={() => onLockedCertificate(`${niche.title} Certificate`)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 font-semibold text-gray-500 hover:bg-gray-200"
                  >
                    <Lock size={18} /> Certificate Locked
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------- Settings view ------------------------- */

function SettingsView({ onLockedAction }: { onLockedAction: (title: string) => void }) {
  const [name, setName] = useState(FAKE_NAME);
  const initials = initialsOf(name || FAKE_NAME);

  return (
    <div className="max-w-xl">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-black text-gray-900">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-purple-100 text-lg font-black text-purple-700">
              {initials}
            </span>
            <button
              type="button"
              onClick={() => onLockedAction("Change Profile Photo")}
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-purple-700 text-white shadow-sm hover:bg-purple-800"
              aria-label="Change photo"
            >
              <Camera size={13} />
            </button>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{name || FAKE_NAME}</p>
            <p className="text-xs text-gray-400">{FAKE_EMAIL}</p>
          </div>
        </div>

        <label className="mt-6 block text-xs font-bold text-gray-500">Display Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500"
        />

        <label className="mt-4 block text-xs font-bold text-gray-500">Email</label>
        <input
          value={FAKE_EMAIL}
          disabled
          className="mt-1.5 w-full rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-400"
        />

        <button
          type="button"
          onClick={() => onLockedAction("Save Profile Changes")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-800"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>
    </div>
  );
}

/* ------------------------- Messages view ------------------------- */

function MessagesView({ onLockedSend }: { onLockedSend: (title: string) => void }) {
  const [draft, setDraft] = useState("");

  function attemptSend(e?: React.FormEvent) {
    e?.preventDefault();
    onLockedSend("Send a Message");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-sm font-black text-gray-900">Conversation with LearnHub PH Support</p>
          <p className="text-xs text-gray-400">
            Sample conversation — sign up to message your instructor directly.
          </p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
          {FAKE_THREAD.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.sender === "student" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.sender === "student"
                    ? "rounded-br-sm bg-purple-700 text-white"
                    : "rounded-bl-sm border border-gray-100 bg-white text-gray-700 shadow-sm"
                }`}
              >
                {m.body}
                <div
                  className={`mt-1 text-[10px] ${m.sender === "student" ? "text-purple-200" : "text-gray-300"}`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={attemptSend}
          className="flex items-center gap-2 border-t border-gray-100 bg-white p-3"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-700 text-white hover:bg-purple-800"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------- Notifications view ------------------------- */

function NotificationsView({
  notifs,
  setNotifs,
}: {
  notifs: typeof FAKE_NOTIFICATIONS;
  setNotifs: (fn: (prev: typeof FAKE_NOTIFICATIONS) => typeof FAKE_NOTIFICATIONS) => void;
}) {
  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-2">
        <Bell size={20} className="text-purple-600" />
        <h2 className="text-lg font-black">Notifications</h2>
        {unread > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {unread} new
          </span>
        )}
      </div>
      <ul className="mt-5 space-y-3">
        {notifs.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => markRead(n.id)}
              className={`flex w-full gap-3 rounded-xl border-l-4 p-4 text-left shadow-sm ${
                n.type === "payment"
                  ? "border-green-500"
                  : n.type === "quiz"
                    ? "border-purple-500"
                    : "border-blue-500"
              } ${n.read ? "bg-white" : "bg-purple-50"}`}
            >
              {n.type === "payment" ? (
                <ClipboardCheck size={20} className="mt-0.5 shrink-0 text-purple-600" />
              ) : n.type === "quiz" ? (
                <FileCheck2 size={20} className="mt-0.5 shrink-0 text-purple-600" />
              ) : (
                <MessageSquare size={20} className="mt-0.5 shrink-0 text-purple-600" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900">{n.title}</p>
                  <span className="shrink-0 text-[10px] text-gray-400">{n.time}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{n.body}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TourPage;
