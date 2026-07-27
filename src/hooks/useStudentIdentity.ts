import { useEffect, useState } from "react";
import { gasCall, getToken } from "@/lib/api";

export type StudentIdentity = {
  name: string;
  photoUrl: string;
  unread: number;
};

const EMPTY: StudentIdentity = { name: "", photoUrl: "", unread: 0 };

// Module-scope cache so every page that mounts <StudentShell> shows the same
// name/photo/unread count instantly (no "Student" flash) instead of each
// route independently fetching (or forgetting to fetch) its own copy.
let cache: StudentIdentity | null = null;
let inflight: Promise<StudentIdentity> | null = null;

async function fetchIdentity(): Promise<StudentIdentity> {
  const token = getToken();
  const [userRes, notifRes] = await Promise.all([
    gasCall("getUserByTokenPublic", token),
    gasCall("getNotifications", token),
  ]);
  return {
    name: userRes?.user?.name || "Student",
    photoUrl: userRes?.user?.profilePhotoUrl || "",
    unread: notifRes?.unread || 0,
  };
}

export function useStudentIdentity() {
  const [identity, setIdentity] = useState<StudentIdentity>(cache || EMPTY);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!inflight) inflight = fetchIdentity();
      try {
        const result = await inflight;
        cache = result;
        if (alive) setIdentity(result);
      } finally {
        inflight = null;
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Lets a page (e.g. Settings, right after a save) push a fresh value
  // immediately instead of waiting for the next background refetch.
  function overrideIdentity(patch: Partial<StudentIdentity>) {
    cache = { ...(cache || EMPTY), ...patch };
    setIdentity(cache);
  }

  return { ...identity, loading, overrideIdentity };
}
