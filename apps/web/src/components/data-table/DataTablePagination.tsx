import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PAGE_SIZES = [10, 25, 50, 100];

export function DataTablePagination<T>({
  table,
  totalRows,
}: {
  table: Table<T>;
  /** Optional override; for server-side pagination pass the upstream count. */
  totalRows?: number;
}) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const rowCount = totalRows ?? table.getFilteredRowModel().rows.length;
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between text-[10px] uppercase tracking-widest text-brand-metal">
      <div className="flex items-center gap-3">
        <span>
          {selectedCount > 0
            ? `${selectedCount} of ${rowCount} selected`
            : `${rowCount.toLocaleString()} records`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span>Rows</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            className="bg-brand-elevated border border-brand-border px-2 py-1 text-xs text-brand-luxury"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <span className="text-brand-metal">
          Page {pageIndex + 1} / {Math.max(pageCount, 1)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="industrial-btn p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="industrial-btn p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="industrial-btn p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
            disabled={!table.getCanNextPage()}
            className="industrial-btn p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
