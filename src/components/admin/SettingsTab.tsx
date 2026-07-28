import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle, Globe, Landmark, Save, Timer, Wallet } from "lucide-react";
import { gasCall } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { LoadState, SectionHeading, inpCls, useAdminQuery } from "./shared";

function SettingsField({ label, value, type, onChange }: { label: string; value: any; type: string; onChange: (v: any) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className={inpCls}
      />
    </div>
  );
}

function SettingsCard({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600">{icon}</span>
        <div>
          <h3 className="font-black text-gray-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs font-medium text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

export default function SettingsTab() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetConfig");
  const cfg = q.data as any;
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (cfg) setForm(cfg);
  }, [cfg]);

  function set(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await gasCall("adminSaveConfig", form);
      if (res.ok) {
        showToast("Settings saved!", "success");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <SectionHeading title="Settings" />
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {cfg && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <SettingsCard icon={<Globe size={18} />} title="Site Info" description="General platform settings">
              <SettingsField label="Site Name" value={form.siteName} type="text" onChange={(v) => set("siteName", v)} />
              <SettingsField label="Course Price (₱)" value={form.coursePrice} type="number" onChange={(v) => set("coursePrice", v)} />
            </SettingsCard>

            <SettingsCard icon={<Timer size={18} />} title="Access" description="Verification timing">
              <SettingsField label="Verification Wait Hours" value={form.accessHours} type="number" onChange={(v) => set("accessHours", v)} />
            </SettingsCard>

            <SettingsCard icon={<Wallet size={18} />} title="GCash" description="Payment details shown to students">
              <SettingsField label="GCash Name" value={form.gcashName} type="text" onChange={(v) => set("gcashName", v)} />
              <SettingsField label="GCash Number" value={form.gcashNumber} type="text" onChange={(v) => set("gcashNumber", v)} />
            </SettingsCard>

            <SettingsCard icon={<Landmark size={18} />} title="BPI Bank Transfer" description="Payment details shown to students">
              <SettingsField label="BPI Account Name" value={form.bpiName} type="text" onChange={(v) => set("bpiName", v)} />
              <SettingsField label="BPI Account Number" value={form.bpiNumber} type="text" onChange={(v) => set("bpiNumber", v)} />
            </SettingsCard>
          </div>

          <div className="sticky bottom-4 mt-6 flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-colors hover:bg-purple-800 disabled:opacity-70"
            >
              {saving ? <Spinner size="sm" className="border-white" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
