import { createFileRoute } from "@tanstack/react-router";
import { type ChangeEvent, useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { useStudentIdentity } from "@/hooks/useStudentIdentity";

export const Route = createFileRoute("/settings")({
  component: () => (
    <SessionGuard>
      <SettingsPage />
    </SessionGuard>
  ),
});

const UPLOAD_TIMEOUT_MS = 20000;

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(timeoutMessage)), ms);
    }),
  ]);
}

function SettingsPage() {
  const identity = useStudentIdentity();
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void (async () => {
      const r = await gasCall("getUserByTokenPublic", getToken());
      setName(r?.user?.name || "");
      setPhoto(r?.user?.profilePhotoUrl || "");
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const r = await gasCall("updateProfileName", getToken(), name);
      if (r?.ok) {
        setMessage("Display name saved.");
        identity.overrideIdentity({ name });
      } else {
        setMessage(r?.msg || "Could not save your name.");
      }
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 4 * 1024 * 1024) {
      setMessage("Choose a PNG, JPEG, or WebP image smaller than 4 MB.");
      return;
    }
    const previousPhoto = photo;
    const preview = URL.createObjectURL(f);
    setPhoto(preview);
    setUploading(true);
    setMessage("Uploading profile photo…");
    try {
      const base64 = (
        await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Could not read this image."));
          reader.readAsDataURL(f);
        })
      ).split(",")[1];

      const r = await withTimeout(
        gasCall("uploadProfilePhoto", getToken(), base64, f.type),
        UPLOAD_TIMEOUT_MS,
        "The upload is taking too long. Your backend may not have this feature deployed yet — please check with support.",
      );

      if (r?.ok && r.photoUrl) {
        setPhoto(r.photoUrl);
        setMessage("Profile photo updated.");
        identity.overrideIdentity({ photoUrl: r.photoUrl });
      } else {
        setPhoto(previousPhoto);
        setMessage(r?.msg || "Photo upload failed. Please try a smaller image.");
      }
    } catch (err) {
      setPhoto(previousPhoto);
      setMessage(err instanceof Error ? err.message : "Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(preview);
    }
  }

  const initial = name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <StudentShell title="Settings" studentName={name} photoUrl={photo}>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-black">Account settings</h2>
        <p className="mt-1 text-sm text-gray-500">Manage the name and photo shown on your student account.</p>
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-5">
            {photo ? (
              <img src={photo} loading="lazy" className="h-20 w-20 rounded-full object-cover" alt="Your LearnHub PH profile photo" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-full bg-purple-100 text-xl font-black text-purple-700">
                {initial}
              </span>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold">
              <Camera size={16} />
              {uploading ? "Uploading…" : "Change photo"}
              <input
                className="hidden"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploading}
                onChange={upload}
              />
            </label>
          </div>
          <label className="mt-7 block text-sm font-bold">
            Display name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500"
            />
          </label>
          <button
            disabled={saving}
            onClick={save}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save changes"}
          </button>
          {message && <p className="mt-4 text-sm font-medium text-gray-600">{message}</p>}
        </section>
      </div>
    </StudentShell>
  );
}
