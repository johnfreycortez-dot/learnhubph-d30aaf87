import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getToken } from "@/lib/api";
import { StudentShell } from "@/components/StudentShell";
import { PublicShell } from "@/components/PublicShell";
import { canonicalLink, faqJsonLd, jsonLdScript } from "@/lib/seo";

const faqs = [
  { q: "How do I access the course after payment?", a: "Once your payment is verified, use your registered email and personal access token to log in. Access is granted within 24 hours of payment confirmation." },
  { q: "Is this really a one-time payment?", a: "Yes. Pay ₱399 once for lifetime access to all 9 VA niches, lessons, quizzes, and completion certificates. There are no monthly fees." },
  { q: "Do I need prior experience to enroll?", a: "No. LearnHub PH is designed for beginners and starts with the foundations before building client-ready skills." },
  { q: "Can I take all 9 niches or just one?", a: "Your single payment unlocks all 9 niches. Start with any niche and learn at your own pace." },
  { q: "How do I earn my certificate?", a: "Complete every lesson in a niche and pass its quizzes. Your certificate then becomes available to download." },
  { q: "What payment methods do you accept?", a: "We accept GCash and BPI Bank transfer. Instructions are shown after signup." },
  { q: "How long does it take to finish a niche?", a: "Each niche has 9 lessons across 3 modules. Most students finish in 3–7 days, with no deadlines." },
  { q: "What if I need help?", a: "Use the Messages icon in the top bar to contact the LearnHub PH team." },
  { q: "Is LearnHub PH only for Filipinos?", a: "It was built with Filipino VAs in mind but is open to anyone. Lessons are in English and relevant internationally." },
  { q: "Are the certificates recognized by employers?", a: "They show you completed structured niche training. They are useful portfolio proof, although not government-accredited." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — LearnHub PH" },
      { name: "description", content: "Answers about LearnHub PH access, pricing, certificates, and support — everything you need to know before enrolling." },
      { property: "og:title", content: "Frequently Asked Questions — LearnHub PH" },
      { property: "og:description", content: "Answers about LearnHub PH access, pricing, certificates, and support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonicalLink("/faq")],
    scripts: [jsonLdScript(faqJsonLd(faqs))],
  }),
  component: FAQRoute,
});

function FAQContent() {
  const [open, setOpen] = useState(0);
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black">Frequently asked questions</h1>
      <p className="mt-1 text-sm text-gray-500">Everything you need to know about LearnHub PH.</p>
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="divide-y">
          {faqs.map((item, i) => (
            <div key={item.q}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold">
                <span>{item.q}</span>
                <ChevronDown size={18} className={open === i ? "shrink-0 rotate-180" : "shrink-0"} />
              </button>
              {open === i && <p className="pb-4 text-sm leading-6 text-gray-500">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FAQRoute() {
  // FAQ content itself has nothing to gate — it's the same static copy for
  // everyone — so guests get the real page (and PublicShell nav) instead of
  // being bounced to /login, while logged-in students still get their usual
  // app shell with sidebar/notifications.
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(!!getToken());
  }, []);

  if (authed) {
    return (
      <StudentShell title="FAQ">
        <FAQContent />
      </StudentShell>
    );
  }
  return (
    <PublicShell>
      <FAQContent />
    </PublicShell>
  );
}
