import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Clock, Users, TrendingUp, Award, MessageSquare, BookOpen, Settings,
  LogOut, Menu, Bell, ChevronDown, ShieldCheck, X, Headphones,
} from "lucide-react";
import { clearAdminToken } from "@/lib/api";
import { AdminGuard } from "@/components/AdminGuard";
import { Spinner } from "@/components/Spinner";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useAdminQuery } from "@/components/admin/shared";

// Each tab is its own chunk, only fetched the first time a user actually
// clicks into it — this file used to bundle all ~1400 lines (every tab, every
// modal, every sub-view) into a single ~60KB chunk that loaded in full even
// if an admin only ever opens Overview.
const OverviewTab = lazy(() => import("@/components/admin/OverviewTab"));
const PendingTab = lazy(() => import("@/components/admin/PendingTab"));
const StudentsTab = lazy(() => import("@/components/admin/StudentsTab"));
const ProgressTab = lazy(() => import("@/components/admin/ProgressTab"));
const CertsTab = lazy(() => import("@/components/admin/CertsTab"));
const MessagesTab = lazy(() => import("@/components/admin/MessagesTab"));
const LiveSupportTab = lazy(() => import("@/components/admin/LiveSupportTab"));
const CoursesTab = lazy(() => import("@/components/admin/CoursesTab"));
const SettingsTab = lazy(() => import("@/components/admin/SettingsTab"));

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — LearnHub PH" },
      { name: "description", content: "Admin dashboard." },
      { property: "og:title", content: "Admin Dashboard — LearnHub PH" },
      { property: "og:description", content: "Admin dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  ),
});

type Tab = "overview" | "pending" | "students" | "progress" | "certs" | "messages" | "livesupport" | "courses" | "settings";

type NavItem = { key: Tab; label: string; icon: ReactNode };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ key: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> }],
  },
  {
    label: "Manage",
    items: [
      { key: "pending", label: "Pending Payments", icon: <Clock size={18} /> },
      { key: "students", label: "All Students", icon: <Users size={18} /> },
      { key: "progress", label: "Progress", icon: <TrendingUp size={18} /> },
      { key: "certs", label: "Certificates", icon: <Award size={18} /> },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
      { key: "livesupport", label: "Live Support", icon: <Headphones size={18} /> },
      { key: "courses", label: "Courses", icon: <BookOpen size={18} /> },
    ],
  },
  {
    label: "System",
    items: [{ key: "settings", label: "Settings", icon: <Settings size={18} /> }],
  },
];

const NAV_FLAT: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

function TabFallback() {
  return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // Lightweight fetch just to surface an unread-messages badge in the topbar.
  // Uses the same react-query cache key as OverviewTab's own "adminGetStats"
  // call, so switching to Overview doesn't trigger a second network request.
  const badge = useAdminQuery("adminGetStats");
  const unread = Number((badge.data as any)?.unrepliedMsgs || 0);

  function logout() {
    clearAdminToken();
    navigate({ to: "/login" });
  }

  const activeLabel = NAV_FLAT.find((n) => n.key === tab)?.label || "Overview";

  function go(key: Tab) {
    setTab(key);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-950">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-100 bg-white shadow-sm transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-gray-100 px-5 py-6">
          <div className="min-w-0">
            <p className="truncate text-lg font-black leading-none">
              LearnHub <span className="learnhub-ph-glow">PH</span>
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
              <ShieldCheck size={11} /> Admin Panel
            </div>
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

        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((n) => {
                  const active = tab === n.key;
                  const showDot = n.key === "messages" && unread > 0;
                  return (
                    <button
                      key={n.key}
                      onClick={() => go(n.key)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                          : "text-gray-500 hover:bg-gray-50 hover:text-purple-700"
                      }`}
                    >
                      {n.icon}
                      <span className="flex-1 text-left">{n.label}</span>
                      {showDot && (
                        <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-red-500"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-4 py-5">
          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gray-50 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black sm:text-2xl">{activeLabel}</h1>
                <p className="hidden truncate text-xs font-medium text-gray-400 sm:block">
                  Manage your LearnHub PH platform
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => go("messages")}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700"
                aria-label="Messages"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex min-w-0 items-center gap-2 rounded-full p-1 hover:bg-gray-50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-sm font-black text-white shadow-sm">
                    AD
                  </span>
                  <span className="hidden max-w-[120px] truncate text-sm font-bold text-gray-700 sm:inline">
                    Admin
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
                        onClick={() => {
                          setMenuOpen(false);
                          go("settings");
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                      >
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmingLogout(true);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<TabFallback />}>
            {tab === "overview" && <OverviewTab />}
            {tab === "pending" && <PendingTab />}
            {tab === "students" && <StudentsTab />}
            {tab === "progress" && <ProgressTab />}
            {tab === "certs" && <CertsTab />}
            {tab === "messages" && <MessagesTab />}
            {tab === "livesupport" && <LiveSupportTab />}
            {tab === "courses" && <CoursesTab />}
            {tab === "settings" && <SettingsTab />}
          </Suspense>
        </main>
      </div>

      <ConfirmModal
        isOpen={confirmingLogout}
        title="Log out?"
        message="You'll need to enter your admin PIN again to get back in."
        confirmLabel="Log Out"
        confirmVariant="danger"
        onConfirm={logout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}
