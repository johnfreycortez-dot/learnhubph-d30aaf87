import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home, BookOpen, Award, MessageSquare, Bell, LogOut, Menu, X,
} from "lucide-react";
import { clearToken } from "@/lib/api";

type Item = { to: string; label: string; icon: ReactNode };

const NAV: Item[] = [
  { to: "/dashboard", label: "Overview", icon: <Home size={20} /> },
  { to: "/dashboard", label: "My Courses", icon: <BookOpen size={20} /> },
  { to: "/certificates", label: "Certificates", icon: <Award size={20} /> },
  { to: "/messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { to: "/notifications", label: "Notifications", icon: <Bell size={20} /> },
];

export function StudentShell({
  children,
  studentName,
  unread = 0,
}: {
  children: ReactNode;
  studentName?: string;
  unread?: number;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  function logout() {
    clearToken();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-purple-700">LearnHub PH</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative text-gray-600 hover:text-purple-700">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
            {studentName && <span className="hidden sm:inline text-sm font-medium text-gray-700">{studentName}</span>}
            <button onClick={logout} className="text-gray-600 hover:text-red-600" aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-[#1a1a2e] text-white transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/10">
          <span className="font-extrabold">LearnHub PH</span>
          <button className="lg:hidden text-white/70" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((n, i) => {
            const active = path === n.to || (n.to === "/dashboard" && path.startsWith("/dashboard"));
            return (
              <Link
                key={i}
                to={n.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? "bg-purple-700 text-white" : "text-white/70 hover:bg-white/5"
                }`}
              >
                {n.icon} {n.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </nav>
      </aside>

      <main className="pt-14 lg:pl-[260px]">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default StudentShell;
