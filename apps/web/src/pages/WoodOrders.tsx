import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Calendar,
  Download,
  Eye,
  LayoutGrid,
  Package,
  Pencil,
  RefreshCw,
  Table as TableIcon,
  Trash2,
  Trees,
} from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { BrandLogo } from "../components/brand/BrandLogo";
import {
  DataTable,
  DataTableBulkBar,
  DataTablePagination,
  DataTableRowActions,
  DataTableToolbar,
  useDataTable,
  type FacetedFilterDef,
  type RowAction,
} from "../components/data-table";
import { Checkbox } from "../components/ui/Checkbox";
import { ConfirmDialog } from "../components/ui/Dialog";
import { Select } from "../components/ui/Select";
import { useToast } from "../components/ui/Toast";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import { downloadCsv, rowsToCsv } from "../lib/csv";
import {
  WOOD_DEPARTMENT_OPTIONS,
  WOOD_STAGE_LABELS,
  WOOD_STAGE_ORDER,
  woodOrderUiCompletedFromRouting,
} from "../data/routing";
import {
  completionPercent,
  statusFromCompletion,
  type WoodRoutingStageKey,
  type WoodWorkOrder,
  type WorkOrderPriority,
  type WorkOrderStatus,
} from "../data/types";
import { woodWorkOrdersFixture } from "../data/fixtures";
import { useDeleteFhWoodOrder, useFhWoodOrders, useUpsertFhWoodOrder } from "../lib/api/hooks/useFactoryHub";
import { WoodWorkOrderDetail } from "./WoodWorkOrderDetail";

type ViewMode = "table" | "kanban";

const PRIORITY_RANK: Record<WorkOrderPriority, number> = {
  Critical: 4,
  High: 3,
  Normal: 2,
  Low: 1,
};

const PRIORITY_TONE: Record<WorkOrderPriority, string> = {
  Critical: "bg-brand-error/15 text-brand-error border-brand-error/40",
  High: "bg-brand-warning/15 text-brand-warning border-brand-warning/40",
  Normal: "bg-brand-elevated text-brand-luxury border-brand-border",
  Low: "bg-brand-success/10 text-brand-success border-brand-success/30",
};

function formatDate(value: string): string {
  return value === "nan" ? "—" : value;
}

function isLate(order: WoodWorkOrder, status: WorkOrderStatus): boolean {
  if (status === "Done" || order.dates.delivery_date === "nan") return false;
  const due = new Date(order.dates.delivery_date);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

function statusFor(order: WoodWorkOrder) {
  const percent = completionPercent(order.quantities);
  const status = statusFromCompletion(percent);
  const palette: Record<WorkOrderStatus, { tone: string; arabic: string }> = {
    Done: { tone: "bg-brand-success/10 text-brand-success border-brand-success/30", arabic: "مكتمل" },
    "In Progress": { tone: "bg-brand-warning/10 text-brand-warning border-brand-warning/30", arabic: "قيد التنفيذ" },
    Pending: { tone: "bg-brand-border/40 text-brand-metal border-brand-border", arabic: "بالانتظار" },
  };
  return { status, percent, ...palette[status] };
}

/** Determine the order's current stage = first stage with qty_passed < total_required. */
function currentStage(order: WoodWorkOrder): WoodRoutingStageKey | null {
  const target = order.quantities.total_required;
  for (const key of WOOD_STAGE_ORDER) {
    if (order.routing_progress[key].qty_passed < target) return key;
  }
  return null;
}

export default function WoodOrders() {
  const toast = useToast();
  const { data: orders = woodWorkOrdersFixture.work_orders, isError: woodOrdersError } = useFhWoodOrders(
    woodWorkOrdersFixture.work_orders,
  );
  const upsertWoodOrder = useUpsertFhWoodOrder();
  const deleteWoodOrder = useDeleteFhWoodOrder();

  useEffect(() => {
    if (woodOrdersError) {
      toast.error(
        "تعذّر تحميل أوامر الخشب من واجهة factory-hub — يتم عرض البيانات المحلية حتى يعمل الخادم.",
      );
    }
  }, [woodOrdersError, toast]);
  const [view, setView] = useState<ViewMode>("table");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [pendingBulkStatus, setPendingBulkStatus] = useState<WorkOrderStatus | "">("");

  const projects = useMemo(() => {
    return Array.from(new Set(orders.map((order) => order.project_name))).sort();
  }, [orders]);

  const columns = useMemo<ColumnDef<WoodWorkOrder>[]>(() => {
    return [
      {
        id: "select",
        size: 44,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={
              !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()
            }
            onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select ${row.original.work_order_id}`}
            checked={row.getIsSelected()}
            onChange={(event) => row.toggleSelected(event.target.checked)}
          />
        ),
      },
      {
        accessorKey: "work_order_id",
        size: 140,
        header: "Work Order",
        meta: { label: "Work Order" },
        cell: ({ row }) => (
          <span className="font-bold text-brand-luxury tracking-wider">
            {row.original.work_order_id}
          </span>
        ),
      },
      {
        accessorKey: "project_name",
        size: 160,
        header: "Project",
        meta: { label: "Project" },
        filterFn: (row, _id, value) => {
          const v = value as string[] | undefined;
          if (!v || !v.length) return true;
          return v.includes(row.original.project_name);
        },
      },
      {
        accessorKey: "product_name",
        size: 280,
        header: "Product",
        meta: { label: "Product" },
        cell: ({ row }) => (
          <ArabicText className="text-brand-metal text-xs leading-snug">
            {row.original.product_name}
          </ArabicText>
        ),
      },
      {
        id: "quantities",
        size: 140,
        header: "Quantities",
        meta: { label: "Quantities" },
        enableSorting: true,
        sortingFn: (a, b) =>
          completionPercent(a.original.quantities) - completionPercent(b.original.quantities),
        cell: ({ row }) => {
          const percent = completionPercent(row.original.quantities);
          return (
            <div>
              <div className="text-xs font-bold text-brand-luxury text-right">
                {row.original.quantities.completed}/{row.original.quantities.total_required}
              </div>
              <div className="mt-1 h-1 w-full bg-brand-border">
                <div
                  className="h-full bg-brand-wood"
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "delivery_date",
        size: 120,
        accessorFn: (row) => row.dates.delivery_date,
        header: "Delivery",
        meta: { label: "Delivery" },
        cell: ({ row }) => {
          const { status } = statusFor(row.original);
          const late = isLate(row.original, status);
          return (
            <div className={`flex items-center gap-2 ${late ? "text-brand-error" : "text-brand-metal"}`}>
              {late ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              <span>{formatDate(row.original.dates.delivery_date)}</span>
            </div>
          );
        },
      },
      {
        id: "priority",
        size: 110,
        accessorFn: (row) => row.priority ?? "Normal",
        header: "Priority",
        meta: { label: "Priority" },
        sortingFn: (a, b) => {
          const aRank = PRIORITY_RANK[(a.original.priority ?? "Normal") as WorkOrderPriority];
          const bRank = PRIORITY_RANK[(b.original.priority ?? "Normal") as WorkOrderPriority];
          return aRank - bRank;
        },
        filterFn: (row, _id, value) => {
          const v = value as string[] | undefined;
          if (!v || !v.length) return true;
          return v.includes(row.original.priority ?? "Normal");
        },
        cell: ({ row }) => {
          const priority = (row.original.priority ?? "Normal") as WorkOrderPriority;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${PRIORITY_TONE[priority]}`}
            >
              {priority}
            </span>
          );
        },
      },
      {
        id: "status",
        size: 130,
        accessorFn: (row) => statusFromCompletion(completionPercent(row.quantities)),
        header: "Status",
        meta: { label: "Status" },
        filterFn: (row, _id, value) => {
          const v = value as string[] | undefined;
          if (!v || !v.length) return true;
          return v.includes(statusFromCompletion(completionPercent(row.original.quantities)));
        },
        cell: ({ row }) => {
          const { status, tone, arabic } = statusFor(row.original);
          return (
            <span
              className={`inline-flex flex-col items-start gap-0 border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${tone}`}
            >
              <span>{status}</span>
              <ArabicText className="text-[9px] font-medium normal-case opacity-80">
                {arabic}
              </ArabicText>
            </span>
          );
        },
      },
      {
        id: "current_stage",
        size: 140,
        accessorFn: (row) => currentStage(row) ?? "completed",
        header: "Current Stage",
        meta: { label: "Current Stage" },
        filterFn: (row, _id, value) => {
          const v = value as string[] | undefined;
          if (!v || !v.length) return true;
          const stage = currentStage(row.original);
          const dept = stage ? WOOD_STAGE_LABELS[stage].department : "DONE";
          return v.includes(dept);
        },
        cell: ({ row }) => {
          const stage = currentStage(row.original);
          if (!stage)
            return (
              <span className="text-[10px] uppercase tracking-widest text-brand-success">
                Completed
              </span>
            );
          const label = WOOD_STAGE_LABELS[stage];
          return (
            <div className="text-xs text-brand-luxury">
              <div className="font-bold">{label.english}</div>
              <ArabicText className="text-[10px] text-brand-metal">{label.arabic}</ArabicText>
            </div>
          );
        },
      },
      {
        id: "actions",
        size: 60,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        header: "",
        cell: ({ row }) => {
          const actions: RowAction[] = [
            { label: "View", icon: Eye, onSelect: () => setDetailId(row.original.work_order_id) },
            { label: "Edit", icon: Pencil, onSelect: () => setDetailId(row.original.work_order_id) },
            {
              label: "Delete",
              icon: Trash2,
              destructive: true,
              onSelect: () => setPendingDelete([row.original.work_order_id]),
            },
          ];
          return (
            <div className="flex justify-end">
              <DataTableRowActions actions={actions} />
            </div>
          );
        },
      },
    ];
  }, []);

  const { table, setGlobalFilter, state } = useDataTable<WoodWorkOrder>({
    data: orders,
    columns,
    getRowId: (row) => row.work_order_id,
    defaultPageSize: 10,
  });
  const debouncedSearch = useDebouncedValue(state.globalFilter, 200);
  useMemo(() => {
    table.setGlobalFilter(debouncedSearch);
  }, [debouncedSearch, table]);

  const filterDefs: FacetedFilterDef[] = useMemo(() => {
    return [
      {
        columnId: "project_name",
        title: "Project",
        options: projects.map((p) => ({ value: p, label: p })),
      },
      {
        columnId: "status",
        title: "Status",
        options: (["Pending", "In Progress", "Done"] as WorkOrderStatus[]).map((s) => ({
          value: s,
          label: s,
        })),
      },
      {
        columnId: "priority",
        title: "Priority",
        options: (["Critical", "High", "Normal", "Low"] as WorkOrderPriority[]).map((p) => ({
          value: p,
          label: p,
        })),
      },
      {
        columnId: "current_stage",
        title: "Department",
        options: WOOD_DEPARTMENT_OPTIONS.map((d) => ({
          value: d.id,
          label: d.english,
          secondary: d.arabic,
        })),
      },
    ];
  }, [projects]);

  const handleDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await deleteWoodOrder.mutateAsync(id);
      }
      table.resetRowSelection();
      toast.success(
        ids.length === 1
          ? `Removed work order ${ids[0]}`
          : `Removed ${ids.length} work orders`,
      );
    } catch {
      toast.error("فشل حذف أمر التشغيل من الخادم.");
    }
  };

  const handleBulkStatus = async (status: WorkOrderStatus) => {
    const selectedIds = Object.keys(state.rowSelection);
    if (!selectedIds.length) return;
    try {
      for (const order of orders) {
        if (!selectedIds.includes(order.work_order_id)) continue;
        const total = order.quantities.total_required;
        let next: WoodWorkOrder;
        if (status === "Done") {
          next = {
            ...order,
            quantities: { total_required: total, completed: total, remaining: 0 },
          };
        } else if (status === "Pending") {
          next = {
            ...order,
            quantities: { total_required: total, completed: 0, remaining: total },
          };
        } else {
          const half = Math.floor(total / 2);
          next = {
            ...order,
            quantities: { total_required: total, completed: half, remaining: total - half },
          };
        }
        await upsertWoodOrder.mutateAsync(next);
      }
      table.resetRowSelection();
      toast.success(`Updated ${selectedIds.length} orders to ${status}`);
    } catch {
      toast.error("فشل تحديث الحالة على الخادم.");
    }
  };

  const handleBulkExport = (rows: WoodWorkOrder[]) => {
    const csv = rowsToCsv(rows, [
      { header: "Work Order", accessor: (r) => r.work_order_id },
      { header: "Project", accessor: (r) => r.project_name },
      { header: "Client", accessor: (r) => r.client ?? "" },
      { header: "Product", accessor: (r) => r.product_name },
      { header: "Total", accessor: (r) => r.quantities.total_required },
      { header: "Completed", accessor: (r) => r.quantities.completed },
      { header: "Remaining", accessor: (r) => r.quantities.remaining },
      { header: "Delivery", accessor: (r) => r.dates.delivery_date },
      { header: "Priority", accessor: (r) => r.priority ?? "Normal" },
      {
        header: "Status",
        accessor: (r) => statusFromCompletion(completionPercent(r.quantities)),
      },
    ]);
    downloadCsv(`wood-work-orders-${new Date().toISOString().slice(0, 10)}`, csv);
    toast.info(`Exported ${rows.length} rows to CSV`);
  };

  const handleStageUpdate = async (
    workOrderId: string,
    stageKey: WoodRoutingStageKey,
    qty: number,
  ) => {
    const order = orders.find((o) => o.work_order_id === workOrderId);
    if (!order) return;
    const total = order.quantities.total_required;
    const clamped = Math.max(0, Math.min(qty, total));
    const routing = {
      ...order.routing_progress,
      [stageKey]: { ...order.routing_progress[stageKey], qty_passed: clamped },
    };
    const completed = woodOrderUiCompletedFromRouting(routing, total);
    const next: WoodWorkOrder = {
      ...order,
      routing_progress: routing,
      quantities: {
        total_required: total,
        completed,
        remaining: Math.max(total - completed, 0),
      },
    };
    try {
      await upsertWoodOrder.mutateAsync(next);
    } catch {
      toast.error("تعذّر حفظ التحديث على الخادم.");
    }
  };

  const detailOrder = detailId
    ? orders.find((o) => o.work_order_id === detailId) ?? null
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end border-b border-brand-border pb-6">
        <div className="flex items-start gap-4 min-w-0">
          <BrandLogo className="h-12 w-auto max-h-12 max-w-[120px] shrink-0 object-contain object-left" />
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Trees className="w-5 h-5 text-brand-wood" />
              <h2 className="text-3xl font-bold tracking-tighter uppercase">
                Wood Factory Orders
              </h2>
            </div>
            <p className="text-sm text-brand-metal font-medium mt-1">
              <ArabicText className="text-brand-luxury">
                {woodWorkOrdersFixture.factory_name}
              </ArabicText>
              <span className="mx-2 text-brand-border">|</span>
              <span>{orders.length} active work orders</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="industrial-btn"
            onClick={() => toast.info("New work order — wire to API once available.")}
          >
            <Package className="w-4 h-4" />
            <span>New Work Order</span>
          </button>
        </div>
      </header>

      <DataTableToolbar
        table={table}
        globalFilter={state.globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        filters={filterDefs}
        leftSlot={<ViewSwitch view={view} onChange={setView} />}
      />

      {view === "table" ? (
        <DataTable
          table={table}
          onRowClick={(row) => setDetailId(row.work_order_id)}
          selectionColumnId="select"
          emptyState={
            <div className="flex flex-col items-center gap-3 text-brand-metal">
              <RefreshCw className="w-6 h-6 opacity-50" />
              <p>No orders match the current filters.</p>
            </div>
          }
        />
      ) : (
        <KanbanBoard
          orders={table.getFilteredRowModel().rows.map((r) => r.original)}
          onSelect={(id) => setDetailId(id)}
        />
      )}

      {view === "table" && <DataTablePagination table={table} />}

      <DataTableBulkBar
        table={table}
        onBulkDelete={(rows) => setPendingDelete(rows.map((r) => r.work_order_id))}
        onBulkExport={handleBulkExport}
        extraActions={[
          {
            label: "Set Status",
            icon: Download,
            onSelect: () => setPendingBulkStatus("In Progress"),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && handleDelete(pendingDelete)}
        title="Delete work orders"
        description={
          pendingDelete?.length === 1
            ? `Delete ${pendingDelete[0]}? This cannot be undone.`
            : `Delete ${pendingDelete?.length ?? 0} selected work orders? This cannot be undone.`
        }
        confirmLabel="Delete"
        destructive
      />

      {pendingBulkStatus !== "" && (
        <BulkStatusDialog
          status={pendingBulkStatus}
          onChange={setPendingBulkStatus}
          onClose={() => setPendingBulkStatus("")}
          onConfirm={() => {
            if (pendingBulkStatus) handleBulkStatus(pendingBulkStatus);
            setPendingBulkStatus("");
          }}
          selectedCount={Object.keys(state.rowSelection).length}
        />
      )}

      <WoodWorkOrderDetail
        order={detailOrder}
        onClose={() => setDetailId(null)}
        onUpdateStage={handleStageUpdate}
      />

      <p className="text-[10px] text-brand-metal uppercase tracking-[0.3em]">
        Source: factory-hub `/api/factory-hub/wood-work-orders` (fallback to in-repo fixture if offline)
      </p>
    </div>
  );
}

function ViewSwitch({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div role="tablist" aria-label="View mode" className="inline-flex border border-brand-border">
      <button
        role="tab"
        aria-selected={view === "table"}
        type="button"
        onClick={() => onChange("table")}
        className={`industrial-btn !border-0 !px-3 ${
          view === "table" ? "bg-brand-border text-brand-luxury" : "text-brand-metal"
        }`}
      >
        <TableIcon className="w-3.5 h-3.5" />
        <span>Table</span>
      </button>
      <button
        role="tab"
        aria-selected={view === "kanban"}
        type="button"
        onClick={() => onChange("kanban")}
        className={`industrial-btn !border-0 !px-3 ${
          view === "kanban" ? "bg-brand-border text-brand-luxury" : "text-brand-metal"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Kanban</span>
      </button>
    </div>
  );
}

function BulkStatusDialog({
  status,
  onChange,
  onClose,
  onConfirm,
  selectedCount,
}: {
  status: WorkOrderStatus | "";
  onChange: (s: WorkOrderStatus | "") => void;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
}) {
  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={onConfirm}
      title="Update status"
      description={`Apply a new status to ${selectedCount} selected order${
        selectedCount === 1 ? "" : "s"
      }.`}
      confirmLabel="Apply"
    >
      <Select
        label="New status"
        value={status}
        onChange={(event) => onChange(event.target.value as WorkOrderStatus)}
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </Select>
    </ConfirmDialog>
  );
}

function KanbanBoard({
  orders,
  onSelect,
}: {
  orders: WoodWorkOrder[];
  onSelect: (id: string) => void;
}) {
  const groups: Record<WorkOrderStatus, WoodWorkOrder[]> = {
    Pending: [],
    "In Progress": [],
    Done: [],
  };
  for (const order of orders) {
    const status = statusFromCompletion(completionPercent(order.quantities));
    groups[status].push(order);
  }

  const columns: { status: WorkOrderStatus; arabic: string; tone: string }[] = [
    { status: "Pending", arabic: "بالانتظار", tone: "border-brand-metal/40" },
    { status: "In Progress", arabic: "قيد التنفيذ", tone: "border-brand-warning/60" },
    { status: "Done", arabic: "مكتمل", tone: "border-brand-success/60" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {columns.map(({ status, arabic, tone }) => (
        <section
          key={status}
          aria-label={status}
          className={`glass-panel border-t-2 ${tone} p-4 flex flex-col gap-3 min-h-[320px]`}
        >
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest">{status}</h3>
              <ArabicText className="text-[10px] text-brand-metal">{arabic}</ArabicText>
            </div>
            <span className="text-[10px] text-brand-metal uppercase tracking-widest">
              {groups[status].length}
            </span>
          </header>
          <div className="space-y-2">
            {groups[status].map((order) => {
              const percent = completionPercent(order.quantities);
              const stage = currentStage(order);
              const priority = (order.priority ?? "Normal") as WorkOrderPriority;
              return (
                <button
                  key={order.work_order_id}
                  type="button"
                  onClick={() => onSelect(order.work_order_id)}
                  className="w-full text-left border border-brand-border bg-brand-black/40 p-3 hover:border-brand-wood/60 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-widest text-brand-luxury">
                        {order.work_order_id}
                      </p>
                      <p className="text-[11px] text-brand-metal truncate">{order.project_name}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5 ${PRIORITY_TONE[priority]}`}
                    >
                      {priority}
                    </span>
                  </div>
                  <ArabicText className="block text-[11px] text-brand-luxury mt-2 line-clamp-2">
                    {order.product_name}
                  </ArabicText>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-brand-metal uppercase tracking-widest">
                      <span>{percent}%</span>
                      <span>
                        {order.quantities.completed}/{order.quantities.total_required}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-brand-border">
                      <div
                        className="h-full bg-brand-wood"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                  {stage && (
                    <p className="mt-2 text-[10px] text-brand-metal uppercase tracking-widest">
                      Next · {WOOD_STAGE_LABELS[stage].english}
                    </p>
                  )}
                </button>
              );
            })}
            {groups[status].length === 0 && (
              <p className="text-[10px] text-brand-metal uppercase tracking-widest text-center py-6">
                Empty
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
