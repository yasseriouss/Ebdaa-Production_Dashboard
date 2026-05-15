import type { Table } from "@tanstack/react-table";
import { Download, Trash2, X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface BulkAction {
  label: string;
  icon?: React.ElementType;
  onSelect: () => void;
  destructive?: boolean;
}

/**
 * Floating bar that appears when one or more rows are selected. Hosts
 * standard delete / status / export actions plus any caller-defined ones.
 */
export function DataTableBulkBar<T>({
  table,
  onBulkDelete,
  onBulkExport,
  extraActions,
}: {
  table: Table<T>;
  onBulkDelete?: (rows: T[]) => void;
  onBulkExport?: (rows: T[]) => void;
  extraActions?: BulkAction[];
}) {
  const selected = table.getSelectedRowModel().rows;
  if (!selected.length) return null;
  const data = selected.map((row) => row.original);

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        "sticky bottom-4 z-20 flex flex-wrap items-center gap-3",
        "border border-brand-wood/50 bg-brand-elevated/95 backdrop-blur px-4 py-3 shadow-2xl",
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-luxury">
        {selected.length} selected
      </span>
      <span className="h-4 w-px bg-brand-border" aria-hidden />

      {onBulkExport && (
        <button
          type="button"
          className="industrial-btn"
          onClick={() => onBulkExport(data)}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      )}

      {extraActions?.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={`${action.label}-${index}`}
            type="button"
            className={cn(
              "industrial-btn",
              action.destructive && "border-brand-error/50 text-brand-error",
            )}
            onClick={action.onSelect}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{action.label}</span>
          </button>
        );
      })}

      {onBulkDelete && (
        <button
          type="button"
          className="industrial-btn border-brand-error/50 text-brand-error hover:bg-brand-error/10"
          onClick={() => onBulkDelete(data)}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      )}

      <span className="flex-1" />

      <button
        type="button"
        onClick={() => table.resetRowSelection()}
        className="industrial-btn text-brand-metal"
        aria-label="Clear selection"
      >
        <X className="w-3.5 h-3.5" />
        <span>Clear</span>
      </button>
    </div>
  );
}
