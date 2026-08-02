import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, CreditCard } from "lucide-react";
import { gasCall, getToken, clearToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Complete Payment — LearnHub PH" },
      { name: "description", content: "Submit your payment to unlock lifetime access." },
      { property: "og:title", content: "Complete Payment — LearnHub PH" },
      { property: "og:description", content: "Submit your payment to unlock lifetime access." },
    ],
  }),
  component: () => (
    <SessionGuard>
      <PaymentPage />
    </SessionGuard>
  ),
});

const INCLUDED = [
  "Access to All 9 VA Niches",
  "81+ Video Lessons",
  "Quizzes After Every Lesson",
  "Certificates of Completion",
  "Lifetime Access",
  "No Monthly Fees",
];

function PaymentPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<{ gcashQrUrl?: string; bpiQrUrl?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"gcash" | "bpi">("gcash");

  const [method, setMethod] = useState<"GCash" | "BPI">("GCash");
  const [ref, setRef] = useState("");
  const [amount, setAmount] = useState(399);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const userRes = await gasCall("getUserByTokenPublic", token);
        if (!userRes.ok) {
          clearToken();
          navigate({ to: "/login" });
          return;
        }
        const assetsRes = await gasCall("getPaymentAssets");
        setAssets(assetsRes || {});
      } catch {
        setError("Failed to load payment page.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!method || !ref || !amount) return;
    setSubmitting(true);
    try {
      const res = await gasCall("submitPayment", getToken(), method, ref, amount);
      if (res.ok) navigate({ to: "/pending" });
      else setSubmitError(res.msg || "Submission failed");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}
      >
        <Spinner size="lg" className="border-white" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2">
            <CreditCard size={24} className="text-purple-600" />
            <h2 className="text-xl font-bold">Complete Your Payment</h2>
          </div>
          <div className="mt-4 rounded-xl bg-purple-50 p-4 text-center">
            <div className="text-4xl font-extrabold text-purple-700">₱399</div>
            <div className="text-xs text-gray-600 mt-1">One-Time Payment</div>
          </div>

          <h3 className="mt-6 font-bold text-gray-900">What's Included</h3>
          <ul className="mt-2 space-y-2">
            {INCLUDED.map((i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="text-green-500" size={18} /> {i}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 font-bold text-gray-900">How to Pay</h3>
          <div className="mt-2 inline-flex rounded-full bg-gray-100 p-1">
            {(["gcash", "bpi"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setMethod(t === "gcash" ? "GCash" : "BPI");
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  tab === t ? "bg-purple-600 text-white" : "text-gray-600"
                }`}
              >
                {t === "gcash" ? "GCash" : "BPI"}
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            {tab === "gcash" ? (
              <>
                {assets?.gcashQrUrl && (
                  <img src={assets.gcashQrUrl} alt="GCash QR code to scan and pay the ₱399 LearnHub PH course fee" loading="lazy" className="mx-auto max-w-[220px] rounded-lg" />
                )}
                <p className="mt-2 font-bold">John Frey Cortez</p>
                <p className="text-sm text-gray-600">09603083284</p>
              </>
            ) : (
              <>
                {assets?.bpiQrUrl && (
                  <img src={assets.bpiQrUrl} alt="BPI bank QR code to scan and pay the ₱399 LearnHub PH course fee" loading="lazy" className="mx-auto max-w-[220px] rounded-lg" />
                )}
                <p className="mt-2 font-bold">John Frey Cortez</p>
                <p className="text-sm text-gray-600">0819143362</p>
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            Screenshot your receipt — you'll need the reference number below.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl h-fit">
          <h2 className="text-xl font-bold">Submit Your Payment</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as "GCash" | "BPI")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="GCash">GCash</option>
                <option value="BPI">BPI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reference Number / Transaction ID</label>
              <input
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. 1234567890"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount Paid</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {submitError && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{submitError}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-70 text-white font-semibold px-5 py-2.5 inline-flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner size="sm" className="border-white" /> : <CheckCircle size={18} />} Submit Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
