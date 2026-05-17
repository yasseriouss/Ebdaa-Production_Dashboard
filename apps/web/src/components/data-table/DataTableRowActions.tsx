import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/cn";
import { useTranslation } from "../../context/I18nContext";

export interface RowAction {
  label: string;
  icon?: React.ElementType;
  onSelect: () => void;
  /** Visually flag a destructive action. */
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * Three-dot dropdown for row-level CRUD actions. Pure controlled markup; the
 * caller wires the actions (e.g. opens an edit drawer or delete confirm).
 */
export function DataTableRowActions({ actions }: { actions: RowAction[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("dataTable.rowActionsAria")}
        className="p-1.5 text-brand-metal hover:text-brand-luxury hover:bg-brand-border transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 z-30 mt-1 min-w-[10rem] bg-brand-elevated border border-brand-border shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={`${action.label}-${index}`}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={() => {
                  setOpen(false);
                  action.onSelect();
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-xs text-start transition-colors",
                  action.disabled
                    ? "text-brand-metal/50 cursor-not-allowed"
                    : action.destructive
                      ? "text-brand-error hover:bg-brand-error/10"
                      : "text-brand-luxury hover:bg-brand-border",
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span className="uppercase tracking-widest font-bold">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
