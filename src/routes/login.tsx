import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle, ShieldCheck, X } from "lucide-react";
import { gasCall, saveToken, getToken } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { AdminPinEntry } from "@/components/AdminPinEntry";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — LearnHub PH" },
      { name: "description", content: "Sign in to your LearnHub PH account or create a new one." },
      { property: "og:title", content: "Sign In — LearnHub PH" },
      { property: "og:description", content: "Sign in to your LearnHub PH account or create a new one." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-purple-700">LearnHub PH</h1>
          <p className="text-xs text-gray-500 mt-1">Learn More. Earn More.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 border-b border-gray-200">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-semibold transition-colors ${
                tab === t ? "border-b-2 border-purple-600 text-purple-700" : "text-gray-500"
              }`}
            >
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="mt-6">{tab === "signin" ? <SignInForm /> : <SignUpForm />}</div>

        <button
          type="button"
          onClick={() => setAdminOpen(true)}
          className="mx-auto mt-6 flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-purple-700"
        >
          <ShieldCheck size={14} /> Admin Access
        </button>
      </div>

      {adminOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAdminOpen(false)}
              className="absolute -right-2 -top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-gray-600 shadow-lg hover:text-gray-900"
              aria-label="Close admin PIN"
            >
              <X size={18} />
            </button>
            <AdminPinEntry
              title="Admin Access"
              subtitle="Enter your 6-digit PIN"
              onSuccess={() => navigate({ to: "/admin/dashboard", replace: true })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!token.trim()) {
      setError("Please enter your access token");
      return;
    }
    setLoading(true);
    try {
      const res = await gasCall("getUserByTokenPublic", token.trim());
      if (res.ok) {
        saveToken(res.user.token);
        navigate({ to: res.user.verified ? "/dashboard" : "/payment" });
      } else {
        setError(res.msg || "Invalid token");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const res = await gasCall("resendToken", forgotEmail);
      if (res.ok) setForgotSent(true);
      else setForgotError(res.msg || "Unable to send token");
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Access Token</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your access token here"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
        />
      </div>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-70 text-white font-semibold px-5 py-2.5 inline-flex items-center justify-center gap-2"
      >
        {loading && <Spinner size="sm" className="border-white" />} Access My Dashboard
      </button>

      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={() => setShowForgot((v) => !v)}
        className="w-full text-sm text-gray-500 hover:text-purple-700"
      >
        Forgot your token?
      </button>

      <div className={`overflow-hidden transition-all ${showForgot ? "max-h-96" : "max-h-0"}`}>
        {forgotSent ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
            <CheckCircle className="text-green-500 mx-auto" size={32} />
            <p className="mt-2 text-sm font-semibold text-green-800">Token sent! Check your inbox.</p>
          </div>
        ) : (
          <div className="space-y-3 pt-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your registered email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {forgotError && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{forgotError}</div>
            )}
            <button
              type="button"
              onClick={submitForgot}
              disabled={forgotLoading}
              className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold px-5 py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {forgotLoading && <Spinner size="sm" className="border-white" />} Send My Token
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tnc, setTnc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  async function checkConfirmed() {
    setConfirmMsg("");
    setChecking(true);
    try {
      const res = await gasCall("getUserByTokenPublic", getToken());
      if (res?.ok && res.user?.emailConfirmed) {
        if (res.user.token) saveToken(res.user.token);
        navigate({ to: "/payment" });
      } else {
        setConfirmMsg("Your email hasn't been confirmed yet. Please check your inbox.");
      }
    } catch {
      setConfirmMsg("Your email hasn't been confirmed yet. Please check your inbox.");
    } finally {
      setChecking(false);
    }
  }



  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !tnc) return;
    setLoading(true);
    try {
      const res = await gasCall("signUp", name, email, tnc);
      if (res.ok) setDone(email);
      else setError(res.msg || "Sign up failed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
          <CheckCircle className="text-green-500 mx-auto" size={48} />
          <h3 className="mt-3 text-lg font-bold text-green-800">Check Your Email!</h3>
          <p className="mt-1 text-sm text-green-700">
            We've sent a confirmation link to <strong>{done}</strong>. Click it to activate your account.{" "}
            <strong>If you don't see it in your inbox within a few minutes, please check your Spam or Junk folder.</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={checkConfirmed}
          disabled={checking}
          className="w-full rounded-xl border-2 border-purple-600 text-purple-700 hover:bg-purple-50 font-semibold px-5 py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {checking && <Spinner size="sm" />} I already confirmed my email
        </button>
        {confirmMsg && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 text-sm">
            {confirmMsg}
          </div>
        )}
      </div>
    );
  }


  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={tnc}
          onChange={(e) => setTnc(e.target.checked)}
          className="mt-1 h-4 w-4 accent-purple-600"
        />
        <span>I agree to the Terms and Conditions</span>
      </label>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={!tnc || loading}
        className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 inline-flex items-center justify-center gap-2"
      >
        {loading && <Spinner size="sm" className="border-white" />} Create Account
      </button>
    </form>
  );
}
