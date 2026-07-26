import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { X, CheckCircle, XCircle, Info } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant };

type Ctx = { showToast: (message: string, variant?: ToastVariant) => void };
const ToastCtx = createContext<Ctx>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-96">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles =
    toast.variant === "success"
      ? "bg-green-600 text-white"
      : toast.variant === "error"
        ? "bg-red-600 text-white"
        : "bg-blue-600 text-white";
  const Icon = toast.variant === "success" ? CheckCircle : toast.variant === "error" ? XCircle : Info;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg animate-in slide-in-from-right ${styles}`}
      role="alert"
    >
      <Icon size={18} className="mt-0.5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="opacity-80 hover:opacity-100" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}
