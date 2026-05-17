import { useMemo } from "react";
import { useDashboardTab } from "../hooks/useDashboardTab";
import { Link } from "wouter";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarRange,
  Clock,
  Cpu,
  Factory,
  Shield,
  Trees,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArabicText } from "../components/brand/ArabicText";
import { AnalyticsMetricRow } from "../components/dashboard/AnalyticsMetricRow";
import { DashboardAnalyticsPanel } from "../components/dashboard/DashboardAnalyticsPanel";
import { DashboardSectionHeader } from "../components/dashboard/DashboardSectionHeader";
import { DashboardViewTabs } from "../components/dashboard/DashboardViewTabs";
import { ExecutiveDashboardSection } from "../components/dashboard/ExecutiveDashboardSection";
import { cn } from "../lib/cn";
import { chartTooltipProps, industrialChartTheme as chart } from "../lib/industrialChartTheme";
import {
  employeeAssignmentsFixture,
  factoryCapacityFixture,
  woodWorkOrdersFixture,
} from "../data/fixtures";
import { WOOD_STAGE_LABELS, WOOD_STAGE_ORDER } from "../data/routing";
import { useFhReferenceSnapshot, useFhWoodOrders } from "../lib/api/hooks/useFactoryHub";
import { useDirection } from "../lib/useDirection";
import { useTranslation, type Translate } from "../context/I18nContext";
import { appLocale } from "../lib/formatLocale";
import {
  type EmployeeAssignments,
  type FactoryCapacitySchema,
  type WoodWorkOrder,
} from "../data/types";

function productivityWeekdayT(t: Translate, day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"): string {
  switch (day) {
    case "mon":
      return t("dashboard.weekdayMon");
    case "tue":
      return t("dashboard.weekdayTue");
    case "wed":
      return t("dashboard.weekdayWed");
    case "thu":
      return t("dashboard.weekdayThu");
    case "fri":
      return t("dashboard.weekdayFri");
    case "sat":
      return t("dashboard.weekdaySat");
    case "sun":
      return t("dashboard.weekdaySun");
    default: {
      const _exhaustive: never = day;
      return _exhaustive;
    }
  }
}

const PRODUCTIVITY_WEEK_BASE: Array<{ day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"; metal: number; wood: number }> =
  [
    { day: "mon", metal: 412, wood: 280 },
    { day: "tue", metal: 365, wood: 318 },
    { day: "wed", metal: 290, wood: 422 },
    { day: "thu", metal: 348, wood: 410 },
    { day: "fri", metal: 401, wood: 510 },
    { day: "sat", metal: 320, wood: 388 },
    { day: "sun", metal: 244, wood: 220 },
  ];

function buildProductivityWeekData(t: Translate) {
  return PRODUCTIVITY_WEEK_BASE.map((row) => ({
    name: productivityWeekdayT(t, row.day),
    metal: row.metal,
    wood: row.wood,
  }));
}

function aggregateStageThroughput(orders: WoodWorkOrder[], locale: string) {
  const ar = locale.startsWith("ar");
  return WOOD_STAGE_ORDER.map((stage) => {
    const total = orders.reduce(
      (acc, order) => acc + order.routing_progress[stage].qty_passed,
      0,
    );
    return {
      stage: ar ? WOOD_STAGE_LABELS[stage].arabic : WOOD_STAGE_LABELS[stage].english,
      qty: total,
    };
  });
}

export default function Dashboard() {
  const { direction } = useDirection();
  const { t } = useTranslation();
  const rtl = direction === "rtl";
  const locale = appLocale(direction);
  const { data: orders = woodWorkOrdersFixture.work_orders } = useFhWoodOrders(
    woodWorkOrdersFixture.work_orders,
  );
  const { data: capRef } = useFhReferenceSnapshot("factory_capacity");
  const { data: empRef } = useFhReferenceSnapshot("employee_assignments");

  const factoryCapacityLive: FactoryCapacitySchema =
    (capRef?.payload as unknown as FactoryCapacitySchema | undefined) ?? factoryCapacityFixture;
  const employeeAssignmentsLive: EmployeeAssignments =
    (empRef?.payload as unknown as EmployeeAssignments | undefined) ?? employeeAssignmentsFixture;
  const stageData = useMemo(() => aggregateStageThroughput(orders, locale), [orders, locale]);
  const productivityWeekData = useMemo(() => buildProductivityWeekData(t), [t]);

  const bottleneck = stageData.reduce(
    (acc, row) => (row.qty < acc.qty ? row : acc),
    stageData[0] ?? { stage: "—", qty: 0 },
  );

  const productivitySummary = useMemo(() => {
    let metalTotal = 0;
    let woodTotal = 0;
    for (const row of productivityWeekData) {
      metalTotal += row.metal;
      woodTotal += row.wood;
    }
    const scale = Math.max(metalTotal, woodTotal, 1);
    return {
      metalTotal,
      woodTotal,
      metalPct: (metalTotal / scale) * 100,
      woodPct: (woodTotal / scale) * 100,
    };
  }, [productivityWeekData]);

  const stageRows = useMemo(() => {
    const maxQty = Math.max(...stageData.map((row) => row.qty), 1);
    return stageData.map((row) => ({
      ...row,
      pct: (row.qty / maxQty) * 100,
    }));
  }, [stageData]);

  const { tab: activeTab, setDashboardTab } = useDashboardTab();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header
        className="flex flex-col gap-4 border-b border-brand-border pb-6"
        dir={rtl ? "rtl" : "ltr"}
        lang={rtl ? "ar" : "en"}
      >
        <div className="min-w-0">
          <h2
            className={cn(
              "text-3xl font-bold",
              rtl ? "font-arabic normal-case tracking-tight" : "tracking-tighter uppercase",
            )}
          >
            {t("dashboard.commandCenter")}
          </h2>
          <p
            className={cn(
              "mt-1 text-sm font-medium text-brand-metal",
              rtl && "font-arabic",
            )}
          >
            <span>{t("dashboard.subtitlePrimary")}</span>
            {!rtl ? (
              <>
                <span className="mx-2 text-brand-border">|</span>
                <ArabicText className="inline text-sm">{t("dashboard.subtitleSecondary")}</ArabicText>
              </>
            ) : null}
          </p>
        </div>
        <div
          className={cn(
            "flex flex-wrap gap-2 border-t border-brand-border/60 pt-4",
            rtl && "font-arabic",
          )}
        >
          <button type="button" className="industrial-btn">
            <Clock className="h-4 w-4" aria-hidden />
            <span>{t("dashboard.shiftOn")}</span>
          </button>
          <button
            type="button"
            className="industrial-btn border-brand-wood/50 bg-brand-wood/10 text-brand-wood"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden />
            <span>{t("dashboard.bottleneck", { stage: bottleneck.stage })}</span>
          </button>
        </div>
      </header>

      <nav
        className="glass-panel flex flex-wrap items-center gap-2 p-3 sm:p-4"
        aria-label={t("dashboard.ebdaaHub")}
        dir={rtl ? "rtl" : "ltr"}
        lang={rtl ? "ar" : "en"}
      >
        <span
          className={cn(
            "me-1 text-[10px] font-bold text-brand-metal",
            rtl ? "font-arabic normal-case" : "uppercase tracking-widest",
          )}
        >
          {t("dashboard.ebdaaHub")}
        </span>
        <Link
          href="/admin/permissions"
          className="industrial-btn gap-1.5 border-brand-success/40 bg-brand-success/5 px-3 py-1.5 text-[10px] text-brand-success"
        >
          <Shield className="h-3 w-3" aria-hidden />
          <ArabicText className="text-[10px]">{t("nav.permissionsAdmin")}</ArabicText>
        </Link>
        <Link href="/about-system" className="industrial-btn gap-1.5 px-3 py-1.5 text-[10px]">
          <BookOpen className="h-3 w-3" aria-hidden />
          {t("dashboard.about")}
        </Link>
        <Link href="/equipment" className="industrial-btn gap-1.5 px-3 py-1.5 text-[10px]">
          <Factory className="h-3 w-3" aria-hidden />
          {t("dashboard.equipment")}
        </Link>
        <Link href="/planning" className="industrial-btn gap-1.5 px-3 py-1.5 text-[10px]">
          <CalendarRange className="h-3 w-3" aria-hidden />
          {t("dashboard.planningKpi")}
        </Link>
        <Link
          href="/daily/wood"
          className="industrial-btn gap-1.5 border-brand-wood/40 px-3 py-1.5 text-[10px] text-brand-wood"
        >
          <Trees className="h-3 w-3" aria-hidden />
          {t("dashboard.dailyWood")}
        </Link>
      </nav>

      <DashboardViewTabs activeTab={activeTab} onTabChange={setDashboardTab} />

      {activeTab === "executive" ? (
        <div
          id="dashboard-panel-executive"
          role="tabpanel"
          aria-labelledby="dashboard-tab-executive"
          className="animate-in fade-in duration-300"
        >
          <ExecutiveDashboardSection />
        </div>
      ) : null}

      {activeTab === "operational" ? (
      <section
        id="operational"
        role="tabpanel"
        aria-labelledby="dashboard-tab-operational"
        className="animate-in fade-in space-y-6 duration-300"
      >
        <DashboardSectionHeader
          badge={t("dashboard.operationalSectionTitle")}
          badgeIcon={BarChart3}
          titleId="operational-analytics-heading"
          title={t("dashboard.operationalSectionTitle")}
          guidanceLabel={t("dashboard.guidanceToggle")}
          guidance={<p>{t("dashboard.operationalSectionSubtitle")}</p>}
        />

      <div className="grid grid-cols-1 gap-6">
        <DashboardAnalyticsPanel
          title={t("dashboard.productivityIndex")}
          subtitle={t("dashboard.productivitySubtitle")}
          rtl={rtl}
          aside={
            <div className="flex flex-wrap gap-3 sm:flex-col sm:items-end">
              <Legend swatch="bg-brand-metal" label={t("dashboard.metalFactory")} rtl={rtl} />
              <Legend swatch="bg-brand-wood" label={t("dashboard.woodFactory")} rtl={rtl} />
            </div>
          }
          footer={
            <>
              <AnalyticsMetricRow
                icon={Factory}
                label={t("dashboard.metalFactory")}
                value={t("dashboard.weekUnits", { count: String(productivitySummary.metalTotal) })}
                progress={productivitySummary.metalPct}
                progressClassName="bg-brand-metal"
                rtl={rtl}
              />
              <AnalyticsMetricRow
                icon={Trees}
                label={t("dashboard.woodFactory")}
                value={t("dashboard.weekUnits", { count: String(productivitySummary.woodTotal) })}
                progress={productivitySummary.woodPct}
                rtl={rtl}
              />
            </>
          }
        >
          <div className="h-[260px] w-full min-h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={productivityWeekData}
                margin={{ top: 12, right: 14, left: 46, bottom: rtl ? 36 : 28 }}
              >
                <defs>
                  <linearGradient id="colorMetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.metal} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chart.metal} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.wood} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chart.wood} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={chart.axis}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  height={rtl ? 48 : 40}
                  tickMargin={10}
                />
                <YAxis
                  stroke={chart.axis}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickMargin={16}
                />
                <Tooltip {...chartTooltipProps} />
                <Area type="monotone" dataKey="metal" stroke={chart.metal} strokeWidth={2} fillOpacity={1} fill="url(#colorMetal)" />
                <Area type="monotone" dataKey="wood" stroke={chart.wood} strokeWidth={2} fillOpacity={1} fill="url(#colorWood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardAnalyticsPanel>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardAnalyticsPanel
          className="lg:col-span-2"
          title={t("dashboard.stageThroughputTitle")}
          subtitle={t("dashboard.stageThroughputSubtitle")}
          rtl={rtl}
          aside={<Trees className="h-4 w-4 shrink-0 text-brand-wood" aria-hidden />}
          footer={
            <>
              {stageRows.map((row) => (
                <AnalyticsMetricRow
                  key={row.stage}
                  icon={Trees}
                  label={row.stage}
                  value={t("dashboard.stageUnits", { count: String(row.qty) })}
                  progress={row.pct}
                  progressClassName={row.stage === bottleneck.stage ? "bg-brand-warning" : "bg-brand-wood"}
                  rtl={rtl}
                />
              ))}
            </>
          }
        >
          <div className="h-[240px] w-full min-h-[200px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageData}
                margin={{
                  top: 20,
                  right: rtl ? 8 : 16,
                  left: rtl ? 16 : 12,
                  bottom: 92,
                }}
                barCategoryGap="14%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis
                  dataKey="stage"
                  stroke={chart.axis}
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  angle={rtl ? 28 : -28}
                  textAnchor={rtl ? "start" : "end"}
                  height={76}
                  interval={0}
                  tickMargin={14}
                  minTickGap={8}
                  tick={{
                    dy: rtl ? 4 : 2,
                  }}
                />
                <YAxis
                  stroke={chart.axis}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={rtl ? 36 : 32}
                />
                <Tooltip {...chartTooltipProps} />
                <Bar dataKey="qty" fill={chart.wood} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardAnalyticsPanel>

        <DashboardAnalyticsPanel
          title={t("dashboard.deptLoadTitle")}
          subtitle={t("dashboard.deptLoadSubtitle")}
          rtl={rtl}
        >
          <ul className="space-y-3" role="list">
            {factoryCapacityLive.woodworking_factory.departments.slice(0, 6).map((dept) => {
              const assigned = employeeAssignmentsLive.departments[dept.id]?.length ?? 0;
              const capacity = dept.tasks.length;
              const load = Math.min(60 + assigned * 1.5, 95);
              return (
                <AnalyticsMetricRow
                  key={dept.id}
                  icon={Cpu}
                  label={<ArabicText className="truncate">{dept.name}</ArabicText>}
                  value={t("dashboard.deptStaffTasks", {
                    staff: String(assigned),
                    tasks: String(capacity),
                  })}
                  progress={load}
                  rtl={rtl}
                />
              );
            })}
          </ul>
        </DashboardAnalyticsPanel>
      </section>
      </section>
      ) : null}
    </div>
  );
}

function Legend({ swatch, label, rtl }: { swatch: string; label: string; rtl?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 w-2 shrink-0", swatch)} aria-hidden />
      <span
        className={cn(
          "text-[9px] font-bold text-brand-metal",
          rtl ? "font-arabic normal-case" : "uppercase tracking-tighter",
        )}
      >
        {label}
      </span>
    </div>
  );
}
