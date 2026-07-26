import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpen, Layout, Layers, Smartphone, Award, Users, Sparkles,
  Trophy, Route as RouteIcon, MessagesSquare, Zap, Plug,
  CheckCircle2, ClipboardCheck, LineChart, ShieldCheck, Mail,
  Star, X, ArrowRight, Globe,
} from "lucide-react";

import logoAsset from "../assets/learnhub-logo.png.asset.json";
import certAsset from "../assets/learnhub-cert.png.asset.json";
import dashAsset from "../assets/learnhub-dashboard.jpg.asset.json";
import nicheSocial from "../assets/niche-social.jpg.asset.json";
import nicheGeneral from "../assets/niche-generalva.jpg.asset.json";
import nicheAdmin from "../assets/niche-admin.jpg.asset.json";
import nicheDesigner from "../assets/niche-designer.jpg.asset.json";
import nicheBooks from "../assets/niche-bookkeeping.jpg.asset.json";
import nicheEcom from "../assets/niche-ecommerce.jpg.asset.json";
import nicheOps from "../assets/niche-operations.jpg.asset.json";
import nicheSupport from "../assets/niche-support.jpg.asset.json";
import nicheAppt from "../assets/niche-appointment.jpg.asset.json";

const CTA_URL =
  "https://script.google.com/macros/s/AKfycbzqGxB3gqNqHL1jWsDzq5t9qyj4mgsRtpOb_X7WCm3-cY6wU7GsLrVkkXsxWnTyn9oDdg/exec";

const go = () => {
  window.location.href = CTA_URL;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnHub PH — Learn More. Earn More." },
      {
        name: "description",
        content:
          "Learn in-demand VA skills and start earning online. 9 niches, 81 lessons, quizzes + certificate. Lifetime access, only ₱399 (55% OFF).",
      },
      { property: "og:title", content: "LearnHub PH — Learn More. Earn More." },
      {
        property: "og:description",
        content:
          "Learn in-demand VA skills and start earning online. 9 niches, 81 lessons, quizzes + certificate. Lifetime access, only ₱399 (55% OFF).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/* ---------------- helpers ---------------- */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCountUp(target: number, trigger: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, duration]);
  return val;
}

function CTAButton({
  children,
  variant = "solid",
  className = "",
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost-white";
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 active:scale-[0.97]";
  const styles = {
    solid:
      "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:brightness-110",
    outline:
      "border border-violet-300 text-violet-700 bg-white hover:bg-violet-50 hover:border-violet-500",
    "ghost-white":
      "border border-white/40 text-white bg-white/10 backdrop-blur hover:bg-white/20",
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick ?? go}
      aria-label={ariaLabel}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------- sections ---------------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ["VA Niches", "#niches"],
    ["Features", "#features"],
    ["Pricing", "#pricing"],
    ["Reviews", "#reviews"],
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-lg shadow-[0_2px_20px_-8px_rgba(76,29,149,0.25)] border-b border-violet-100"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <a href="#top" className="flex items-center gap-2 shrink-0">
          <span
            className={`font-extrabold tracking-tight text-lg ${
              scrolled ? "text-slate-900" : "text-white"
            }`}
          >
            LearnHub <span className="text-violet-500">PH</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center justify-center gap-8">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-slate-700 hover:text-violet-700"
                  : "text-white/85 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <button
            type="button"
            onClick={go}
            className={`hidden sm:inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 ${
              scrolled
                ? "border-violet-300 text-violet-700 hover:bg-violet-50"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            Sign In
          </button>
          <CTAButton className="!px-4 !py-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </CTAButton>
        </div>
      </div>
    </header>
  );
}

function LogoMark({ className = "" }: { className?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div
        className={`grid place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 text-white font-black ${className}`}
      >
        L
      </div>
    );
  }
  return (
    <img
      src={logoAsset.url}
      onError={() => setBroken(true)}
      alt="LearnHub PH"
      className={`${className} object-contain`}
    />
  );
}

function Stat({ value, suffix = "", label, badge }: { value: number | string; suffix?: string; label: string; badge?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const isNum = typeof value === "number";
  const n = useCountUp(isNum ? (value as number) : 0, inView && isNum);
  return (
    <div ref={ref} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-4 sm:px-5 sm:py-5 text-left relative overflow-hidden">
      <div className="text-2xl sm:text-3xl font-black text-white leading-none flex items-baseline gap-1">
        {isNum ? n.toLocaleString() : value}
        {suffix && <span className="text-lg text-violet-200">{suffix}</span>}
      </div>
      <div className="mt-1 text-xs sm:text-sm text-violet-100/90">{label}</div>
      {badge && (
        <span className="absolute top-2 right-2 rounded-full bg-yellow-400 text-yellow-950 text-[10px] font-bold px-2 py-0.5">
          {badge}
        </span>
      )}
    </div>
  );
}

const HERO_CYCLE: { name: string; from: string; to: string }[] = [
  { name: "Social Media Manager", from: "#4c1d95", to: "#6d28d9" },
  { name: "General VA", from: "#0d7377", to: "#14a085" },
  { name: "Admin Assistant", from: "#3d6b4f", to: "#5a8a6a" },
  { name: "Graphic Designer", from: "#9b2d4f", to: "#d45f7a" },
  { name: "Bookkeeping VA", from: "#1e4d78", to: "#4a7fa5" },
  { name: "E-Commerce VA", from: "#8a4a10", to: "#c47c2e" },
  { name: "Operations Assistant", from: "#1e3a7a", to: "#4a72b8" },
  { name: "Customer Support", from: "#8a2020", to: "#e07070" },
  { name: "Appointment Setter", from: "#4a2080", to: "#8b6abf" },
];

function Hero() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % HERO_CYCLE.length), 10000);
    return () => clearInterval(id);
  }, []);
  const current = HERO_CYCLE[idx];
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-32">
      {/* animated gradient bg */}
      <div
        className="absolute inset-0 transition-[background] duration-[1200ms] ease-in-out"
        style={{ background: `linear-gradient(135deg, ${current.from} 0%, ${current.to} 100%)` }}
      />
      {/* blobs */}
      <div className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-blob" />
      <div className="absolute top-40 -right-16 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob" style={{ animationDelay: "-12s" }} />

      {/* watermark niche name */}
      <div
        key={current.name}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-4"
        style={{ animation: "fade-up 1s ease-out both" }}
      >
        <span
          className="font-black text-white text-center whitespace-nowrap select-none"
          style={{
            opacity: 0.12,
            fontSize: "clamp(80px, 12vw, 160px)",
            fontWeight: 900,
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          {current.name}
        </span>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div className="reveal">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            The VA Learning Platform Built for Everyone
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">
            Launch Your VA Career.{" "}
            <span className="bg-gradient-to-r from-fuchsia-200 to-cyan-100 bg-clip-text text-transparent">
              Master 9 In-Demand Niches.
            </span>
          </h1>
          <p className="mt-5 text-lg text-white/90 max-w-xl">
            Get lifetime access to 81 expert lessons, quizzes, and certificates across 9 high-paying VA specializations —
            now at <span className="line-through opacity-70">₱899</span>{" "}
            <span className="font-bold text-white">₱399 only!</span>
          </p>
          <p className="mt-3 text-sm text-white/85 max-w-xl inline-flex items-center gap-2">
            <Globe className="h-4 w-4 align-middle shrink-0" aria-hidden="true" />
            <span>Open to aspiring VAs everywhere — no nationality restrictions.</span>
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            <Stat value={9} label="VA Niches" />
            <Stat value={81} label="Lessons" />
            <Stat value="₱399" label="One-Time" badge="55% OFF" />
            <Stat value="∞" label="Lifetime Access" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <CTAButton className="!px-6 !py-3.5 !text-base">
              Get Started <ArrowRight className="h-5 w-5" />
            </CTAButton>
            <a
              href="#curriculum"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 backdrop-blur px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/15 transition"
            >
              See what's inside
            </a>
          </div>
        </div>

        {/* product preview */}
        <div className="reveal relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-white/10 blur-2xl" />
          <div
            className="relative animate-float rounded-2xl bg-white shadow-2xl shadow-black/40 overflow-hidden border border-white/20"
            style={{ transform: "rotateY(-6deg) rotateX(3deg)", transformStyle: "preserve-3d" }}
          >
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border-b border-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 text-[10px] text-slate-500 font-medium">learnhubph.lovable.app</span>
            </div>
            <img
              src={dashAsset.url}
              alt="LearnHub PH dashboard preview"
              className="block w-full h-auto"
              loading="eager"
            />
          </div>
          <div className="absolute -top-4 -left-4 rounded-xl bg-white shadow-xl border border-violet-100 px-3 py-2 text-xs font-semibold text-slate-800 flex items-center gap-2 animate-float" style={{ animationDelay: "-2s" }}>
            🎓 <span>Now Learning: <span className="text-violet-700">{current.name}</span></span>
          </div>
          <div className="absolute -bottom-4 -right-2 rounded-xl bg-white shadow-xl border border-violet-100 px-3 py-2 text-xs font-semibold text-slate-800 flex items-center gap-2 animate-float" style={{ animationDelay: "-4s" }}>
            <CheckCircle2 className="h-4 w-4 text-green-500" /> 1 Lesson Completed
          </div>
        </div>
      </div>

      {/* progress dots */}
      <div className="relative mt-10 flex items-center justify-center gap-2">
        {HERO_CYCLE.map((n, i) => (
          <span
            key={n.name}
            aria-label={n.name}
            className="rounded-full bg-white transition-all duration-[400ms] ease-out"
            style={{
              width: i === idx ? 10 : 7,
              height: i === idx ? 10 : 7,
              opacity: i === idx ? 1 : 0.35,
            }}
          />
        ))}
      </div>
    </section>
  );
}

function FeatureStrip() {
  const items = [
    { icon: BookOpen, label: "81 Expert Lessons" },
    { icon: ClipboardCheck, label: "243 Quiz Questions" },
    { icon: Award, label: "9 Certificates" },
    { icon: ShieldCheck, label: "Lifetime Access" },
    { icon: Sparkles, label: "Only ₱399 (55% OFF)" },
  ];
  return (
    <div className="bg-white border-y border-violet-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((it) => (
          <div key={it.label} className="reveal flex items-center gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 shrink-0">
              <it.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-slate-800">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------- flip cards ------- */

type Niche = {
  title: string;
  short: string;
  img: { url: string };
  daily: string;
  back: string;
  modules: { title: string; lessons: string[] }[];
};

const NICHES: Niche[] = [
  {
    title: "Social Media Manager",
    short: "Manage social accounts, create content, and grow audiences for clients worldwide.",
    img: nicheSocial,
    back: "#6d28d9",
    daily: "Plan, create, and analyze social content across Facebook, Instagram, TikTok, and LinkedIn to help clients grow their audience.",
    modules: [
      { title: "Foundations of Social Media Management", lessons: [
        "What is Social Media Management?",
        "The VA Freelancer Mindset",
        "Understanding Your Ideal Client",
      ] },
      { title: "Content Creation & Scheduling", lessons: [
        "Building a Content Calendar",
        "Canva for Social Media Graphics",
        "Scheduling with Buffer & Meta Suite",
      ] },
      { title: "Analytics, Reporting & Client Management", lessons: [
        "Reading Social Media Insights",
        "Creating Client Reports",
        "Setting Up & Closing a Client Project",
      ] },
    ],
  },
  {
    title: "General VA",
    short: "Master the core VA skills every client needs — admin, research, inbox, and more.",
    img: nicheGeneral,
    back: "#0d7377",
    daily: "Handle the day-to-day admin, research, and inbox work that keeps small businesses running smoothly.",
    modules: [
      { title: "VA Foundations", lessons: [
        "What Do Clients Really Need from a VA?",
        "Time Management & Work-from-Home Habits",
        "Setting Up Your VA Workspace",
      ] },
      { title: "Core VA Tools", lessons: [
        "Google Workspace Essentials",
        "Trello, Asana & Project Management Tools",
        "Communication Tools: Slack, Zoom & Email",
      ] },
      { title: "Getting Clients", lessons: [
        "Building Your VA Portfolio",
        "Where to Find Clients (OnlineJobs, Upwork)",
        "Writing a Winning Proposal",
      ] },
    ],
  },
  {
    title: "Admin Assistant",
    short: "Organize schedules, manage documents, coordinate tasks, and support busy executives.",
    img: nicheAdmin,
    back: "#5a8a6a",
    daily: "Keep executives organized with calendars, documents, reports, and airtight admin systems.",
    modules: [
      { title: "Admin Fundamentals", lessons: [
        "Admin VA Role & Responsibilities",
        "Calendar & Schedule Management",
        "File Organization & Cloud Storage",
      ] },
      { title: "Professional Communication", lessons: [
        "Professional Email Writing",
        "Creating Reports & Documents",
        "Meeting Minutes & Action Items",
      ] },
      { title: "Advanced Admin Skills", lessons: [
        "Automating Tasks with Make.com & Zapier",
        "Data Entry & Spreadsheet Management",
        "SOP Writing for Admin Processes",
      ] },
    ],
  },
  {
    title: "Graphic Designer",
    short: "Create eye-catching visuals, branding assets, and marketing materials using Canva & Adobe.",
    img: nicheDesigner,
    back: "#d45f7a",
    daily: "Turn ideas into on-brand visuals — social posts, ads, and pitch decks — using Canva and Adobe.",
    modules: [
      { title: "Design Foundations", lessons: [
        "Design Fundamentals: Color, Font & Layout",
        "Canva Deep Dive: Templates & Brand Kit",
        "Exporting & Delivering Design Files",
      ] },
      { title: "Content & Social Media Design", lessons: [
        "Social Media Post Design",
        "Stories, Reels Covers & Thumbnails",
        "Ads Creatives & Promotional Banners",
      ] },
      { title: "Client-Ready Design Work", lessons: [
        "Building a Brand Kit for a Client",
        "Presentation & Pitch Deck Design",
        "Pricing & Packaging Your Design Services",
      ] },
    ],
  },
  {
    title: "Bookkeeping VA",
    short: "Handle bookkeeping, invoicing, payroll support, and financial reporting for clients.",
    img: nicheBooks,
    back: "#4a7fa5",
    daily: "Track transactions, reconcile accounts, and deliver clear financial reports for busy business owners.",
    modules: [
      { title: "Accounting Basics", lessons: [
        "Accounting Basics for Non-Accountants",
        "Chart of Accounts & Transaction Coding",
        "Reconciling Accounts & Bank Statements",
      ] },
      { title: "Client Financial Tasks", lessons: [
        "Creating & Sending Invoices",
        "Expense Tracking & Categorization",
        "Payroll Support Basics",
      ] },
      { title: "Bookkeeping Tools", lessons: [
        "QuickBooks Online Basics",
        "Wave Accounting Essentials",
        "Generating Financial Reports for Clients",
      ] },
    ],
  },
  {
    title: "E-Commerce VA",
    short: "Manage product listings, orders, customer support, and inventory on Shopify & Amazon.",
    img: nicheEcom,
    back: "#c47c2e",
    daily: "Run online stores end-to-end — listings, orders, inventory, and customers — on Shopify and Amazon.",
    modules: [
      { title: "Ecommerce Foundations", lessons: [
        "The Ecommerce VA Role Explained",
        "Shopify Store Navigation & Settings",
        "Amazon Seller Central Overview",
      ] },
      { title: "Product & Inventory Management", lessons: [
        "Writing Product Descriptions That Sell",
        "Product Photo Guidelines & Basic Editing",
        "Inventory Tracking & Stock Alerts",
      ] },
      { title: "Orders, Customers & Suppliers", lessons: [
        "Processing Orders & Handling Returns",
        "Customer Messaging & Review Management",
        "Working with Suppliers & Logistics",
      ] },
    ],
  },
  {
    title: "Operations Assistant",
    short: "Streamline processes, manage teams, build SOPs, and run day-to-day operations.",
    img: nicheOps,
    back: "#4a72b8",
    daily: "Design the systems, SOPs, and workflows that let small teams scale without chaos.",
    modules: [
      { title: "Operations Fundamentals", lessons: [
        "What Operations Management Actually Means",
        "Identifying Bottlenecks & Inefficiencies",
        "Tools of the Trade: ClickUp, Monday & Notion",
      ] },
      { title: "SOPs & Process Design", lessons: [
        "Writing Your First SOP",
        "Process Mapping & Workflow Diagrams",
        "Building a Team Knowledge Base",
      ] },
      { title: "Team & Performance Management", lessons: [
        "Onboarding Remote Team Members",
        "Setting KPIs & Tracking Performance",
        "Running Productive Team Meetings",
      ] },
    ],
  },
  {
    title: "Customer Support Specialist",
    short: "Deliver exceptional support via chat, email, and calls.",
    img: nicheSupport,
    back: "#e07070",
    daily: "Deliver friendly, fast support over chat, email, and phone — turning customers into loyal fans.",
    modules: [
      { title: "Customer Service Foundations", lessons: [
        "The Golden Rules of Customer Service",
        "Customer Empathy & Active Listening",
        "Using Helpdesk Tools: Zendesk & Freshdesk",
      ] },
      { title: "Handling Customer Interactions", lessons: [
        "Handling Email Tickets Professionally",
        "Live Chat Best Practices",
        "Phone Support & Call Etiquette",
      ] },
      { title: "Difficult Situations & Escalations", lessons: [
        "De-escalating Angry Customers",
        "Refunds, Replacements & Policy Enforcement",
        "When and How to Escalate to a Supervisor",
      ] },
    ],
  },
  {
    title: "Appointment Setter",
    short: "Master outreach, objection handling, and booking qualified appointments.",
    img: nicheAppt,
    back: "#8b6abf",
    daily: "Fill your client's calendar with qualified sales calls through outreach, follow-up, and CRM work.",
    modules: [
      { title: "Appointment Setting Foundations", lessons: [
        "What is Appointment Setting?",
        "Target Market Research & Lead Lists",
        "Cold Email & LinkedIn Outreach Basics",
      ] },
      { title: "Outreach & Objection Handling", lessons: [
        "Building an Effective Outreach Script",
        "Handling Common Objections",
        "Follow-Up Sequences That Convert",
      ] },
      { title: "Tools & Reporting", lessons: [
        "Using Calendly & Scheduling Tools",
        "CRM Basics: HubSpot & GoHighLevel",
        "Reporting Your Appointment Setting Results",
      ] },
    ],
  },
];

function FlipCard({ niche }: { niche: Niche }) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((f) => !f);
  return (
    <div
      className={`flip-card reveal cursor-pointer group ${flipped ? "is-flipped" : ""}`}
      style={{ minHeight: "480px" }}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${niche.title} — tap to ${flipped ? "flip back" : "learn more"}`}
    >
      <div className="flip-inner" style={{ minHeight: "480px" }}>
        {/* front */}
        <div className="flip-face rounded-2xl bg-white border border-violet-100 shadow-sm overflow-hidden flex flex-col transition-all group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-violet-500/10 group-hover:border-violet-300">
          <div className="w-full bg-white overflow-hidden" style={{ aspectRatio: "6 / 5" }}>
            <img src={niche.img.url} alt={niche.title} className="w-full h-full object-cover block" loading="lazy" />
          </div>
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-lg font-bold text-slate-900">{niche.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{niche.short}</p>
            <span className="mt-3 text-xs font-semibold text-violet-600 inline-flex items-center gap-1">
              👆 Tap to learn more
            </span>
          </div>
        </div>
        {/* back */}
        <div
          className="flip-face flip-back rounded-2xl text-white shadow-lg p-6 flex flex-col justify-between overflow-hidden"
          style={{ backgroundColor: niche.back }}
        >
          <div>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">{niche.title}</h3>
            <p className="mt-4 text-sm text-white/90 leading-relaxed">{niche.daily}</p>
            <span className="mt-5 inline-flex items-center rounded-full bg-white/20 border border-white/30 px-3 py-1 text-[11px] font-bold tracking-wide">
              3 Modules · 9 Lessons
            </span>
          </div>
          <div className="mt-6 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(); }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold shadow-md hover:bg-white/95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 transition"
              style={{ color: niche.back }}
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-white/85 inline-flex items-center gap-1">
              ↻ Tap to flip back
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Niches() {
  return (
    <section id="niches" className="py-20 sm:py-28 bg-[#f8f6ff]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto reveal">
          <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5">
            9 VA Niches Included
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Everything You Need to Land High-Paying VA Clients
          </h2>
          <p className="mt-4 text-slate-600">
            One payment of ₱399 (was ₱899, 55% OFF) unlocks all 9 specializations — with lessons, quizzes and certificates for each.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NICHES.map((n) => (
            <FlipCard key={n.title} niche={n} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------- curriculum ------- */

function Curriculum() {
  const [active, setActive] = useState(0);
  const niche = NICHES[active];
  return (
    <section id="curriculum" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5">
            Course Curriculum
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            See What's Inside Every Niche
          </h2>
          <p className="mt-3 text-slate-600">
            Each niche includes 3 modules and 9 lessons. Pick a niche to preview its curriculum.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr] reveal">
          {/* niche tabs */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {NICHES.map((n, i) => (
              <button
                key={n.title}
                type="button"
                onClick={() => setActive(i)}
                className={`shrink-0 lg:shrink text-left rounded-xl px-4 py-3 text-sm font-semibold transition-all border ${
                  active === i
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent shadow-md shadow-violet-500/30"
                    : "bg-white text-slate-700 border-violet-100 hover:border-violet-300 hover:bg-violet-50"
                }`}
              >
                {n.title}
              </button>
            ))}
          </div>

          {/* modules accordion */}
          <div className="rounded-2xl border border-violet-100 bg-[#f8f6ff] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">{niche.title}</h3>
              <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-xs font-bold">
                3 Modules · 9 Lessons
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{niche.daily}</p>

            <div className="mt-6 space-y-3">
              {niche.modules.map((m, mi) => (
                <details
                  key={m.title}
                  open={mi === 0}
                  className="group rounded-xl bg-white border border-violet-100 open:shadow-md transition-all"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 text-white text-xs font-black shrink-0">
                        {mi + 1}
                      </span>
                      <span className="font-bold text-slate-900">{m.title}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-violet-500 transition-transform group-open:rotate-90" />
                  </summary>
                  <ul className="px-4 pb-4 pt-1 space-y-2 border-t border-violet-50">
                    {m.lessons.map((l, li) => (
                      <li key={l} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                        <span>
                          <span className="text-slate-400 text-xs mr-1">Lesson {mi * 3 + li + 1}.</span>
                          {l}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            <div className="mt-6">
              <CTAButton>Unlock all 9 niches — ₱399 <ArrowRight className="h-4 w-4" /></CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------- features ------- */


function Features() {
  const items = [
    { icon: BookOpen, label: "Course Management", tint: "from-violet-500 to-purple-600" },
    { icon: Layout, label: "Intuitive User Interface", tint: "from-fuchsia-500 to-pink-500" },
    { icon: Layers, label: "Blended Learning", tint: "from-indigo-500 to-violet-600" },
    { icon: Smartphone, label: "Mobile Learning", tint: "from-cyan-500 to-blue-500" },
    { icon: Award, label: "Certification", tint: "from-amber-500 to-orange-500" },
    { icon: Users, label: "User Management", tint: "from-emerald-500 to-teal-500" },
    { icon: Sparkles, label: "Customization", tint: "from-pink-500 to-rose-500" },
    { icon: Trophy, label: "Gamification", tint: "from-yellow-500 to-amber-500" },
    { icon: RouteIcon, label: "Personalised Learning Paths", tint: "from-purple-600 to-fuchsia-600" },
    { icon: MessagesSquare, label: "Social Learning Tools", tint: "from-sky-500 to-indigo-500" },
    { icon: Zap, label: "Automation", tint: "from-orange-500 to-red-500" },
    { icon: Plug, label: "Integrations", tint: "from-teal-500 to-cyan-500" },
  ];
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5">
            Platform Features
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Top 12 LMS Features
          </h2>
          <p className="mt-3 text-slate-600">
            A learning experience built for modern Filipino freelancers — beautiful, mobile-friendly and easy to use.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.label}
              className="reveal rounded-2xl bg-white border border-slate-200 p-6 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-300"
            >
              <div className={`grid place-items-center h-14 w-14 rounded-2xl bg-gradient-to-br ${it.tint} text-white shadow-md shrink-0`}>
                <it.icon className="h-7 w-7" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{it.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">Built in, no setup needed</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatYouGet() {
  const items = [
    { icon: BookOpen, label: "81 Full-Length Lessons", desc: "Step-by-step video and text lessons across every niche." },
    { icon: ClipboardCheck, label: "Quiz After Every Lesson", desc: "Reinforce what you learn with 243 practice questions." },
    { icon: Award, label: "Completion Certificates", desc: "Get a certificate for every niche you finish." },
    { icon: LineChart, label: "Progress Tracking", desc: "See how far you've come across all 9 niches." },
    { icon: ShieldCheck, label: "Secure Token Login", desc: "Passwordless, safe access to your learning." },
    { icon: Mail, label: "Email Support", desc: "Real humans ready when you need a hand." },
  ];
  return (
    <section className="py-20 sm:py-28 bg-[#f8f6ff]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto reveal">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">What You Get</h2>
          <p className="mt-3 text-slate-600">Everything's included in the ₱399 all-access pass — forever.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.label} className="reveal rounded-2xl bg-white border border-violet-100 p-6 flex gap-4 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shrink-0">
                <it.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{it.label}</div>
                <p className="text-sm text-slate-600 mt-1">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Certificate() {
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center">
        <div className="reveal">
          <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5">
            Recognized Certificates
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Real Certificates You Can Show Off
          </h2>
          <p className="mt-4 text-slate-600 max-w-lg">
            Earn a shareable certificate for every niche you complete — perfect for LinkedIn and Upwork.
          </p>
          <div className="mt-6">
            <CTAButton>Start earning yours <ArrowRight className="h-4 w-4" /></CTAButton>
          </div>
        </div>
        <div className="reveal">
          <div className="cert-frame rounded-2xl border border-violet-100 shadow-2xl shadow-violet-500/10 bg-white p-3 hover:-translate-y-1 transition-transform duration-500">
            <img
              src={certAsset.url}
              alt="LearnHub PH certificate of completion"
              className="block w-full h-auto rounded-xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const perks = [
    "9 VA Niches",
    "27 Learning Modules",
    "81 Expert Lessons",
    "243 Quiz Questions",
    "9 Completion Certificates",
    "Lifetime Access – No Expiry",
    "GCash & BPI Bank Transfer Accepted",
  ];
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-b from-[#f8f6ff] to-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center reveal">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            One Payment. Lifetime Access.
          </h2>
          <p className="mt-3 text-slate-600">No subscriptions, no hidden fees.</p>
        </div>
        <div className="reveal relative mt-10 rounded-3xl bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#7c3aed] p-8 sm:p-10 text-white shadow-2xl shadow-violet-900/40 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl animate-blob" />
          <div className="relative flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/15 border border-white/25 backdrop-blur px-3 py-1 text-xs font-bold tracking-wide">
              ALL-ACCESS PASS
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-400 text-yellow-950 px-3 py-1 text-xs font-black">
              55% OFF
            </span>
          </div>
          <div className="relative mt-6 flex items-end gap-3">
            <span className="text-2xl text-white/60 line-through">₱899</span>
            <span className="text-6xl sm:text-7xl font-black leading-none">₱399</span>
            <span className="text-sm text-violet-100 pb-2">one-time · lifetime</span>
          </div>
          <ul className="relative mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-white/95">
                <CheckCircle2 className="h-5 w-5 text-fuchsia-300 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-8">
            <button
              type="button"
              onClick={go}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white text-violet-700 px-8 py-4 text-base font-bold shadow-xl shadow-black/30 hover:bg-violet-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300 transition-all"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-3 text-xs text-violet-100/80">Instant access · GCash & BPI Bank Transfer</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------- testimonials ------- */

const TESTIMONIALS = [
  {
    name: "Maria Santos",
    role: "Social Media VA",
    color: "from-pink-500 to-fuchsia-500",
    quote:
      "LearnHub PH gave me the confidence to land my first international client in just 6 weeks. The Social Media Manager niche was gold!",
  },
  {
    name: "Jose Reyes",
    role: "General VA",
    color: "from-violet-500 to-indigo-500",
    quote:
      "The lessons are so easy to follow. I now earn 3x my previous BPO salary working from home for a US client.",
  },
  {
    name: "Ana Cruz",
    role: "Ecommerce VA",
    color: "from-cyan-500 to-teal-500",
    quote:
      "₱399 for lifetime access is unreal. The E-Commerce VA course helped me manage a full Shopify store on my own.",
  },
];

function Testimonials() {
  return (
    <section id="reviews" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto reveal">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Student Stories</h2>
          <p className="mt-3 text-slate-600">Real Filipino VAs who leveled up with LearnHub PH.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="reveal rounded-2xl bg-gradient-to-b from-white to-violet-50/40 border border-violet-100 p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 transition-all"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-slate-700 leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className={`grid place-items-center h-11 w-11 rounded-full bg-gradient-to-br ${t.color} text-white font-black`}>
                  {t.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-tight">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#7c3aed]" />
      <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-fuchsia-400/30 blur-3xl animate-blob" />
      <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center reveal">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Ready to Start Your VA Journey?
        </h2>
        <p className="mt-4 text-violet-100 max-w-xl mx-auto">
          Join thousands of Filipinos building freelance careers with LearnHub PH.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={go}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-violet-700 px-8 py-4 text-base font-bold shadow-xl shadow-black/30 hover:bg-violet-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300 transition-all"
          >
            Create Your Free Account <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------- modal ------- */

function DocModal({
  open,
  title,
  iframeSrc,
  fallbackHref,
  onClose,
}: {
  open: boolean;
  title: string;
  iframeSrc: string;
  fallbackHref: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-modal-title"
      style={{ animation: "fade-up 0.25s ease-out both" }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] sm:w-full sm:max-w-[720px] max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 id="doc-modal-title" className="text-lg font-bold text-slate-900">
            {title}
          </h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <iframe
            src={iframeSrc}
            title={title}
            className="w-full rounded-lg border border-slate-200"
            style={{ height: "60vh", border: 0 }}
            allow="autoplay"
          />
          <p className="mt-3 text-sm text-slate-600">
            Document not loading?{" "}
            <a
              href={fallbackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-700 font-semibold hover:underline"
            >
              Open it directly →
            </a>
          </p>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-xl border border-violet-300 text-violet-700 bg-white px-4 py-2 text-sm font-semibold hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer({
  onPrivacy,
  onTerms,
}: {
  onPrivacy: () => void;
  onTerms: () => void;
}) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-white font-extrabold text-lg">
              LearnHub <span className="text-violet-400">PH</span>
            </span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <button
              type="button"
              onClick={onPrivacy}
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={onTerms}
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white"
            >
              Terms &amp; Conditions
            </button>
            <a href="mailto:johnfreycortez@gmail.com" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          © 2026 LearnHub PH. All rights reserved. | Learn More. Earn More.
        </div>
      </div>
    </footer>
  );
}

/* ---------------- root ---------------- */

function Landing() {
  useReveal();
  const [modal, setModal] = useState<"privacy" | "terms" | null>(null);
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Nav />
      <main>
        <Hero />
        <FeatureStrip />
        <Niches />
        <Curriculum />
        <Features />
        <WhatYouGet />
        <Certificate />
        <Pricing />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer onPrivacy={() => setModal("privacy")} onTerms={() => setModal("terms")} />
      <DocModal
        open={modal === "privacy"}
        title="Privacy Policy"
        iframeSrc="https://drive.google.com/file/d/1YRasHuCL5CnnpIVCK6wnXZsFN_G1RxQ0/preview"
        fallbackHref="https://drive.google.com/file/d/1YRasHuCL5CnnpIVCK6wnXZsFN_G1RxQ0/view?usp=drive_link"
        onClose={() => setModal(null)}
      />
      <DocModal
        open={modal === "terms"}
        title="Terms & Conditions"
        iframeSrc="https://drive.google.com/file/d/19eWx7_0MsJbQ3vNV7w2Icto6qYX0ALtz/preview"
        fallbackHref="https://drive.google.com/file/d/19eWx7_0MsJbQ3vNV7w2Icto6qYX0ALtz/view?usp=drive_link"
        onClose={() => setModal(null)}
      />
    </div>
  );
}
