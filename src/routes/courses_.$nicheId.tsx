import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Lock, PlayCircle, Search } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { useGasQuery } from "@/hooks/useGasQuery";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { PublicShell } from "@/components/PublicShell";
import { Spinner } from "@/components/Spinner";
import { findNicheByTitle } from "@/data/niches";
import { canonical, canonicalLink, courseJsonLd, jsonLdScript } from "@/lib/seo";

type NicheRow = { NicheID: string; NicheTitle: string; Description?: string; Color?: string };

function thumbUrl(id?: string) {
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w200` : null;
}

export const Route = createFileRoute("/courses_/$nicheId")({
  loader: async ({ params }) => {
    const niches: NicheRow[] = (await gasCall("getNiches").catch(() => [])) || [];
    const nicheRow = niches.find((n) => n.NicheID === params.nicheId);
    return { nicheRow: nicheRow || null };
  },
  head: ({ loaderData, params }) => {
    const nicheRow = loaderData?.nicheRow;
    const marketing = findNicheByTitle(nicheRow?.NicheTitle);
    const title = nicheRow ? `${nicheRow.NicheTitle} Course — LearnHub PH` : "Course — LearnHub PH";
    const description =
      marketing?.short || nicheRow?.Description || "Learn in-demand virtual assistant skills with LearnHub PH.";
    const url = canonical(`/courses/${params.nicheId}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(marketing?.img?.url ? [{ property: "og:image", content: marketing.img.url }] : []),
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [canonicalLink(`/courses/${params.nicheId}`)],
      scripts: nicheRow
        ? [
            jsonLdScript(
              courseJsonLd({
                name: nicheRow.NicheTitle,
                description,
                url,
                image: marketing?.img?.url,
              }),
            ),
          ]
        : [],
    };
  },
  component: NicheRoute,
});

function NicheRoute() {
  const { nicheRow } = Route.useLoaderData();
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(!!getToken());
  }, []);

  if (authed) return <SessionGuard><CourseDetail /></SessionGuard>;
  return <PublicNicheMarketing nicheRow={nicheRow} />;
}

/* ---------------- Public marketing view (guests + crawlers) ---------------- */

function PublicNicheMarketing({ nicheRow }: { nicheRow: NicheRow | null }) {
  const marketing = findNicheByTitle(nicheRow?.NicheTitle);

  if (!nicheRow) {
    return (
      <PublicShell>
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-purple-700">
          <ArrowLeft size={16} /> All courses
        </Link>
        <p className="mt-6 text-sm text-gray-500">This course is not available yet.</p>
      </PublicShell>
    );
  }

  const lessonCount = marketing?.modules.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0;

  return (
    <PublicShell>
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-purple-700">
        <ArrowLeft size={16} /> All courses
      </Link>

      <section className="mt-5 grid gap-6 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-[1fr_260px]">
        <div>
          <p className="text-sm font-bold text-purple-600">VA LEARNING PATH</p>
          <h1 className="mt-2 text-3xl font-black">{nicheRow.NicheTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {marketing?.daily || nicheRow.Description}
          </p>
          {lessonCount > 0 && (
            <p className="mt-3 text-sm font-semibold text-gray-400">
              {marketing?.modules.length} modules · {lessonCount} lessons · quiz + certificate
            </p>
          )}
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white hover:bg-purple-800"
          >
            Get lifetime access <ArrowRight size={16} />
          </Link>
        </div>
        {marketing?.img?.url && (
          <div className="overflow-hidden rounded-xl">
            <img src={marketing.img.url} alt={nicheRow.NicheTitle} loading="lazy" className="h-full w-full object-cover" />
          </div>
        )}
      </section>

      {marketing && (
        <div className="mt-6 space-y-4">
          {marketing.modules.map((module, index) => (
            <section key={module.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-black">
                Module {index + 1}: {module.title}
              </h2>
              <ul className="mt-3 divide-y">
                {module.lessons.map((lesson) => (
                  <li key={lesson} className="flex items-center gap-3 py-3 text-sm font-semibold text-gray-600">
                    <Lock size={16} className="shrink-0 text-gray-300" />
                    {lesson}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PublicShell>
  );
}

/* ---------------- Logged-in app view (existing behavior) ---------------- */

function CourseDetail() {
  const { nicheId } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useGasQuery<any>("getCourseAndProgress", [getToken()]);
  const niche = useMemo(() => data?.modules?.find((n: any) => n.NicheID === nicheId), [data, nicheId]);
  const [search, setSearch] = useState("");

  if (!data) return <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (!niche) return <StudentShell title="Course"><p className="text-sm text-gray-500">This course is not available yet.</p></StudentShell>;

  const lessons = niche.courses.flatMap((c: any) => c.modules.flatMap((m: any) => m.lessons));
  const done = lessons.filter((l: any) => data.progress?.[l.LessonID]).length;
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const orderedIds = lessons.map((l: any) => l.LessonID);
  const isUnlocked = (lessonId: string) => {
    const idx = orderedIds.indexOf(lessonId);
    return idx <= 0 || orderedIds.slice(0, idx).every((id: string) => data.progress?.[id]);
  };

  return (
    <StudentShell title={niche.NicheTitle}>
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate({ to: "/courses" })} className="inline-flex items-center gap-2 text-sm font-bold text-purple-700">
          <ArrowLeft size={16} /> All courses
        </button>
        <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-purple-600">YOUR LEARNING PATH</p>
          <h2 className="mt-2 text-3xl font-black">{niche.NicheTitle}</h2>
          <p className="mt-2 text-sm text-gray-500">{done} of {lessons.length} lessons completed</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-purple-100">
            <div className="h-full rounded-full bg-purple-700" style={{ width: `${percent}%` }} />
          </div>
        </section>
        <div className="relative mt-6 max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-400"
          />
        </div>
        <div className="mt-6 space-y-4">
          {niche.courses
            .flatMap((course: any) => course.modules)
            .map((module: any, index: number) => ({
              module,
              index,
              lessons: module.lessons.filter((lesson: any) =>
                !search.trim() || lesson.Title?.toLowerCase().includes(search.trim().toLowerCase()),
              ),
            }))
            .filter(({ lessons }) => lessons.length > 0)
            .map(({ module, index, lessons }) => (
            <section key={module.ModuleID} className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-black">Module {index + 1}: {module.Title}</h3>
              <div className="mt-3 divide-y">
                {lessons.map((lesson: any) => {
                  const thumb = thumbUrl(data.thumbnailMap?.[lesson.LessonID]);
                  const unlocked = isUnlocked(lesson.LessonID);
                  const doneLesson = !!data.progress?.[lesson.LessonID];
                  return (
                    <button
                      key={lesson.LessonID}
                      disabled={!unlocked}
                      title={unlocked ? undefined : "Complete the previous lesson to unlock"}
                      onClick={() => {
                        if (!unlocked) return;
                        navigate({ to: "/lesson/$lessonId", params: { lessonId: lesson.LessonID }, state: { modules: data.modules, niche: niche.NicheTitle } as any });
                      }}
                      className={`flex w-full items-center gap-3 py-3 text-left ${unlocked ? "hover:text-purple-700" : "cursor-not-allowed opacity-50"}`}
                    >
                      {doneLesson ? (
                        <CheckCircle2 size={19} className="shrink-0 text-emerald-500" />
                      ) : unlocked ? (
                        <Circle size={19} className="shrink-0 text-gray-300" />
                      ) : (
                        <Lock size={17} className="shrink-0 text-gray-300" />
                      )}
                      <span className="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-purple-50">
                        {thumb ? <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" /> : <PlayCircle size={18} className="text-purple-300" />}
                      </span>
                      <span className="flex-1 text-sm font-semibold">{lesson.Title}</span>
                      {unlocked ? <PlayCircle size={18} className="shrink-0" /> : <Lock size={16} className="shrink-0 text-gray-300" />}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
