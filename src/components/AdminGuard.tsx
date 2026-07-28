import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Spinner } from "./Spinner";
import { clearAdminToken, isAdminTokenValid } from "@/lib/api";

// Kept as thin wrappers around the api.ts token helpers so existing imports
// of isAdminAuthed/clearAdminAuth elsewhere don't break, but the real check
// is now "do we hold a non-expired, server-issued token" — not a client-set
// boolean flag anyone could fake from devtools.
export function isAdminAuthed(): boolean {
  return isAdminTokenValid();
}

export function clearAdminAuth(): void {
  clearAdminToken();
}

// Soft client-side re-check while the dashboard is open, so a session that
// expires mid-visit (no admin* call happens to fire) still gets bounced
// instead of sitting on stale data until the next click.
const RECHECK_INTERVAL_MS = 30 * 1000;

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminTokenValid()) {
      clearAdminToken();
      navigate({ to: "/login", replace: true });
      return;
    }
    setReady(true);

    const interval = window.setInterval(() => {
      if (!isAdminTokenValid()) {
        clearAdminToken();
        navigate({ to: "/login", replace: true });
      }
    }, RECHECK_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }
  return <>{children}</>;
}

export default AdminGuard;
