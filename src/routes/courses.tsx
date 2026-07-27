import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/courses")({ component: () => <SessionGuard><CoursesPage /></SessionGuard> });

function CoursesPage() {
  const navigate = useNavigate();
  const [niches, setNiches] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState("");
  useEffect(() => { void (async () => { const res = await gasCall("getNiches"); setNiches(res || []); setLoading(false); })(); }, []);
  async function choose(niche: any) {
    setBusy(niche.NicheID); const result = await gasCall("selectNiche", getToken(), niche.NicheID); setBusy("");
    if (result?.ok) navigate({ to: "/dashboard" });
  }
  return <StudentShell title="Courses"><div className="max-w-6xl"><h2 className="text-2xl font-black">Choose a learning path</h2><p className="mt-1 text-sm text-gray-500">Explore every VA specialization and start learning at your own pace.</p>{loading ? <div className="mt-12"><Spinner size="lg" /></div> : <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{niches.map((n) => <article key={n.NicheID} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: `${n.Color || "#7c3aed"}18` }}>{n.Icon || "📚"}</span><BookOpen className="text-purple-600" /></div><h3 className="mt-5 font-black">{n.NicheTitle}</h3><p className="mt-2 min-h-10 text-sm leading-6 text-gray-500">{n.Description}</p><button onClick={() => choose(n)} disabled={busy === n.NicheID} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-800 disabled:opacity-60">{busy === n.NicheID ? "Opening…" : "View course"}<ChevronRight size={16} /></button></article>)}</div>}</div></StudentShell>;
}
