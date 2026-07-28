// Shared SEO constants + structured-data helpers.
//
// SITE_URL is the canonical origin used to build canonical links, sitemap
// entries, and absolute JSON-LD URLs. Update this the moment you connect a
// custom domain — every canonical/OG/sitemap URL in the app is derived from
// this single constant, so nothing else needs to change.
export const SITE_URL = "https://learnhubph.lovable.app";
export const SITE_NAME = "LearnHub PH";
export const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/6krp3EM0SNNnRD2neVNsXI0ex7g1/social-images/social-1784933163089-LearnHub_PH_Social.webp";

export function canonical(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalLink(path: string) {
  return { rel: "canonical" as const, href: canonical(path) };
}

export function jsonLdScript(data: Record<string, unknown>) {
  return { type: "application/ld+json" as const, children: JSON.stringify(data) };
}

export function organizationJsonLd(logoUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    ...(logoUrl ? { logo: logoUrl } : {}),
    description:
      "Learn in-demand VA skills and start earning online. 9 niches, 81 lessons, quizzes and certificates. Lifetime access.",
    sameAs: [],
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function courseJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.image ? { image: opts.image } : {}),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
  };
}
