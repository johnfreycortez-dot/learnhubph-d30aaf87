import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  Bell,
  BookOpen,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  X,
} from "lucide-react";
import { clearToken } from "@/lib/api";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useStudentIdentity } from "@/hooks/useStudentIdentity";

type NavItem = { to: string; label: string; icon: ReactNode; match?: string[] };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, match: ["/dashboard"] },
  { to: "/courses", label: "Courses", icon: <BookOpen size={18} />, match: ["/courses"] },
  { to: "/certificates", label: "My Certificates", icon: <Award size={18} />, match: ["/certificates"] },
  { to: "/help", label: "Help", icon: <HelpCircle size={18} />, match: ["/help"] },
  { to: "/settings", label: "Settings", icon: <Settings size={18} />, match: ["/settings"] },
];

export function StudentShell({
  children,
  studentName,
  photoUrl,
  unread,
  title,
}: {
  children: ReactNode;
  studentName?: string;
  photoUrl?: string;
  unread?: number;
  title?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const identity = useStudentIdentity();

  // A page can pass its own studentName/photoUrl/unread (e.g. Dashboard,
  // or Settings right after a save) to reflect changes instantly. Any page
  // that doesn't pass these falls back to the shared identity hook, so
  // every page shows the same real name/photo instead of a generic "Student".
  const name = studentName ?? identity.name;
  const photo = photoUrl ?? identity.photoUrl;
  const unreadCount = unread ?? identity.unread;

  function logout() {
    clearToken();
    navigate({ to: "/login" });
  }

  function isActive(item: NavItem) {
    return (item.match || []).some((m) => path === m || path.startsWith(m + "/"));
  }

  const initials = (name || "Student")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function Avatar() {
    if (photo) {
      return (
        <img
          src={photo}
          alt={name || "Profile photo"}
          className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full object-cover"
        />
      );
    }
    return (
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-100 text-sm font-black text-purple-700">
        {initials}
      </span>
    );
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[246px] flex-col border-r border-gray-100 bg-white shadow-sm transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-6">
          <div className="min-w-0">
            <p className="truncate text-lg font-black leading-none">
              LearnHub{" "}
              <span className="learnhub-ph-glow">PH</span>
            </p>
            <p className="truncate text-[11px] font-semibold text-gray-400">Student LMS</p>
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
          {NAV.map((n) => {
            const active = isActive(n);
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
                  active
                    ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-purple-700"
                }`}
              >
                {n.icon} {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-gray-100 px-4 py-5">
          <Link
            to="/faq"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-purple-700"
          >
            <HelpCircle size={18} /> FAQ
          </Link>
          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[246px]">
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
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
              <h1 className="truncate text-xl font-black sm:text-2xl">{title || "LearnHub PH"}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/messages"
                className="hidden h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700 sm:grid"
                aria-label="Messages"
              >
                <MessageSquare size={18} />
              </Link>
              <Link
                to="/notifications"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-purple-700"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex min-w-0 items-center gap-2 rounded-full p-1 hover:bg-gray-50"
                >
                  <Avatar />
                  <span className="hidden max-w-[120px] truncate text-sm font-bold text-gray-700 sm:inline">
                    {name || "Student"}
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
                      <Link
                        to="/notifications"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                      >
                        Notifications
                      </Link>
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

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <ConfirmModal
        isOpen={confirmingLogout}
        title="Log out?"
        message="You'll need to sign in again to access your dashboard."
        confirmLabel="Log Out"
        confirmVariant="danger"
        onConfirm={logout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}

export default StudentShell;
