import { useMemo, useState, useEffect, useCallback } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useUrlState } from "../../lib/useUrlState";

export interface UseDataTableConfig<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  /** Unique row id selector — required for stable selection across re-renders. */
  getRowId: (row: T) => string;
  /** Default page size (rows per page). */
  defaultPageSize?: number;
  /** Persist state to URL search params; set `false` for ephemeral tables. */
  syncUrl?: boolean;
}

/**
 * Wraps TanStack Table with sensible production defaults: row selection,
 * multi-column sorting, faceted column filters, global search, pagination,
 * and optional URL sync for filters/sort/pagination so views are shareable.
 */
export function useDataTable<T>({
  data,
  columns,
  getRowId,
  defaultPageSize = 10,
  syncUrl = true,
}: UseDataTableConfig<T>) {
  const url = useUrlState();

  const initialSort: SortingState = useMemo(() => {
    if (!syncUrl) return [];
    const raw = url.get("sort");
    if (!raw) return [];
    return raw.split(",").map((token) => {
      const [id, dir] = token.split(":");
      return { id, desc: dir === "desc" };
    });
  }, [syncUrl, url]);

  const initialPage = syncUrl ? Number(url.get("page") ?? 1) - 1 : 0;
  const initialSize = syncUrl ? Number(url.get("size") ?? defaultPageSize) : defaultPageSize;
  const initialQ = syncUrl ? url.get("q") ?? "" : "";

  const [sorting, setSorting] = useState<SortingState>(initialSort);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((c) => (c.id ?? (c as { accessorKey?: string }).accessorKey ?? "") as string),
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>(initialQ);
  const [pagination, setPagination] = useState({
    pageIndex: Number.isFinite(initialPage) && initialPage >= 0 ? initialPage : 0,
    pageSize: Number.isFinite(initialSize) && initialSize > 0 ? initialSize : defaultPageSize,
  });

  const table = useReactTable<T>({
    data,
    columns,
    getRowId,
    state: { sorting, columnFilters, columnVisibility, columnOrder, rowSelection, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    enableRowSelection: true,
    enableMultiSort: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  });

  useEffect(() => {
    if (!syncUrl) return;
    const sortToken = sorting.length
      ? sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(",")
      : null;
    url.setMany({
      sort: sortToken,
      page: pagination.pageIndex === 0 ? null : String(pagination.pageIndex + 1),
      size: pagination.pageSize === defaultPageSize ? null : String(pagination.pageSize),
      q: globalFilter || null,
    });
  }, [sorting, pagination.pageIndex, pagination.pageSize, globalFilter, syncUrl, defaultPageSize, url]);

  const resetSelection = useCallback(() => setRowSelection({}), []);

  return {
    table,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      rowSelection,
      globalFilter,
      pagination,
    },
    setGlobalFilter,
    setColumnFilters,
    setColumnVisibility,
    resetSelection,
  };
}
