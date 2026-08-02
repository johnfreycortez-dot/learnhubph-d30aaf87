import { createFileRoute } from "@tanstack/react-router";
import { gasCall } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

// Dynamic rather than a static public/sitemap.xml because the course list
// (niches) lives in the Apps Script backend and can change independently of
// a deploy — a static file would silently drift out of date. This runs on
// the server on each request; put a CDN/edge cache in front of it if request
// volume ever becomes a concern (the docs recommend this for the same reason).
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        type NicheRow = { NicheID: string };
        let niches: NicheRow[] = [];
        try {
          niches = (await gasCall("getNiches")) || [];
        } catch {
          niches = [];
        }

        const staticUrls: { loc: string; changefreq: string; priority: string }[] = [
          { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
          { loc: `${SITE_URL}/courses`, changefreq: "weekly", priority: "0.9" },
          { loc: `${SITE_URL}/blog/how-to-become-a-virtual-assistant`, changefreq: "monthly", priority: "0.7" },
          { loc: `${SITE_URL}/faq`, changefreq: "monthly", priority: "0.6" },
          { loc: `${SITE_URL}/help`, changefreq: "monthly", priority: "0.6" },
        ];

        const nicheUrls = niches
          .filter((n) => n && n.NicheID)
          .map((n) => ({ loc: `${SITE_URL}/courses/${n.NicheID}`, changefreq: "monthly", priority: "0.8" }));

        const all = [...staticUrls, ...nicheUrls];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
