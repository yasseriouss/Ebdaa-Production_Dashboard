import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
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
import { BrandLogoOverlay } from "../components/brand/BrandLogoLoader";
import { ArabicText } from "../components/brand/ArabicText";
import { BrandLogo } from "../components/brand/BrandLogo";
import { useTranslation, type Translate } from "../context/I18nContext";
import { useDeferredLoading } from "../lib/useDeferredLoading";
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
import { downloadCsv, rowsToCsv, type CsvColumn } from "../lib/csv";
import { downloadTablePdf, rowsToTableData } from "../lib/pdf";
import {
  WOOD_DEPARTMENT_OPTIONS,
  WOOD_STAGE_LABELS,
  WOOD_STAGE_ORDER,
  departmentReportsToLabel,
} from "../data/routing";
import {
  completionPercent,
  statusFromCompletion,
  type WoodDepartmentId,
  type WoodRoutingStageKey,
  type WoodWorkOrder,
  type WorkOrderPriority,
  type WorkOrderStatus,
} from "../data/types";
import { woodWorkOrdersFixture } from "../data/fixtures";
import {
  DEPARTMENT_REPORTS_TO,
  getDepartmentFactory,
} from "../data/fixtures/factoryCapacity";
import { useDeleteFhWoodOrder, useFhWoodOrders, useUpsertFhWoodOrder } from "../lib/api/hooks/useFactoryHub";

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

function woStatusT(t: Translate, s: WorkOrderStatus): string {
  switch (s) {
    case "Pending":
      return t("pages.woodOrders.statusPending");
    case "In Progress":
      return t("pages.woodOrders.statusInProgress");
    case "Done":
      return t("pages.woodOrders.statusDone");
    default:
      return s;
  }
}

function woPriorityT(t: Translate, p: WorkOrderPriority): string {
  switch (p) {
    case "Critical":
      return t("pages.woodOrders.priorityCritical");
    case "High":
      return t("pages.woodOrders.priorityHigh");
    case "Normal":
      return t("pages.woodOrders.priorityNormal");
    case "Low":
      return t("pages.woodOrders.priorityLow");
    default:
      return p;
  }
}

function woodDepartmentFilterDetail(
  deptId: WoodDepartmentId,
  locale: "ar" | "en",
  t: Translate,
): string {
  const factory = getDepartmentFactory(deptId);
  if (!factory) return "";
  const factoryLabel =
    locale === "ar"
      ? factory.name
      : factory.factory_id === "WF-001"
        ? t("pages.departments.woodFactoryOfficial")
        : t("pages.departments.metalFactoryOfficial");
  const parentId = DEPARTMENT_REPORTS_TO[deptId];
  if (!parentId) {
    return t("pages.woodOrders.deptFilterDetailRoot", { factory: factoryLabel });
  }
  const parentLabel = departmentReportsToLabel(parentId, locale);
  return t("pages.woodOrders.deptFilterDetailSub", {
    factory: factoryLabel,
    parent: parentLabel,
  });
}

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
  const [, navigate] = useLocation();
  const toast = useToast();
  const { t, locale } = useTranslation();
  const openDetail = (id: string) => navigate(`/orders/wood/${encodeURIComponent(id)}`);
  const {
    data: orders = woodWorkOrdersFixture.work_orders,
    isError: woodOrdersError,
    isFetching,
  } = useFhWoodOrders(woodWorkOrdersFixture.work_orders);
  const showBusy = useDeferredLoading(isFetching);
  const upsertWoodOrder = useUpsertFhWoodOrder();
  const deleteWoodOrder = useDeleteFhWoodOrder();

  useEffect(() => {
    if (woodOrdersError) {
      toast.error(t("pages.woodOrders.loadError"));
    }
  }, [woodOrdersError, toast, t]);
  const [view, setView] = useState<ViewMode>("table");
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
            aria-label={t("pages.woodOrders.selectAll")}
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={
              !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()
            }
            onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={t("pages.woodOrders.selectRowAria", {
              id: row.original.work_order_id,
            })}
            checked={row.getIsSelected()}
            onChange={(event) => row.toggleSelected(event.target.checked)}
          />
        ),
      },
      {
        accessorKey: "work_order_id",
        size: 140,
        header: t("pages.woodOrders.colWorkOrder"),
        meta: { label: t("pages.woodOrders.colWorkOrder") },
        cell: ({ row }) => (
          <span className="font-bold text-brand-luxury tracking-wider">
            {row.original.work_order_id}
          </span>
        ),
      },
      {
        accessorKey: "project_name",
        size: 160,
        header: t("pages.woodOrders.colProject"),
        meta: { label: t("pages.woodOrders.colProject") },
        filterFn: (row, _id, value) => {
          const v = value as string[] | undefined;
          if (!v || !v.length) return true;
          return v.includes(row.original.project_name);
        },
      },
      {
        accessorKey: "product_name",
        size: 280,
        header: t("pages.woodOrders.colProduct"),
        meta: { label: t("pages.woodOrders.colProduct") },
        cell: ({ row }) => (
          <ArabicText className="text-brand-metal text-xs leading-snug">
            {row.original.product_name}
          </ArabicText>
        ),
      },
      {
        id: "quantities",
        size: 140,
        header: t("pages.woodOrders.colQuantities"),
        meta: { label: t("pages.woodOrders.colQuantities") },
        enableSorting: true,
        sortingFn: (a, b) =>
          completionPercent(a.original.quantities) - completionPercent(b.original.quantities),
        cell: ({ row }) => {
          const percent = completionPercent(row.original.quantities);
          return (
            <div>
              <div className="text-xs font-bold text-brand-luxury text-end">
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
        header: t("pages.woodOrders.colDelivery"),
        meta: { label: t("pages.woodOrders.colDelivery") },
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
        header: t("pages.woodOrders.colPriority"),
        meta: { label: t("pages.woodOrders.colPriority") },
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
              {woPriorityT(t, priority)}
            </span>
          );
        },
      },
      {
        id: "status",
        size: 130,
        accessorFn: (row) => statusFromCompletion(completionPercent(row.quantities)),
        header: t("pages.woodOrders.colStatus"),
        meta: { label: t("pages.woodOrders.colStatus") },
        filterFn: (row, _id, value) => {
          const v = value as string[] | undefined;
          if (!v || !v.length) return true;
          return v.includes(statusFromCompletion(completionPercent(row.original.quantities)));
        },
        cell: ({ row }) => {
          const { status, tone } = statusFor(row.original);
          return (
            <span
              className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${tone}`}
            >
              {woStatusT(t, status)}
            </span>
          );
        },
      },
      {
        id: "current_stage",
        size: 140,
        accessorFn: (row) => currentStage(row) ?? "completed",
        header: t("pages.woodOrders.colCurrentStage"),
        meta: { label: t("pages.woodOrders.colCurrentStage") },
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
                {t("pages.woodOrders.stageCompleted")}
              </span>
            );
          const label = WOOD_STAGE_LABELS[stage];
          const primary = locale === "ar" ? label.arabic : label.english;
          const secondary = locale === "ar" ? label.english : label.arabic;
          return (
            <div className="text-xs text-brand-luxury">
              <div className="font-bold">{primary}</div>
              {locale === "ar" ? (
                <span className="block text-[10px] text-brand-metal" lang="en" dir="ltr">
                  {secondary}
                </span>
              ) : (
                <ArabicText className="text-[10px] text-brand-metal">{secondary}</ArabicText>
              )}
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
            { label: t("pages.woodOrders.actionView"), icon: Eye, onSelect: () => openDetail(row.original.work_order_id) },
            { label: t("pages.woodOrders.actionEdit"), icon: Pencil, onSelect: () => openDetail(row.original.work_order_id) },
            {
              label: t("pages.woodOrders.actionDelete"),
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
  }, [t, locale]);

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
        title: t("pages.woodOrders.filterProject"),
        options: projects.map((p) => ({ value: p, label: p })),
      },
      {
        columnId: "status",
        title: t("pages.woodOrders.filterStatus"),
        options: (["Pending", "In Progress", "Done"] as WorkOrderStatus[]).map((s) => ({
          value: s,
          label: woStatusT(t, s),
        })),
      },
      {
        columnId: "priority",
        title: t("pages.woodOrders.filterPriority"),
        options: (["Critical", "High", "Normal", "Low"] as WorkOrderPriority[]).map((p) => ({
          value: p,
          label: woPriorityT(t, p),
        })),
      },
      {
        columnId: "current_stage",
        title: t("pages.woodOrders.filterDepartment"),
        options: WOOD_DEPARTMENT_OPTIONS.map((d) => ({
          value: d.id,
          label: locale === "ar" ? d.arabic : d.english,
          secondary: locale === "ar" ? d.english : d.arabic,
          detail: woodDepartmentFilterDetail(d.id, locale, t),
        })),
      },
    ];
  }, [t, locale, projects]);

  const handleDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await deleteWoodOrder.mutateAsync(id);
      }
      table.resetRowSelection();
      toast.success(
        ids.length === 1
          ? t("pages.woodOrders.removedOne", { id: ids[0] })
          : t("pages.woodOrders.removedN", { n: String(ids.length) }),
      );
    } catch {
      toast.error(t("pages.woodOrders.deleteFail"));
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
      toast.success(
        t("pages.woodOrders.updatedStatus", {
          n: String(selectedIds.length),
          status: woStatusT(t, status),
        }),
      );
    } catch {
      toast.error(t("pages.woodOrders.updateFail"));
    }
  };

  const woodExportColumns: CsvColumn<WoodWorkOrder>[] = [
    { header: t("pages.woodOrders.csvWorkOrder"), accessor: (r) => r.work_order_id },
    { header: t("pages.woodOrders.csvProject"), accessor: (r) => r.project_name },
    { header: t("pages.woodOrders.csvClient"), accessor: (r) => r.client ?? "" },
    { header: t("pages.woodOrders.csvProduct"), accessor: (r) => r.product_name },
    { header: t("pages.woodOrders.csvTotal"), accessor: (r) => r.quantities.total_required },
    { header: t("pages.woodOrders.csvCompleted"), accessor: (r) => r.quantities.completed },
    { header: t("pages.woodOrders.csvRemaining"), accessor: (r) => r.quantities.remaining },
    { header: t("pages.woodOrders.csvDelivery"), accessor: (r) => r.dates.delivery_date },
    { header: t("pages.woodOrders.csvPriority"), accessor: (r) => r.priority ?? "Normal" },
    {
      header: t("pages.woodOrders.csvStatus"),
      accessor: (r) => statusFromCompletion(completionPercent(r.quantities)),
    },
  ];

  const handleBulkExport = (rows: WoodWorkOrder[]) => {
    const csv = rowsToCsv(rows, woodExportColumns);
    downloadCsv(`wood-work-orders-${new Date().toISOString().slice(0, 10)}`, csv);
    toast.info(t("pages.woodOrders.exportRows", { n: String(rows.length) }));
  };

  const handleBulkExportPdf = async (rows: WoodWorkOrder[]) => {
    try {
      const { headers, rows: data } = rowsToTableData(rows, woodExportColumns);
      await downloadTablePdf({
        title: t("pages.woodOrders.title"),
        headers,
        rows: data,
        filename: `wood-work-orders-${new Date().toISOString().slice(0, 10)}`,
      });
      toast.info(t("pages.woodOrders.exportRows", { n: String(rows.length) }));
    } catch {
      toast.error(t("pages.dailyProduction.exportPdfFail"));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <BrandLogoOverlay label={t("loader.busy")} show={showBusy} />
      <header className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end border-b border-brand-border pb-6">
        <div className="flex items-start gap-4 min-w-0">
          <BrandLogo className="h-12 w-auto max-h-12 max-w-[120px] shrink-0 object-contain object-left" />
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Trees className="w-5 h-5 text-brand-wood" />
              <h2 className="text-3xl font-bold tracking-tighter uppercase">
                {t("pages.woodOrders.title")}
              </h2>
            </div>
            <p className="text-sm text-brand-metal font-medium mt-1">
              <ArabicText className="text-brand-luxury">
                {woodWorkOrdersFixture.factory_name}
              </ArabicText>
              <span className="mx-2 text-brand-border">|</span>
              <span>{t("pages.woodOrders.activeCount", { n: String(orders.length) })}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="industrial-btn"
            onClick={() => toast.info(t("pages.woodOrders.newWorkOrderHint"))}
          >
            <Package className="w-4 h-4" />
            <span>{t("pages.woodOrders.newWorkOrder")}</span>
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
          onRowClick={(row) => openDetail(row.work_order_id)}
          selectionColumnId="select"
          emptyState={
            <div className="flex flex-col items-center gap-3 text-brand-metal">
              <RefreshCw className="w-6 h-6 opacity-50" />
              <p>{t("pages.woodOrders.emptyFilters")}</p>
            </div>
          }
        />
      ) : (
        <KanbanBoard
          orders={table.getFilteredRowModel().rows.map((r) => r.original)}
          onSelect={(id) => openDetail(id)}
        />
      )}

      {view === "table" && <DataTablePagination table={table} />}

      <DataTableBulkBar
        table={table}
        onBulkDelete={(rows) => setPendingDelete(rows.map((r) => r.work_order_id))}
        onBulkExport={handleBulkExport}
        onBulkExportPdf={(rows) => void handleBulkExportPdf(rows)}
        extraActions={[
          {
            label: t("pages.woodOrders.bulkSetStatus"),
            icon: Download,
            onSelect: () => setPendingBulkStatus("In Progress"),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && handleDelete(pendingDelete)}
        title={t("pages.woodOrders.deleteTitle")}
        description={
          pendingDelete?.length === 1
            ? t("pages.woodOrders.deleteConfirmOne", { id: pendingDelete[0] })
            : t("pages.woodOrders.deleteConfirmN", { n: String(pendingDelete?.length ?? 0) })
        }
        confirmLabel={t("common.delete")}
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

    </div>
  );
}

function ViewSwitch({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const { t } = useTranslation();
  return (
    <div
      role="tablist"
      aria-label={t("pages.woodOrders.viewModeAria")}
      className="inline-flex border border-brand-border"
    >
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
        <span>{t("pages.woodOrders.viewTable")}</span>
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
        <span>{t("pages.woodOrders.viewKanban")}</span>
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
  const { t } = useTranslation();
  const desc =
    selectedCount === 1
      ? t("pages.woodOrders.bulkUpdateDescOne")
      : t("pages.woodOrders.bulkUpdateDesc", { n: String(selectedCount) });
  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("pages.woodOrders.bulkUpdateTitle")}
      description={desc}
      confirmLabel={t("pages.woodOrders.bulkApply")}
    >
      <Select
        label={t("pages.woodOrders.bulkNewStatusLabel")}
        value={status}
        onChange={(event) => onChange(event.target.value as WorkOrderStatus)}
      >
        <option value="Pending">{t("pages.woodOrders.statusPending")}</option>
        <option value="In Progress">{t("pages.woodOrders.statusInProgress")}</option>
        <option value="Done">{t("pages.woodOrders.statusDone")}</option>
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
  const { t, locale } = useTranslation();
  const groups: Record<WorkOrderStatus, WoodWorkOrder[]> = {
    Pending: [],
    "In Progress": [],
    Done: [],
  };
  for (const order of orders) {
    const status = statusFromCompletion(completionPercent(order.quantities));
    groups[status].push(order);
  }

  const columns: { status: WorkOrderStatus; tone: string }[] = [
    { status: "Pending", tone: "border-brand-metal/40" },
    { status: "In Progress", tone: "border-brand-warning/60" },
    { status: "Done", tone: "border-brand-success/60" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {columns.map(({ status, tone }) => (
        <section
          key={status}
          aria-label={woStatusT(t, status)}
          className={`glass-panel border-t-2 ${tone} p-4 flex flex-col gap-3 min-h-[320px]`}
        >
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest">{woStatusT(t, status)}</h3>
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
                  className="w-full text-start border border-brand-border bg-brand-black/40 p-3 hover:border-brand-wood/60 transition-colors"
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
                      {woPriorityT(t, priority)}
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
                      {t("pages.woodOrders.kanbanNext", {
                        stage:
                          locale === "ar"
                            ? WOOD_STAGE_LABELS[stage].arabic
                            : WOOD_STAGE_LABELS[stage].english,
                      })}
                    </p>
                  )}
                </button>
              );
            })}
            {groups[status].length === 0 && (
              <p className="text-[10px] text-brand-metal uppercase tracking-widest text-center py-6">
                {t("pages.woodOrders.kanbanEmpty")}
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
