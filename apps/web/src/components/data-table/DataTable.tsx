import { flexRender, type Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/cn";

interface DataTableProps<T> {
  table: Table<T>;
  onRowClick?: (row: T) => void;
  /** Optional sticky-checkbox column id so it renders with the freeze styling. */
  selectionColumnId?: string;
  /** Optional empty state rendered when the table has no rows. */
  emptyState?: React.ReactNode;
}

/**
 * Industrial table shell built on TanStack Table. Renders the headers,
 * sort indicators, column resize handles, sticky selection column, and
 * the row body. Toolbar/pagination are deliberately decoupled.
 */
export function DataTable<T>({
  table,
  onRowClick,
  selectionColumnId = "select",
  emptyState,
}: DataTableProps<T>) {
  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="w-full text-start table-fixed"
          style={{ width: table.getTotalSize() ? `${table.getTotalSize()}px` : "100%" }}
        >
          <thead className="bg-brand-black/40 border-b border-brand-border">
            {headerGroups.map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="text-[10px] font-bold uppercase tracking-widest text-brand-metal"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const isSelection = header.column.id === selectionColumnId;
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn(
                        "relative px-4 py-4 select-none",
                        isSelection && "sticky start-0 z-10 bg-brand-elevated w-[44px] px-3",
                      )}
                    >
                      {header.isPlaceholder ? null : isSelection ? (
                        <div className="flex justify-center">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "flex min-w-0 max-w-full items-center gap-2",
                            canSort && "cursor-pointer hover:text-brand-luxury transition-colors",
                          )}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          <span className="min-w-0 truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {canSort && (
                            <span aria-hidden className="shrink-0 text-brand-metal/70">
                              {sorted === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                      {header.column.getCanResize() && (
                        <button
                          type="button"
                          aria-label="Resize column"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute end-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                            "bg-transparent hover:bg-brand-wood/50 transition-colors",
                            header.column.getIsResizing() && "bg-brand-wood",
                          )}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="table-cell-multiline px-6 py-16 text-center text-xs text-brand-metal"
                >
                  {emptyState ?? "No records match the current filters."}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const selected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    data-state={selected ? "selected" : undefined}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "border-b border-brand-border last:border-b-0 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-brand-elevated/60",
                      selected && "bg-brand-wood/5",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isSelection = cell.column.id === selectionColumnId;
                      return (
                        <td
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className={cn(
                            "px-4 py-3 text-xs text-brand-luxury",
                            isSelection && "sticky start-0 z-[5] bg-brand-elevated/95 backdrop-blur px-3",
                          )}
                          onClick={isSelection ? (event) => event.stopPropagation() : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
