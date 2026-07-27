import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Spinner } from "./Spinner";

const ADMIN_FLAG_KEY = "lhph_admin";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ADMIN_FLAG_KEY) === "true";
}

export function clearAdminAuth(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_FLAG_KEY);
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate({ to: "/login", replace: true });
    } else {
      setReady(true);
    }
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
