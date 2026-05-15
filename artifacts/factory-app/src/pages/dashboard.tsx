import { useMemo, useSyncExternalStore } from "react";
import { useGetDashboardStats, useGetDashboardClients, useGetEmployeeStats, useGetMetalStagesSummary, useGetWoodenStagesSummary, useListCapacityMachines } from "@workspace/api-client-react";
import type { StageSummary, CapacityMachineRow } from "@workspace/api-client-react";
import { PieBulletLegend } from "@/components/PieBulletLegend";
import { LoadPressureCard } from "@/components/LoadPressureCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Factory, Boxes, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
    transition: executiveTransition
  }
};

function ExecutiveCard({ children, className, title, icon: Icon, value, subtitle }: any) {
  return (
    <motion.div variants={itemVariants} className={cn("double-bezel-outer", className)}>
      <div className="double-bezel-inner h-full p-6 flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
          {Icon && <Icon className="h-5 w-5 text-accent/70" />}
        </div>
        <div>
          <div className="text-4xl font-bold tracking-tight text-foreground tabular-nums">{value}</div>
          {subtitle && <p className="text-xs text-muted-foreground mt-2 font-medium">{subtitle}</p>}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const { data: clients } = useGetDashboardClients();
  const { data: empStats } = useGetEmployeeStats();
  const { data: metalStageSummary, isLoading: loadingMetalStages } = useGetMetalStagesSummary();
  const { data: woodenStageSummary, isLoading: loadingWoodenStages } = useGetWoodenStagesSummary();
  const { data: capacityMachines = [], isLoading: loadingCapacityMachines } = useListCapacityMachines();
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

  if (isLoading) return <div className="p-12"><Skeleton className="h-12 w-48 mb-8" /><div className="grid gap-8 grid-cols-4"><Skeleton className="h-64 rounded-4xl" /><Skeleton className="h-64 rounded-4xl" /><Skeleton className="h-64 rounded-4xl" /><Skeleton className="h-64 rounded-4xl" /></div></div>;

  return (
    <motion.div
      dir="rtl"
      lang="ar"
      className="p-4 sm:p-8 lg:p-12 space-y-8 sm:space-y-12 max-w-(--breakpoint-2xl) mx-auto w-full min-w-0"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="space-y-2">
        <h1 className="text-5xl font-bold text-foreground">الرؤية التنفيذية</h1>
        <p className="text-lg text-muted-foreground font-medium">نظام إبداع — إدارة الأداء الصناعي</p>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          هيكل البيانات: عميل → عدة مشاريع → كل مشروع يضم عدة أوامر شغل (معدنية و/أو خشبية).
        </p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid gap-8 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(180px,auto)]">
        
        {/* Major KPI - Metal */}
        <ExecutiveCard 
          className="md:col-span-3 lg:col-span-4 row-span-1"
          title="أوامر المصنع المعدني"
          icon={Factory}
          value={stats?.metalTotalOrders || 0}
          subtitle={`إنجاز ${stats?.metalAvgCompletionPct || 0}% · نشط ${stats?.metalActiveOrders || 0}`}
        />

        {/* Major KPI - Wooden */}
        <ExecutiveCard 
          className="md:col-span-3 lg:col-span-4 row-span-1"
          title="أوامر المصنع الخشبي"
          icon={Boxes}
          value={stats?.woodenTotalOrders || 0}
          subtitle={`إنجاز ${stats?.woodenAvgCompletionPct || 0}% · نشط ${stats?.woodenActiveOrders || 0}`}
        />

        {/* Highlight KPI - Shared Projects */}
        <ExecutiveCard 
          className="md:col-span-2 lg:col-span-4 row-span-1 bg-accent/5"
          title="المشاريع المشتركة"
          icon={CheckCircle2}
          value={stats?.sharedProjectsCount || 0}
          subtitle="عملاء المصنعين المشتركين"
        />

        {/* Overdue Alerts - Metal */}
        <ExecutiveCard 
          className="md:col-span-3 lg:col-span-3 row-span-1"
          title="متأخرات معدني"
          icon={AlertTriangle}
          value={stats?.metalBacklogTotal || 0}
          subtitle={`متوقف: ${stats?.metalOverdueOrders || 0} أمر`}
        />

        {/* Overdue Alerts - Wooden */}
        <ExecutiveCard 
          className="md:col-span-3 lg:col-span-3 row-span-1"
          title="متأخرات خشبي"
          icon={AlertTriangle}
          value={stats?.woodenBacklogTotal || 0}
          subtitle={`متوقف: ${stats?.woodenOverdueOrders || 0} أمر`}
        />

        {/* Clients Analytics - Large Bento Piece */}
        <motion.div variants={itemVariants} className="double-bezel-outer md:col-span-6 lg:col-span-6 row-span-2 min-w-0">
          <div className="double-bezel-inner h-full p-4 sm:p-6 lg:p-8 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6 lg:mb-8">
              تحليل كبار العملاء
            </h3>
            <div className="w-full min-w-0 max-h-[min(52vh,440px)] overflow-y-auto overflow-x-hidden pe-1 -me-1">
              {topClients.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">لا توجد بيانات عملاء بعد</p>
              ) : (
                <ul className="space-y-5 sm:space-y-6 pb-1">
                  {topClients.map((row, idx) => {
                    const widthPct = (row.totalOrders / topClientsMaxOrders) * 100;
                    return (
                      <li key={`${row.clientFull}-${idx}`} className="min-w-0 list-none space-y-2.5 sm:space-y-3">
                        <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-4">
                          <p className="text-sm font-medium text-foreground leading-relaxed break-words min-w-0 order-1">
                            {row.clientFull}
                          </p>
                          <div className="shrink-0 text-xs text-muted-foreground tabular-nums order-2 sm:order-none sm:text-end">
                            <span className="font-semibold text-foreground">{row.totalOrders}</span>
                            {" أمر"}
                            {typeof row.completionPct === "number" && (
                              <span className="ms-2 opacity-90">إنجاز {Math.round(row.completionPct)}%</span>
                            )}
                          </div>
                        </div>
                        <div
                          className="h-3 sm:h-3.5 w-full rounded-full bg-muted/45 ring-1 ring-border/35 overflow-hidden"
                          dir="rtl"
                          aria-hidden
                        >
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
        </motion.div>

        {/* Status Distribution - Metal */}
        <motion.div variants={itemVariants} className="double-bezel-outer md:col-span-3 lg:col-span-3 row-span-2 min-w-0">
          <div className="double-bezel-inner h-full p-4 sm:p-6 lg:p-8 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 sm:mb-8">
              توزيع حالات المصنع المعدني
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
                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">إجمالي</span>
              </div>
            </div>
            {metalStatusData.length > 0 && (
              <div className="mt-4 pt-3 border-t border-foreground/10">
                <PieBulletLegend items={metalStatusData.map(({ name, fill, value }) => ({ name, fill, value }))} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Status Distribution - Wooden */}
        <motion.div variants={itemVariants} className="double-bezel-outer md:col-span-3 lg:col-span-3 row-span-2 min-w-0">
          <div className="double-bezel-inner h-full p-4 sm:p-6 lg:p-8 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 sm:mb-8">
              توزيع حالات المصنع الخشبي
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
                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">إجمالي</span>
              </div>
            </div>
            {woodenStatusData.length > 0 && (
              <div className="mt-4 pt-3 border-t border-foreground/10">
                <PieBulletLegend items={woodenStatusData.map(({ name, fill, value }) => ({ name, fill, value }))} />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ضغط العمل حسب الأقسام — معدني وخشبي متجاوران */}
      <motion.div variants={itemVariants} className="space-y-4 pt-8 border-t border-foreground/5">
        <div className="px-1 space-y-1">
          <h2 className="text-sm font-bold text-foreground tracking-tight">توزيع ضغط العمل — الأقسام</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            يُجمَّع ضغط العمل (WIP) حسب القسم أو الماكينة.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div variants={itemVariants}>
            <LoadPressureCard
              title="المصنع المعدني"
              subtitle="أسماء الأقسام كما في مخطط المصنع (قسم تجهيز الصاج، التشكيل، اللحام، …)"
              rows={metalDeptRows}
              isLoading={loadingMetalStages || loadingCapacityMachines}
              barColor="oklch(58% 0.14 28)"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <LoadPressureCard
              title="المصنع الخشبي"
              subtitle="أقسام الخشب من قاعدة البيانات مع توزيع WIP من المراحل الأربع لمسار الأمر"
              rows={woodenDeptRows}
              isLoading={loadingWoodenStages || loadingCapacityMachines}
              barColor="oklch(55% 0.12 250)"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* ضغط العمل حسب المحطة / الماكينة — مرحلة لكل صف */}
      <motion.div variants={itemVariants} className="space-y-4 pt-8">
        <div className="px-1 space-y-1">
          <h2 className="text-sm font-bold text-foreground tracking-tight">توزيع ضغط العمل — المحطات والماكينات</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            كل صف ماكينة من جدول المهام مع القسم التابع له؛ للمعدن يُطابق WIP مرحلة بنفس اسم المهمة؛ للخشب يُقسَّم WIP
            المرحلة المبسّطة على عدد الماكينات في الأقسام المرتبطة.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div variants={itemVariants}>
            <LoadPressureCard
              title="المصنع المعدني — الماكينات"
              subtitle="كل ماكينة (مهمة) من مخطط السعة — مرتبة حسب تسلسل العملية"
              rows={metalMachineRows}
              isLoading={loadingMetalStages || loadingCapacityMachines}
              barColor="oklch(52% 0.16 28)"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <LoadPressureCard
              title="المصنع الخشبي — الماكينات"
              subtitle="جميع الماكينات المعرّفة في المصنع الخشبي"
              rows={woodenMachineRows}
              isLoading={loadingWoodenStages || loadingCapacityMachines}
              barColor="oklch(50% 0.14 250)"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Global Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-foreground/5">
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-accent tabular-nums">
            {Math.round(((stats?.metalCompletedOrders || 0) + (stats?.woodenCompletedOrders || 0)) /
              Math.max(1, (stats?.metalTotalOrders || 0) + (stats?.woodenTotalOrders || 0)) * 100)}%
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">كفاءة الإنتاج الكلية</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-foreground tabular-nums">{stats?.metalCompletedOrders || 0}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">وحدات معدنية جاهزة</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-foreground tabular-nums">{stats?.woodenCompletedOrders || 0}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">وحدات خشبية جاهزة</div>
        </div>
      </motion.div>

      {/* Workforce Widget */}
      {empStats && (
        <motion.div variants={itemVariants} className="grid gap-8 md:grid-cols-12 pt-8 border-t border-foreground/5">
          <ExecutiveCard
            className="md:col-span-4"
            title="القوة البشرية WF-001"
            icon={Users}
            value={empStats.total || 0}
            subtitle={`${empStats.departments?.length || 0} أقسام`}
          />
          <motion.div variants={itemVariants} className="double-bezel-outer md:col-span-8">
            <div className="double-bezel-inner h-full p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">توزيع الموظفين حسب القسم</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(empStats.departments || []).map((d: any, i: number) => ({
                        name: d.departmentName || d.departmentId,
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
                    items={(empStats.departments || []).map((d: { departmentName?: string; departmentId?: string; count?: number }, i: number) => ({
                      name: String(d.departmentName || d.departmentId || "—"),
                      fill: PIE_COLORS[i % PIE_COLORS.length],
                      value: d.count ?? 0,
                    }))}
                  />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">بيانات شخصية — للاستخدام المحلي فقط</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
