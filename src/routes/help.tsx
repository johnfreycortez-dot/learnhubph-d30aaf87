import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, CircleHelp, MessageSquare } from "lucide-react";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";

export const Route = createFileRoute("/help")({ component: () => <SessionGuard><HelpPage /></SessionGuard> });

// A handful of the most common questions, answered right here so students
// don't have to leave the page for a quick check. The full list still lives
// on /faq.
const quickFaqs = [
  {
    q: "How do I access the course after payment?",
    a: "Once your payment is verified, log in with your registered email and personal access token. Access is granted within 24 hours of payment confirmation.",
  },
  {
    q: "How do I earn my certificate?",
    a: "Complete every lesson in a niche and pass its quizzes. Your certificate then becomes available to download from My Certificates.",
  },
  {
    q: "Can I take all 9 niches or just one?",
    a: "Your single ₱399 payment unlocks all 9 niches. Start with any niche and learn at your own pace — there are no deadlines.",
  },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <StudentShell title="Help Center">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-black">How can we help?</h2>
        <p className="mt-1 text-sm text-gray-500">Guides and support for your LearnHub PH learning journey.</p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <Link to="/courses" className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
            <BookOpen className="text-purple-600" />
            <h3 className="mt-4 font-black">Getting started</h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Browse a niche, open its modules, and continue a lesson whenever you're ready.
            </p>
          </Link>
          <Link to="/faq" className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
            <CircleHelp className="text-purple-600" />
            <h3 className="mt-4 font-black">Frequently asked questions</h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Find clear answers about access, payments, certificates, and more.
            </p>
          </Link>
        </div>

        {/* Quick answers, right here — no need to leave the page */}
        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="font-black">Quick answers</h3>
          <div className="mt-2 divide-y">
            {quickFaqs.map((item, i) => (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold"
                >
                  <span>{item.q}</span>
                  <ChevronDown size={18} className={open === i ? "shrink-0 rotate-180 text-purple-600" : "shrink-0 text-gray-400"} />
                </button>
                {open === i && <p className="pb-4 text-sm leading-6 text-gray-500">{item.a}</p>}
              </div>
            ))}
          </div>
          <Link to="/faq" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:text-purple-800">
            See all FAQs <ArrowRight size={14} />
          </Link>
        </section>

        {/* Contact support now actually links to Messages instead of just describing it */}
        <Link
          to="/messages"
          className="mt-5 flex items-start gap-4 rounded-2xl bg-purple-700 p-6 text-white shadow-sm transition hover:bg-purple-800"
        >
          <MessageSquare className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-black">Contact support</h3>
            <p className="mt-1 text-sm text-purple-100">
              Didn't find your answer? Send the LearnHub PH team a message and we'll reply to your email.
            </p>
          </div>
          <ArrowRight className="mt-0.5 shrink-0" size={18} />
        </Link>
      </div>
    </StudentShell>
  );
}
