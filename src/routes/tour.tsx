import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Compass,
  GraduationCap,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { NICHES, type Niche } from "../data/niches";
import { canonicalLink } from "../lib/seo";

export const Route = createFileRoute("/tour")({
  head: () => ({
    meta: [
      { title: "Take a Tour — LearnHub PH" },
      {
        name: "description",
        content: "Preview the LearnHub PH student dashboard — see all 9 VA niches and 81 real lesson topics before you sign up.",
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

const NAV = [
  { label: "Dashboard", icon: <GraduationCap size={18} />, active: true },
  { label: "Courses", icon: <BookOpen size={18} />, active: false },
  { label: "My Certificates", icon: <Award size={18} />, active: false },
  { label: "Settings", icon: <Settings size={18} />, active: false },
];

// Fake, believable-but-not-real per-student numbers. Deterministic per niche
// (based on index) so the demo looks the same on every visit instead of
// jumping around, without needing any backend.
function fakeNichePct(index: number) {
  const pattern = [65, 100, 30, 0, 0, 15, 0, 0, 0];
  return pattern[index] ?? 0;
}

const FAKE_NAME = "Juan Dela Cruz";
const TOTAL_LESSONS = NICHES.reduce((sum, n) => sum + n.modules.reduce((s, m) => s + m.lessons.length, 0), 0);
const FAKE_COMPLETED_LESSONS = 8;
const FAKE_CERTIFICATES = 1;
const FAKE_OVERALL_PCT = Math.round((FAKE_COMPLETED_LESSONS / TOTAL_LESSONS) * 100);

function TourPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedLessonTitle, setLockedLessonTitle] = useState("");

  function openLocked(title: string) {
    setLockedLessonTitle(title);
    setLockedModalOpen(true);
  }

  const initials = useMemo(
    () =>
      FAKE_NAME.split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase(),
    [],
  );

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
        <a href="/" className="text-[11px] font-semibold text-purple-100 underline hover:text-white sm:text-xs">
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
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {NAV.map((n) => (
            <button
              key={n.label}
              type="button"
              onClick={() => (n.active ? undefined : openLocked(n.label))}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                n.active
                  ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-purple-700"
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        <div className="space-y-2 border-t border-gray-100 px-4 py-5">
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
              <h1 className="truncate text-xl font-black sm:text-2xl">Dashboard</h1>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => openLocked("Messages")}
                className="hidden h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700 sm:grid"
                aria-label="Messages (locked in demo)"
              >
                <MessageSquare size={18} />
              </button>
              <div className="flex items-center gap-2 rounded-full p-1">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-100 text-sm font-black text-purple-700">
                  {initials}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-bold text-gray-700 sm:inline">
                  {FAKE_NAME}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <p className="mb-6 text-sm font-semibold text-gray-500">
            Welcome back, {FAKE_NAME.split(" ")[0]}! 👋 Here's a sample of what your real dashboard looks like.
          </p>

          {/* Fake stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={<BookOpen size={16} />} label="Niches Enrolled" value={NICHES.length} />
            <StatCard icon={<TrendingUp size={16} />} label="Lessons Completed" value={`${FAKE_COMPLETED_LESSONS}/${TOTAL_LESSONS}`} />
            <StatCard icon={<Award size={16} />} label="Certificates Earned" value={FAKE_CERTIFICATES} />
            <StatCard icon={<Sparkles size={16} />} label="Overall Progress" value={`${FAKE_OVERALL_PCT}%`} />
          </div>

          {/* Courses list — real niche/lesson titles, locked */}
          <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Your Courses</h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                Preview only — sign up to unlock
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {NICHES.map((niche, i) => (
                <NicheCard
                  key={niche.title}
                  niche={niche}
                  index={i}
                  isOpen={expanded === i}
                  onToggle={() => setExpanded((cur) => (cur === i ? null : i))}
                  onLockedLesson={openLocked}
                />
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-purple-700 p-6 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-base font-black">Like what you see?</p>
              <p className="text-sm text-purple-100">
                Get lifetime access to all {NICHES.length} niches and {TOTAL_LESSONS} lessons for a one-time ₱399.
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

      {lockedModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-purple-100 text-purple-700">
              <Lock size={20} />
            </div>
            <h3 className="mt-4 text-base font-black text-gray-900">This is locked in the demo</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              {lockedLessonTitle ? `"${lockedLessonTitle}" is` : "This"} part of full access. Sign up for lifetime
              access (₱399 one-time) to unlock every lesson, quiz, and certificate.
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
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-purple-700">{icon}</div>
      <p className="mt-2 text-xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-semibold text-gray-400">{label}</p>
    </div>
  );
}

function NicheCard({
  niche,
  index,
  isOpen,
  onToggle,
  onLockedLesson,
}: {
  niche: Niche;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onLockedLesson: (title: string) => void;
}) {
  const pct = fakeNichePct(index);
  const lessonCount = niche.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 bg-white p-4 text-left hover:bg-gray-50/60"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-black text-white"
            style={{ background: niche.back }}
          >
            {niche.title.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">{niche.title}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-purple-600" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] font-bold text-gray-400">
                {pct}% · {lessonCount} lessons
              </span>
            </div>
          </div>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="space-y-3 border-t border-gray-100 bg-gray-50/60 p-4">
          {niche.modules.map((module) => (
            <div key={module.title}>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">{module.title}</p>
              <ul className="space-y-1.5">
                {module.lessons.map((lesson) => (
                  <li key={lesson}>
                    <button
                      type="button"
                      onClick={() => onLockedLesson(lesson)}
                      className="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-3.5 py-2.5 text-left text-sm font-semibold text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Lock size={13} className="shrink-0 text-gray-300" />
                        <span className="truncate">{lesson}</span>
                      </span>
                      <ChevronRight size={14} className="shrink-0 text-gray-300" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TourPage;
