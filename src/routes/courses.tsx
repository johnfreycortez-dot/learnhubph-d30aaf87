import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Headphones,
  Palette,
  Search,
  ShoppingCart,
  Settings2,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { useGasQuery } from "@/hooks/useGasQuery";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { PublicShell } from "@/components/PublicShell";
import { Spinner } from "@/components/Spinner";
import { canonicalLink, jsonLdScript, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

type NicheRow = { NicheID: string; NicheTitle: string; Description?: string; Color?: string };

export const Route = createFileRoute("/courses")({
  // Runs on the server for the initial request (so crawlers and logged-out
  // visitors get the real course catalog in the HTML, not a spinner) and
  // again on the client for subsequent in-app navigations.
  loader: async () => {
    const niches: NicheRow[] = (await gasCall("getNiches").catch(() => [])) || [];
    return { niches };
  },
  head: ({ loaderData }) => {
    const niches = loaderData?.niches || [];
    return {
      meta: [
        { title: "Courses — 9 VA Specializations | LearnHub PH" },
        {
          name: "description",
          content:
            "Browse all 9 virtual assistant learning paths on LearnHub PH — social media, admin, design, bookkeeping, e-commerce, support and more.",
        },
        { property: "og:title", content: "Courses — 9 VA Specializations | LearnHub PH" },
        {
          property: "og:description",
          content: "9 VA learning paths, 81 lessons, quizzes and certificates. Lifetime access for one payment.",
        },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [canonicalLink("/courses")],
      scripts: [
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: niches.map((n, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/courses/${n.NicheID}`,
            name: n.NicheTitle,
          })),
        }),
      ],
    };
  },
  component: CoursesRoute,
});

function CoursesRoute() {
  const { niches } = Route.useLoaderData();
  // Default to the public marketing view (matches what SSR renders for
  // guests/crawlers). Swap to the real app view only once we've confirmed
  // a valid session token client-side.
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(!!getToken());
  }, []);

  if (authed) {
    return (
      <SessionGuard>
        <CoursesPage initialNiches={niches} />
      </SessionGuard>
    );
  }
  return <PublicCoursesMarketing niches={niches} />;
}

function nicheIcon(id: string): LucideIcon {
  return (
    ({
      NICHE001: CalendarDays,
      NICHE002: BriefcaseBusiness,
      NICHE003: ShieldCheck,
      NICHE004: Palette,
      NICHE005: WalletCards,
      NICHE006: ShoppingCart,
      NICHE007: Settings2,
      NICHE008: Headphones,
      NICHE009: CalendarDays,
    } as Record<string, LucideIcon>)[id] || BookOpen
  );
}

/* ---------------- Public marketing view (guests + crawlers) ---------------- */

function PublicCoursesMarketing({ niches }: { niches: NicheRow[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return niches;
    return niches.filter(
      (n) => n.NicheTitle?.toLowerCase().includes(q) || n.Description?.toLowerCase().includes(q),
    );
  }, [niches, search]);

  return (
    <PublicShell>
      <h1 className="text-3xl font-black">Choose a learning path</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        9 in-demand virtual assistant specializations, 81 lessons, quizzes and completion certificates.
        One payment unlocks every niche for life.
      </p>

      <div className="relative mt-6 max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-400"
        />
      </div>

      {niches.length === 0 ? (
        <div className="mt-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((n) => {
            const Icon = nicheIcon(n.NicheID);
            return (
              <article key={n.NicheID} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl"
                    style={{ backgroundColor: `${n.Color || "#7c3aed"}18`, color: n.Color || "#7c3aed" }}
                  >
                    <Icon size={24} strokeWidth={2.25} />
                  </span>
                  <BookOpen className="text-purple-600" />
                </div>
                <h2 className="mt-5 font-black">{n.NicheTitle}</h2>
                <p className="mt-2 min-h-10 text-sm leading-6 text-gray-500">{n.Description}</p>
                <Link
                  to="/courses/$nicheId"
                  params={{ nicheId: n.NicheID }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-800"
                >
                  View course <ChevronRight size={16} />
                </Link>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-gray-500">No courses match "{search}".</p>
          )}
        </div>
      )}
    </PublicShell>
  );
}

/* ---------------- Logged-in app view (existing behavior) ---------------- */

function CoursesPage({ initialNiches }: { initialNiches: NicheRow[] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: niches, isLoading } = useGasQuery<NicheRow[]>("getNiches", [], {
    initialData: initialNiches?.length ? initialNiches : undefined,
  });
  const list = niches || [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (n) => n.NicheTitle?.toLowerCase().includes(q) || n.Description?.toLowerCase().includes(q),
    );
  }, [list, search]);

  return (
    <StudentShell title="Courses">
      <div className="max-w-6xl">
        <h2 className="text-2xl font-black">Choose a learning path</h2>
        <p className="mt-1 text-sm text-gray-500">Explore every VA specialization and start learning at your own pace.</p>

        <div className="relative mt-5 max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-400"
          />
        </div>

        {isLoading && !niches ? (
          <div className="mt-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((n) => {
              const Icon = nicheIcon(n.NicheID);
              return (
                <article key={n.NicheID} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl"
                      style={{ backgroundColor: `${n.Color || "#7c3aed"}18`, color: n.Color || "#7c3aed" }}
                    >
                      <Icon size={24} strokeWidth={2.25} />
                    </span>
                    <BookOpen className="text-purple-600" />
                  </div>
                  <h3 className="mt-5 font-black">{n.NicheTitle}</h3>
                  <p className="mt-2 min-h-10 text-sm leading-6 text-gray-500">{n.Description}</p>
                  <button
                    onClick={() => navigate({ to: "/courses/$nicheId", params: { nicheId: n.NicheID } })}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-800"
                  >
                    View course <ChevronRight size={16} />
                  </button>
                </article>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full text-sm text-gray-500">No courses match "{search}".</p>
            )}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
