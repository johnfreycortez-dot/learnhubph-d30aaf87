import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu } from "lucide-react";
import { useState } from "react";

// Lightweight header/footer for pages that must render real content for
// logged-out visitors and crawlers (public marketing versions of /courses,
// /courses/$nicheId, /faq, /help). Deliberately does NOT use StudentShell,
// which assumes an authenticated identity (name, photo, notifications,
// logout) that guests don't have.
export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-950">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-black leading-none">
            LearnHub <span className="learnhub-ph-glow">PH</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-gray-600 sm:flex">
            <Link to="/courses" className="hover:text-purple-700">
              Courses
            </Link>
            <Link to="/faq" className="hover:text-purple-700">
              FAQ
            </Link>
            <Link to="/help" className="hover:text-purple-700">
              Help
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-800"
            >
              Get Started <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gray-50 sm:hidden"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-gray-100 px-4 py-3 text-sm font-semibold text-gray-600 sm:hidden">
            <Link to="/courses" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 hover:bg-gray-50">
              Courses
            </Link>
            <Link to="/faq" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 hover:bg-gray-50">
              FAQ
            </Link>
            <Link to="/help" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 hover:bg-gray-50">
              Help
            </Link>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-gray-100 bg-white px-4 py-8 text-center text-xs text-gray-400 sm:px-6">
        © {new Date().getFullYear()} LearnHub PH. Learn More. Earn More.
      </footer>
    </div>
  );
}

export default PublicShell;
