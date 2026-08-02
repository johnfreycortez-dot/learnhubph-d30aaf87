import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import {
  BookOpen,
  Layout,
  Layers,
  Smartphone,
  Award,
  Users,
  Sparkles,
  Trophy,
  Route as RouteIcon,
  MessagesSquare,
  Zap,
  Plug,
  CheckCircle2,
  ClipboardCheck,
  LineChart,
  ShieldCheck,
  Mail,
  Star,
  X,
  ArrowRight,
  Globe,
  RefreshCw,
  Check,
  GraduationCap,
  ChevronDown,
  Headphones,
  Bot,
  LayoutDashboard,
  ClipboardList,
  PlayCircle,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

import logoAsset from "../assets/learnhub-logo.png.asset.json";
import certAsset from "../assets/learnhub-cert.png.asset.json";
import devicesMockup from "../assets/learnhub-devices-mockup.png";
import shotDashboard from "../assets/screenshot-dashboard.png";
import shotCourses from "../assets/screenshot-courses.png";
import shotLessons from "../assets/screenshot-lessons.png";
import shotCertificates from "../assets/screenshot-certificates.png";
import shotSettings from "../assets/screenshot-settings.png";
import shotChatbot from "../assets/screenshot-chatbot.png";
import shotHelp from "../assets/screenshot-help.png";
import shotCurriculum from "../assets/screenshot-curriculum.png";
import { NICHES, type Niche } from "../data/niches";
import { canonicalLink } from "../lib/seo";
import { DocModal, LEGAL_DOCS } from "../components/DocModal";

const CTA_URL =
  "https://script.google.com/macros/s/AKfycbzqGxB3gqNqHL1jWsDzq5t9qyj4mgsRtpOb_X7WCm3-cY6wU7GsLrVkkXsxWnTyn9oDdg/exec";

const go = () => {
  window.location.href = CTA_URL;
};
const goToLogin = () => {
  window.location.href = "/login";
};
const goToTour = () => {
  window.location.href = "/tour";
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
    links: [canonicalLink("/")],
    scripts: [jsonLdScript(homeCourseJsonLd(DEFAULT_OG_IMAGE))],
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
    "ghost-white": "border border-white/40 text-white bg-white/10 backdrop-blur hover:bg-white/20",
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick ?? goToLogin}
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
                scrolled ? "text-slate-700 hover:text-violet-700" : "text-white/85 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <button
            type="button"
            onClick={goToTour}
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 ${
              scrolled
                ? "border-violet-300 text-violet-700 hover:bg-violet-50"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            <RouteIcon className="h-4 w-4" /> Tour Me
          </button>
          <button
            type="button"
            onClick={goToLogin}
            className={`hidden sm:inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 ${
              scrolled
                ? "border-violet-300 text-violet-700 hover:bg-violet-50"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            Sign In
          </button>
          <CTAButton className="!px-4 !py-2" onClick={goToLogin}>
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

function Stat({
  value,
  suffix = "",
  label,
  badge,
}: {
  value: number | string;
  suffix?: string;
  label: string;
  badge?: string;
}) {
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
    <div
      ref={ref}
      className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-4 sm:px-5 sm:py-5 text-left relative overflow-hidden"
    >
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

// Shared niche data — used by Hero cycle AND flip cards
type NicheColor = {
  caps: string; // watermark all-caps short name
  gradient: string; // 4-stop diagonal gradient
  accent: string; // solid accent color (button text on white)
  description: string;
  skills: string[];
};
const NICHE_COLORS: Record<string, NicheColor> = {
  "Social Media Manager": {
    caps: "SOCIAL MEDIA",
    gradient: "linear-gradient(135deg, #3b0764, #7c3aed, #a855f7, #6d28d9)",
    accent: "#7c3aed",
    description:
      "As a Social Media Manager VA, you'll learn to build and run social media accounts for clients from scratch. You'll create content calendars, design graphics, write captions, schedule posts, and deliver monthly performance reports — everything a client needs to grow their brand online.",
    skills: [
      "Plan and schedule content across Facebook, Instagram, TikTok and LinkedIn",
      "Design on-brand graphics and write captions that drive engagement",
      "Read analytics and present performance results to clients professionally",
    ],
  },
  "General VA": {
    caps: "GENERAL VA",
    gradient: "linear-gradient(135deg, #042f2e, #0d9488, #14b8a6, #0f766e)",
    accent: "#0d9488",
    description:
      "As a General VA, you'll become the go-to support person every remote business owner needs. You'll master the tools, communication skills, and workflows that let you hit the ground running from day one — and attract your first paying client faster than you think.",
    skills: [
      "Manage emails, calendars, research tasks and day-to-day admin work",
      "Use Google Workspace, Trello, Asana, Slack and Zoom confidently",
      "Build a portfolio and write proposals that win clients on Upwork and OnlineJobs",
    ],
  },
  "Admin Assistant": {
    caps: "ADMIN",
    gradient: "linear-gradient(135deg, #052e16, #16a34a, #4ade80, #15803d)",
    accent: "#16a34a",
    description:
      "As an Admin Assistant VA, you'll handle the behind-the-scenes work that keeps businesses running smoothly. From organizing files and writing professional emails to automating repetitive tasks — you'll be indispensable to any remote team that hires you.",
    skills: [
      "Manage calendars, schedules, files and cloud storage systems",
      "Write professional emails, meeting minutes and client-ready documents",
      "Automate workflows using Make.com and Zapier to save clients hours every week",
    ],
  },
  "Graphic Designer": {
    caps: "DESIGN",
    gradient: "linear-gradient(135deg, #4c0519, #e11d48, #fb7185, #be123c)",
    accent: "#e11d48",
    description:
      "As a Graphic Designer VA, you'll create professional visual content for clients using Canva and Adobe tools — no design degree required. You'll deliver everything from social media graphics to full brand kits, ad creatives, and pitch decks that impress.",
    skills: [
      "Master color, typography and layout fundamentals for professional-quality output",
      "Design social posts, stories, ad creatives, thumbnails and presentation decks",
      "Build complete brand kits and confidently package and price your design services",
    ],
  },
  "Bookkeeping VA": {
    caps: "BOOKKEEPING",
    gradient: "linear-gradient(135deg, #172554, #2563eb, #60a5fa, #1d4ed8)",
    accent: "#2563eb",
    description:
      "As a Bookkeeping VA, you'll handle the financial admin that every business owner dreads doing themselves. You'll manage invoices, track expenses, reconcile accounts, and generate reports using QuickBooks and Wave — no accounting degree needed.",
    skills: [
      "Code transactions, reconcile accounts and manage expense categories accurately",
      "Create and send invoices, track payments and support basic payroll tasks",
      "Generate clear financial reports for clients using QuickBooks Online and Wave",
    ],
  },
  "E-Commerce VA": {
    caps: "E-COMMERCE",
    gradient: "linear-gradient(135deg, #431407, #ea580c, #fb923c, #c2410c)",
    accent: "#ea580c",
    description:
      "As an E-Commerce VA, you'll manage online stores end-to-end for clients selling on Shopify and Amazon. You'll handle product listings, inventory, customer orders, supplier coordination, and review management — keeping the store running without the owner.",
    skills: [
      "Navigate Shopify and Amazon Seller Central and manage store settings confidently",
      "Write product descriptions that sell and maintain accurate inventory records",
      "Process orders, handle returns, respond to customers and coordinate with suppliers",
    ],
  },
  "Operations Assistant": {
    caps: "OPERATIONS",
    gradient: "linear-gradient(135deg, #1e1b4b, #4f46e5, #818cf8, #4338ca)",
    accent: "#4f46e5",
    description:
      "As an Operations Assistant VA, you'll help businesses run more efficiently by mapping workflows, eliminating bottlenecks, and building the systems remote teams rely on daily. You'll become the person who makes sure everything actually gets done.",
    skills: [
      "Use ClickUp, Monday.com and Notion to manage projects and team tasks",
      "Write clear SOPs and process maps that any team member can follow",
      "Onboard remote team members, track KPIs and run productive team meetings",
    ],
  },
  "Customer Support Specialist": {
    caps: "SUPPORT",
    gradient: "linear-gradient(135deg, #450a0a, #dc2626, #f87171, #b91c1c)",
    accent: "#dc2626",
    description:
      "As a Customer Support Specialist VA, you'll handle every type of customer interaction with professionalism and empathy. From email tickets and live chat to phone calls and angry customer de-escalation — you'll be the voice clients trust to protect their brand.",
    skills: [
      "Use Zendesk and Freshdesk to manage tickets, chats and support queues",
      "Handle refunds, replacements and policy enforcement with confidence",
      "De-escalate difficult customers and know exactly when and how to escalate issues",
    ],
  },
  "Appointment Setter": {
    caps: "APPOINTMENTS",
    gradient: "linear-gradient(135deg, #2e1065, #7c3aed, #c084fc, #6d28d9)",
    accent: "#7c3aed",
    description:
      "As an Appointment Setter VA, you'll generate qualified leads and fill your client's calendar with booked calls. You'll learn cold outreach, objection handling, follow-up sequences, and CRM tools — the exact skills high-paying sales-focused clients hire for.",
    skills: [
      "Research target leads, build lead lists and craft outreach messages that get replies",
      "Handle common objections confidently and follow up with sequences that convert",
      "Use Calendly, HubSpot and GoHighLevel to manage bookings and track results",
    ],
  },
};

const HERO_ORDER: string[] = [
  "Social Media Manager",
  "General VA",
  "Admin Assistant",
  "Graphic Designer",
  "Bookkeeping VA",
  "E-Commerce VA",
  "Operations Assistant",
  "Customer Support Specialist",
  "Appointment Setter",
];

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Two-layer gradient crossfade
  const [layerAGradient, setLayerAGradient] = useState(NICHE_COLORS[HERO_ORDER[0]].gradient);
  const [layerBGradient, setLayerBGradient] = useState(NICHE_COLORS[HERO_ORDER[0]].gradient);
  const [layerAOpacity, setLayerAOpacity] = useState(1);
  const [layerBOpacity, setLayerBOpacity] = useState(0);
  const aIsCurrentRef = useRef(true);
  // Watermark text lags behind for fade-out
  const [displayIndex, setDisplayIndex] = useState(0);
  const [wmVisible, setWmVisible] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const goToIndex = (nextIdx: number) => {
    const nextGradient = NICHE_COLORS[HERO_ORDER[nextIdx]].gradient;
    // Crossfade: whichever layer is currently visible fades out, the other takes new gradient and fades in
    if (aIsCurrentRef.current) {
      setLayerBGradient(nextGradient);
      // next frame trigger transition
      requestAnimationFrame(() => {
        setLayerAOpacity(0);
        setLayerBOpacity(1);
      });
    } else {
      setLayerAGradient(nextGradient);
      requestAnimationFrame(() => {
        setLayerBOpacity(0);
        setLayerAOpacity(1);
      });
    }
    aIsCurrentRef.current = !aIsCurrentRef.current;
    setCurrentIndex(nextIdx);
    // Watermark fade
    setWmVisible(false);
    window.setTimeout(() => {
      setDisplayIndex(nextIdx);
      setWmVisible(true);
    }, 400);
  };

  const startInterval = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setCurrentIndex((i) => {
        const next = (i + 1) % HERO_ORDER.length;
        // Call goToIndex-like without recursion via state
        return next;
      });
    }, 10000);
  };

  // Drive crossfade when currentIndex changes via interval
  const lastAppliedRef = useRef(0);
  useEffect(() => {
    if (currentIndex === lastAppliedRef.current) return;
    const nextIdx = currentIndex;
    lastAppliedRef.current = nextIdx;
    const nextGradient = NICHE_COLORS[HERO_ORDER[nextIdx]].gradient;
    if (aIsCurrentRef.current) {
      setLayerBGradient(nextGradient);
      requestAnimationFrame(() => {
        setLayerAOpacity(0);
        setLayerBOpacity(1);
      });
    } else {
      setLayerAGradient(nextGradient);
      requestAnimationFrame(() => {
        setLayerBOpacity(0);
        setLayerAOpacity(1);
      });
    }
    aIsCurrentRef.current = !aIsCurrentRef.current;
    setWmVisible(false);
    const t = window.setTimeout(() => {
      setDisplayIndex(nextIdx);
      setWmVisible(true);
    }, 400);
    return () => window.clearTimeout(t);
  }, [currentIndex]);

  useEffect(() => {
    if (reduced) return;
    startInterval();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [reduced]);

  const jumpTo = (i: number) => {
    if (i === currentIndex) return;
    setCurrentIndex(i);
    if (!reduced) startInterval(); // reset timer
  };

  const activeName = HERO_ORDER[currentIndex];
  const displayName = HERO_ORDER[displayIndex];
  const displayCaps = NICHE_COLORS[displayName].caps;

  const layerBaseStyle = {
    position: "absolute" as const,
    inset: 0,
    backgroundSize: "200% 200%",
    backgroundPosition: "0% 50%",
    transition: "opacity 1.5s ease-in-out",
    animation: reduced ? undefined : "gradientShift 8s ease-in-out infinite",
    pointerEvents: "none" as const,
  };

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-32"
      style={{ backgroundColor: "#2e1065" }}
    >
      {/* Gradient crossfade layers */}
      <div
        aria-hidden="true"
        style={{
          ...layerBaseStyle,
          backgroundImage: layerAGradient,
          opacity: layerAOpacity,
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          ...layerBaseStyle,
          backgroundImage: layerBGradient,
          opacity: layerBOpacity,
          zIndex: 0,
        }}
      />

      {/* blobs */}
      <div
        className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-blob"
        style={{ zIndex: 1 }}
      />
      <div
        className="absolute top-40 -right-16 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl animate-blob"
        style={{ animationDelay: "-6s", zIndex: 1 }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob"
        style={{ animationDelay: "-12s", zIndex: 1 }}
      />

      {/* watermark niche name — bottom-left, cropped */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ zIndex: 2 }}
      >
        <span
          style={{
            position: "absolute",
            bottom: "-15px",
            left: "-10px",
            fontSize: "clamp(60px, 8vw, 110px)",
            fontWeight: 900,
            color: "rgba(255,255,255,0.05)",
            letterSpacing: "-3px",
            lineHeight: 1,
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
            opacity: wmVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          {displayCaps}
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
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
            Get lifetime access to 81 expert lessons, quizzes, and certificates across 9 high-paying
            VA specializations — now at <span className="line-through opacity-70">₱899</span>{" "}
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
            <CTAButton className="!px-6 !py-3.5 !text-base" onClick={goToLogin}>
              Get Started <ArrowRight className="h-5 w-5" />
            </CTAButton>
            <button
              type="button"
              onClick={goToTour}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 backdrop-blur px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/15 transition"
            >
              <RouteIcon className="h-4 w-4" /> Tour Me
            </button>
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
          <img
            src={devicesMockup}
            alt="LearnHub PH shown on laptop, tablet, and phone"
            className="relative block w-full h-auto animate-float"
            loading="eager"
          />
          <div
            className="absolute -top-4 -left-4 rounded-xl bg-white shadow-xl border border-violet-100 px-3 py-2 text-xs font-semibold text-slate-800 flex items-center gap-2 animate-float"
            style={{ animationDelay: "-2s" }}
          >
            <GraduationCap className="h-4 w-4 text-violet-600" />{" "}
            <span>
              Now Learning: <span className="text-violet-700">{activeName}</span>
            </span>
          </div>
          <div
            className="absolute bottom-8 right-2 rounded-xl bg-white shadow-xl border border-violet-100 px-3 py-2 text-xs font-semibold text-slate-800 flex items-center gap-2 animate-float"
            style={{ animationDelay: "-4s" }}
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" /> 1 Lesson Completed
          </div>
        </div>
      </div>

      {/* progress dots — clickable */}
      <div className="relative z-10 mt-10 flex items-center justify-center gap-2">
        {HERO_ORDER.map((n, i) => {
          const isActive = i === currentIndex;
          return (
            <button
              key={n}
              type="button"
              aria-label={`Show ${n}`}
              onClick={() => jumpTo(i)}
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
                transition: "all 0.4s ease",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            />
          );
        })}
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

function FlipCard({ niche }: { niche: Niche }) {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div
      className="reveal group"
      style={{ perspective: "1000px", width: "100%", minHeight: "420px", height: "480px" }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsFlipped((flipped) => !flipped);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${niche.title} — click to ${isFlipped ? "flip back" : "learn more"}`}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.7s ease",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          cursor: "pointer",
        }}
        onClick={() => setIsFlipped((flipped) => !flipped)}
      >
        {/* front */}
        <div
          className="rounded-2xl bg-white border border-violet-100 shadow-sm overflow-hidden flex flex-col transition-all group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-violet-500/10 group-hover:border-violet-300"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="w-full bg-white overflow-hidden shrink-0" style={{ height: "210px" }}>
            <img
              src={niche.img.url}
              alt={niche.title}
              className="w-full h-full object-cover block"
              loading="lazy"
            />
          </div>
          <div className="p-5 flex flex-col flex-1 min-h-0">
            <h3 className="text-lg font-bold text-slate-900">{niche.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1 overflow-hidden">
              {niche.short}
            </p>
            <span className="mt-3 text-xs font-semibold text-violet-600 inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Click to flip →
            </span>
          </div>
        </div>
        {/* back */}
        {(() => {
          const meta = NICHE_COLORS[niche.title];
          const gradient =
            meta?.gradient ?? `linear-gradient(135deg, ${niche.back}, ${niche.back})`;
          const accent = meta?.accent ?? niche.back;
          const description = meta?.description ?? niche.daily;
          const skills = meta?.skills ?? [];
          return (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                backgroundImage: gradient,
                backgroundSize: "300% 300%",
                backgroundPosition: "0% 50%",
                animation:
                  "gradientShift 6s ease-in-out infinite, pulseGlow 4s ease-in-out infinite",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.20)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
                overflow: "hidden",
                color: "white",
              }}
            >
              {/* decorative orbs */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "-40px",
                  width: "160px",
                  height: "160px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.15)",
                  filter: "blur(40px)",
                  animation: "orbFloat1 9s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: "-50px",
                  left: "-40px",
                  width: "180px",
                  height: "180px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.12)",
                  filter: "blur(40px)",
                  animation: "orbFloat2 10s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />

              {/* header */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
                  {niche.title}
                </h3>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "9999px",
                  }}
                >
                  VA Specialization
                </span>
              </div>

              {/* description */}
              <p
                style={{
                  position: "relative",
                  zIndex: 1,
                  margin: 0,
                  fontSize: "13px",
                  lineHeight: 1.6,
                  opacity: 0.9,
                }}
              >
                {description}
              </p>

              {/* skills */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    opacity: 0.6,
                    marginBottom: "8px",
                    fontWeight: 700,
                  }}
                >
                  What You'll Learn
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {skills.map((s) => (
                    <li
                      key={s}
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-start",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        opacity: 0.9,
                      }}
                    >
                      <Check
                        size={12}
                        style={{ marginTop: "4px", flexShrink: 0 }}
                        aria-hidden="true"
                      />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToLogin();
                  }}
                  className="active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 transition"
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "white",
                    color: accent,
                    fontWeight: 700,
                    fontSize: "14px",
                    height: "44px",
                    borderRadius: "10px",
                    border: 0,
                    cursor: "pointer",
                  }}
                >
                  Enroll Now <ArrowRight size={16} />
                </button>
                <span
                  style={{
                    marginTop: "8px",
                    display: "inline-flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={12} aria-hidden="true" />
                  Click to flip back
                </span>
              </div>
            </div>
          );
        })()}
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
            One payment of ₱399 (was ₱899, 55% OFF) unlocks all 9 specializations — with lessons,
            quizzes and certificates for each.
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

/* ------- platform screenshot showcase ------- */

const PLATFORM_SHOTS: {
  name: string;
  desc: string;
  icon: typeof LayoutDashboard;
  src: string;
}[] = [
  {
    name: "Dashboard",
    desc: "Track lessons, progress and upcoming activity at a glance.",
    icon: LayoutDashboard,
    src: shotDashboard,
  },
  {
    name: "Courses",
    desc: "Browse all 9 VA learning paths and jump right in.",
    icon: BookOpen,
    src: shotCourses,
  },
  {
    name: "Lessons",
    desc: "Work through modules and mark lessons complete as you go.",
    icon: PlayCircle,
    src: shotLessons,
  },
  {
    name: "My Certificates",
    desc: "Earn a downloadable certificate for every niche you finish.",
    icon: Award,
    src: shotCertificates,
  },
  {
    name: "Account Settings",
    desc: "Manage your profile and account details in one place.",
    icon: Settings,
    src: shotSettings,
  },
  {
    name: "Live Chat Support",
    desc: "Get instant answers from the LearnHub PH support bot.",
    icon: Bot,
    src: shotChatbot,
  },
  {
    name: "Help Center",
    desc: "Guides, FAQs and support whenever you need a hand.",
    icon: HelpCircle,
    src: shotHelp,
  },
  {
    name: "Course Curriculum",
    desc: "Preview every module and lesson before you enroll.",
    icon: ClipboardList,
    src: shotCurriculum,
  },
];

function ScreenshotLightbox({
  shot,
  onClose,
}: {
  shot: (typeof PLATFORM_SHOTS)[number] | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!shot) return;
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
  }, [shot, onClose]);

  if (!shot) return null;
  const Icon = shot.icon;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="screenshot-lightbox-title"
      style={{ animation: "fade-up 0.25s ease-out both" }}
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 text-white shrink-0">
              <Icon className="h-4 w-4" />
            </span>
            <h3
              id="screenshot-lightbox-title"
              className="text-base sm:text-lg font-bold text-slate-900 truncate"
            >
              {shot.name}
            </h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-[#f1f0fb] p-3 sm:p-5">
          <img
            src={shot.src}
            alt={`${shot.name} screenshot enlarged`}
            className="w-full h-auto rounded-lg border border-violet-100 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

function ScreenshotShowcase() {
  const [index, setIndex] = useState(0);
  const [layerAShot, setLayerAShot] = useState(PLATFORM_SHOTS[0]);
  const [layerBShot, setLayerBShot] = useState(PLATFORM_SHOTS[0]);
  const [layerAOpacity, setLayerAOpacity] = useState(1);
  const [layerBOpacity, setLayerBOpacity] = useState(0);
  const aIsCurrentRef = useRef(true);
  const intervalRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const [lightboxShot, setLightboxShot] = useState<(typeof PLATFORM_SHOTS)[number] | null>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const applyIndex = (nextIdx: number) => {
    const nextShot = PLATFORM_SHOTS[nextIdx];
    if (aIsCurrentRef.current) {
      setLayerBShot(nextShot);
      requestAnimationFrame(() => {
        setLayerAOpacity(0);
        setLayerBOpacity(1);
      });
    } else {
      setLayerAShot(nextShot);
      requestAnimationFrame(() => {
        setLayerBOpacity(0);
        setLayerAOpacity(1);
      });
    }
    aIsCurrentRef.current = !aIsCurrentRef.current;
    setIndex(nextIdx);
  };

  const startInterval = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      const next = (indexRef.current + 1) % PLATFORM_SHOTS.length;
      applyIndex(next);
    }, 10000);
  };

  useEffect(() => {
    if (reduced) return;
    startInterval();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const jumpTo = (i: number) => {
    if (i === index) return;
    applyIndex(i);
    startInterval();
  };

  const goPrev = () => jumpTo((index - 1 + PLATFORM_SHOTS.length) % PLATFORM_SHOTS.length);
  const goNext = () => jumpTo((index + 1) % PLATFORM_SHOTS.length);

  const currentShot = PLATFORM_SHOTS[index];
  const CurrentIcon = currentShot.icon;

  const layerBase: CSSProperties = {
    position: "absolute",
    inset: 0,
    transition: "opacity 0.7s ease",
  };

  return (
    <div className="mt-16">
      <div className="text-center max-w-2xl mx-auto reveal">
        <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5">
          Live Platform Preview
        </span>
        <h3 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          A Closer Look at LearnHub PH
        </h3>
        <p className="mt-3 text-slate-600">
          From your first login to your final certificate — here's every screen you'll use along
          the way.
        </p>
      </div>

      <div className="mt-10 max-w-3xl mx-auto reveal">
        <div className="relative animate-float" style={{ animationDuration: "7s" }}>
          <div className="relative rounded-2xl border border-violet-100 bg-white shadow-2xl shadow-violet-900/10 overflow-hidden">
            {/* browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[#f8f6ff] border-b border-violet-100">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 truncate rounded-md bg-white border border-violet-100 px-2.5 py-1 text-xs text-slate-400">
                learnhubph.com
              </span>
            </div>

            {/* crossfading screenshot */}
            <button
              type="button"
              onClick={() => setLightboxShot(currentShot)}
              className="group relative block w-full h-64 sm:h-96 bg-[#f1f0fb] overflow-hidden cursor-zoom-in focus-visible:outline-none"
              aria-label={`Enlarge ${currentShot.name} screenshot`}
            >
              <img
                src={layerAShot.src}
                alt=""
                className="h-full w-full object-cover object-top"
                style={{ ...layerBase, opacity: layerAOpacity }}
              />
              <img
                src={layerBShot.src}
                alt=""
                className="h-full w-full object-cover object-top"
                style={{ ...layerBase, opacity: layerBOpacity }}
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/50 backdrop-blur px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-3.5 w-3.5" /> Click to enlarge
              </span>
            </button>
          </div>

          {/* floating name badge */}
          <div className="relative z-10 -mt-5 ml-5 inline-flex items-center gap-2.5 rounded-xl bg-white shadow-lg border border-violet-100 px-4 py-2.5 text-sm font-bold text-slate-800">
            <span className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 text-white shrink-0">
              <CurrentIcon className="h-4 w-4" />
            </span>
            {currentShot.name}
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500 min-h-[1.25rem]">
          {currentShot.desc}
        </p>

        {/* controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous screenshot"
            className="grid place-items-center h-9 w-9 rounded-full border border-violet-200 text-violet-600 bg-white hover:bg-violet-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            {PLATFORM_SHOTS.map((s, i) => (
              <button
                key={s.name}
                type="button"
                aria-label={`Show ${s.name}`}
                onClick={() => jumpTo(i)}
                style={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                }}
                className={`transition-all duration-300 ${
                  i === index ? "bg-violet-600" : "bg-violet-200 hover:bg-violet-300"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next screenshot"
            className="grid place-items-center h-9 w-9 rounded-full border border-violet-200 text-violet-600 bg-white hover:bg-violet-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ScreenshotLightbox shot={lightboxShot} onClose={() => setLightboxShot(null)} />
    </div>
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
                          <span className="text-slate-400 text-xs mr-1">
                            Lesson {mi * 3 + li + 1}.
                          </span>
                          {l}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            <div className="mt-6">
              <CTAButton onClick={goToLogin}>
                Unlock all 9 niches — ₱399 <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>

        <ScreenshotShowcase />
      </div>
    </section>
  );
}

/* ------- features ------- */

function Features() {
  const items = [
    {
      icon: BookOpen,
      label: "Course Management",
      tint: "from-violet-500 to-purple-600",
      desc: "Structured niches, modules, and lessons that keep every learner on a clear path to mastery.",
    },
    {
      icon: Layout,
      label: "Intuitive User Interface",
      tint: "from-fuchsia-500 to-pink-500",
      desc: "Clean, distraction-free screens so students spend their time learning, not figuring out the app.",
    },
    {
      icon: Layers,
      label: "Blended Learning",
      tint: "from-indigo-500 to-violet-600",
      desc: "Video, text, and hands-on practice combined for lessons that actually stick.",
    },
    {
      icon: Smartphone,
      label: "Mobile Learning",
      tint: "from-cyan-500 to-blue-500",
      desc: "A fully responsive dashboard, so students can learn on their phone between shifts or commutes.",
    },
    {
      icon: Award,
      label: "Certification",
      tint: "from-amber-500 to-orange-500",
      desc: "Auto-generated certificates the moment a niche is completed — proof clients can trust.",
    },
    {
      icon: Users,
      label: "User Management",
      tint: "from-emerald-500 to-teal-500",
      desc: "Effortless enrollment, access control, and student records, all in one place.",
    },
    {
      icon: Sparkles,
      label: "Customization",
      tint: "from-pink-500 to-rose-500",
      desc: "Branded colors, badges, and layouts that make the platform feel like your own.",
    },
    {
      icon: Trophy,
      label: "Gamification",
      tint: "from-yellow-500 to-amber-500",
      desc: "Progress bars, streaks, and milestones that keep students motivated to finish what they start.",
    },
    {
      icon: RouteIcon,
      label: "Personalised Learning Paths",
      tint: "from-purple-600 to-fuchsia-600",
      desc: "Sequential unlocking keeps each student on the right lesson at the right time, at their own pace.",
    },
    {
      icon: MessagesSquare,
      label: "Social Learning Tools",
      tint: "from-sky-500 to-indigo-500",
      desc: "Built-in messaging keeps students and instructors connected throughout the course.",
    },
    {
      icon: Zap,
      label: "Automation",
      tint: "from-orange-500 to-red-500",
      desc: "Enrollment, unlocking, notifications, and certificates all run themselves in the background.",
    },
    {
      icon: Plug,
      label: "Integrations",
      tint: "from-teal-500 to-cyan-500",
      desc: "Works with the tools you already use, so nothing needs to be rebuilt from scratch.",
    },
    {
      icon: Headphones,
      label: "Live Support (9AM–9PM Weekdays)",
      tint: "from-green-500 to-emerald-600",
      desc: "A real team member is just a click away, Monday to Friday, whenever students need extra help.",
    },
    {
      icon: Bot,
      label: "AI Chatbot",
      tint: "from-blue-600 to-indigo-700",
      desc: "Instant answers on pricing, courses, and certificates — day or night, no waiting required.",
    },
  ];
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5">
            Platform Features
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Top 14 LMS Features
          </h2>
          <p className="mt-3 text-slate-600">
            A learning experience built for modern Filipino freelancers — beautiful, mobile-friendly
            and easy to use.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.label}
              className="reveal rounded-2xl bg-white border border-slate-200 p-6 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-300"
            >
              <div
                className={`grid place-items-center h-14 w-14 rounded-2xl bg-gradient-to-br ${it.tint} text-white shadow-md shrink-0`}
              >
                <it.icon className="h-7 w-7" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{it.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{it.desc}</div>
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
    {
      icon: BookOpen,
      label: "81 Full-Length Lessons",
      desc: "Step-by-step video and text lessons across every niche.",
    },
    {
      icon: ClipboardCheck,
      label: "Quiz After Every Lesson",
      desc: "Reinforce what you learn with 243 practice questions.",
    },
    {
      icon: Award,
      label: "Completion Certificates",
      desc: "Get a certificate for every niche you finish.",
    },
    {
      icon: LineChart,
      label: "Progress Tracking",
      desc: "See how far you've come across all 9 niches.",
    },
    {
      icon: ShieldCheck,
      label: "Secure Token Login",
      desc: "Passwordless, safe access to your learning.",
    },
    { icon: Mail, label: "Email Support", desc: "Real humans ready when you need a hand." },
  ];
  return (
    <section className="py-20 sm:py-28 bg-[#f8f6ff]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto reveal">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            What You Get
          </h2>
          <p className="mt-3 text-slate-600">
            Everything's included in the ₱399 all-access pass — forever.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {items.map((it) => (
            <div
              key={it.label}
              className="reveal rounded-2xl bg-white border border-violet-100 p-6 flex gap-4 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
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
            Earn a shareable certificate for every niche you complete — perfect for LinkedIn and
            Upwork.
          </p>
          <div className="mt-6">
            <CTAButton onClick={goToLogin}>
              Start earning yours <ArrowRight className="h-4 w-4" />
            </CTAButton>
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
              onClick={goToLogin}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white text-violet-700 px-8 py-4 text-base font-bold shadow-xl shadow-black/30 hover:bg-violet-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300 transition-all"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-3 text-xs text-violet-100/80">
              Instant access · GCash & BPI Bank Transfer
            </p>
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

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I access the course after payment?",
    a: "Once your GCash payment or Bank transfer is verified by our team, you'll receive an email with your personal access token. Use that token along with your registered email to log in at learnhubph.lovable.app. Access is granted within 24 hours of payment confirmation.",
  },
  {
    q: "Is this really a one-time payment?",
    a: "Yes — you pay ₱399 once and get lifetime access to all 9 VA niches, 81 lessons, 243 quiz questions, and 9 completion certificates. No monthly fees, no renewals, no hidden charges.",
  },
  {
    q: "Do I need prior experience to enroll?",
    a: "No experience needed at all. LearnHub PH is designed for complete beginners who want to start a VA career. The lessons start from the basics and build up to real, client-ready skills step by step.",
  },
  {
    q: "Can I take all 9 niches or just one?",
    a: "You get access to all 9 niches with your single payment. You can start with any niche you want, learn at your own pace, and complete as many as you like. Most students pick one niche to focus on first and expand from there.",
  },
  {
    q: "How do I earn my certificate?",
    a: "Complete all 9 lessons in a niche and pass the quizzes at the end of each lesson. Once you finish all requirements for a niche, your certificate is automatically generated and available to download from your dashboard.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept GCash payments & BPI Bank transfer only. After signing up, you'll receive our GCash details and instructions on how to submit your proof of payment for verification.",
  },
  {
    q: "How long does it take to finish a niche?",
    a: "Each niche has 9 lessons across 3 modules. Most students complete a single niche in 3 to 7 days depending on their pace. There are no deadlines — you can go as fast or as slow as you need.",
  },
  {
    q: "What if I have a question or need help?",
    a: "You can reach us through the Messages section inside the platform after logging in, or by emailing us directly. Our team typically responds within 24 hours on business days.",
  },
  {
    q: "Is LearnHub PH only for Filipinos?",
    a: "LearnHub PH was built with Filipino VAs in mind but is open to anyone who wants to build a VA career. The content is in English and the skills taught are applicable to working with international clients worldwide.",
  },
  {
    q: "Are the certificates recognized by employers?",
    a: "LearnHub PH certificates demonstrate that you have completed structured training in a specific VA niche. While they are not government-accredited, they serve as strong portfolio proof of your skills — especially when applying on platforms like Upwork, OnlineJobs.ph, and LinkedIn.",
  },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#f8f6ff]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center reveal">
          <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5">
            Got Questions?
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-slate-600">
            Everything you need to know before getting started with LearnHub PH.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 reveal">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={f.q}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  style={{
                    background: isOpen ? "#faf5ff" : "white",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: isOpen ? "#7c3aed" : "#0f172a",
                    transition: "background 0.2s ease, color 0.2s ease",
                    cursor: "pointer",
                    border: 0,
                  }}
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      flexShrink: 0,
                      transition: "transform 0.3s ease",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      color: isOpen ? "#7c3aed" : "#64748b",
                    }}
                    aria-hidden="true"
                  />
                </button>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.3s ease",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        borderTop: "1px solid #f3f4f6",
                        padding: "16px 20px",
                        fontSize: "14px",
                        color: "#4b5563",
                        lineHeight: 1.7,
                      }}
                    >
                      {f.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="reviews" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto reveal">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Student Stories
          </h2>
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
                <div
                  className={`grid place-items-center h-11 w-11 rounded-full bg-gradient-to-br ${t.color} text-white font-black`}
                >
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
      <div
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl animate-blob"
        style={{ animationDelay: "-8s" }}
      />
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
            onClick={goToLogin}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-violet-700 px-8 py-4 text-base font-bold shadow-xl shadow-black/30 hover:bg-violet-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300 transition-all"
          >
            Create Your Free Account <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------- modal (see components/DocModal.tsx) ------- */

function Footer({ onPrivacy, onTerms }: { onPrivacy: () => void; onTerms: () => void }) {
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
            <a
              href="mailto:learnhubph@proton.me"
              className="hover:text-white transition-colors"
            >
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
        <FAQ />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer onPrivacy={() => setModal("privacy")} onTerms={() => setModal("terms")} />
      <DocModal
        open={modal === "privacy"}
        title={LEGAL_DOCS.privacy.title}
        iframeSrc={LEGAL_DOCS.privacy.iframeSrc}
        fallbackHref={LEGAL_DOCS.privacy.fallbackHref}
        onClose={() => setModal(null)}
      />
      <DocModal
        open={modal === "terms"}
        title={LEGAL_DOCS.terms.title}
        iframeSrc={LEGAL_DOCS.terms.iframeSrc}
        fallbackHref={LEGAL_DOCS.terms.fallbackHref}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
