import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { gasCall, saveToken } from "@/lib/api";
import { Spinner } from "@/components/Spinner";

type Search = { token?: string };

export const Route = createFileRoute("/confirm")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Confirm Email — LearnHub PH" },
      { name: "description", content: "Confirm your LearnHub PH email address." },
      { property: "og:title", content: "Confirm Email — LearnHub PH" },
      { property: "og:description", content: "Confirm your LearnHub PH email address." },
    ],
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "ok" | "fail">("loading");

  useEffect(() => {
    if (!token) {
      setState("fail");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await gasCall("confirmEmail", token);
        if (cancelled) return;
        if (res.ok) {
          if (res.user?.token) saveToken(res.user.token);
          setState("ok");
          setTimeout(() => navigate({ to: "/payment" }), 2000);

        } else {
          setState("fail");
        }
      } catch {
        if (!cancelled) setState("fail");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 text-center shadow-2xl">
        {state === "loading" && (
          <>
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-sm text-gray-600">Confirming your email...</p>
          </>
        )}
        {state === "ok" && (
          <>
            <CheckCircle className="text-green-500 mx-auto" size={64} />
            <h2 className="mt-3 text-xl font-bold text-gray-900">Email Confirmed!</h2>
            <p className="mt-2 text-sm text-gray-600">Your access token has been sent to your email.</p>
            <p className="mt-1 text-xs text-gray-400">Redirecting you to complete your payment...</p>

          </>
        )}
        {state === "fail" && (
          <>
            <XCircle className="text-red-500 mx-auto" size={64} />
            <h2 className="mt-3 text-xl font-bold text-gray-900">Link Expired or Invalid</h2>
            <p className="mt-2 text-sm text-gray-600">
              This confirmation link has already been used or has expired.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
