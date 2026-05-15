import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
  /** Defaults to 4000 ms. */
  durationMs?: number;
}

interface ToastContextValue {
  push: (item: Omit<ToastItem, "id">) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * App-wide toast provider. Toasts auto-dismiss after 4 s and stack from the
 * bottom-right of the viewport. Wraps the app in `App.tsx`.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback<ToastContextValue["push"]>(
    (item) => {
      const id = Math.random().toString(36).slice(2);
      const durationMs = item.durationMs ?? 4000;
      setToasts((current) => [...current, { id, ...item }]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (message) => push({ kind: "success", message }),
      error: (message) => push({ kind: "error", message }),
      info: (message) => push({ kind: "info", message }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            aria-live="polite"
            aria-atomic="true"
            className="fixed bottom-4 end-4 z-[200] flex flex-col gap-2 max-w-sm"
          >
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const palette: Record<ToastKind, { icon: typeof Info; tone: string }> = {
    success: { icon: CheckCircle2, tone: "border-brand-success/60 text-brand-success" },
    error: { icon: AlertCircle, tone: "border-brand-error/60 text-brand-error" },
    info: { icon: Info, tone: "border-brand-metal text-brand-luxury" },
  };
  const Icon = palette[toast.kind].icon;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 px-4 py-3 bg-brand-elevated border shadow-lg",
        palette[toast.kind].tone,
        "animate-in slide-in-from-right duration-200",
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="flex-1 text-xs leading-relaxed text-brand-luxury">{toast.message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-brand-metal hover:text-brand-luxury"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
