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
    <div className="relative w-full max-w-[272px] animate-in fade-in zoom-in-95 duration-200">
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[30px] bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-600 opacity-50 blur-2xl"
      />
      <div
        className="relative overflow-hidden rounded-[22px] border border-white/10 p-5 text-center"
        style={{
          background: "linear-gradient(165deg, #2a1f4d 0%, #1b1436 45%, #100b22 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 40px rgba(139,92,246,0.08), 0 20px 40px -12px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* faint sheen top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.06] to-transparent"
        />

        <div className="relative">
          <div
            className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-1 ring-white/20"
            style={{ boxShadow: "0 8px 16px -4px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.35)" }}
          >
            <ShieldCheck size={20} strokeWidth={2.25} />
          </div>
          <h1 className="mt-3 text-base font-black tracking-tight text-white">{title}</h1>
          <p className="mt-0.5 text-[11px] font-semibold text-white/40">{subtitle}</p>

          <div className={`mt-4 flex justify-center gap-1.5 ${shake ? "animate-shake" : ""}`}>
            {Array.from({ length: 6 }).map((_, i) => {
              const filled = i < pin.length;
              return (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full border transition-all duration-150 ${
                    success
                      ? "scale-110 border-green-400 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.75)]"
                      : error
                        ? "border-red-400 bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.75)]"
                        : filled
                          ? "scale-110 border-purple-400 bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.75)]"
                          : "border-white/15 bg-transparent"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-2 h-4">
            {success && (
              <p className="inline-flex items-center justify-center gap-1 text-xs font-bold text-green-400">
                <CheckCircle2 size={13} /> PIN Correct
              </p>
            )}
            {error && <p className="text-xs font-bold text-red-400">{error}</p>}
            {loading && !success && !error && (
              <p className="text-xs font-semibold text-purple-300">Verifying…</p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
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
              <Delete size={15} />
            </KeypadButton>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1 text-[9px] font-semibold text-white/25">
            <ShieldCheck size={10} /> Secured admin session
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
      className="grid h-11 w-full place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-base font-bold text-white/90 transition-all hover:-translate-y-0.5 hover:border-purple-400/30 hover:bg-purple-500/15 hover:text-white active:translate-y-0 active:scale-95 active:bg-purple-500/25 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 6px rgba(0,0,0,0.35)" }}
      {...rest}
    >
      {children}
    </button>
  );
}

export default AdminPinEntry;
