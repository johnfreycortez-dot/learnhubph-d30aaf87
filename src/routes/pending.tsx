import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, Clock, RefreshCw } from "lucide-react";
import { gasCall, getToken, clearToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/pending")({
  head: () => ({
    meta: [
      { title: "Payment Pending — LearnHub PH" },
      { name: "description", content: "We're reviewing your payment." },
      { property: "og:title", content: "Payment Pending — LearnHub PH" },
      { property: "og:description", content: "We're reviewing your payment." },
    ],
  }),
  component: () => (
    <SessionGuard>
      <PendingPage />
    </SessionGuard>
  ),
});

function PendingPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [approved, setApproved] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const check = useCallback(async () => {
    try {
      const res = await gasCall("checkPaymentStatus", getToken());
      if (res.status === "approved") {
        setApproved(true);
        setProgress(100);
        setTimeout(() => navigate({ to: "/dashboard" }), 1500);
        return true;
      }
      if (res.status === "invalid") {
        clearToken();
        navigate({ to: "/login" });
        return true;
      }
    } catch {
      /* ignore, keep polling */
    }
    setCountdown(10);
    setProgress(0);
    return false;
  }, [navigate]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          check();
          return 10;
        }
        return c - 1;
      });
      setProgress((p) => Math.min(100, p + 10));
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [check]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-2xl">
        {approved ? (
          <CheckCircle className="text-green-400 mx-auto animate-pulse" size={56} />
        ) : (
          <Clock className="text-purple-400 mx-auto animate-pulse" size={56} />
        )}
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          {approved ? "Payment Approved!" : "Payment Submitted!"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {approved
            ? "Redirecting to your dashboard..."
            : "We're reviewing your payment. This usually takes a few minutes to a few hours."}
        </p>

        {!approved && (
          <div className="mt-6 flex justify-center">
            <Spinner size="lg" />
          </div>
        )}

        <p className="mt-6 text-sm text-gray-700 inline-flex items-center gap-1.5 justify-center">
          <Clock size={16} />
          {approved ? "Complete" : `Still pending... checking again in ${countdown}s`}
        </p>

        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${approved ? "bg-green-500" : "bg-purple-600"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {!approved && (
          <button
            onClick={check}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-purple-600 text-purple-700 hover:bg-purple-50 font-semibold px-5 py-2.5"
          >
            <RefreshCw size={18} /> Check Now
          </button>
        )}
      </div>
    </div>
  );
}
