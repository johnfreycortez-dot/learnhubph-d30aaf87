import nicheSocial from "../assets/niche-social.jpg.asset.json";
import nicheGeneral from "../assets/niche-generalva.jpg.asset.json";
import nicheAdmin from "../assets/niche-admin.jpg.asset.json";
import nicheDesigner from "../assets/niche-designer.jpg.asset.json";
import nicheBooks from "../assets/niche-bookkeeping.jpg.asset.json";
import nicheEcom from "../assets/niche-ecommerce.jpg.asset.json";
import nicheOps from "../assets/niche-operations.jpg.asset.json";
import nicheSupport from "../assets/niche-support.jpg.asset.json";
import nicheAppt from "../assets/niche-appointment.jpg.asset.json";

// Marketing/curriculum copy for all 9 niches — the single source of truth
// used by both the public landing page (index.tsx) and the public course
// marketing pages (courses.tsx / courses_.$nicheId.tsx). Order matches the
// NicheID ordering returned by the getNiches backend action (NICHE001..009).
export type Niche = {
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
    daily: "Manage social accounts, create content strategies, schedule posts, and report results to clients.",
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
    daily: "Handle research, admin tasks, inbox management, and client coordination as a well-rounded VA.",
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
    back: "#3d6b4f",
    daily: "Organize schedules, manage files, write professional emails, and automate admin workflows.",
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
    back: "#9b2d4f",
    daily: "Create social media graphics, brand kits, pitch decks, and ad creatives using Canva and Adobe tools.",
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
    back: "#1e4d78",
    daily: "Handle invoicing, expense tracking, bank reconciliation, and generate financial reports for clients.",
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
    back: "#8a4a10",
    daily: "Manage Shopify and Amazon stores, write product listings, track inventory, and handle customer orders.",
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
    back: "#1e3a7a",
    daily: "Map workflows, write SOPs, onboard team members, and track KPIs across remote operations.",
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
    back: "#8a2020",
    daily: "Handle tickets, live chat, phone support, and de-escalate difficult customer situations professionally.",
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
    back: "#4a2080",
    daily: "Research leads, send cold outreach, handle objections, and book qualified appointments for clients.",
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

export function findNicheByTitle(title?: string): Niche | undefined {
  if (!title) return undefined;
  return NICHES.find((n) => n.title.trim().toLowerCase() === title.trim().toLowerCase());
}
