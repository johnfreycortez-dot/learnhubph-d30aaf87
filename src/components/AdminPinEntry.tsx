import { useEffect, useState } from "react";
import { CheckCircle2, Delete, ShieldCheck } from "lucide-react";
import { gasCall } from "@/lib/api";

const ADMIN_FLAG_KEY = "lhph_admin";

type AdminPinEntryProps = {
  title?: string;
  subtitle?: string;
  onSuccess: () => void | Promise<void>;
};

export function AdminPinEntry({
  title = "Admin Access",
  subtitle = "Enter your 6-digit PIN to continue",
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
    <div className="relative w-full max-w-[340px] animate-in fade-in zoom-in-95 duration-200">
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[32px] bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-600 opacity-40 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-[26px] border border-white/60 bg-white p-8 text-center shadow-2xl shadow-purple-950/20">
        {/* subtle top sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-purple-50 to-transparent"
        />

        <div className="relative">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40 ring-4 ring-purple-50">
            <ShieldCheck size={28} strokeWidth={2.25} />
          </div>
          <h1 className="mt-5 text-xl font-black tracking-tight text-gray-900">{title}</h1>
          <p className="mt-1 text-xs font-semibold text-gray-400">{subtitle}</p>

          <div className={`mt-7 flex justify-center gap-2.5 ${shake ? "animate-shake" : ""}`}>
            {Array.from({ length: 6 }).map((_, i) => {
              const filled = i < pin.length;
              return (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full border-2 transition-all duration-150 ${
                    success
                      ? "scale-110 border-green-500 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.55)]"
                      : error
                        ? "border-red-500 bg-red-500"
                        : filled
                          ? "scale-110 border-purple-600 bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                          : "border-gray-200 bg-transparent"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-3 h-5">
            {success && (
              <p className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-green-600">
                <CheckCircle2 size={16} /> PIN Correct — Redirecting…
              </p>
            )}
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            {loading && !success && !error && (
              <p className="text-sm font-semibold text-purple-600">Verifying…</p>
            )}
          </div>

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
              <Delete size={20} />
            </KeypadButton>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gray-300">
            <ShieldCheck size={12} /> Secured admin session
          </p>
        </div>
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
      className="grid h-14 w-full place-items-center rounded-2xl border border-gray-100 bg-gray-50/80 text-xl font-bold text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
      {...rest}
    >
      {children}
    </button>
  );
}

export default AdminPinEntry;
