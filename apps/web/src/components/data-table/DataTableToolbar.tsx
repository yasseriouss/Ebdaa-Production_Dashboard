import { useEffect, useRef, useState } from "react";
import type { Column, Table } from "@tanstack/react-table";
import { Check, Filter, Search, Settings2, X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface FacetedFilterOption {
  value: string;
  label: string;
  /** Optional secondary label (e.g. Arabic). */
  secondary?: string;
}

export interface FacetedFilterDef {
  columnId: string;
  title: string;
  options: FacetedFilterOption[];
}

interface DataTableToolbarProps<T> {
  table: Table<T>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  filters?: FacetedFilterDef[];
  /** Optional slot rendered to the far right (e.g. "Add new" button). */
  rightSlot?: React.ReactNode;
  /** Optional slot rendered to the left of the search box (e.g. view toggle). */
  leftSlot?: React.ReactNode;
}

export function DataTableToolbar<T>({
  table,
  globalFilter,
  onGlobalFilterChange,
  filters = [],
  rightSlot,
  leftSlot,
}: DataTableToolbarProps<T>) {
  const activeFilterCount = filters.reduce((acc, def) => {
    const value = table.getColumn(def.columnId)?.getFilterValue() as
      | string[]
      | undefined;
    return acc + (value && value.length ? 1 : 0);
  }, 0);

  const resetAll = () => {
    onGlobalFilterChange("");
    for (const def of filters) {
      table.getColumn(def.columnId)?.setFilterValue(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {leftSlot}
        <label
          className={cn(
            "relative flex items-center gap-2 border border-brand-border bg-brand-elevated",
            "px-3 py-2 min-w-[14rem] focus-within:border-brand-metal transition-colors",
          )}
        >
          <Search className="w-3.5 h-3.5 text-brand-metal" aria-hidden />
          <input
            type="search"
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            placeholder="Search..."
            aria-label="Global search"
            className="flex-1 bg-transparent text-xs text-brand-luxury placeholder:text-brand-metal/70 outline-none"
          />
        </label>

        {filters.map((def) => (
          <FacetedFilter key={def.columnId} table={table} def={def} />
        ))}

        {(activeFilterCount > 0 || globalFilter) && (
          <button
            type="button"
            onClick={resetAll}
            className="industrial-btn text-brand-metal hover:text-brand-luxury"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ColumnVisibilityMenu table={table} />
        {rightSlot}
      </div>
    </div>
  );
}

function FacetedFilter<T>({
  table,
  def,
}: {
  table: Table<T>;
  def: FacetedFilterDef;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const column = table.getColumn(def.columnId);
  const selected = (column?.getFilterValue() as string[] | undefined) ?? [];
  const selectedSet = new Set(selected);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!column) return null;

  const toggle = (value: string) => {
    const next = new Set(selectedSet);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    column.setFilterValue(next.size ? Array.from(next) : undefined);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "industrial-btn",
          selectedSet.size && "border-brand-wood/60 text-brand-luxury",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Filter className="w-3.5 h-3.5" />
        <span>{def.title}</span>
        {selectedSet.size > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-brand-wood/20 text-brand-wood text-[9px] font-bold">
            {selectedSet.size}
          </span>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-2 min-w-[14rem] bg-brand-elevated border border-brand-border shadow-2xl"
        >
          <div className="p-2 max-h-[280px] overflow-y-auto">
            {def.options.map((option) => {
              const active = selectedSet.has(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => toggle(option.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left",
                    "hover:bg-brand-border transition-colors",
                    active && "text-brand-luxury",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-4 h-4 border",
                      active
                        ? "bg-brand-wood/20 border-brand-wood text-brand-wood"
                        : "border-brand-border",
                    )}
                    aria-hidden
                  >
                    {active && <Check className="w-3 h-3" />}
                  </span>
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.secondary && (
                    <span className="text-[10px] text-brand-metal" lang="ar" dir="rtl">
                      {option.secondary}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedSet.size > 0 && (
            <div className="border-t border-brand-border p-2">
              <button
                type="button"
                onClick={() => column.setFilterValue(undefined)}
                className="w-full px-2 py-1 text-[10px] uppercase tracking-widest text-brand-metal hover:text-brand-luxury"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ColumnVisibilityMenu<T>({ table }: { table: Table<T> }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleable = table
    .getAllLeafColumns()
    .filter((col: Column<T, unknown>) => col.getCanHide());

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="industrial-btn"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Settings2 className="w-3.5 h-3.5" />
        <span>Columns</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 z-30 mt-2 min-w-[14rem] bg-brand-elevated border border-brand-border shadow-2xl"
        >
          <div className="p-2 max-h-[280px] overflow-y-auto">
            {toggleable.map((col) => {
              const visible = col.getIsVisible();
              const label = (col.columnDef.meta as { label?: string } | undefined)?.label ?? col.id;
              return (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-brand-border transition-colors"
                >
                  <input
                    type="checkbox"
                    className="accent-brand-wood"
                    checked={visible}
                    onChange={() => col.toggleVisibility()}
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
