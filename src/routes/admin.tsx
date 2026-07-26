import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { gasCall } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LearnHub PH" },
      { name: "description", content: "Admin login." },
      { property: "og:title", content: "Admin — LearnHub PH" },
      { property: "og:description", content: "Admin login." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  function press(digit: string) {
    if (loading || pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => submit(next), 120);
    }
  }

  function backspace() {
    setPin((p) => p.slice(0, -1));
  }

  async function submit(fullPin: string) {
    setLoading(true);
    setError("");
    try {
      const res = await gasCall("adminLogin", fullPin);
      if (res.ok) {
        sessionStorage.setItem("lhph_admin", "true");
        navigate({ to: "/admin/dashboard" });
      } else {
        fail();
      }
    } catch {
      fail();
    } finally {
      setLoading(false);
    }
  }

  function fail() {
    setShake(true);
    setError("Incorrect PIN");
    setTimeout(() => {
      setShake(false);
      setPin("");
      setError("");
    }, 1800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-xs rounded-2xl bg-gray-900 p-10 text-center shadow-2xl">
        <Lock className="text-purple-500 mx-auto" size={48} />
        <h1 className="mt-4 text-xl font-bold text-white">Admin Panel</h1>
        <p className="text-xs text-gray-400">LearnHub PH</p>

        <div className={`mt-6 flex justify-center gap-2 ${shake ? "animate-shake" : ""}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full ${
                i < pin.length ? "bg-purple-500" : "border-2 border-gray-600"
              }`}
            />
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => press(String(n))}
              className="h-16 w-full rounded-xl bg-gray-800 text-white text-xl font-bold hover:bg-purple-900 active:scale-95 transition-all"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => press("0")}
            className="h-16 w-full rounded-xl bg-gray-800 text-white text-xl font-bold hover:bg-purple-900 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={backspace}
            className="h-16 w-full rounded-xl bg-gray-800 text-white text-xl font-bold hover:bg-purple-900 active:scale-95 transition-all"
            aria-label="Backspace"
          >
            ←
          </button>
        </div>
      </div>
    </div>
  );
}
