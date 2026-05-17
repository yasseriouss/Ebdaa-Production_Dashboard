import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { useTranslation } from "../../context/I18nContext";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Render a slim side panel instead of a centred dialog. */
  variant?: "modal" | "sheet";
  /** Optional footer slot (action buttons). */
  footer?: ReactNode;
}

/**
 * Lightweight modal / slide-over without a Radix dependency. Locks scroll,
 * traps focus on the first interactive child via `autofocus`, and closes on
 * Escape or backdrop click.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  variant = "modal",
  footer,
}: DialogProps) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "relative bg-brand-elevated border border-brand-border shadow-2xl flex flex-col",
          variant === "modal"
            ? "m-auto w-full max-w-2xl max-h-[90vh]"
            : "ms-auto h-full w-full max-w-xl",
        )}
      >
        <header className="flex items-start justify-between gap-4 px-6 py-4 border-b border-brand-border">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-luxury">
              {title}
            </h3>
            {description && (
              <p className="text-[10px] text-brand-metal uppercase tracking-wider mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("dialog.closeAria")}
            className="p-1.5 text-brand-metal hover:text-brand-luxury hover:bg-brand-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  /** Optional supplemental body (e.g. a select shown above the buttons). */
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  destructive,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedConfirm = confirmLabel ?? t("dialog.confirm");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <button type="button" onClick={onClose} className="industrial-btn">
            {t("dialog.cancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "industrial-btn",
              destructive
                ? "border-brand-error/60 text-brand-error hover:bg-brand-error/10"
                : "border-brand-wood/60 text-brand-luxury bg-brand-wood/15 hover:bg-brand-wood/25",
            )}
          >
            {resolvedConfirm}
          </button>
        </>
      }
    >
      {description && <p className="text-sm text-brand-luxury">{description}</p>}
      {children}
    </Dialog>
  );
}
