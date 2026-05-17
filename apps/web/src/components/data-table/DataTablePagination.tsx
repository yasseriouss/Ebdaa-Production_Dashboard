import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslation } from "../../context/I18nContext";
import { useDirection } from "../../lib/useDirection";
import { appLocale, formatNumber } from "../../lib/formatLocale";

const PAGE_SIZES = [10, 25, 50, 100];

export function DataTablePagination<T>({
  table,
  totalRows,
}: {
  table: Table<T>;
  /** Optional override; for server-side pagination pass the upstream count. */
  totalRows?: number;
}) {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const locale = appLocale(direction);
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
            ? t("dataTable.selectedOfTotal", {
                n: String(formatNumber(selectedCount, locale)),
                total: String(formatNumber(rowCount, locale)),
              })
            : t("dataTable.records", { n: String(formatNumber(rowCount, locale)) })}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span>{t("dataTable.rows")}</span>
          <select
            aria-label={t("dataTable.rowsPerPageAria")}
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
          {t("dataTable.pageOf", {
            page: String(pageIndex + 1),
            pages: String(Math.max(pageCount, 1)),
          })}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="industrial-btn p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("dataTable.firstPage")}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="industrial-btn p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("dataTable.prevPage")}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="industrial-btn p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("dataTable.nextPage")}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
            disabled={!table.getCanNextPage()}
            className="industrial-btn p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("dataTable.lastPage")}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
