import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`fixed inset-0 z-[9997] ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="h-[calc(100%-57px)] overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export default Drawer;
