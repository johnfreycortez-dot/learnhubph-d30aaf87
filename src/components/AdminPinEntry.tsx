import { useEffect, useState } from "react";
import { CheckCircle2, Delete, ShieldCheck } from "lucide-react";
import { gasCall, saveAdminToken } from "@/lib/api";

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
      if (result?.ok === true && result?.token) {
        saveAdminToken(result.token, result.expiresAt);
        setSuccess(true);
        await Promise.resolve(onSuccess());
        return;
      }
      // ok:true with no token means the backend hasn't been updated to the
      // new signed-token contract yet — treat it as a failure rather than
      // silently granting an unauthenticated session.
      fail(result?.ok === true ? "Server did not return a session token." : "Incorrect PIN");
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
    <div className="relative w-full max-w-[320px] animate-in fade-in zoom-in-95 duration-200">
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[34px] bg-gradient-to-br from-purple-200 via-fuchsia-100 to-indigo-200 opacity-70 blur-2xl"
      />
      <div
        className="relative overflow-hidden rounded-[26px] border border-white px-8 pb-7 pt-7 text-center backdrop-blur-xl"
        style={{
          background: "rgba(255,255,255,0.78)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), 0 24px 48px -16px rgba(124,58,237,0.22), 0 4px 16px -6px rgba(30,27,46,0.08)",
        }}
      >
        {/* faint sheen top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/60 to-transparent"
        />

        <div className="relative">
          <div
            className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-1 ring-white/40"
            style={{ boxShadow: "0 8px 16px -4px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.35)" }}
          >
            <ShieldCheck size={22} strokeWidth={2.25} />
          </div>
          <h1 className="mt-3 text-base font-black tracking-tight text-[#1E1B2E]">{title}</h1>
          <p className="mt-0.5 text-[11px] font-semibold text-[#8B85A3]">{subtitle}</p>

          <div className={`mt-5 flex justify-center gap-2 ${shake ? "animate-shake" : ""}`}>
            {Array.from({ length: 6 }).map((_, i) => {
              const filled = i < pin.length;
              return (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full border transition-all duration-150 ${
                    success
                      ? "scale-110 border-green-500 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                      : error
                        ? "border-red-500 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        : filled
                          ? "scale-110 border-purple-600 bg-purple-600 shadow-[0_0_8px_rgba(124,58,237,0.45)]"
                          : "border-purple-200 bg-transparent"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-2 h-4">
            {success && (
              <p className="inline-flex items-center justify-center gap-1 text-xs font-bold text-green-600">
                <CheckCircle2 size={13} /> PIN Correct
              </p>
            )}
            {error && <p className="text-xs font-bold text-red-500">{error}</p>}
            {loading && !success && !error && (
              <p className="text-xs font-semibold text-purple-500">Verifying…</p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 justify-items-center gap-x-5 gap-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <KeypadButton key={n} onClick={() => press(String(n))} disabled={loading || success}>
                {n}
              </KeypadButton>
            ))}
            <div />
            <KeypadButton onClick={() => press("0")} disabled={loading || success}>
              0
            </KeypadButton>
            <KeypadButton
              onClick={backspace}
              disabled={loading || success}
              aria-label="Backspace"
              ghost
            >
              <Delete size={17} />
            </KeypadButton>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1 text-[9px] font-semibold text-[#8B85A3]">
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
  ghost = false,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { ghost?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`grid aspect-square w-[62px] place-items-center rounded-full text-xl font-medium transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${
        ghost
          ? "bg-transparent text-[#8B85A3] hover:bg-purple-50 active:bg-purple-100"
          : "bg-white text-[#1E1B2E] hover:-translate-y-0.5 hover:bg-purple-50 active:bg-purple-100"
      }`}
      style={
        ghost
          ? undefined
          : {
              boxShadow:
                "0 1px 2px rgba(30,27,46,0.04), 0 4px 10px -4px rgba(124,58,237,0.14)",
            }
      }
      {...rest}
    >
      {children}
    </button>
  );
}

export default AdminPinEntry;
