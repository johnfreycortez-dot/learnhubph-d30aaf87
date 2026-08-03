import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, BookOpen, Download, Lock, AlertCircle } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";

export const Route = createFileRoute("/certificates")({
  head: () => ({
    meta: [
      { title: "My Certificates — LearnHub PH" },
      {
        name: "description",
        content:
          "View and download your LearnHub PH certificates of completion for every virtual assistant module you finish.",
      },
      { property: "og:title", content: "My Certificates — LearnHub PH" },
      {
        property: "og:description",
        content:
          "View and download your LearnHub PH certificates of completion for every virtual assistant module you finish.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: () => (
    <SessionGuard>
      <CertificatesPage />
    </SessionGuard>
  ),
});

function CertificatesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await gasCall("getCourseAndProgress", getToken());
      setModules(res.modules || []);
      setProgress(res.progress || {});
    } catch {
      setError("Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function download(nicheId: string) {
    setDownloading(nicheId);
    try {
      const res = await gasCall("generateCertificatePdf", getToken(), nicheId);
      if (res.ok) {
        const bytes = atob(res.base64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || "certificate.pdf";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        showToast(res.msg || "Failed to generate certificate", "error");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <StudentShell>
      <div className="flex items-center gap-2">
        <Award size={24} className="text-purple-600" />
        <h1 className="text-2xl font-extrabold">My Certificates</h1>
      </div>
      <p className="mt-1 text-sm text-gray-500">Complete all lessons in a niche to earn your certificate.</p>

      {loading && (
        <div className="mt-10 flex justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {error && (
        <div className="mt-10 flex flex-col items-center">
          <AlertCircle className="text-red-500" size={48} />
          <p className="mt-3 text-gray-700">{error}</p>
          <button onClick={load} className="mt-3 rounded-xl bg-purple-700 text-white px-5 py-2.5 text-sm font-semibold">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((n: any) => {
            const lessons = n.courses.flatMap((c: any) => c.modules.flatMap((m: any) => m.lessons));
            const done = lessons.filter((l: any) => progress[l.LessonID]).length;
            const total = lessons.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            const complete = pct === 100 && total > 0;
            return (
              <div key={n.NicheID} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-600" />
                  <h3 className="font-bold">{n.NicheTitle}</h3>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {done} / {total} lessons completed
                </p>
                {complete ? (
                  <>
                    <span className="mt-3 inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      Completed
                    </span>
                    <button
                      onClick={() => download(n.NicheID)}
                      disabled={downloading === n.NicheID}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-semibold px-4 py-2.5"
                    >
                      {downloading === n.NicheID ? (
                        <Spinner size="sm" className="border-white" />
                      ) : (
                        <Download size={18} />
                      )}
                      Download Certificate
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-xs text-gray-500">{total - done} lessons remaining</p>
                    <button
                      disabled
                      className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-200 text-gray-500 font-semibold px-4 py-2.5 cursor-not-allowed"
                    >
                      <Lock size={18} /> Certificate Locked
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </StudentShell>
  );
}
