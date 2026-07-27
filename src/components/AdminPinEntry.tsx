import { useState } from "react";
import { CheckCircle, Lock } from "lucide-react";
import { gasCall } from "@/lib/api";

type AdminPinEntryProps = {
  title?: string;
  subtitle?: string;
  onSuccess: () => void | Promise<void>;
};

export function AdminPinEntry({
  title = "Admin Panel",
  subtitle = "LearnHub PH",
  onSuccess,
}: AdminPinEntryProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function press(digit: string) {
    if (loading || success || pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      window.setTimeout(() => void submit(next), 120);
    }
  }

  function backspace() {
    if (loading || success) return;
    setPin((p) => p.slice(0, -1));
    setError("");
  }

  async function submit(fullPin: string) {
    setLoading(true);
    setError("");
    console.info("[LearnHub PH] Admin PIN check started", { pinLength: fullPin.length });
    try {
      const result = await gasCall("adminLogin", fullPin);
      console.info("[LearnHub PH] Admin PIN response", { ok: result?.ok, result });

      if (result?.ok === true) {
        window.sessionStorage.setItem("lhph_admin", "true");
        setSuccess(true);
        await Promise.resolve(onSuccess());
        return;
      }

      fail("Incorrect PIN");
    } catch (err) {
      console.error("[LearnHub PH] Admin PIN check failed", err);
      fail("Unable to verify PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fail(message: string) {
    setShake(true);
    setError(message);
    window.setTimeout(() => {
      setShake(false);
      setPin("");
      setError("");
    }, 1800);
  }

  return (
    <div className="w-full max-w-xs rounded-2xl bg-gray-900 p-8 text-center shadow-2xl">
      <Lock className="text-purple-500 mx-auto" size={44} />
      <h1 className="mt-4 text-xl font-bold text-white">{title}</h1>
      <p className="text-xs text-gray-400">{subtitle}</p>

      <div className={`mt-6 flex justify-center gap-2 ${shake ? "animate-shake" : ""}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full transition-colors ${
              success
                ? "bg-green-500"
                : error
                  ? "bg-red-500"
                  : i < pin.length
                    ? "bg-purple-500"
                    : "border-2 border-gray-600"
            }`}
          />
        ))}
      </div>

      {success && (
        <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm text-green-400">
          <CheckCircle size={16} className="text-green-400" /> PIN Correct — Redirecting...
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {loading && !success && <p className="mt-3 text-sm text-purple-200">Checking PIN...</p>}

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => press(String(n))}
            disabled={loading || success}
            className="h-16 w-full rounded-xl bg-gray-800 text-xl font-bold text-white transition-all hover:bg-purple-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {n}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => press("0")}
          disabled={loading || success}
          className="h-16 w-full rounded-xl bg-gray-800 text-xl font-bold text-white transition-all hover:bg-purple-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          disabled={loading || success}
          className="h-16 w-full rounded-xl bg-gray-800 text-xl font-bold text-white transition-all hover:bg-purple-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Backspace"
        >
          ←
        </button>
      </div>
    </div>
  );
}

export default AdminPinEntry;