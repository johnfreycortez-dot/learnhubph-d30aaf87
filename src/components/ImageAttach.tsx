import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { gasCall } from "@/lib/api";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 4 * 1024 * 1024; // 4MB, matches the backend's own limit

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Attach button + preview strip for chat-style composers. Calls
 * `uploadMessageImage` (shared by Messages and Live Support on the backend)
 * as soon as a file is picked, and hands the resulting Drive URL back via
 * onUploaded — the composer just needs to send that URL alongside the text.
 */
export function ImageAttach({
  token,
  imageUrl,
  onUploaded,
  onClear,
  onError,
}: {
  /** Student session token, or null for the admin composer (admin auth is handled automatically by gasCall for "admin*" actions). */
  token: string | null;
  imageUrl: string | null;
  onUploaded: (url: string) => void;
  onClear: () => void;
  onError: (msg: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED.includes(file.type)) return onError("Please choose a PNG, JPEG, GIF, or WebP image.");
    if (file.size > MAX_BYTES) return onError("Image is too large — please use one under 4MB.");

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = token
        ? await gasCall("uploadMessageImage", token, base64, file.type)
        : await gasCall("adminUploadMessageImage", base64, file.type);
      if (res.ok) onUploaded(res.url);
      else onError(res.msg || "Upload failed.");
    } catch {
      onError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (imageUrl) {
    return (
      <div className="relative inline-block">
        <img src={imageUrl} alt="Attached image preview" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove attached image"
          className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-gray-800 text-white shadow"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={ALLOWED.join(",")} onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Attach image"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
      >
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
      </button>
    </>
  );
}
