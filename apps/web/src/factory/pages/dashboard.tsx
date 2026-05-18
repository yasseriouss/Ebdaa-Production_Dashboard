import { useEffect, useMemo, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { AnalyticsMetricRow } from "../../components/dashboard/AnalyticsMetricRow";
import { dashboardAnalyticsSubtitleClass } from "../../components/dashboard/DashboardAnalyticsPanel";
import { ExecutiveAnalyticsListPanel } from "../../components/dashboard/ExecutiveAnalyticsListPanel";
import { ExecutiveDataStatus } from "../../components/dashboard/ExecutiveDataStatus";
import { useExecutiveDashboardData } from "../hooks/useExecutiveDashboardData";
import type { StageSummary, CapacityMachineRow } from "@workspace/api-client-react";
import { PieBulletLegend } from "@factory/components/PieBulletLegend";
import { LoadPressureCard } from "@factory/components/LoadPressureCard";
import { Skeleton } from "@factory/components/ui/skeleton";
import { Factory, Boxes, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@factory/lib/utils";
import { formatDepartmentDisplayName } from "../../lib/departmentDisplayName";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";
import { useDirection } from "../../lib/useDirection";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false,
  );
}

const METAL_STATUS_COLORS: Record<string, string> = {
  "تم الانتهاء": "oklch(65% 0.15 140)",
  "تم التسليم": "oklch(60% 0.15 140)",
  "تحت التصنيع": "oklch(65% 0.15 250)",
  "في المخزن": "oklch(60% 0.15 280)",
  "لم يتم البدء": "oklch(50% 0.018 50)",
  "متوقف": "oklch(60% 0.15 30)",
};

const WOODEN_STATUS_COLORS: Record<string, string> = {
  "تم التسليم": "oklch(65% 0.15 140)",
  "تم الانتهاء": "oklch(65% 0.15 140)",
  "تحت التصنيع": "oklch(65% 0.15 250)",
  "به مشكله": "oklch(62% 0.2 25)",
  "تحت التعديل": "oklch(58% 0.18 290)",
  "فى انتظار خامات": "oklch(72% 0.16 85)",
  "في المخزن": "oklch(60% 0.15 280)",
  "لم يتم البدء": "oklch(50% 0.018 50)",
  "متوقف": "oklch(60% 0.15 30)",
  "Delivered": "oklch(65% 0.15 140)",
  "Production": "oklch(65% 0.15 250)",
};

const PIE_COLORS = [
  "oklch(65% 0.15 250)", 
  "oklch(65% 0.15 140)", 
  "oklch(75% 0.15 80)", 
  "oklch(60% 0.15 30)", 
  "oklch(60% 0.15 280)"
];

const MF_ID = "MF-001";
const WF_ID = "WF-001";

/** مراحل أمر الشغل الخشب المبسّطة ↔ أقسام gem_Claude (factory_operations_schema) */
const WOODEN_STAGE_TO_DEPT_IDS: Record<string, string[]> = {
  القطع: ["DEPT_SOLID_WOOD", "DEPT_PANEL_PROC"],
  التجميع: ["DEPT_VENEER", "DEPT_JOINERY"],
  التشطيب: ["DEPT_SANDING", "DEPT_UPHOLSTERY", "DEPT_WOOD_PAINT"],
  التغليف: ["DEPT_WOOD_ASSY"],
};

/** مطابقة أسماء مراحل المعدن في قاعدة أوامر الشغل مع أسماء المهام في مخطط السعة */
const METAL_STAGE_NAME_TO_TASK_NAME: Record<string, string> = {
  "مكابس و تكويع": "مكابس وتكويع",
  "لحام أرجون استالنس": "لحام أرجون ستانلس",
  "التسليم": "التجميع",
};

function resolveMetalTaskName(stageName: string): string {
  return METAL_STAGE_NAME_TO_TASK_NAME[stageName] ?? stageName;
}

function buildTaskNameToDepartmentName(machines: CapacityMachineRow[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const row of machines) {
    m.set(row.taskName, row.departmentName);
  }
  return m;
}

function aggregateMetalDepartmentsFromCapacity(
  summary: StageSummary[],
  machines: CapacityMachineRow[],
): { name: string; wip: number; done: number }[] {
  const metalMachines = machines.filter((x) => x.factoryId === MF_ID);
  const taskToDept = buildTaskNameToDepartmentName(metalMachines);
  const agg = new Map<string, { wip: number; done: number }>();
  for (const s of summary) {
    const taskName = resolveMetalTaskName(s.stageName);
    const dept = taskToDept.get(taskName) ?? "غير مربوط بجدول الماكينات";
    const cur = agg.get(dept) ?? { wip: 0, done: 0 };
    cur.wip += s.totalWip ?? 0;
    cur.done += s.totalDone ?? 0;
    agg.set(dept, cur);
  }
  return Array.from(agg.entries())
    .map(([name, v]) => ({ name, wip: v.wip, done: v.done }))
    .sort((a, b) => b.wip - a.wip);
}

function aggregateWoodenDepartmentsFromCapacity(
  summary: StageSummary[],
  machines: CapacityMachineRow[],
): { name: string; wip: number; done: number }[] {
  const byDeptId = new Map<string, string>();
  for (const m of machines.filter((x) => x.factoryId === WF_ID)) {
    byDeptId.set(m.departmentId, m.departmentName);
  }
  const agg = new Map<string, { wip: number; done: number }>();
  for (const name of byDeptId.values()) {
    agg.set(name, { wip: 0, done: 0 });
  }
  for (const s of summary) {
    const group = WOODEN_STAGE_TO_DEPT_IDS[s.stageName];
    if (!group?.length) continue;
    const shareWip = (s.totalWip ?? 0) / group.length;
    const shareDone = (s.totalDone ?? 0) / group.length;
    for (const deptId of group) {
      const name = byDeptId.get(deptId);
      if (!name) continue;
      const cur = agg.get(name)!;
      cur.wip += shareWip;
      cur.done += shareDone;
    }
  }
  return Array.from(agg.entries())
    .map(([name, v]) => ({ name, wip: v.wip, done: v.done }))
    .sort((a, b) => b.wip - a.wip);
}

function metalMachineRowsFromCapacity(
  summary: StageSummary[],
  machines: CapacityMachineRow[],
): { name: string; wip: number; done: number }[] {
  return machines
    .filter((x) => x.factoryId === MF_ID)
    .sort((a, b) => a.processStep - b.processStep || a.taskName.localeCompare(b.taskName, "ar"))
    .map((m) => {
      const match = summary.find((s) => resolveMetalTaskName(s.stageName) === m.taskName);
      return {
        name: `${m.taskName} — ${m.departmentName}`,
        wip: match?.totalWip ?? 0,
        done: match?.totalDone ?? 0,
      };
    });
}

function woodenMachineRowsFromCapacity(
  summary: StageSummary[],
  machines: CapacityMachineRow[],
): { name: string; wip: number; done: number }[] {
  const wood = machines.filter((x) => x.factoryId === WF_ID);
  return wood
    .sort((a, b) => a.processStep - b.processStep || a.taskName.localeCompare(b.taskName, "ar"))
    .map((m) => {
      const stageName = Object.keys(WOODEN_STAGE_TO_DEPT_IDS).find((st) =>
        WOODEN_STAGE_TO_DEPT_IDS[st].includes(m.departmentId),
      );
      const stageEntry = stageName ? summary.find((s) => s.stageName === stageName) : undefined;
      const count = stageName
        ? wood.filter((x) => WOODEN_STAGE_TO_DEPT_IDS[stageName].includes(x.departmentId)).length
        : 1;
      const wip = stageEntry && count > 0 ? (stageEntry.totalWip ?? 0) / count : 0;
      const done = stageEntry && count > 0 ? (stageEntry.totalDone ?? 0) / count : 0;
      return {
        name: `${m.taskName} — ${m.departmentName}`,
        wip,
        done,
      };
    });
}

const executiveTransition = { type: "spring" as const, damping: 30, stiffness: 200, mass: 1 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: executiveTransition,
  },
};

const embeddedItemVariants = {
  hidden: { opacity: 1, scale: 1, y: 0 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0 } },
};

const embeddedContainerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
};

function ExecutiveCard({
  children,
  className,
  title,
  icon: Icon,
  value,
  valueSuffix,
  subtitle,
  embedded = false,
  rtl = false,
}: {
  children?: ReactNode;
  className?: string;
  title: string;
  icon?: ComponentType<{ className?: string }>;
  value: ReactNode;
  valueSuffix?: ReactNode;
  subtitle?: string;
  embedded?: boolean;
  rtl?: boolean;
}) {
  const titleClass = cn(
    "text-xs font-bold",
    embedded
      ? rtl
        ? "font-arabic normal-case tracking-normal text-brand-metal"
        : "uppercase tracking-wider text-brand-metal"
      : rtl
        ? "font-arabic normal-case tracking-normal text-muted-foreground"
        : "uppercase tracking-wider text-muted-foreground",
  );

  const body = (
    <>
      <div className={cn("flex flex-row items-center justify-between", embedded ? "pb-3" : "pb-4")}>
        <h3 className={titleClass}>{title}</h3>
        {Icon ? (
          <Icon className={cn("h-5 w-5", embedded ? "text-brand-wood/80" : "text-accent/70")} aria-hidden />
        ) : null}
      </div>
      <div>
        <div
          className={cn(
            "font-bold tracking-tight tabular-nums",
            embedded ? "text-3xl text-brand-luxury sm:text-4xl" : "text-4xl text-foreground",
          )}
        >
          {value}
          {valueSuffix ? (
            <span className={cn("ms-2 text-lg font-medium sm:text-xl", embedded ? "text-brand-metal" : "text-muted-foreground")}>
              {valueSuffix}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className={cn("mt-2 text-xs font-medium", embedded ? "text-brand-metal" : "text-muted-foreground")}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </>
  );

  if (embedded) {
    return (
      <motion.div
        variants={embeddedItemVariants}
        className={cn("stat-card flex h-full min-h-[8.5rem] flex-col justify-between", className)}
      >
        {body}
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} className={cn("double-bezel-outer", className)}>
      <div className="double-bezel-inner flex h-full flex-col justify-between p-6">{body}</div>
    </motion.div>
  );
}

export type FactoryDashboardProps = { embedded?: boolean };

export default function Dashboard({ embedded = false }: FactoryDashboardProps) {
  const { ft } = useFactoryTranslation();
  const { direction } = useDirection();
  const rtl = direction === "rtl";
  const cardMotion = embedded ? embeddedItemVariants : itemVariants;
  const {
    stats,
    clients,
    empStats,
    metalStageSummary,
    woodenStageSummary,
    capacityMachines,
    isLoading,
    isFetching,
    isError,
    partialError,
    refetchAll,
    loadingMetalStages,
    loadingWoodenStages,
  } = useExecutiveDashboardData();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  const metalStatusData = (stats?.metalStatusBreakdown || []).map(
    (item: { status: string; count: number }) => ({ name: item.status, value: item.count, fill: METAL_STATUS_COLORS[item.status] || "oklch(50% 0.018 50)" })
  );

  const woodenStatusData = (stats?.woodenStatusBreakdown || []).map(
    (item: { status: string; count: number }) => ({
      name: item.status,
      value: item.count,
      fill: WOODEN_STATUS_COLORS[item.status] || "oklch(50% 0.018 50)",
    })
  );

  const statusPieOuterR = isLg ? 88 : isSm ? 80 : 72;
  const statusPieInnerR = isLg ? 54 : isSm ? 48 : 42;
  const topClients = useMemo(() => {
    const clientList = Array.isArray(clients) ? clients : [];
    return clientList.slice(0, 8).map((c: { client?: string; totalOrders?: number; completionPct?: number }) => {
      const full = String(c.client ?? "").trim();
      return {
        clientFull: full || "—",
        totalOrders: c.totalOrders ?? 0,
        completionPct: c.completionPct,
      };
    });
  }, [clients]);

  const topClientsMaxOrders = useMemo(
    () => Math.max(1, ...topClients.map((c) => c.totalOrders)),
    [topClients],
  );

  const metalDeptRows = useMemo(
    () => aggregateMetalDepartmentsFromCapacity(metalStageSummary ?? [], capacityMachines),
    [metalStageSummary, capacityMachines],
  );
  const woodenDeptRows = useMemo(
    () => aggregateWoodenDepartmentsFromCapacity(woodenStageSummary ?? [], capacityMachines),
    [woodenStageSummary, capacityMachines],
  );
  const metalMachineRows = useMemo(
    () => metalMachineRowsFromCapacity(metalStageSummary ?? [], capacityMachines),
    [metalStageSummary, capacityMachines],
  );
  const woodenMachineRows = useMemo(
    () => woodenMachineRowsFromCapacity(woodenStageSummary ?? [], capacityMachines),
    [woodenStageSummary, capacityMachines],
  );

  useEffect(() => {
    if (!embedded || isLoading) return;
    if (typeof window === "undefined" || window.location.hash !== "#executive") return;
    document.getElementById("executive")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [embedded, isLoading]);

  if (isLoading) {
    return (
      <div className={cn(embedded ? "py-2" : "p-12")} role="status" aria-label={ft("dashboard.loading")}>
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-36 sm:h-44 rounded-2xl" />
          <Skeleton className="h-36 sm:h-44 rounded-2xl" />
          <Skeleton className="h-36 sm:h-44 rounded-2xl" />
          <Skeleton className="h-36 sm:h-44 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(embedded ? "py-2" : "p-8")}>
        <ExecutiveDataStatus isError onRetry={() => void refetchAll()} isRetrying={isFetching} />
      </div>
    );
  }

  return (
    <motion.div
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "en"}
      className={cn(
        "mx-auto w-full min-w-0 space-y-8 sm:space-y-10",
        embedded ? "max-w-full space-y-6 sm:space-y-8" : "max-w-(--breakpoint-2xl) p-4 sm:p-8 lg:p-12 space-y-8 sm:space-y-12",
      )}
      initial={embedded ? false : "hidden"}
      animate="visible"
      variants={embedded ? embeddedContainerVariants : containerVariants}
    >
      {partialError ? (
        <ExecutiveDataStatus
          partialError
          onRetry={() => void refetchAll()}
          isRetrying={isFetching}
          className={embedded ? "mb-4" : "mb-6"}
        />
      ) : null}
      {!embedded ? (
        <header className="space-y-2 min-w-0">
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground">{ft("dashboard.title")}</h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">{ft("dashboard.subtitle")}</p>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{ft("dashboard.dataHint")}</p>
        </header>
      ) : null}

      {/* Bento Grid Layout */}
      <div
        className={cn(
          "grid auto-rows-[minmax(160px,auto)] md:grid-cols-6 lg:grid-cols-12",
          embedded ? "gap-4 sm:gap-5" : "gap-8",
        )}
      >
        
        {/* Major KPI - Metal */}
        <ExecutiveCard embedded={embedded} rtl={rtl}
          className="md:col-span-3 lg:col-span-4 row-span-1"
          title={ft("dashboard.metalOrdersTitle")}
          icon={Factory}
          value={stats?.metalTotalOrders || 0}
          subtitle={`${ft("dashboard.avgCompletion", { pct: stats?.metalAvgCompletionPct || 0 })} · ${ft("dashboard.activeOrders", { n: stats?.metalActiveOrders || 0 })}`}
        />

        {/* Major KPI - Wooden */}
        <ExecutiveCard embedded={embedded} rtl={rtl}
          className="md:col-span-3 lg:col-span-4 row-span-1"
          title={ft("dashboard.woodenOrdersTitle")}
          icon={Boxes}
          value={stats?.woodenTotalOrders || 0}
          subtitle={`${ft("dashboard.avgCompletion", { pct: stats?.woodenAvgCompletionPct || 0 })} · ${ft("dashboard.activeOrders", { n: stats?.woodenActiveOrders || 0 })}`}
        />

        {/* Highlight KPI - Shared Projects */}
        <ExecutiveCard embedded={embedded} rtl={rtl}
          className="md:col-span-2 lg:col-span-4 row-span-1 bg-accent/5"
          title={ft("dashboard.sharedProjectsTitle")}
          icon={CheckCircle2}
          value={stats?.sharedProjectsCount || 0}
          subtitle={ft("dashboard.sharedProjectsSubtitle")}
        />

        {/* Overdue Alerts - Metal */}
        <ExecutiveCard embedded={embedded} rtl={rtl}
          className="md:col-span-3 lg:col-span-3 row-span-1"
          title={ft("dashboard.metalBacklogTitle")}
          icon={AlertTriangle}
          value={stats?.metalBacklogTotal || 0}
          subtitle={ft("dashboard.stoppedOrders", { n: stats?.metalOverdueOrders || 0 })}
        />

        {/* Overdue Alerts - Wooden */}
        <ExecutiveCard embedded={embedded} rtl={rtl}
          className="md:col-span-3 lg:col-span-3 row-span-1"
          title={ft("dashboard.woodenBacklogTitle")}
          icon={AlertTriangle}
          value={stats?.woodenBacklogTotal || 0}
          subtitle={ft("dashboard.stoppedOrders", { n: stats?.woodenOverdueOrders || 0 })}
        />

        {/* Clients Analytics - Large Bento Piece */}
        <motion.div variants={cardMotion} className="md:col-span-6 lg:col-span-6 row-span-2 min-w-0">
          {embedded ? (
            <ExecutiveAnalyticsListPanel title={ft("dashboard.topClientsTitle")} rtl={rtl} className="h-full">
              <ul className="max-h-[min(52vh,440px)] space-y-3 overflow-y-auto overflow-x-hidden pe-1" role="list">
                {topClients.length === 0 ? (
                  <li className="py-8 text-center text-sm text-brand-metal">{ft("dashboard.noClients")}</li>
                ) : (
                  topClients.map((row, idx) => (
                    <AnalyticsMetricRow
                      key={`${row.clientFull}-${idx}`}
                      layout="client"
                      label={row.clientFull}
                      value={ft("dashboard.productionOrdersCount", { n: row.totalOrders })}
                      secondaryValue={
                        typeof row.completionPct === "number"
                          ? `${Math.round(row.completionPct)}%`
                          : undefined
                      }
                      progress={typeof row.completionPct === "number" ? row.completionPct : undefined}
                      progressClassName="bg-brand-wood"
                      rtl={rtl}
                    />
                  ))
                )}
              </ul>
            </ExecutiveAnalyticsListPanel>
          ) : (
            <div className="double-bezel-outer h-full min-w-0">
              <div className="double-bezel-inner h-full p-4 sm:p-6 lg:p-8 min-w-0">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:mb-6 lg:mb-8">
                  {ft("dashboard.topClientsTitle")}
                </h3>
                <div className="w-full min-w-0 max-h-[min(52vh,440px)] overflow-y-auto overflow-x-hidden pe-1 -me-1">
                  {topClients.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">{ft("dashboard.noClients")}</p>
                  ) : (
                    <ul className="space-y-5 pb-1 sm:space-y-6">
                      {topClients.map((row, idx) => {
                        const widthPct = (row.totalOrders / topClientsMaxOrders) * 100;
                        return (
                          <li key={`${row.clientFull}-${idx}`} className="min-w-0 list-none space-y-2.5 sm:space-y-3">
                            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-4">
                              <p className="order-1 min-w-0 break-words text-sm font-medium leading-relaxed text-foreground">
                                {row.clientFull}
                              </p>
                              <div className="order-2 shrink-0 text-xs tabular-nums text-muted-foreground sm:text-end">
                                <span className="font-semibold text-foreground">{row.totalOrders}</span>{" "}
                                {ft("dashboard.ordersUnit")}
                                {typeof row.completionPct === "number" ? (
                                  <span className="ms-2 opacity-90">
                                    {ft("dashboard.completionPct", { pct: Math.round(row.completionPct) })}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/45 ring-1 ring-border/35 sm:h-3.5" dir="rtl" aria-hidden>
                              <div
                                className="h-full rounded-full transition-[width] duration-500 ease-out"
                                style={{
                                  width: `${widthPct}%`,
                                  background: "oklch(64% 0.13 28)",
                                  minWidth: row.totalOrders > 0 ? "6px" : undefined,
                                }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
        {/* Status Distribution - Metal */}
        <motion.div variants={cardMotion} className="double-bezel-outer md:col-span-3 lg:col-span-3 row-span-2 min-w-0">
          <div className="double-bezel-inner h-full p-4 sm:p-6 lg:p-8 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 sm:mb-8">
              {ft("dashboard.metalStatusDistribution")}
            </h3>
            <div className="h-[220px] sm:h-[250px] relative w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metalStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={statusPieOuterR}
                    innerRadius={statusPieInnerR}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {metalStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(99% 0.008 70)", border: "none", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">{stats?.metalTotalOrders}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">{ft("dashboard.totalLabel")}</span>
              </div>
            </div>
            {metalStatusData.length > 0 && (
              <div className="mt-4 pt-3 border-t border-foreground/10">
                <PieBulletLegend rtl={rtl} items={metalStatusData.map(({ name, fill, value }) => ({ name, fill, value }))} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Status Distribution - Wooden */}
        <motion.div variants={cardMotion} className="double-bezel-outer md:col-span-3 lg:col-span-3 row-span-2 min-w-0">
          <div className="double-bezel-inner h-full p-4 sm:p-6 lg:p-8 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 sm:mb-8">
              {ft("dashboard.woodenStatusDistribution")}
            </h3>
            <div className="h-[220px] sm:h-[250px] relative w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={woodenStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={statusPieOuterR}
                    innerRadius={statusPieInnerR}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {woodenStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(99% 0.008 70)", border: "none", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">{stats?.woodenTotalOrders}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">{ft("dashboard.totalLabel")}</span>
              </div>
            </div>
            {woodenStatusData.length > 0 && (
              <div className="mt-4 pt-3 border-t border-foreground/10">
                <PieBulletLegend rtl={rtl} items={woodenStatusData.map(({ name, fill, value }) => ({ name, fill, value }))} />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ضغط العمل حسب الأقسام — معدني وخشبي متجاوران */}
      <motion.div variants={cardMotion} className="space-y-4 pt-8 border-t border-foreground/5">
        <div className="px-1 space-y-1">
          <h2 className="text-sm font-bold text-foreground tracking-tight">{ft("dashboard.loadByDept")}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            {ft("dashboard.loadByDeptHint")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div variants={cardMotion}>
            <LoadPressureCard
              title={ft("dashboard.metalPlant")}
              subtitle={ft("dashboard.metalDeptSubtitle")}
              rows={metalDeptRows}
              isLoading={loadingMetalStages}
              barColor="oklch(58% 0.14 28)"
              progressClassName="bg-brand-metal"
              emptyLabel={ft("dashboard.noLoadData")}
              embedded={embedded}
              rtl={rtl}
              pressureWipLabel={(n) => ft("dashboard.pressureWip", { n: Math.round(n) })}
              pressureDoneLabel={(n) => ft("dashboard.pressureDone", { n: Math.round(n) })}
            />
          </motion.div>
          <motion.div variants={cardMotion}>
            <LoadPressureCard
              title={ft("dashboard.woodenPlant")}
              subtitle={ft("dashboard.woodenDeptSubtitle")}
              rows={woodenDeptRows}
              isLoading={loadingWoodenStages}
              barColor="oklch(55% 0.12 250)"
              progressClassName="bg-brand-wood"
              emptyLabel={ft("dashboard.noLoadData")}
              embedded={embedded}
              rtl={rtl}
              pressureWipLabel={(n) => ft("dashboard.pressureWip", { n: Math.round(n) })}
              pressureDoneLabel={(n) => ft("dashboard.pressureDone", { n: Math.round(n) })}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* ضغط العمل حسب المحطة / الماكينة — مرحلة لكل صف */}
      <motion.div variants={cardMotion} className="space-y-4 pt-8">
        <div className="px-1 space-y-1">
          <h2 className="text-sm font-bold text-foreground tracking-tight">{ft("dashboard.loadByMachines")}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            {ft("dashboard.loadMachinesHint")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div variants={cardMotion}>
            <LoadPressureCard
              title={ft("dashboard.metalMachinesTitle")}
              subtitle={ft("dashboard.metalMachinesSubtitle")}
              rows={metalMachineRows}
              isLoading={loadingMetalStages}
              barColor="oklch(52% 0.16 28)"
              progressClassName="bg-brand-metal"
              emptyLabel={ft("dashboard.noLoadData")}
              embedded={embedded}
              rtl={rtl}
              pressureWipLabel={(n) => ft("dashboard.pressureWip", { n: Math.round(n) })}
              pressureDoneLabel={(n) => ft("dashboard.pressureDone", { n: Math.round(n) })}
            />
          </motion.div>
          <motion.div variants={cardMotion}>
            <LoadPressureCard
              title={ft("dashboard.woodenMachinesTitle")}
              subtitle={ft("dashboard.woodenMachinesSubtitle")}
              rows={woodenMachineRows}
              isLoading={loadingWoodenStages}
              barColor="oklch(50% 0.14 250)"
              progressClassName="bg-brand-wood"
              emptyLabel={ft("dashboard.noLoadData")}
              embedded={embedded}
              rtl={rtl}
              pressureWipLabel={(n) => ft("dashboard.pressureWip", { n: Math.round(n) })}
              pressureDoneLabel={(n) => ft("dashboard.pressureDone", { n: Math.round(n) })}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Global Summary */}
      <motion.div variants={cardMotion} className={cn("pt-8", !embedded && "border-t border-foreground/5")}>
        <div className={cn(embedded && "glass-panel p-4 sm:p-6")}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center space-y-2">
              <div className={cn("font-bold tabular-nums", embedded ? "text-4xl text-brand-luxury sm:text-5xl" : "text-5xl text-accent")}>
                {Math.round(
                  ((stats?.metalCompletedOrders || 0) + (stats?.woodenCompletedOrders || 0)) /
                    Math.max(1, (stats?.metalTotalOrders || 0) + (stats?.woodenTotalOrders || 0)) *
                    100,
                )}
                %
              </div>
              <div className={embedded ? dashboardAnalyticsSubtitleClass(rtl) : "text-xs font-bold uppercase tracking-widest text-muted-foreground"}>
                {ft("dashboard.overallEfficiency")}
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className={cn("font-bold tabular-nums", embedded ? "text-4xl text-brand-luxury sm:text-5xl" : "text-5xl text-foreground")}>
                {stats?.metalCompletedOrders || 0}
              </div>
              <div className={embedded ? dashboardAnalyticsSubtitleClass(rtl) : "text-xs font-bold uppercase tracking-widest text-muted-foreground"}>
                {ft("dashboard.metalReady")}
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className={cn("font-bold tabular-nums", embedded ? "text-4xl text-brand-luxury sm:text-5xl" : "text-5xl text-foreground")}>
                {stats?.woodenCompletedOrders || 0}
              </div>
              <div className={embedded ? dashboardAnalyticsSubtitleClass(rtl) : "text-xs font-bold uppercase tracking-widest text-muted-foreground"}>
                {ft("dashboard.woodReady")}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Workforce Widget */}
      {empStats && (
        <motion.div variants={cardMotion} className="grid gap-8 md:grid-cols-12 pt-8 border-t border-foreground/5">
          <ExecutiveCard embedded={embedded} rtl={rtl}
            className="md:col-span-4"
            title={ft("dashboard.workforceTitle")}
            icon={Users}
            value={empStats.total || 0}
            valueSuffix={embedded ? ft("dashboard.employeeUnit") : undefined}
            subtitle={ft("dashboard.departmentsCount", { n: empStats.departments?.length || 0 })}
          />
          <motion.div variants={cardMotion} className="double-bezel-outer md:col-span-8">
            <div className="double-bezel-inner h-full p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                {ft("dashboard.workforceDeptChart")}
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(empStats.departments || []).map((d: any, i: number) => ({
                        name: formatDepartmentDisplayName(
                          String(d.departmentName || d.departmentId || "—"),
                          d.departmentId,
                        ),
                        value: d.count,
                        fill: PIE_COLORS[i % PIE_COLORS.length],
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {(empStats.departments || []).map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "oklch(99% 0.008 70)", border: "none", borderRadius: "12px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {(empStats.departments || []).length > 0 && (
                <div className="mt-4 pt-3 border-t border-foreground/10">
                  <PieBulletLegend
                    rtl={rtl}
                    columns={2}
                    items={(empStats.departments || []).map((d: { departmentName?: string; departmentId?: string; count?: number }, i: number) => ({
                      name: formatDepartmentDisplayName(
                        String(d.departmentName || d.departmentId || "—"),
                        d.departmentId,
                      ),
                      fill: PIE_COLORS[i % PIE_COLORS.length],
                      value: d.count ?? 0,
                    }))}
                  />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">{ft("dashboard.workforcePrivacy")}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
