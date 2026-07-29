import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function DocModal({
  open,
  title,
  iframeSrc,
  fallbackHref,
  onClose,
}: {
  open: boolean;
  title: string;
  iframeSrc: string;
  fallbackHref: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-modal-title"
      style={{ animation: "fade-up 0.25s ease-out both" }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] sm:w-full sm:max-w-[720px] max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 id="doc-modal-title" className="text-lg font-bold text-slate-900">
            {title}
          </h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <iframe
            src={iframeSrc}
            title={title}
            className="w-full rounded-lg border border-slate-200"
            style={{ height: "60vh", border: 0 }}
            allow="autoplay"
          />
          <p className="mt-3 text-sm text-slate-600">
            Document not loading?{" "}
            <a
              href={fallbackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-700 font-semibold hover:underline"
            >
              Open it directly →
            </a>
          </p>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-xl border border-violet-300 text-violet-700 bg-white px-4 py-2 text-sm font-semibold hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared Drive file IDs for the legal documents, used by both the landing
// page footer and the sign-up form so there's a single source of truth.
export const LEGAL_DOCS = {
  terms: {
    title: "Terms & Conditions",
    iframeSrc: "https://drive.google.com/file/d/19eWx7_0MsJbQ3vNV7w2Icto6qYX0ALtz/preview",
    fallbackHref:
      "https://drive.google.com/file/d/19eWx7_0MsJbQ3vNV7w2Icto6qYX0ALtz/view?usp=drive_link",
  },
  privacy: {
    title: "Privacy Policy",
    iframeSrc: "https://drive.google.com/file/d/1YRasHuCL5CnnpIVCK6wnXZsFN_G1RxQ0/preview",
    fallbackHref:
      "https://drive.google.com/file/d/1YRasHuCL5CnnpIVCK6wnXZsFN_G1RxQ0/view?usp=drive_link",
  },
} as const;
