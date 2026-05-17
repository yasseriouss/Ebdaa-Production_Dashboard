import { useMemo } from "react";
import { BarChart3, Cpu, Globe2, Trees } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  employeeAssignmentsFixture,
  factoryCapacityFixture,
  woodWorkOrdersFixture,
  workforceAllocationFixture,
} from "../data/fixtures";
import { useFhWoodOrders } from "../lib/api/hooks/useFactoryHub";
import type { Factory } from "../data/types";
import { useTranslation } from "../context/I18nContext";

type Scope = "all" | "wood" | "metal";

export function AnalyticsAll() {
  return <AnalyticsView scope="all" />;
}
export function AnalyticsWood() {
  return <AnalyticsView scope="wood" />;
}
export function AnalyticsMetal() {
  return <AnalyticsView scope="metal" />;
}

function AnalyticsView({ scope }: { scope: Scope }) {
  const { t } = useTranslation();
  const subtitle =
    scope === "all"
      ? t("pages.analytics.subtitleAll")
      : scope === "wood"
        ? t("pages.analytics.subtitleWood")
        : t("pages.analytics.subtitleMetal");
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="border-b border-brand-border pb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-brand-wood" />
          <h2 className="text-3xl font-bold tracking-tighter uppercase">{t("pages.analytics.title")}</h2>
        </div>
        <p className="text-sm text-brand-metal mt-1">
          {subtitle}
          <span className="mx-2 text-brand-border">|</span>
          {t("pages.analytics.subtitleAr")}
        </p>
      </header>

      {scope === "all" && <OverallSection />}

      {(scope === "all" || scope === "wood") && (
        <>
          {scope === "all" && <Divider />}
          <FactorySection
            title={t("pages.analytics.woodworkingTitle")}
            subtitleLine={t("pages.analytics.woodworkingArabic")}
            icon={Trees}
            factory={factoryCapacityFixture.woodworking_factory}
            extra={<WoodKpis />}
          />
        </>
      )}

      {(scope === "all" || scope === "metal") && (
        <>
          {scope === "all" && <Divider />}
          <FactorySection
            title={t("pages.analytics.metalworkingTitle")}
            subtitleLine={t("pages.analytics.metalworkingArabic")}
            icon={Cpu}
            factory={factoryCapacityFixture.metal_factory}
            extra={<MetalKpis />}
          />
        </>
      )}
    </div>
  );
}

function Divider() {
  return <hr className="border-t border-brand-border" aria-hidden />;
}

function OverallSection() {
  const { t } = useTranslation();
  const { data: orders = woodWorkOrdersFixture.work_orders } = useFhWoodOrders(
    woodWorkOrdersFixture.work_orders,
  );
  type MixRow = { id: "wood" | "metal"; name: string; value: number };
  const data: MixRow[] = useMemo(
    () => [
      { id: "wood", name: t("pages.analytics.woodLabel"), value: orders.length },
      { id: "metal", name: t("pages.analytics.metalLabel"), value: 0 },
    ],
    [orders.length, t],
  );
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Globe2 className="w-4 h-4 text-brand-wood" />
        <h3 className="text-sm font-bold uppercase tracking-widest">{t("pages.analytics.overall")}</h3>
        <span className="text-[10px] text-brand-metal">{t("pages.analytics.overallAr")}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard titleKey="pages.analytics.kpiActiveOrders" value={orders.length.toString()} />
        <KpiCard
          titleKey="pages.analytics.kpiWorkforce"
          value={(
            Object.values(employeeAssignmentsFixture.departments).reduce((a, l) => a + l.length, 0) +
            employeeAssignmentsFixture.management_layer.length
          ).toString()}
        />
        <KpiCard
          titleKey="pages.analytics.kpiMachines"
          value={(
            factoryCapacityFixture.metal_factory.departments.reduce((a, d) => a + d.tasks.length, 0) +
            factoryCapacityFixture.woodworking_factory.departments.reduce((a, d) => a + d.tasks.length, 0)
          ).toString()}
        />
      </div>
      <div className="glass-panel p-4 sm:p-6 md:p-8">
        <h4 className="text-xs font-bold uppercase tracking-widest mb-3">{t("pages.analytics.factoryMix")}</h4>
        <ul
          className="m-0 mb-6 flex list-none flex-wrap items-center gap-x-4 gap-y-2 p-0"
          aria-label={t("pages.analytics.chartLegendPie")}
        >
          {data.map((row) => (
            <li key={row.id} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full ring-2 ring-brand-border shadow-sm"
                style={{ backgroundColor: row.id === "wood" ? "#D97706" : "#71717A" }}
                aria-hidden
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-luxury">
                {row.name}
                <span className="ms-1 tabular-nums text-brand-metal">{row.value}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-8 sm:gap-10 md:flex-row md:items-center md:justify-between">
          <div className="w-full max-w-[240px] aspect-square mx-auto md:mx-0 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Tooltip
                  contentStyle={{ backgroundColor: "#101010", border: "1px solid #1F1F1F", fontSize: "10px" }}
                  itemStyle={{ color: "#F3F4F6" }}
                  wrapperStyle={{ outline: "none" }}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="42%"
                  outerRadius="68%"
                  paddingAngle={2}
                  stroke="#101010"
                  strokeWidth={2}
                  label={false}
                  isAnimationActive={false}
                >
                  <Cell fill="#D97706" />
                  <Cell fill="#71717A" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul
            className="flex flex-col gap-4 md:gap-5 flex-1 min-w-0 md:ps-8 md:ms-2 md:border-s border-brand-border"
            aria-label={t("pages.analytics.chartLegendList")}
          >
            {data.map((row) => (
              <li key={row.id} className="flex items-start gap-4">
                <span
                  className="mt-1 shrink-0 w-3 h-3 rounded-full ring-2 ring-brand-border"
                  style={{ backgroundColor: row.id === "wood" ? "#D97706" : "#71717A" }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-brand-luxury">
                    {row.name}
                  </span>
                  <span className="text-[10px] text-brand-metal tabular-nums">
                    {row.value === 1
                      ? t("pages.analytics.activeOrdersOne", { n: String(row.value) })
                      : t("pages.analytics.activeOrdersOther", { n: String(row.value) })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FactorySection({
  title,
  subtitleLine,
  icon: Icon,
  factory,
  extra,
}: {
  title: string;
  subtitleLine: string;
  icon: React.ElementType;
  factory: Factory;
  extra?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const utilisation = useMemo(
    () =>
      factory.departments.map((dept) => {
        const totalCapacity = dept.tasks.reduce(
          (acc, task) => acc + (task.capacity_metrics?.max_capacity_per_hour ?? 0),
          0,
        );
        return { name: dept.name, capacity: totalCapacity };
      }),
    [factory],
  );
  const opCosts = useMemo(
    () =>
      factory.departments.map((dept) => ({
        name: dept.name,
        cost: dept.tasks.reduce(
          (acc, task) => acc + (task.cost_center_info?.hourly_operating_cost ?? 0),
          0,
        ),
      })),
    [factory],
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Icon className="w-4 h-4 text-brand-wood" />
        <h3 className="text-sm font-bold uppercase tracking-widest">{title}</h3>
        <span className="text-[10px] text-brand-metal">{subtitleLine}</span>
      </div>
      {extra}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={t("pages.analytics.capPerDept")} subtitle={t("pages.analytics.capPerDeptSub")}>
          <div className="h-[280px] sm:h-[300px] min-h-[260px] pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilisation} margin={{ top: 12, right: 12, left: 8, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#101010", border: "1px solid #1F1F1F", fontSize: "10px" }}
                  itemStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="capacity" fill="#D97706" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title={t("pages.analytics.hourlyCost")} subtitle={t("pages.analytics.hourlyCostSub")}>
          <div className="h-[280px] sm:h-[300px] min-h-[260px] pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opCosts} margin={{ top: 12, right: 12, left: 8, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#101010", border: "1px solid #1F1F1F", fontSize: "10px" }}
                  itemStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="cost" fill="#71717A" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </section>
  );
}

function WoodKpis() {
  const { data: woodOrders = woodWorkOrdersFixture.work_orders } = useFhWoodOrders(
    woodWorkOrdersFixture.work_orders,
  );
  const planned = workforceAllocationFixture.departments_workforce.reduce(
    (acc, d) => acc + d.staff.reduce((s, r) => s + r.count, 0),
    0,
  );
  const actual = Object.values(employeeAssignmentsFixture.departments).reduce((a, l) => a + l.length, 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <KpiCard titleKey="pages.analytics.kpiWoodOrders" value={String(woodOrders.length)} />
      <KpiCard titleKey="pages.analytics.kpiPlannedStaff" value={String(planned)} />
      <KpiCard titleKey="pages.analytics.kpiActualStaff" value={String(actual)} />
      <KpiCard titleKey="pages.analytics.kpiFillRate" value={`${Math.round((actual / planned) * 100)}%`} />
    </div>
  );
}

function MetalKpis() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <KpiCard titleKey="pages.analytics.kpiMetalOrders" value="0" />
      <KpiCard titleKey="pages.analytics.kpiCnc" value="2" />
      <KpiCard titleKey="pages.analytics.kpiWelding" value="4" />
      <KpiCard titleKey="pages.analytics.kpiWaste" value="—" />
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel p-4 sm:p-6 md:p-8">
      <header className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-luxury">{title}</h4>
        {subtitle && (
          <p className="text-[10px] text-brand-metal uppercase tracking-wider">{subtitle}</p>
        )}
      </header>
      {children}
    </div>
  );
}

function KpiCard({ titleKey, value }: { titleKey: string; value: string }) {
  const { t } = useTranslation();
  return (
    <div className="glass-panel p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-metal">{t(titleKey)}</p>
      <p className="mt-2 text-2xl font-bold text-brand-luxury">{value}</p>
    </div>
  );
}
