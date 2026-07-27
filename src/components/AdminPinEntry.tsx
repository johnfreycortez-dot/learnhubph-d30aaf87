import { useEffect, useState } from "react";
import { CheckCircle, Lock } from "lucide-react";
import { gasCall } from "@/lib/api";

const ADMIN_FLAG_KEY = "lhph_admin";

type AdminPinEntryProps = {
  title?: string;
  subtitle?: string;
  onSuccess: () => void | Promise<void>;
};

export function AdminPinEntry({
  title = "Admin Access",
  subtitle = "Enter your 6-digit PIN",
  onSuccess,
}: AdminPinEntryProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (pin.length !== 6 || loading || success) return;
    const timer = window.setTimeout(() => void submit(pin), 120);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function press(digit: string) {
    if (loading || success || pin.length >= 6) return;
    setPin((current) => (current.length >= 6 ? current : current + digit));
  }

  function backspace() {
    if (loading || success) return;
    setPin((p) => p.slice(0, -1));
    setError("");
  }

  async function submit(fullPin: string) {
    setLoading(true);
    setError("");
    try {
      const result = await gasCall("adminLogin", fullPin);
      if (result?.ok === true) {
        window.sessionStorage.setItem(ADMIN_FLAG_KEY, "true");
        setSuccess(true);
        await Promise.resolve(onSuccess());
        return;
      }
      fail("Incorrect PIN");
    } catch {
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
    }, 1600);
  }

  return (
    <div className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xl">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-purple-100 text-purple-700">
        <Lock size={26} />
      </div>
      <h1 className="mt-4 text-xl font-black text-gray-900">{title}</h1>
      <p className="mt-1 text-xs font-medium text-gray-500">{subtitle}</p>

      <div className={`mt-6 flex justify-center gap-2 ${shake ? "animate-shake" : ""}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border transition-colors ${
              success
                ? "border-green-500 bg-green-500"
                : error
                  ? "border-red-500 bg-red-500"
                  : i < pin.length
                    ? "border-purple-600 bg-purple-600"
                    : "border-gray-300 bg-transparent"
            }`}
          />
        ))}
      </div>

      {success && (
        <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-green-600">
          <CheckCircle size={16} /> PIN Correct — Redirecting…
        </p>
      )}
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      {loading && !success && <p className="mt-3 text-sm font-semibold text-purple-600">Checking PIN…</p>}

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <KeypadButton key={n} onClick={() => press(String(n))} disabled={loading || success}>
            {n}
          </KeypadButton>
        ))}
        <div />
        <KeypadButton onClick={() => press("0")} disabled={loading || success}>
          0
        </KeypadButton>
        <KeypadButton onClick={backspace} disabled={loading || success} aria-label="Backspace">
          ←
        </KeypadButton>
      </div>
    </div>
  );
}

function KeypadButton({
  onClick,
  disabled,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 text-xl font-bold text-gray-800 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      {...rest}
    >
      {children}
    </button>
  );
}

export default AdminPinEntry;
