import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";
import { canonicalLink, jsonLdScript, DEFAULT_OG_IMAGE, SITE_URL, SITE_NAME } from "@/lib/seo";

const TITLE = "How to Become a Virtual Assistant (2026 Step-by-Step Guide)";
const DESCRIPTION =
  "A practical, step-by-step guide to becoming a virtual assistant — choosing a niche, building skills and a portfolio, setting rates, and landing your first client, with specific advice for VAs in the Philippines.";

const steps: { title: string; body: string[] }[] = [
  {
    title: "1. Understand what a virtual assistant actually does",
    body: [
      "A virtual assistant (VA) is a remote contractor who handles specific, repeatable work for a business owner — inbox and calendar management, social media, bookkeeping, customer support, e-commerce store upkeep, design, or operations.",
      "You are not applying for one job title. You are selling a set of outcomes: fewer hours the client spends on admin, faster replies to customers, cleaner books, more consistent content. Framing your work that way is what separates a ₱150/hour VA from a ₱900/hour one.",
    ],
  },
  {
    title: "2. Pick one niche first, then broaden",
    body: [
      "Generalist VAs compete on price. Specialists compete on results. Start with a single specialization you can describe in one sentence, then add adjacent skills once you have paying clients.",
      "The nine niches with the most consistent demand right now are: Social Media Management, General VA, Admin Assistant, Graphic Design, Bookkeeping, E-Commerce, Operations, Customer Support, and Appointment Setting.",
    ],
  },
  {
    title: "3. Build the core skill stack",
    body: [
      "Every niche shares a base layer: written English, Google Workspace or Microsoft 365, a project tool (Asana, Trello, ClickUp or Notion), a comms tool (Slack), and basic file and password hygiene.",
      "On top of that, add your niche tools — Canva and a scheduler for social media, Xero or QuickBooks for bookkeeping, Shopify for e-commerce, Gorgias or Zendesk for support, Calendly and a CRM for appointment setting.",
    ],
  },
  {
    title: "4. Create proof before you have clients",
    body: [
      "No client will hire a portfolio that says 'eager to learn'. Build 3 sample deliverables instead: a one-month content calendar with 12 finished graphics, a reconciled sample ledger, a cleaned-up product listing set, or a documented SOP for a support workflow.",
      "Put them in a single public folder or a one-page portfolio site. Add a short note under each explaining the problem, what you did, and the result you'd expect for a client.",
    ],
  },
  {
    title: "5. Set your rate and your terms",
    body: [
      "Entry-level Filipino VAs typically start between $4 and $7 per hour, specialists at $8 to $15, and experienced niche VAs (bookkeeping, ads, operations) well above that. Retainers of 20, 40 or 80 hours a month are more stable than hourly gigs.",
      "Decide upfront: hours of availability in your client's timezone, revision limits, payment schedule (usually 50% upfront for projects, or bi-monthly for retainers), and how you invoice.",
    ],
  },
  {
    title: "6. Get paid and stay compliant (Philippines specifics)",
    body: [
      "Most Filipino VAs get paid through Wise, PayPal, Payoneer, or direct remittance into GCash or a BPI/BDO account. Compare the fee plus FX spread — Wise is usually cheapest for USD to PHP.",
      "If you're freelancing full-time in the Philippines, register as a self-employed professional with the BIR, get your COR (Form 2303) and official receipts, and keep paying SSS, PhilHealth and Pag-IBIG as a voluntary member. Doing this early makes visa applications, loans, and larger contracts much easier later.",
    ],
  },
  {
    title: "7. Land the first three clients",
    body: [
      "Apply where clients already are: OnlineJobs.ph (heavily used by US owners hiring Filipino VAs), Upwork, niche Facebook groups, and direct outreach to small businesses whose social media or store is visibly neglected.",
      "Send short, specific pitches. One line on the problem you noticed, one line on what you'd do in week one, one line of proof, and a clear next step. Ten targeted pitches beat a hundred generic ones.",
    ],
  },
  {
    title: "8. Turn the first client into a career",
    body: [
      "Over-communicate in the first month: a Monday plan, a Friday summary, and no silent days. Most VAs lose contracts to poor communication, not poor skills.",
      "After 60 days, ask for a testimonial and a referral, then raise your rate for the next client. Repeat that loop and you will be at a full-time income within a year.",
    ],
  },
];

const faqs = [
  {
    q: "How long does it take to become a virtual assistant?",
    a: "Most beginners are client-ready in 4 to 8 weeks of focused learning — enough time to master one niche, build three portfolio samples, and start pitching.",
  },
  {
    q: "Do I need a degree or experience to be a VA?",
    a: "No. Clients hire on demonstrated skill and reliability. A portfolio with real sample work matters far more than a diploma.",
  },
  {
    q: "How much do virtual assistants earn in the Philippines?",
    a: "Entry-level VAs typically earn $4–$7 per hour, specialists $8–$15, and experienced niche VAs more. A 40-hour-per-week retainer at $6/hour is roughly ₱55,000 a month.",
  },
  {
    q: "What equipment do I need to start?",
    a: "A reliable laptop, a stable internet connection of at least 15 Mbps with a backup (mobile data or a second ISP), a headset, and a quiet place to take calls.",
  },
];

export const Route = createFileRoute("/blog/how-to-become-a-virtual-assistant")({
  head: () => ({
    meta: [
      { title: `${TITLE} | ${SITE_NAME}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE_URL}/blog/how-to-become-a-virtual-assistant` },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
    ],
    links: [canonicalLink("/blog/how-to-become-a-virtual-assistant")],
    scripts: [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: TITLE,
        description: DESCRIPTION,
        image: DEFAULT_OG_IMAGE,
        mainEntityOfPage: `${SITE_URL}/blog/how-to-become-a-virtual-assistant`,
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to become a virtual assistant",
        description: DESCRIPTION,
        step: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.title.replace(/^\d+\.\s*/, ""),
          text: s.body[0],
        })),
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: TITLE,
            item: `${SITE_URL}/blog/how-to-become-a-virtual-assistant`,
          },
        ],
      }),
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-700">Guide</p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
          How to Become a Virtual Assistant: A Step-by-Step Guide
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-500">{DESCRIPTION}</p>

        <nav aria-label="On this page" className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black">On this page</h2>
          <ol className="mt-3 space-y-1.5 text-sm text-gray-500">
            {steps.map((s) => (
              <li key={s.title}>
                <a className="hover:text-purple-700" href={`#${slug(s.title)}`}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {steps.map((s) => (
          <section key={s.title} id={slug(s.title)} className="mt-10 scroll-mt-24">
            <h2 className="text-xl font-black">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-3 text-sm leading-7 text-gray-500">
                {p}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-12">
          <h2 className="text-xl font-black">Frequently asked questions</h2>
          <dl className="mt-4 divide-y rounded-2xl bg-white p-5 shadow-sm">
            {faqs.map((f) => (
              <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                <dt className="text-sm font-bold">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-6 text-gray-500">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="mt-12 rounded-2xl bg-purple-700 p-6 text-white shadow-sm">
          <h2 className="text-lg font-black">Want the whole path in one place?</h2>
          <p className="mt-2 text-sm leading-6 text-purple-100">
            LearnHub PH covers all 9 VA niches across 81 lessons with quizzes and completion
            certificates — one payment of ₱399, lifetime access.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-purple-700 hover:bg-purple-50"
            >
              Browse the 9 niches
            </Link>
            <Link
              to="/faq"
              className="rounded-xl border border-white/40 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            >
              Read the FAQ
            </Link>
          </div>
        </aside>
      </article>
    </PublicShell>
  );
}

function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
