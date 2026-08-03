import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";

// A small, dependency-free emoji grid — deliberately not pulling in a full
// emoji-picker library (those run 100-300KB+) just to drop a face into a
// chat box. Covers the common chat/support use cases.
const EMOJIS = [
  "😀", "😂", "🥰", "😊", "😉", "😍", "🤔", "😅",
  "😢", "😭", "😡", "🙏", "👍", "👎", "👏", "🙌",
  "❤️", "🎉", "🔥", "✨", "✅", "❌", "⚠️", "💯",
  "😴", "🤝", "💪", "🙂", "😎", "🥳", "😬", "👀",
];

export function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Add emoji"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <Smile size={19} />
      </button>
      {open && (
        <div className="absolute bottom-11 right-0 z-20 grid w-56 grid-cols-8 gap-1 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-lg">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onSelect(e);
                setOpen(false);
              }}
              className="grid h-7 w-7 place-items-center rounded-lg text-lg hover:bg-gray-100"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
