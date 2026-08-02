import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ToastProvider } from "../components/Toast";
import { ThemeProvider, useTheme } from "../lib/theme";
import { ThemeToggle } from "../components/ThemeToggle";
import { jsonLdScript, organizationJsonLd, websiteJsonLd, SITE_URL } from "../lib/seo";
import logoAsset from "../assets/learnhub-logo.png.asset.json";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LearnHub PH — Learn More. Earn More." },
      { property: "og:title", content: "LearnHub PH — Learn More. Earn More." },
      { name: "twitter:title", content: "LearnHub PH — Learn More. Earn More." },
      { name: "description", content: "Learn in-demand VA skills and start earning online. 9 niches, 81 lessons, quizzes + certificate. Lifetime access, only ₱399 (55% OFF)." },
      { property: "og:description", content: "Learn in-demand VA skills and start earning online. 9 niches, 81 lessons, quizzes + certificate. Lifetime access, only ₱399 (55% OFF)." },
      { name: "twitter:description", content: "Learn in-demand VA skills and start earning online. 9 niches, 81 lessons, quizzes + certificate. Lifetime access, only ₱399 (55% OFF)." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/6krp3EM0SNNnRD2neVNsXI0ex7g1/social-images/social-1784933163089-LearnHub_PH_Social.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/6krp3EM0SNNnRD2neVNsXI0ex7g1/social-images/social-1784933163089-LearnHub_PH_Social.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    scripts: [
      jsonLdScript(organizationJsonLd(`${SITE_URL}${logoAsset.url}`)),
      jsonLdScript(websiteJsonLd()),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// The landing page is pinned to light mode (see lib/theme.tsx) and doesn't
// offer a dark mode at all, so the floating toggle has nothing to do there —
// hide it instead of showing a control that can't actually change anything.
function ConditionalThemeToggle() {
  const { isLightLocked } = useTheme();
  if (isLightLocked) return null;
  return <ThemeToggle />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <ConditionalThemeToggle />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
